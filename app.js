import { supabase } from "./supabase.js";
console.log("App carregado!");

console.log("Supabase:", supabase);

async function testarConexao() {
    try {
        const { data, error } = await supabase
            .from("noticias")
            .select("*");

        console.log("Dados:", data);
        console.log("Erro:", error);
    } catch (e) {
        console.error("Erro ao conectar:", e);
    }
}

testarConexao();
const STORAGE_KEY = "ceti_maria_neusa_cms_v1";
const SESSION_KEY = "ceti_admin_session";
const CREDENTIALS_KEY = "ceti_admin_credentials";
const SCHOOL_LOGO = "assets/logo-ceti.png";
const makeId = () => `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const defaultData = {
  classes: ["1 Ano A", "2 Ano A", "3 Ano A"],
  subjects: ["Portugues", "Matematica", "Historia", "Geografia", "Ciencias"],
  students: [
    {
      id: makeId(),
      name: "Ana Clara Sousa",
      className: "1 Ano A",
      user: "ana",
      password: "123456"
    }
  ],
  teachers: [
    {
      id: makeId(),
      name: "Professor Matematica",
      subject: "Matematica",
      classes: ["1 Ano A"],
      user: "prof",
      password: "123456"
    }
  ],
  grades: [
    {
      id: makeId(),
      studentId: "",
      teacherId: "",
      subject: "Matematica",
      className: "1 Ano A",
      trimesters: {
        1: { n1: 8, n2: 7, n3: 6, recovery: false },
        2: { n1: 7, n2: 8, n3: 7, recovery: false },
        3: { n1: 6, n2: 7, n3: 8, recovery: false }
      }
    }
  ],
  news: [
    {
      id: makeId(),
      title: "Abertura do projeto Cultura Digital",
      summary: "Estudantes iniciam ciclo de oficinas sobre tecnologia, cidadania e producao digital.",
      content:
        "O CETI Maria Neusa de Sousa deu inicio ao projeto Cultura Digital, com oficinas de pesquisa, apresentacao, seguranca online e producao colaborativa.",
      category: "Tecnologia",
      date: "2026-02-10",
      author: "Coordenacao Pedagogica",
      published: true,
      files: []
    },
    {
      id: makeId(),
      title: "Reuniao de pais e responsaveis",
      summary: "Encontro fortalece a parceria entre escola e familias no acompanhamento da aprendizagem.",
      content:
        "A equipe gestora convida pais e responsaveis para dialogo sobre calendario, rendimento, frequencia e projetos do semestre.",
      category: "Comunicado",
      date: "2026-02-22",
      author: "Gestao Escolar",
      published: true,
      files: []
    }
  ],
  events: [
    {
      id: makeId(),
      title: "Feira de Ciencias e Tecnologia",
      description: "Apresentacao de projetos interdisciplinares.",
      date: "2026-03-12",
      time: "08:00",
      location: "Patio da escola"
    },
    {
      id: makeId(),
      title: "Simulado bimestral",
      description: "Avaliacao diagnostica das areas de conhecimento.",
      date: "2026-03-20",
      time: "07:30",
      location: "Salas de aula"
    }
  ],
  activities: [
    {
      id: makeId(),
      name: "Projeto Leitura em Movimento",
      description: "Rodas de leitura, producao textual e socializacao de resenhas.",
      responsible: "Area de Linguagens",
      date: "2026-02-18",
      files: []
    },
    {
      id: makeId(),
      name: "Competicao de Robotica Educacional",
      description: "Desafios com prototipagem, logica e resolucao de problemas.",
      responsible: "Laboratorio de Informatica",
      date: "2026-03-04",
      files: []
    }
  ],
  achievements: [
    {
      id: makeId(),
      title: "Destaque em olimpiada regional",
      description: "Estudantes conquistam bons resultados em desafio de matematica.",
      category: "Olimpiadas",
      date: "2026-01-30",
      files: []
    },
    {
      id: makeId(),
      title: "Certificacao em boas praticas pedagogicas",
      description: "Equipe recebe reconhecimento por projeto de recomposicao de aprendizagem.",
      category: "Certificacao",
      date: "2026-02-14",
      files: []
    }
  ],
  files: [],
  indicators: {
    students: 420,
    projects: 28,
    events: 36,
    awards: 12
  },
  about: {
    history:
      "O CETI Maria Neusa de Sousa atua em Francisco Macedo-PI fortalecendo trajetorias estudantis por meio de formacao integral, projetos pedagogicos, cultura digital e participacao da comunidad[...]",
    mission: "Oferecer educacao publica de qualidade, inclusiva e conectada aos desafios contemporaneos.",
    vision: "Ser referencia regional em inovacao pedagogica, protagonismo estudantil e gestao participativa.",
    values: "Etica, respeito, colaboracao, equidade, criatividade, responsabilidade social e excelencia."
  },
  contact: {
    address: "Francisco Macedo - PI",
    phone: "(89) 0000-0000",
    email: "contato@cetimarianeusa.edu.br"
  },
  team: [
    { name: "Direcao Escolar", role: "Gestao" },
    { name: "Coordenacao Pedagogica", role: "Acompanhamento" },
    { name: "Secretaria Escolar", role: "Atendimento" },
    { name: "Corpo Docente", role: "Ensino e projetos" }
  ]
};

let state = loadData();
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

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return ensureData(structuredClone(defaultData));
  try {
    return ensureData({ ...structuredClone(defaultData), ...JSON.parse(stored) });
  } catch {
    return ensureData(structuredClone(defaultData));
  }
}

function ensureData(data) {
  data.classes ||= ["1 Ano A", "2 Ano A", "3 Ano A"];
  data.subjects ||= ["Portugues", "Matematica", "Historia", "Geografia", "Ciencias"];
  data.students ||= [];
  data.teachers ||= [];
  data.grades ||= [];
  if (data.students[0] && data.teachers[0] && data.grades[0] && !data.grades[0].studentId) {
    data.grades[0].studentId = data.students[0].id;
    data.grades[0].teacherId = data.teachers[0].id;
  }
  data.grades = data.grades.map(normalizeGradeShape);
  return data;
}

function normalizeGradeShape(grade) {
  if (grade.trimesters) {
    return {
      ...grade,
      trimesters: {
        1: normalizeTrimester(grade.trimesters[1]),
        2: normalizeTrimester(grade.trimesters[2]),
        3: normalizeTrimester(grade.trimesters[3])
      }
    };
  }
  return {
    ...grade,
    trimesters: {
      1: normalizeTrimester({ n1: grade.n1, n2: grade.n2, n3: grade.n3 }),
      2: normalizeTrimester(),
      3: normalizeTrimester()
    }
  };
}

function normalizeTrimester(trimester = {}) {
  return {
    n1: Number(trimester.n1) || 0,
    n2: Number(trimester.n2) || 0,
    n3: Number(trimester.n3) || 0,
    recovery: Boolean(trimester.recovery) || false
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

function isLoggedIn() {
  return getSession()?.role === "admin";
}

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

function getAdminCredentials() {
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveAdminCredentials(user, password) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ user, password }));
}

function findLogin(user, password) {
  const credentials = getAdminCredentials();
  if (credentials && user === credentials.user && password === credentials.password) {
    return { role: "admin", name: "Administrador" };
  }
  const teacher = state.teachers.find((item) => item.user === user && item.password === password);
  if (teacher) return { role: "teacher", id: teacher.id, name: teacher.name };
  const student = state.students.find((item) => item.user === user && item.password === password);
  if (student) return { role: "student", id: student.id, name: student.name };
  return null;
}

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
  const credentials = getAdminCredentials();
  if (!credentials) {
    root.innerHTML = `
      <form class="panel contact-form" data-setup-form>
        <h2>Criar acesso administrativo</h2>
        <label>Usuario<input class="input" name="user" required autocomplete="username"></label>
        <label>Senha<input class="input" name="password" type="password" required minlength="6" autocomplete="new-password"></label>
        <label>Confirmar senha<input class="input" name="confirm" type="password" required minlength="6" autocomplete="new-password"></label>
        <button class="button primary" type="submit">Criar acesso</button>
        <p class="muted">Depois disso, o administrador podera cadastrar estudantes e professores.</p>
      </form>
    `;
    $("[data-setup-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      if (form.get("password") !== form.get("confirm")) {
        toast("As senhas nao conferem.");
        return;
      }
      saveAdminCredentials(form.get("user"), form.get("password"));
      setSession({ role: "admin", name: "Administrador" });
      toast("Acesso administrativo criado.");
      renderLoginPortal();
    });
    return;
  }

  root.innerHTML = `
    <form class="panel contact-form login-card" data-login-form>
      <h2>Entrar no portal</h2>
      <label>Usuario<input class="input" name="user" required autocomplete="username"></label>
      <label>Senha<input class="input" name="password" type="password" required autocomplete="current-password"></label>
      <button class="button primary" type="submit">Entrar</button>
      <p class="muted">Use o acesso cadastrado pelo administrador. Exemplo inicial: professor prof/123456 e estudante ana/123456.</p>
    </form>
  `;
  $("[data-login-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const session = findLogin(form.get("user"), form.get("password"));
    if (!session) {
      toast("Usuario ou senha invalidos.");
      return;
    }
    setSession(session);
    toast("Login realizado com sucesso.");
    renderLoginPortal();
  });
}

function renderAdmin() {
  const root = $("[data-login-root]");
  if (!isLoggedIn()) {
    renderLoginForm();
    return;
  }

  root.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-tabs" aria-label="Menu administrativo">
        ${["dashboard", "classes", "subjects", "students", "teachers", "grades", "news", "events", "activities", "achievements", "settings", "uploads"]
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
    toast("Sessao encerrada.");
    renderLoginPortal();
  });
  renderAdminContent();
}

function tabLabel(tab) {
  return {
    dashboard: "Dashboard",
    classes: "Turmas",
    subjects: "Disciplinas",
    students: "Alunos",
    teachers: "Professores",
    grades: "Notas",
    news: "Noticias",
    events: "Calendario",
    activities: "Atividades",
    achievements: "Conquistas",
    settings: "Quem Somos e Contato",
    uploads: "Arquivos"
  }[tab];
}

function renderAdminContent() {
  const content = $("[data-admin-content]");
  if (currentAdminTab === "dashboard") {
    content.innerHTML = `
      <h2>Dashboard</h2>
      <div class="dashboard-grid">
        ${miniStat("Noticias", state.news.length)}
        ${miniStat("Turmas", state.classes.length)}
        ${miniStat("Disciplinas", state.subjects.length)}
        ${miniStat("Alunos", state.students.length)}
        ${miniStat("Professores", state.teachers.length)}
        ${miniStat("Notas", state.grades.length)}
        ${miniStat("Eventos", state.events.length)}
        ${miniStat("Atividades", state.activities.length)}
        ${miniStat("Conquistas", state.achievements.length)}
      </div>
      <p class="muted">Os dados cadastrados aparecem automaticamente nas abas publicas do portal.</p>
    `;
    return;
  }
  if (currentAdminTab === "uploads") {
    content.innerHTML = `<h2>Upload de arquivos</h2>${uploadZone("global")}`;
    bindUpload($("[data-upload='global']"), (files) => {
      state.files.push(...files);
      saveAndRerender("Arquivos enviados.");
    });
    return;
  }
  if (currentAdminTab === "settings") {
    renderSettings(content);
    return;
  }
  if (["classes", "subjects"].includes(currentAdminTab)) {
    renderAcademicList(content, currentAdminTab);
    return;
  }
  renderCrud(content, currentAdminTab);
}

function renderAcademicList(content, tab, editValue = "") {
  const isClasses = tab === "classes";
  const collection = state[tab];
  const editing = collection.includes(editValue) ? editValue : "";
  content.innerHTML = `
    <h2>${tabLabel(tab)}</h2>
    <form class="form-grid" data-academic-form>
      ${field(isClasses ? "Nome da turma" : "Nome da disciplina", "name", editing)}
      <div class="full">
        <button class="button primary" type="submit">${editing ? "Salvar alteracoes" : "Cadastrar"}</button>
        ${editing ? `<button class="button ghost" type="button" data-cancel-edit>Cancelar</button>` : ""}
      </div>
    </form>
    <div class="admin-list">
      ${
        collection
          .map(
            (item) => `
          <article class="admin-row">
            <div>
              <strong>${escapeHtml(item)}</strong>
              <p class="muted">${academicUsageDescription(tab, item)}</p>
            </div>
            <div class="row-actions">
              <button class="button ghost" data-edit-value="${escapeHtml(item)}">Editar</button>
              <button class="button danger" data-delete-value="${escapeHtml(item)}">Excluir</button>
            </div>
          </article>
        `
          )
          .join("") || emptyState(isClasses ? "Nenhuma turma cadastrada." : "Nenhuma disciplina cadastrada.")
      }
    </div>
  `;

  $("[data-academic-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = String(new FormData(event.target).get("name") || "").trim();
    if (!name) return;
    const alreadyExists = collection.some((item) => item.toLowerCase() === name.toLowerCase() && item !== editing);
    if (alreadyExists) {
      toast(isClasses ? "Esta turma ja existe." : "Esta disciplina ja existe.");
      return;
    }
    state[tab] = editing ? collection.map((item) => (item === editing ? name : item)) : [name, ...collection];
    if (editing && editing !== name) renameAcademicValue(tab, editing, name);
    saveAndRerender(editing ? "Registro atualizado." : "Registro cadastrado.");
  });

  $("[data-cancel-edit]")?.addEventListener("click", () => renderAcademicList(content, tab));
  $$("[data-edit-value]", content).forEach((button) =>
    button.addEventListener("click", () => renderAcademicList(content, tab, button.dataset.editValue))
  );
  $$("[data-delete-value]", content).forEach((button) =>
    button.addEventListener("click", () => {
      const value = button.dataset.deleteValue;
      if (academicValueInUse(tab, value)) {
        toast(isClasses ? "Turma em uso por alunos, professores ou notas." : "Disciplina em uso por professores ou notas.");
        return;
      }
      state[tab] = collection.filter((item) => item !== value);
      saveAndRerender("Registro excluido.");
    })
  );
}

function academicUsageDescription(tab, value) {
  if (tab === "classes") {
    const students = state.students.filter((student) => student.className === value).length;
    const teachers = state.teachers.filter((teacher) => (teacher.classes || []).includes(value)).length;
    return `${students} aluno(s) | ${teachers} professor(es)`;
  }
  const teachers = state.teachers.filter((teacher) => teacher.subject === value).length;
  const grades = state.grades.filter((grade) => grade.subject === value).length;
  return `${teachers} professor(es) | ${grades} nota(s)`;
}

function academicValueInUse(tab, value) {
  if (tab === "classes") {
    return (
      state.students.some((student) => student.className === value) ||
      state.teachers.some((teacher) => (teacher.classes || []).includes(value)) ||
      state.grades.some((grade) => grade.className === value)
    );
  }
  return state.teachers.some((teacher) => teacher.subject === value) || state.grades.some((grade) => grade.subject === value);
}

function renameAcademicValue(tab, oldValue, newValue) {
  if (tab === "classes") {
    state.students = state.students.map((student) => (student.className === oldValue ? { ...student, className: newValue } : student));
    state.teachers = state.teachers.map((teacher) => ({
      ...teacher,
      classes: (teacher.classes || []).map((className) => (className === oldValue ? newValue : className))
    }));
    state.grades = state.grades.map((grade) => (grade.className === oldValue ? { ...grade, className: newValue } : grade));
    return;
  }
  state.teachers = state.teachers.map((teacher) => (teacher.subject === oldValue ? { ...teacher, subject: newValue } : teacher));
  state.grades = state.grades.map((grade) => (grade.subject === oldValue ? { ...grade, subject: newValue } : grade));
}

function renderSettings(content) {
  content.innerHTML = `
    <h2>Quem Somos e Contato</h2>
    <form class="form-grid" data-settings-form>
      ${field("Historia da escola", "history", state.about.history, "textarea", "full")}
      ${field("Missao", "mission", state.about.mission, "textarea", "full")}
      ${field("Visao", "vision", state.about.vision, "textarea", "full")}
      ${field("Valores", "values", state.about.values, "textarea", "full")}
      ${field("Endereco", "address", state.contact.address, "text", "full")}
      ${field("Telefone", "phone", state.contact.phone)}
      ${field("E-mail", "email", state.contact.email, "email")}
      <div class="full">
        <button class="button primary" type="submit">Salvar informacoes</button>
      </div>
    </form>
  `;
  $("[data-settings-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    state.about = {
      history: data.history,
      mission: data.mission,
      vision: data.vision,
      values: data.values
    };
    state.contact = {
      address: data.address,
      phone: data.phone,
      email: data.email
    };
    saveAndRerender("Informacoes institucionais atualizadas.");
  });
}

function miniStat(label, value) {
  return `<div class="mini-stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function collectionFor(tab) {
  return {
    news: "news",
    students: "students",
    teachers: "teachers",
    grades: "grades",
    events: "events",
    activities: "activities",
    achievements: "achievements"
  }[tab];
}

