import { supabase, fetchWithCache, clearCache } from "./supabase.js";

console.log("App carregado!");
console.log("Supabase:", supabase);

const SESSION_KEY = "ceti_admin_session";
const SCHOOL_LOGO = "assets/logo-ceti.png";
const makeId = () => `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

let state = {
  classes: [],
  subjects: [],
  students: [],
  teachers: [],
  grades: [],
  news: [],
  events: [],
  activities: [],
  achievements: [],
  files: [],
  indicators: {
    students: 0,
    projects: 0,
    events: 0,
    awards: 0
  },
  about: {
    history: "",
    mission: "",
    vision: "",
    values: ""
  },
  contact: {
    address: "",
    phone: "",
    email: ""
  },
  team: []
};

let currentCalendarView = "month";
let currentAdminTab = "dashboard";
let currentTeacherTrimester = "1";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// ==================== FUNÇÕES DE CÁLCULO ====================
function calculateTrimesterRecovery(n1, n2, n3) {
  const n1Num = Number(n1) || 0;
  const n2Num = Number(n2) || 0;
  const n3Num = Number(n3) || 0;
  
  if (n1Num === 0 && n2Num === 0 && n3Num === 0) return false;
  
  const average = (n1Num + n2Num + n3Num) / 3;
  return average < 6;
}

function getTrimesterAverage(n1, n2, n3) {
  const n1Num = Number(n1) || 0;
  const n2Num = Number(n2) || 0;
  const n3Num = Number(n3) || 0;
  
  if (n1Num === 0 && n2Num === 0 && n3Num === 0) return "0.0";
  
  return ((n1Num + n2Num + n3Num) / 3).toFixed(1);
}

function normalizeTrimester(trimester = {}) {
  const n1 = Number(trimester.n1) || 0;
  const n2 = Number(trimester.n2) || 0;
  const n3 = Number(trimester.n3) || 0;
  const recovery = calculateTrimesterRecovery(n1, n2, n3);
  
  return { n1, n2, n3, recovery };
}

function getTrimester(grade = {}, trimester = "1") {
  return normalizeTrimester(grade.trimesters?.[trimester]);
}

function trimesterAverage(grade, trimester = "1") {
  const tri = getTrimester(grade, trimester);
  return getTrimesterAverage(tri.n1, tri.n2, tri.n3);
}

function gradeAverage(grade) {
  const t1 = Number(trimesterAverage(grade, "1")) || 0;
  const t2 = Number(trimesterAverage(grade, "2")) || 0;
  const t3 = Number(trimesterAverage(grade, "3")) || 0;
  
  if (t1 === 0 && t2 === 0 && t3 === 0) return "0.0";
  
  let count = 0;
  let sum = 0;
  if (t1 > 0) { sum += t1; count++; }
  if (t2 > 0) { sum += t2; count++; }
  if (t3 > 0) { sum += t3; count++; }
  
  return count > 0 ? (sum / count).toFixed(1) : "0.0";
}

function hasAllGrades(studentId) {
  const studentGrades = state.grades.filter((g) => g.studentId === studentId);
  return studentGrades.every(
    (g) =>
      getTrimesterAverage(g.trimesters[1].n1, g.trimesters[1].n2, g.trimesters[1].n3) !== "0.0" &&
      getTrimesterAverage(g.trimesters[2].n1, g.trimesters[2].n2, g.trimesters[2].n3) !== "0.0" &&
      getTrimesterAverage(g.trimesters[3].n1, g.trimesters[3].n2, g.trimesters[3].n3) !== "0.0"
  );
}

// ==================== FUNÇÕES DE DADOS ====================
async function loadDataFromSupabase() {
  try {
    console.log("Carregando dados do Supabase...");
    
    const [
      classesData,
      subjectsData,
      studentsData,
      teachersData,
      gradesData,
      newsData,
      eventsData,
      activitiesData,
      achievementsData
    ] = await Promise.all([
      supabase.from("classes").select("*"),
      supabase.from("subjects").select("*"),
      supabase.from("students").select("*"),
      supabase.from("teachers").select("*"),
      supabase.from("grades").select("*"),
      supabase.from("news").select("*"),
      supabase.from("events").select("*"),
      supabase.from("activities").select("*"),
      supabase.from("achievements").select("*")
    ]);

    state.classes = classesData.data?.map((c) => c.name) || [];
    state.subjects = subjectsData.data?.map((s) => s.name) || [];
    state.students = studentsData.data || [];
    state.teachers = teachersData.data || [];
    state.grades = (gradesData.data || []).map(normalizeGradeData);
    state.news = newsData.data || [];
    state.events = eventsData.data || [];
    state.activities = activitiesData.data || [];
    state.achievements = achievementsData.data || [];

    console.log("Dados carregados com sucesso");
  } catch (error) {
    console.error("Erro ao carregar dados do Supabase:", error);
  }
}

function normalizeGradeData(grade) {
  const trimesters = grade.trimesters || { 
    1: { n1: 0, n2: 0, n3: 0 }, 
    2: { n1: 0, n2: 0, n3: 0 }, 
    3: { n1: 0, n2: 0, n3: 0 } 
  };
  
  return {
    ...grade,
    trimesters: {
      1: normalizeTrimester(trimesters[1]),
      2: normalizeTrimester(trimesters[2]),
      3: normalizeTrimester(trimesters[3])
    }
  };
}

async function saveGradeToSupabase(grade) {
  try {
    const { error } = await supabase
      .from("grades")
      .upsert(grade, { onConflict: "id" });
    
    if (error) throw error;
    clearCache("grades");
  } catch (error) {
    console.error("Erro ao salvar nota:", error);
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T12:00:00`));
}

