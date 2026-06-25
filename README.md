# Portal CETI Maria Neusa de Sousa

Site institucional responsivo e SPA para o CETI Maria Neusa de Sousa - Francisco Macedo-PI.

## Como abrir

Abra o arquivo `index.html` diretamente no navegador.

## Colocar em rede local

Na pasta do projeto, rode:

```powershell
node serve-local.js
```

Depois acesse pelo computador em `http://localhost:8080` ou, em outro aparelho na mesma rede Wi-Fi, use `http://IP-DO-COMPUTADOR:8080`.

## Login

Acesse a aba `Login`. No primeiro acesso, crie o usuario e a senha do administrador.

O CMS salva os dados e o acesso administrativo no `localStorage` do navegador, permitindo cadastrar, editar, excluir, publicar ou ocultar registros sem servidor.

O administrador tambem cadastra turmas, disciplinas, alunos e professores. No cadastro do aluno escolha a turma; no cadastro do professor escolha a disciplina e marque as turmas em que ele leciona. Professores acessam o portal para lancar N1, N2 e N3 em cada um dos tres trimestres; estudantes acessam para ver notas trimestrais, media final, situacao de recuperacao, grafico e relatorio geral.

O perfil do professor possui atalho para o iSEDUC/SEDUC-PI. A integracao automatica com `https://portal.seduc.pi.gov.br/` depende de API oficial ou autorizacao da SEDUC; sem isso, o portal local apenas abre o sistema oficial para registro manual.

## Funcionalidades entregues

- SPA sem recarregamento de pagina.
- Home institucional com hero, destaques, indicadores e galeria.
- Abas: Inicio, Noticias, Quem Somos, Calendario, Atividades, Conquistas e Contato.
- Calendario com visualizacao mensal, semanal e lista.
- Filtros por texto e categoria.
- Modo claro/escuro.
- Navegacao por teclado e estrutura semantica.
- Login com perfis de administrador, professor e estudante.
- CMS protegido por acesso administrativo criado no primeiro uso.
- Cadastro de turmas dos alunos pelo administrador.
- Cadastro de disciplinas dos professores pelo administrador.
- Cadastro de alunos pelo administrador.
- Cadastro de professores com disciplina e turmas.
- Lancamento de N1, N2 e N3 nos tres trimestres por professores.
- Perfil de notas em formato de planilha por turma, disciplina e trimestre.
- Boletim do estudante com medias trimestrais, media final, aviso de recuperacao e grafico.
- Relatorio geral do aluno com todas as disciplinas e geracao de PDF.
- Relatorio do professor somente com a disciplina dele e todos os alunos vinculados, com geracao de PDF.
- Atalho para o portal iSEDUC/SEDUC-PI.
- CRUD de noticias, eventos, atividades e conquistas.
- Edicao pelo admin dos textos de Quem Somos e dos contatos da escola.
- Upload com arrastar e soltar, seletor de arquivos, pre-visualizacao e barra de progresso.
- Suporte local a JPG, PNG, WEBP, MP4, WEBM e PDF.
- Logomarca oficial aplicada com recorte circular em PNG.

## Observacao tecnica

O pedido original cita React, Next.js, Tailwind CSS, Framer Motion, Node.js, Express, PostgreSQL e JWT. Este ambiente nao possui `node` nem `npm` instalados, entao a entrega foi implementada como SPA estatica funcional em HTML, CSS e JavaScript puro.

Para producao, a evolucao recomendada e migrar o CMS local para:

- Next.js no frontend.
- API Node/Express ou API routes.
- PostgreSQL para persistencia.
- JWT com perfis de usuario.
- Upload local com adaptador compativel com Cloud Storage.