function renderCrud(content, tab, editId = null) {
  const key = collectionFor(tab);
  const collection = state[key];
  const editing = collection.find((item) => item.id === editId);
  content.innerHTML = `
    <h2>${tabLabel(tab)}</h2>
    <form class="form-grid" data-crud-form>
      ${fieldsFor(tab, editing)}
      ${["students", "teachers", "grades"].includes(tab) ? "" : `<div class="full">${uploadZone("entity")}</div>`}
      <div class="full">
        <button class="button primary" type="submit">${editing ? "Salvar alteracoes" : "Cadastrar"}</button>
        ${editing ? `<button class="button ghost" type="button" data-cancel-edit>Cancelar</button>` : ""}
      </div>
    </form>
    <div class="admin-list">
      ${collection
        .map(
          (item) => `
          <article class="admin-row">
            <div>
              <strong>${escapeHtml(adminItemTitle(tab, item))}</strong>
              <p class="muted">${escapeHtml(adminItemDescription(tab, item))}</p>
            </div>
            <div class="row-actions">
              ${tab === "news" ? `<button class="button ghost" data-toggle-publish="${item.id}">${item.published ? "Ocultar" : "Publicar"}</button>` : ""}
              <button class="button ghost" data-edit="${item.id}">Editar</button>
              <button class="button danger" data-delete="${item.id}">Excluir</button>
            </div>
          </article>
        `
        )
        .join("")}
    </div>
  `;
  let pendingFiles = editing?.files ? [...editing.files] : [];
  bindUpload($("[data-upload='entity']"), (files) => {
    pendingFiles.push(...files);
    toast("Arquivo anexado ao cadastro.");
  });
  $("[data-crud-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    if (tab === "teachers") data.classes = formData.getAll("classes");
    const normalized = normalizeForm(tab, data, pendingFiles, editing);
    if (editing) {
      state[key] = collection.map((item) => (item.id === editing.id ? normalized : item));
    } else {
      state[key].unshift(normalized);
    }
    saveAndRerender(editing ? "Registro atualizado." : "Registro cadastrado.");
  });
  $("[data-cancel-edit]")?.addEventListener("click", () => renderCrud(content, tab));
  $$("[data-edit]", content).forEach((button) => button.addEventListener("click", () => renderCrud(content, tab, button.dataset.edit)));
  $$("[data-delete]", content).forEach((button) =>
    button.addEventListener("click", () => {
      state[key] = state[key].filter((item) => item.id !== button.dataset.delete);
      saveAndRerender("Registro excluido.");
    })
  );
  $$("[data-toggle-publish]", content).forEach((button) =>
    button.addEventListener("click", () => {
      state.news = state.news.map((item) => (item.id === button.dataset.togglePublish ? { ...item, published: !item.published } : item));
      saveAndRerender("Status de publicacao atualizado.");
    })
  );
}