function route() {
  const page = (location.hash || "#inicio").replace("#", "").split("?")[0];
  $$(".page").forEach((section) => section.classList.toggle("active", section.dataset.page === page));
  $$(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === page));
  $("[data-nav-panel]").classList.remove("open");
  document.body.classList.remove("no-scroll");
  $("#main").focus({ preventScroll: true });
  if (page === "login") renderLoginPortal();
  if (page === "noticia") renderNewsDetail();
}

function toast(message) {
  const region = $("[data-toast-region]");
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 3200);
}

function card(item, type, options = {}) {
  const title = item.title || item.name;
  const text = item.summary || item.description || item.content;
  const category = item.category || item.responsible || type;
  const media = item.files?.find((file) => file.type.startsWith("image/"));
  const mediaMarkup = media
    ? `<img class="card-media" src="${media.data}" alt="">`
    : `<div class="card-media">${category}</div>`;
  const openLabel = options.href ? `<span class="card-link-label">Ler noticia completa</span>` : "";
  const content = `
    ${mediaMarkup}
    <div class="card-body">
      <span class="badge">${escapeHtml(category)}</span>
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(text)}</p>
      ${item.date ? `<p class="meta">${formatDate(item.date)}</p>` : ""}
      ${openLabel}
    </div>
  `;
  if (options.href) {
    return `<a class="card card-link" href="${options.href}" aria-label="Abrir noticia completa: ${escapeHtml(title)}">${content}</a>`;
  }
  return `
    <article class="card">
      ${content}
    </article>
  `;
}

// ==================== RENDERIZAÇÃO PÚBLICA ====================
function renderPublic() {
  renderHome();
  renderNews();
  renderAbout();
  renderContact();
  renderCalendar();
  renderActivities();
  renderAchievements();
  setupFilters();
}

function renderHome() {
  const published = state.news.filter((item) => item.published);
  const nextEvents = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
  $("[data-home-highlights]").innerHTML = [
    published[0] && card(published[0], "Ultimas Noticias"),
    nextEvents[0] && card(nextEvents[0], "Proximos Eventos"),
    card({ title: "Calendario Escolar", summary: "Acompanhe provas, reunioes e datas importantes.", category: "Organizacao" }, "Calendario"),
    state.activities[0] && card(state.activities[0], "Atividades Recentes")
  ]
    .filter(Boolean)
    .join("");

  const indicators = [
    ["Alunos", state.indicators.students],
    ["Projetos realizados", state.indicators.projects],
    ["Eventos realizados", state.indicators.events],
    ["Premiacoes", state.indicators.awards]
  ];
  $("[data-indicators]").innerHTML = indicators
    .map(([label, value]) => `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`)
    .join("");

  const galleryItems = [
    ...state.activities.map((item) => item.name),
    ...state.achievements.map((item) => item.title),
    ...published.map((item) => item.title)
  ].slice(0, 5);
  $("[data-gallery-strip]").innerHTML = galleryItems
    .map((title) => `<div class="gallery-item">${title}</div>`)
    .join("");
}

function renderNews() {
  const categories = ["Todas", ...new Set(state.news.map((item) => item.category).filter(Boolean))];
  $("[data-category-filter='noticias']").innerHTML = categories.map((cat) => `<option>${cat}</option>`).join("");
  const items = state.news.filter((item) => item.published);
  $("[data-news-list]").innerHTML =
    items.map((item) => card(item, "Noticia", { href: `#noticia?id=${encodeURIComponent(item.id)}` })).join("") ||
    emptyState("Nenhuma noticia publicada.");
}