function adminItemTitle(tab, item) {
  if (tab === "students") return item.name;
  if (tab === "teachers") return item.name;
  if (tab === "grades") {
    const student = state.students.find((entry) => entry.id === item.studentId);
    return `${student?.name || "Aluno"} - ${item.subject}`;
  }
  return item.title || item.name;
}

function adminItemDescription(tab, item) {
  if (tab === "students") return `${item.className} | usuario: ${item.user}`;
  if (tab === "teachers") return `${item.subject} | turmas: ${(item.classes || []).join(", ")} | usuario: ${item.user}`;
  if (tab === "grades") return `${item.className} | 1T ${trimesterAverage(item, "1")} ${getTrimester(item, "1").recovery ? "(Rec)" : ""} | 2T ${trimesterAverage(item, "2")} ${getTrimester(item, "2").recovery ? "(Rec)" : ""} | 3T ${trimesterAverage(item, "3")} ${getTrimester(item, "3").recovery ? "(Rec)" : ""} | final ${gradeAverage(item)}`;
  return item.summary || item.description || item.date || "";
}

function fieldsFor(tab, item = {}) {
  if (tab === "students") {
    return `
      ${field("Nome do aluno", "name", item.name)}
      ${selectField("Turma", "className", state.classes, item.className)}
      ${field("Usuario", "user", item.user)}
      ${field("Senha", "password", item.password || "", "password")}
    `;
  }
  if (tab === "teachers") {
    return `
      ${field("Nome do professor", "name", item.name)}
      ${selectField("Disciplina", "subject", state.subjects, item.subject)}
      ${checkboxField("Turmas", "classes", state.classes, item.classes || [], "full")}
      ${field("Usuario", "user", item.user)}
      ${field("Senha", "password", item.password || "", "password")}
    `;
  }
  if (tab === "grades") {
    return gradeFields(item);
  }
  if (tab === "news") {
    return `
      ${field("Titulo", "title", item.title)}
      ${field("Categoria", "category", item.category)}
      ${field("Resumo", "summary", item.summary, "textarea", "full")}
      ${field("Conteudo completo", "content", item.content, "textarea", "full")}
      ${field("Data", "date", item.date, "date")}
      ${field("Autor", "author", item.author)}
      <label>Publicado<select class="input" name="published"><option value="true" ${item.published !== false ? "selected" : ""}>Sim</option><option value="false" ${item.published === false ? "selected" : ""}>Nao</option></select></label>
    `;
  }
  if (tab === "events") {
    return `
      ${field("Titulo", "title", item.title)}
      ${field("Data", "date", item.date, "date")}
      ${field("Horario", "time", item.time, "time")}
      ${field("Local", "location", item.location)}
      ${field("Descricao", "description", item.description, "textarea", "full")}
    `;
  }
  if (tab === "activities") {
    return `
      ${field("Nome da atividade", "name", item.name)}
      ${field("Responsavel", "responsible", item.responsible)}
      ${field("Data", "date", item.date, "date")}
      ${field("Descricao", "description", item.description, "textarea", "full")}
    `;
  }
  return `
    ${field("Titulo", "title", item.title)}
    ${field("Categoria", "category", item.category)}
    ${field("Data", "date", item.date, "date")}
    ${field("Descricao", "description", item.description, "textarea", "full")}
  `;
}

function field(label, name, value = "", type = "text", span = "") {
  const safeValue = escapeHtml(value);
  const input =
    type === "textarea"
      ? `<textarea class="input" name="${name}" rows="4" required>${safeValue}</textarea>`
      : `<input class="input" name="${name}" type="${type}" value="${safeValue}" required>`;
  return `<label class="${span}">${label}${input}</label>`;
}

function selectField(label, name, options, value = "", span = "") {
  return `
    <label class="${span}">${label}
      <select class="input" name="${name}" required>
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </label>
  `;
}

function checkboxField(label, name, options, selected = [], span = "") {
  return `
    <fieldset class="check-field ${span}">
      <legend>${label}</legend>
      <div class="check-grid">
        ${options
          .map(
            (option) => `
          <label>
            <input type="checkbox" name="${name}" value="${escapeHtml(option)}" ${selected.includes(option) ? "checked" : ""}>
            <span>${escapeHtml(option)}</span>
          </label>
        `
          )
          .join("") || `<p class="muted">Cadastre uma turma antes de vincular professores.</p>`}
      </div>
    </fieldset>
  `;
}

function gradeFields(item = {}, teacher = null) {
  const allowedClasses = teacher ? teacher.classes || [] : state.classes;
  const allowedSubjects = teacher ? [teacher.subject] : state.subjects;
  const students = state.students.filter((student) => !allowedClasses.length || allowedClasses.includes(student.className));
  return `
    ${selectField("Aluno", "studentId", students.map((student) => student.id), item.studentId)}
    ${selectField("Disciplina", "subject", allowedSubjects, item.subject)}
    ${selectField("Turma", "className", allowedClasses.length ? allowedClasses : state.classes, item.className)}
    ${selectField("Trimestre", "trimester", ["1", "2", "3"], item.trimester || "1")}
    ${field("N1", "n1", getTrimester(item, item.trimester || "1").n1, "number")}
    ${field("N2", "n2", getTrimester(item, item.trimester || "1").n2, "number")}
    ${field("N3", "n3", getTrimester(item, item.trimester || "1").n3, "number")}
    <label>
      <input type="checkbox" name="recovery" ${getTrimester(item, item.trimester || "1").recovery ? "checked" : ""}>
      <span>Aluno em recuperacao neste trimestre</span>
    </label>
  `.replaceAll(/<option value="([^"]+)"([^>]*)>([^<]+)<\/option>/g, (markup, value, selected, label) => {
    const student = state.students.find((entry) => entry.id === value);
    return student ? `<option value="${value}"${selected}>${escapeHtml(student.name)} - ${escapeHtml(student.className)}</option>` : markup;
  });
}