function renderNewsDetail() {
  const root = $("[data-news-detail]");
  if (!root) return;
  const params = new URLSearchParams((location.hash.split("?")[1] || "").trim());
  const item = state.news.find((news) => news.id === params.get("id") && news.published);
  if (!item) {
    root.innerHTML = `
      <article class="panel news-detail">
        <a class="button ghost" href="#noticias">Voltar para noticias</a>
        <h2>Noticia nao encontrada</h2>
        <p class="muted">A publicacao pode ter sido removida ou ainda nao esta publicada.</p>
      </article>
    `;
    return;
  }
  const image = item.files?.find((file) => file.type.startsWith("image/"));
  const attachments = (item.files || []).filter((file) => !file.type.startsWith("image/"));
  root.innerHTML = `
    <article class="panel news-detail">
      <a class="button ghost" href="#noticias">Voltar para noticias</a>
      ${image ? `<img class="news-detail-media" src="${image.data}" alt="">` : ""}
      <div class="news-detail-head">
        <span class="badge">${escapeHtml(item.category || "Noticia")}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="meta">${item.date ? formatDate(item.date) : ""}${item.author ? ` | ${escapeHtml(item.author)}` : ""}</p>
      </div>
      ${item.summary ? `<p class="news-summary">${escapeHtml(item.summary)}</p>` : ""}
      <div class="news-content">${escapeHtml(item.content || item.summary || "").replaceAll("\n", "<br>")}</div>
      ${
        attachments.length
          ? `<div class="news-attachments"><h3>Anexos</h3>${attachments.map(newsAttachment).join("")}</div>`
          : ""
      }
    </article>
  `;
}

function newsAttachment(file) {
  return `<a class="button ghost" href="${file.data}" download="${escapeHtml(file.name)}">${escapeHtml(file.name)}</a>`;
}

function renderAbout() {
  $("[data-about-history]").textContent = state.about.history;
  $("[data-about-mission]").textContent = state.about.mission;
  $("[data-about-vision]").textContent = state.about.vision;
  $("[data-about-values]").textContent = state.about.values;
  $("[data-team-list]").innerHTML = state.team
    .map((person) => `<div class="person"><strong>${person.name}</strong><br><span class="muted">${person.role}</span></div>`)
    .join("");
}

function renderContact() {
  $("[data-contact-address]").textContent = state.contact.address;
  $("[data-contact-phone]").textContent = state.contact.phone;
  $("[data-contact-email]").textContent = state.contact.email;
}

function renderCalendar() {
  const shell = $("[data-calendar]");
  $$(".segmented button").forEach((button) => button.classList.toggle("active", button.dataset.calendarView === currentCalendarView));
  if (currentCalendarView === "list") {
    shell.innerHTML = `<div class="list-view">${state.events.map(calendarListItem).join("") || emptyState("Nenhum evento cadastrado.")}</div>`;
    return;
  }

  const days = currentCalendarView === "week" ? 7 : 35;
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), currentCalendarView === "week" ? today.getDate() : 1);
  const start = new Date(base);
  start.setDate(base.getDate() - start.getDay());
  const cells = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const events = state.events.filter((event) => event.date === iso);
    return `<div class="calendar-cell"><strong>${date.getDate()}</strong>${events
      .map((event) => `<div class="calendar-event">${event.title}</div>`)
      .join("")}</div>`;
  });
  shell.innerHTML = `<div class="calendar-grid">${labels
    .map((label) => `<div class="calendar-head">${label}</div>`)
    .join("")}${cells.join("")}</div>`;
}

function calendarListItem(event) {
  return `
    <article class="list-item">
      <strong>${formatDate(event.date)}<br>${event.time || ""}</strong>
      <div>
        <h3>${event.title}</h3>
        <p class="muted">${event.description}</p>
        <span class="badge">${event.location}</span>
      </div>
    </article>
  `;
}

function renderActivities() {
  $("[data-activity-list]").innerHTML = state.activities.map((item) => card(item, "Atividade")).join("") || emptyState("Nenhuma atividade cadastrada.");
}

function renderAchievements() {
  const categories = ["Todas", ...new Set(state.achievements.map((item) => item.category).filter(Boolean))];
  $("[data-category-filter='conquistas']").innerHTML = categories.map((cat) => `<option>${cat}</option>`).join("");
  $("[data-achievement-list]").innerHTML =
    state.achievements.map((item) => card(item, "Conquista")).join("") || emptyState("Nenhuma conquista cadastrada.");
}

function emptyState(message) {
  return `<article class="panel"><p class="muted">${message}</p></article>`;
}

function setupFilters() {
  $$(".toolbar").forEach((toolbar) => {
    toolbar.oninput = toolbar.onchange = () => {
      const input = $("input", toolbar);
      const select = $("select", toolbar);
      const term = input?.value.toLowerCase() || "";
      const category = select?.value || "Todas";
      const key = input?.dataset.filter;
      const target =
        key === "noticias" ? "[data-news-list]" : key === "atividades" ? "[data-activity-list]" : "[data-achievement-list]";
      const collection = key === "noticias" ? state.news.filter((item) => item.published) : key === "atividades" ? state.activities : state.achievements;
      const filtered = collection.filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        const okCategory = category === "Todas" || !category || item.category === category;
        return text.includes(term) && okCategory;
      });
      $(target).innerHTML =
        filtered
          .map((item) =>
            key === "noticias" ? card(item, key, { href: `#noticia?id=${encodeURIComponent(item.id)}` }) : card(item, key)
          )
          .join("") || emptyState("Nenhum resultado encontrado.");
    };
  });
}

// ==================== AUTENTICAÇÃO ====================
function getSession() {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function findLogin(user, password) {
  try {
    const { data: admins } = await supabase.from("admins").select("*").eq("user", user).eq("password", password);
    if (admins?.length) return { role: "admin", name: "Administrador", id: admins[0].id };

    const { data: teachers } = await supabase.from("teachers").select("*").eq("user", user).eq("password", password);
    if (teachers?.length) return { role: "teacher", id: teachers[0].id, name: teachers[0].name };

    const { data: students } = await supabase.from("students").select("*").eq("user", user).eq("password", password);
    if (students?.length) return { role: "student", id: students[0].id, name: students[0].name };

    return null;
  } catch (error) {
    console.error("Erro ao buscar login:", error);
    return null;
  }
}

// ==================== PORTAL DE LOGIN ====================
function renderLoginPortal() {
  const session = getSession();
  if (session?.role === "admin") {
    renderAdmin();
    return;
  }
  if (session?.role === "teacher") {
    renderTeacherPanel(session);
    return;
  }
  if (session?.role === "student") {
    renderStudentPanel(session);
    return;
  }
  renderLoginForm();
}

function renderLoginForm() {
  const root = $("[data-login-root]");
  root.innerHTML = `
    <form class="panel contact-form login-card" data-login-form>
      <h2>Entrar no portal</h2>
      <label>Usuario<input class="input" name="user" required autocomplete="username"></label>
      <label>Senha<input class="input" name="password" type="password" required autocomplete="current-password"></label>
      <button class="button primary" type="submit">Entrar</button>
      <p class="muted">Use seu usuario e senha cadastrados pelo administrador da escola.</p>
    </form>
  `;
  $("[data-login-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const session = await findLogin(form.get("user"), form.get("password"));
    if (!session) {
      toast("Usuario ou senha invalidos.");
      return;
    }
    setSession(session);
    toast("Login realizado com sucesso.");
    renderLoginPortal();
  });
}