function getTrimester(grade = {}, trimester = "1") {
  return normalizeTrimester(grade.trimesters?.[trimester]);
}

function trimesterAverage(grade, trimester = "1") {
  const values = Object.values(getTrimester(grade, trimester)).filter(v => typeof v === 'number');
  return (values.reduce((total, value) => total + value, 0) / 3).toFixed(1);
}

function gradeAverage(grade) {
  const averages = ["1", "2", "3"].map((trimester) => Number(trimesterAverage(grade, trimester)));
  return (averages.reduce((total, value) => total + value, 0) / averages.length).toFixed(1);
}

function recoveryMessage(average) {
  return Number(average) >= 6 ? "Aluno aprovado." : "Aluno em recuperacao. Procure a escola para acompanhar o plano de estudos.";
}

function normalizeForm(tab, data, files, existing = {}) {
  const base = { ...existing, ...data, id: existing.id || makeId(), files };
  if (tab === "news") base.published = data.published === "true";
  if (tab === "teachers") base.classes = Array.isArray(data.classes) ? data.classes : String(data.classes || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (tab === "grades") {
    const student = state.students.find((item) => item.id === data.studentId);
    base.className = data.className || student?.className || "";
    const recovery = data.recovery === "on" || data.recovery === true;
    base.trimesters = {
      ...normalizeGradeShape(existing).trimesters,
      [data.trimester]: normalizeTrimester({ n1: data.n1, n2: data.n2, n3: data.n3, recovery })
    };
    delete base.n1;
    delete base.n2;
    delete base.n3;
    delete base.trimester;
    delete base.recovery;
  }
  return base;
}

function uploadZone(id) {
  return `
    <div class="upload-zone" data-upload="${id}">
      <strong>Arraste arquivos ou selecione do dispositivo</strong>
      <p class="muted">Imagens JPG, PNG, WEBP; videos MP4, WEBM; documentos PDF.</p>
      <input class="input" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,image/*,video/*,application/pdf">
      <div class="progress" aria-hidden="true"><span></span></div>
      <div class="preview-grid" data-preview></div>
    </div>
  `;
}

function bindUpload(zone, onDone) {
  if (!zone) return;
  const input = $("input[type='file']", zone);
  const progress = $(".progress span", zone);
  const preview = $("[data-preview]", zone);
  const process = async (fileList) => {
    const files = [...fileList];
    const accepted = files.filter((file) => /image\/|video\/|application\/pdf/.test(file.type));
    const output = [];
    for (const [index, file] of accepted.entries()) {
      const data = await readFile(file);
      output.push({ id: makeId(), name: file.name, type: file.type, size: file.size, data });
      progress.style.width = `${Math.round(((index + 1) / accepted.length) * 100)}%`;
    }
    preview.innerHTML = output.map(previewItem).join("");
    if (output.length) onDone(output);
    if (files.length !== accepted.length) toast("Alguns arquivos foram ignorados por formato invalido.");
  };
  input.addEventListener("change", () => process(input.files));
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("dragover");
    process(event.dataTransfer.files);
  });
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function previewItem(file) {
  const thumb = file.type.startsWith("image/")
    ? `<img src="${file.data}" alt="">`
    : file.type.startsWith("video/")
      ? `<video src="${file.data}" muted controls></video>`
      : `<div class="preview-thumb">PDF</div>`;
  return `<div class="preview-item">${thumb}<small>${file.name}</small></div>`;
}