// ==================== PAINEL DO PROFESSOR ====================
function renderTeacherPanel(session) {
  const root = $("[data-login-root]");
  const teacher = state.teachers.find((item) => item.id === session.id);
  if (!teacher) {
    clearSession();
    renderLoginForm();
    return;
  }
  const teacherStudents = state.students.filter((student) => (teacher.classes || []).includes(student.className));
  const teacherGrades = state.grades.filter((grade) => grade.subject === teacher.subject);

  root.innerHTML = `
    <div class="portal-heading">
      <div>
        <h2>Professor: ${escapeHtml(teacher.name)}</h2>
        <p class="muted">${escapeHtml(teacher.subject)} | Turmas: ${(teacher.classes || []).map(escapeHtml).join(", ")}</p>
      </div>
      <div class="row-actions">
        <button class="button ghost" data-teacher-report>Relatorio da disciplina</button>
        <a class="button ghost" href="https://portal.seduc.pi.gov.br/" target="_blank" rel="noopener">Abrir iSEDUC</a>
        <button class="button ghost" data-logout>Sair</button>
      </div>
    </div>
    <div class="panel">
      <div class="portal-heading compact">
        <div>
          <h2>Notas trimestrais</h2>
          <p class="muted">Preencha N1, N2 e N3. A media do trimestre e calculada automaticamente. Recuperacao e marcada automaticamente se media < 6.0</p>
        </div>
        <div class="segmented" role="tablist" aria-label="Trimestres">
          ${["1", "2", "3"].map((trimester) => `<button class="${currentTeacherTrimester === trimester ? "active" : ""}" data-teacher-trimester="${trimester}">${trimester}T</button>`).join("")}
        </div>
      </div>
      <form data-teacher-grade-form>
        <div class="gradebook-table">
          <div class="gradebook-head">
            <span>Estudante</span><span>N1</span><span>N2</span><span>N3</span><span>${currentTeacherTrimester}MT</span><span>Recuperacao</span><span>Resultado</span>
          </div>
          ${teacherStudents.map((student) => teacherStudentRow(student, teacher, currentTeacherTrimester)).join("") || emptyState("Nenhum aluno cadastrado nas turmas deste professor.")}
        </div>
        <button class="button primary" type="submit">Salvar ${currentTeacherTrimester} trimestre</button>
      </form>
    </div>
    <div class="panel report-panel" data-teacher-report-panel hidden>
      <div class="portal-heading compact">
        <h2>Relatorio geral da disciplina</h2>
        <button class="button ghost" data-pdf-report>Gerar PDF</button>
      </div>
      ${teacherReportTable(teacher, teacherGrades)}
    </div>
  `;

  $("[data-logout]").addEventListener("click", () => {
    clearSession();
    renderLoginPortal();
  });

  $$("[data-teacher-trimester]").forEach((button) =>
    button.addEventListener("click", () => {
      currentTeacherTrimester = button.dataset.teacherTrimester;
      renderTeacherPanel(session);
    })
  );

  $("[data-teacher-report]").addEventListener("click", () => {
    const panel = $("[data-teacher-report-panel]");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("[data-pdf-report]").addEventListener("click", () => {
    generatePdfReport(`Relatorio - ${teacher.subject}`, teacherReportTable(teacher, teacherGrades));
  });

  $("[data-teacher-grade-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    for (const student of teacherStudents) {
      const existing = state.grades.find(
        (g) => g.studentId === student.id && g.subject === teacher.subject && g.className === student.className
      );

      const n1 = event.target.elements[`n1-${student.id}`]?.value || 0;
      const n2 = event.target.elements[`n2-${student.id}`]?.value || 0;
      const n3 = event.target.elements[`n3-${student.id}`]?.value || 0;
      const recovery = calculateTrimesterRecovery(n1, n2, n3);

      const gradeData = existing || {
        id: makeId(),
        studentId: student.id,
        subject: teacher.subject,
        className: student.className,
        trimesters: { 1: normalizeTrimester(), 2: normalizeTrimester(), 3: normalizeTrimester() }
      };

      gradeData.trimesters[currentTeacherTrimester] = { n1, n2, n3, recovery };

      if (existing) {
        const idx = state.grades.indexOf(existing);
        state.grades[idx] = gradeData;
      } else {
        state.grades.push(gradeData);
      }

      await saveGradeToSupabase(gradeData);
    }

    toast("Notas salvas com sucesso.");
    renderTeacherPanel(session);
  });
}

function teacherStudentRow(student, teacher, trimester) {
  const grade = state.grades.find(
    (g) => g.studentId === student.id && g.subject === teacher.subject && g.className === student.className
  ) || {
    trimesters: { 1: normalizeTrimester(), 2: normalizeTrimester(), 3: normalizeTrimester() }
  };

  const trimesterData = getTrimester(grade, trimester);
  const average = getTrimesterAverage(trimesterData.n1, trimesterData.n2, trimesterData.n3);
  const isRecovery = trimesterData.recovery;

  return `
    <div class="gradebook-row">
      <div>
        <strong>${escapeHtml(student.name)}</strong>
        <small>Turma ${escapeHtml(student.className)}</small>
      </div>
      <input class="input" name="n1-${student.id}" type="number" min="0" max="10" step="0.1" value="${trimesterData.n1 || ""}">
      <input class="input" name="n2-${student.id}" type="number" min="0" max="10" step="0.1" value="${trimesterData.n2 || ""}">
      <input class="input" name="n3-${student.id}" type="number" min="0" max="10" step="0.1" value="${trimesterData.n3 || ""}">
      <strong>${average}</strong>
      <span class="badge">${isRecovery ? "Recuperacao" : "Aprovado"}</span>
      <span class="badge">${Number(average) >= 6 && !isRecovery ? "Aprovado" : isRecovery ? "Recuperacao" : "Pendente"}</span>
    </div>
  `;
}

function teacherReportTable(teacher, grades) {
  const rows = grades
    .map((grade) => {
      const student = state.students.find((item) => item.id === grade.studentId);
      const t1Recovery = getTrimester(grade, "1").recovery;
      const t2Recovery = getTrimester(grade, "2").recovery;
      const t3Recovery = getTrimester(grade, "3").recovery;
      return `
        <tr>
          <td>${escapeHtml(student?.name || "Aluno")}</td>
          <td>${escapeHtml(grade.className)}</td>
          <td>${trimesterAverage(grade, "1")} ${t1Recovery ? "(Rec)" : ""}</td>
          <td>${trimesterAverage(grade, "2")} ${t2Recovery ? "(Rec)" : ""}</td>
          <td>${trimesterAverage(grade, "3")} ${t3Recovery ? "(Rec)" : ""}</td>
          <td>${gradeAverage(grade)}</td>
          <td>${t1Recovery || t2Recovery || t3Recovery ? "Em recuperacao" : Number(gradeAverage(grade)) >= 6 ? "Aprovado" : "Recuperacao final"}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-scroll">
      <table class="report-table">
        <thead>
          <tr><th>Aluno</th><th>Turma</th><th>1T</th><th>2T</th><th>3T</th><th>Final</th><th>Situacao</th></tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="7">Nenhuma nota registrada em ${escapeHtml(teacher.subject)}.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

// ==================== PAINEL DO ALUNO ====================
function renderStudentPanel(session) {
  const root = $("[data-login-root]");
  const student = state.students.find((item) => item.id === session.id);
  if (!student) {
    clearSession();
    renderLoginForm();
    return;
  }

  const grades = state.grades.filter((grade) => grade.studentId === student.id);
  const allGradesComplete = hasAllGrades(student.id);
  const averages = grades.map((grade) => Number(gradeAverage(grade)));
  const generalAverage = averages.filter((a) => a > 0).length
    ? (averages.filter((a) => a > 0).reduce((total, value) => total + value, 0) / averages.filter((a) => a > 0).length).toFixed(1)
    : "0.0";

  const hasRecoveryTrimester = grades.some(
    (grade) =>
      getTrimester(grade, "1").recovery ||
      getTrimester(grade, "2").recovery ||
      getTrimester(grade, "3").recovery
  );

  const finalRecovery = allGradesComplete && Number(generalAverage) < 6;

  root.innerHTML = `
    <div class="portal-heading">
      <div>
        <h2>Boletim de ${escapeHtml(student.name)}</h2>
        <p class="muted">Turma: ${escapeHtml(student.className)}</p>
      </div>
      <div class="row-actions">
        <button class="button ghost" data-student-report>Relatorio geral</button>
        <button class="button ghost" data-logout>Sair</button>
      </div>
    </div>
    <div class="dashboard-grid">
      ${miniStat("Media geral", generalAverage)}
      ${miniStat("Disciplinas", grades.length)}
      ${miniStat("Situacao", allGradesComplete ? (finalRecovery ? "Recuperacao final" : "Aprovado") : "Pendente")}
    </div>
    <article class="panel recovery-panel ${hasRecoveryTrimester || finalRecovery ? "warning" : ""}">
      <strong>${
        hasRecoveryTrimester && !finalRecovery
          ? "Aluno em recuperacao em algum trimestre. Procure a escola para acompanhar o plano de estudos."
          : finalRecovery
          ? "Aluno em recuperacao final. Procure a escola para agendar avaliacao."
          : allGradesComplete
          ? "Aluno aprovado!"
          : "Aguardando preenchimento de todas as notas..."
      }</strong>
    </article>
    <div class="grade-grid">
      ${grades.map((grade) => studentGradeCard(grade)).join("") || emptyState("Nenhuma nota cadastrada para este aluno.")}
    </div>
    <div class="panel report-panel" data-student-report-panel hidden>
      <div class="portal-heading compact">
        <h2>Relatorio geral do aluno</h2>
        <button class="button ghost" data-pdf-report>Gerar PDF</button>
      </div>
      ${studentReportTable(grades, allGradesComplete, finalRecovery)}
    </div>
  `;

  $("[data-logout]").addEventListener("click", () => {
    clearSession();
    renderLoginPortal();
  });

  $("[data-student-report]").addEventListener("click", () => {
    const panel = $("[data-student-report-panel]");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("[data-pdf-report]").addEventListener("click", () => {
    generatePdfReport(`Relatorio - ${student.name}`, studentReportTable(grades, allGradesComplete, finalRecovery));
  });
}

function studentGradeCard(grade) {
  const average = gradeAverage(grade);
  const t1Recovery = getTrimester(grade, "1").recovery;
  const t2Recovery = getTrimester(grade, "2").recovery;
  const t3Recovery = getTrimester(grade, "3").recovery;

  return `
    <article class="panel grade-card">
      <div class="grade-card-head">
        <div>
          <span class="badge">${escapeHtml(grade.subject)}</span>
          <h3>Media final ${average}</h3>
        </div>
        <strong>${t1Recovery || t2Recovery || t3Recovery ? "Em recuperacao" : Number(average) >= 6 ? "Aprovado" : "Recuperacao"}</strong>
      </div>
      <div class="grade-chart" aria-label="Grafico de notas">
        ${gradeBar("1T", trimesterAverage(grade, "1"), t1Recovery)}
        ${gradeBar("2T", trimesterAverage(grade, "2"), t2Recovery)}
        ${gradeBar("3T", trimesterAverage(grade, "3"), t3Recovery)}
        ${gradeBar("Media", average, false)}
      </div>
      <div class="trimester-grid">
        ${["1", "2", "3"].map((trimester) => trimesterMiniTable(grade, trimester)).join("")}
      </div>
    </article>
  `;
}

function trimesterMiniTable(grade, trimester) {
  const data = getTrimester(grade, trimester);
  const recoveryStatus = data.recovery ? " - EM RECUPERACAO" : "";
  return `
    <div class="trimester-mini">
      <strong>${trimester} trimestre${recoveryStatus}</strong>
      <span>N1 ${Number(data.n1).toFixed(1)}</span>
      <span>N2 ${Number(data.n2).toFixed(1)}</span>
      <span>N3 ${Number(data.n3).toFixed(1)}</span>
      <span>Media ${getTrimesterAverage(data.n1, data.n2, data.n3)}</span>
    </div>
  `;
}

function studentReportTable(grades, allComplete, finalRecovery) {
  const rows = grades
    .map((grade) => {
      const t1Recovery = getTrimester(grade, "1").recovery;
      const t2Recovery = getTrimester(grade, "2").recovery;
      const t3Recovery = getTrimester(grade, "3").recovery;
      return `
        <tr>
          <td>${escapeHtml(grade.subject)}</td>
          <td>${trimesterAverage(grade, "1")} ${t1Recovery ? "(Rec)" : ""}</td>
          <td>${trimesterAverage(grade, "2")} ${t2Recovery ? "(Rec)" : ""}</td>
          <td>${trimesterAverage(grade, "3")} ${t3Recovery ? "(Rec)" : ""}</td>
          <td>${gradeAverage(grade)}</td>
          <td>${
            allComplete
              ? t1Recovery || t2Recovery || t3Recovery
                ? "Em recuperacao"
                : Number(gradeAverage(grade)) >= 6
                ? "Aprovado"
                : finalRecovery
                ? "Recuperacao final"
                : "Pendente"
              : "Pendente"
          }</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="table-scroll">
      <table class="report-table">
        <thead>
          <tr><th>Disciplina</th><th>1T</th><th>2T</th><th>3T</th><th>Final</th><th>Situacao</th></tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="6">Nenhuma nota registrada.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function gradeBar(label, value, isRecovery = false) {
  const percent = Math.max(0, Math.min(100, Number(value) * 10));
  const recoveryText = isRecovery ? " - REC" : "";
  return `
    <div class="grade-bar">
      <span>${label}${recoveryText}</span>
      <div><i style="width:${percent}%"></i></div>
      <strong>${Number(value).toFixed(1)}</strong>
    </div>
  `;
}

function miniStat(label, value) {
  return `<div class="mini-stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function generatePdfReport(title, content) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) {
    toast("Permita pop-ups para gerar o PDF.");
    return;
  }
  const generatedAt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
  reportWindow.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; }
          .pdf-header {
            display: grid;
            grid-template-columns: 82px 1fr;
            gap: 16px;
            align-items: center;
            border-bottom: 3px solid #253a9b;
            margin-bottom: 18px;
            padding-bottom: 14px;
          }
          .pdf-logo {
            width: 78px;
            height: 78px;
            object-fit: contain;
          }
          .school-name {
            font-size: 19px;
            font-weight: 800;
            text-transform: uppercase;
            color: #253a9b;
            margin: 0 0 4px;
          }
          .school-info {
            display: grid;
            gap: 2px;
            color: #4b5563;
            font-size: 12px;
            margin: 0;
          }
          h1 { font-size: 21px; margin: 0 0 14px; }
          p { margin: 0; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #253a9b; color: white; }
          .table-scroll { overflow: visible; }
          .report-meta { margin-bottom: 12px; font-size: 12px; }
          .actions { display: flex; gap: 8px; margin-top: 18px; }
          button { border: 1px solid #253a9b; background: #253a9b; color: white; padding: 10px 14px; font-weight: 700; cursor: pointer; }
          @media print { .actions { display: none; } }
        </style>
      </head>
      <body>
        <header class="pdf-header">
          <img class="pdf-logo" src="${SCHOOL_LOGO}" alt="Logo do CETI Maria Neusa de Sousa">
          <div>
            <p class="school-name">CETI Maria Neusa de Sousa</p>
            <p class="school-info">
              <span>Centro Estadual de Tempo Integral</span>
              <span>${escapeHtml(state.contact.address)}</span>
              <span>Telefone: ${escapeHtml(state.contact.phone)} | E-mail: ${escapeHtml(state.contact.email)}</span>
            </p>
          </div>
        </header>
        <h1>${escapeHtml(title)}</h1>
        <p class="report-meta">Documento gerado em ${generatedAt}</p>
        ${content}
        <div class="actions">
          <button onclick="window.print()">Salvar como PDF</button>
          <button onclick="window.close()">Fechar</button>
        </div>
        <script>
          window.addEventListener("load", () => {
            const logo = document.querySelector(".pdf-logo");
            const printReport = () => setTimeout(() => window.print(), 300);
            if (logo && !logo.complete) {
              logo.addEventListener("load", printReport, { once: true });
              logo.addEventListener("error", printReport, { once: true });
              return;
            }
            printReport();
          });
        <\/script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}

// ==================== ADMIN PAINEL ====================
function renderAdmin() {
  const root = $("[data-login-root]");
  const session = getSession();
  if (!session || session.role !== "admin") {
    renderLoginForm();
    return;
  }

  root.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-tabs" aria-label="Menu administrativo">
        ${["dashboard", "students", "teachers", "grades", "news"]
          .map((tab) => `<button data-admin-tab="${tab}" class="${currentAdminTab === tab ? "active" : ""}">${tabLabel(tab)}</button>`)
          .join("")}
        <button data-logout>Sair</button>
      </aside>
      <section class="panel" data-admin-content></section>
    </div>
  `;

  $$("[data-admin-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      currentAdminTab = button.dataset.adminTab;
      renderAdmin();
    })
  );

  $("[data-logout]").addEventListener("click", () => {
    clearSession();
    renderLoginPortal();
  });

  renderAdminContent();
}

function tabLabel(tab) {
  return { dashboard: "Dashboard", students: "Alunos", teachers: "Professores", grades: "Notas", news: "Noticias" }[tab];
}

function renderAdminContent() {
  const content = $("[data-admin-content]");
  if (currentAdminTab === "dashboard") {
    content.innerHTML = `
      <h2>Dashboard</h2>
      <div class="dashboard-grid">
        ${miniStat("Noticias", state.news.length)}
        ${miniStat("Turmas", state.classes.length)}
        ${miniStat("Alunos", state.students.length)}
        ${miniStat("Professores", state.teachers.length)}
        ${miniStat("Notas", state.grades.length)}
        ${miniStat("Eventos", state.events.length)}
      </div>
    `;
  }
}

// ==================== PREFERÊNCIAS E UI ====================
function setupPreferences() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.dataset.theme = theme;
  $("[data-theme-toggle]").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });
}

function setupUi() {
  $("[data-menu-toggle]").addEventListener("click", () => {
    $("[data-nav-panel]").classList.toggle("open");
    document.body.classList.toggle("no-scroll");
  });

  $$(".segmented button").forEach((button) =>
    button.addEventListener("click", () => {
      currentCalendarView = button.dataset.calendarView;
      renderCalendar();
    })
  );

  setInterval(() => {
    const media = $("[data-hero-media]");
    if (media) media.style.backgroundPosition = `${50 + Math.sin(Date.now() / 2500) * 3}% center`;
  }, 500);
}

// ==================== INICIALIZAÇÃO ====================
window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", async () => {
  await loadDataFromSupabase();
  renderPublic();
  setupUi();
  setupPreferences();
  route();
});