function saveAndRerender(message) {
  saveData();
  renderPublic();
  renderLoginPortal();
  toast(message);
}

function renderTeacherPanel(session) {
  const root = $("[data-login-root]");
  const teacher = state.teachers.find((item) => item.id === session.id);
  if (!teacher) {
    clearSession();
    renderLoginForm();
    return;
  }
  const teacherStudents = state.students.filter((student) => (teacher.classes || []).includes(student.className));
  const teacherGrades = state.grades.filter((grade) => grade.teacherId === teacher.id || grade.subject === teacher.subject);
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
    <article class="panel seduc-panel">
      <h2>Conexao com SEDUC</h2>
      <p class="muted">A integracao automatica com o iSEDUC depende de API oficial ou autorizacao da SEDUC. Por enquanto, este botao abre o portal para o professor registrar notas e presencas no iSEDUC.</p>
    </article>
    <div class="panel">
      <div class="portal-heading compact">
        <div>
          <h2>Notas trimestrais</h2>
          <p class="muted">Preencha N1, N2 e N3. A media do trimestre e calculada automaticamente. Marque se o aluno esta em recuperacao neste trimestre.</p>
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
  $("[data-teacher-grade-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    teacherStudents.forEach((student) => {
      const existing = findGrade(student.id, teacher.subject, student.className);
      const next = existing || {
        id: makeId(),
        teacherId: teacher.id,
        studentId: student.id,
        subject: teacher.subject,
        className: student.className,
        trimesters: { 1: normalizeTrimester(), 2: normalizeTrimester(), 3: normalizeTrimester() }
      };
      next.teacherId = teacher.id;
      const recovery = event.target.elements[`recovery-${student.id}`]?.checked || false;
      next.trimesters[currentTeacherTrimester] = normalizeTrimester({
        n1: event.target.elements[`n1-${student.id}`]?.value,
        n2: event.target.elements[`n2-${student.id}`]?.value,
        n3: event.target.elements[`n3-${student.id}`]?.value,
        recovery
      });
      if (existing) {
        state.grades = state.grades.map((grade) => (grade.id === existing.id ? next : grade));
      } else {
        state.grades.push(next);
      }
    });
    saveAndRerender("Notas salvas.");
  });
}

function findGrade(studentId, subject, className) {
  return state.grades.find((grade) => grade.studentId === studentId && grade.subject === subject && grade.className === className);
}

function teacherStudentRow(student, teacher, trimester) {
  const grade = findGrade(student.id, teacher.subject, student.className) || {};
  const trimesterData = getTrimester(grade, trimester);
  const average = trimesterAverage(grade, trimester);
  const isRecovery = trimesterData.recovery || false;
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
      <input type="checkbox" name="recovery-${student.id}" ${isRecovery ? "checked" : ""}>
      <span class="badge">${Number(average) >= 6 && !isRecovery ? "Aprovado" : isRecovery ? "Recuperacao" : "Recuperacao"}</span>
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

function renderStudentPanel(session) {
  const root = $("[data-login-root]");
  const student = state.students.find((item) => item.id === session.id);
  if (!student) {
    clearSession();
    renderLoginForm();
    return;
  }
  const grades = state.grades.filter((grade) => grade.studentId === student.id);
  const averages = grades.map((grade) => Number(gradeAverage(grade)));
  const generalAverage = averages.length
    ? (averages.reduce((total, value) => total + value, 0) / averages.length).toFixed(1)
    : "0.0";
  const hasRecoveryTrimester = grades.some(grade => 
    getTrimester(grade, "1").recovery || getTrimester(grade, "2").recovery || getTrimester(grade, "3").recovery
  );
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
      ${miniStat("Situacao", hasRecoveryTrimester ? "Em recuperacao" : Number(generalAverage) >= 6 ? "Aprovado" : "Recuperacao")}
    </div>
    <article class="panel recovery-panel ${hasRecoveryTrimester || Number(generalAverage) < 6 ? "warning" : ""}">
      <strong>${hasRecoveryTrimester ? "Aluno em recuperacao em algum trimestre. Procure a escola para acompanhar o plano de estudos." : recoveryMessage(generalAverage)}</strong>
    </article>
    <div class="grade-grid">
      ${grades.map((grade) => studentGradeCard(grade)).join("") || emptyState("Nenhuma nota cadastrada para este aluno.")}
    </div>
    <div class="panel report-panel" data-student-report-panel hidden>
      <div class="portal-heading compact">
        <h2>Relatorio geral do aluno</h2>
        <button class="button ghost" data-pdf-report>Gerar PDF</button>
      </div>
      ${studentReportTable(grades)}
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
    generatePdfReport(`Relatorio - ${student.name}`, studentReportTable(grades));
  });
}

function gradeRow(grade) {
  const student = state.students.find((item) => item.id === grade.studentId);
  return `
    <article class="admin-row">
      <div>
        <strong>${escapeHtml(student?.name || "Aluno")}</strong>
        <p class="muted">${escapeHtml(grade.subject)} | ${escapeHtml(grade.className)} | media final ${gradeAverage(grade)}</p>
      </div>
      <span class="badge">1T ${trimesterAverage(grade, "1")} | 2T ${trimesterAverage(grade, "2")} | 3T ${trimesterAverage(grade, "3")}</span>
    </article>
  `;
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
      <span>Media ${trimesterAverage(grade, trimester)}</span>
    </div>
  `;
}

function studentReportTable(grades) {
  const rows = grades
    .map(
      (grade) => {
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
            <td>${t1Recovery || t2Recovery || t3Recovery ? "Em recuperacao" : Number(gradeAverage(grade)) >= 6 ? "Aprovado" : "Recuperacao"}</td>
          </tr>
        `;
      }
    )
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
  $("[data-contact-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    event.target.reset();
    toast("Mensagem registrada localmente. Integre ao backend para envio real.");
  });
  setInterval(() => {
    const media = $("[data-hero-media]");
    if (media) media.style.backgroundPosition = `${50 + Math.sin(Date.now() / 2500) * 3}% center`;
  }, 500);
}

window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", () => {
  renderPublic();
  setupUi();
  setupPreferences();
  route();
});
