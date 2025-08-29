const userAvatar = document.getElementById("user-avatar");
const userOptions = document.getElementById("user-options");
const logoutBtn = document.getElementById("logout-btn");
const themeBtn = document.getElementById("theme-btn");

// alterna visibilidade das opções
userAvatar.addEventListener("click", () => {
    const isOpen = window.getComputedStyle(userOptions).display === "flex";
    userOptions.style.display = isOpen ? "none" : "flex";
});

// sair da conta
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
});

// aplica tema salvo
if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
}

// alterna tema e salva
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// fecha menu ao clicar fora
document.addEventListener("click", (e) => {
    const isOpen = window.getComputedStyle(userOptions).display === "flex";
    if (isOpen && !userAvatar.contains(e.target) && !userOptions.contains(e.target)) {
        userOptions.style.display = "none";
    }
});

let cenas = [];
let editandoIndex = null;

const btnCriar = document.getElementById("btn-criar");
const btnEditar = document.getElementById("btn-editar");
const btnRemover = document.getElementById("btn-remover");
const btnListar = document.getElementById("btn-listar");

const formCena = document.getElementById("form-cena");
const formTitulo = document.getElementById("form-titulo");
const nomeCena = document.getElementById("nomeCena");
const acoesCena = document.getElementById("acoesCena");
const intervaloCena = document.getElementById("intervaloCena");
const salvarCena = document.getElementById("salvarCena");
const cancelarCena = document.getElementById("cancelarCena");

const listaCenas = document.getElementById("cenas-ul");

// Abrir formulário de criação
btnCriar.addEventListener("click", () => {
  formTitulo.textContent = "Criar Cena";
  formCena.classList.remove("hidden");
  editandoIndex = null;
  nomeCena.value = "";
  acoesCena.value = "";
  intervaloCena.value = 5;
});

// Editar última cena (exemplo simples)
btnEditar.addEventListener("click", () => {
  if (cenas.length === 0) return alert("Nenhuma cena cadastrada!");
  const cena = cenas[cenas.length - 1];
  formTitulo.textContent = "Editar Cena";
  formCena.classList.remove("hidden");
  nomeCena.value = cena.nome;
  acoesCena.value = cena.acoes;
  intervaloCena.value = cena.intervalo;
  editandoIndex = cenas.length - 1;
});

// Remover última cena (exemplo simples)
btnRemover.addEventListener("click", () => {
  if (cenas.length === 0) return alert("Nenhuma cena para remover!");
  cenas.pop();
  renderizarCenas();
});

// Listar cenas
btnListar.addEventListener("click", () => {
  renderizarCenas();
});

// Salvar cena (criar/editar)
salvarCena.addEventListener("click", () => {
  const cena = {
    nome: nomeCena.value,
    acoes: acoesCena.value,
    intervalo: parseInt(intervaloCena.value),
    ativa: true
  };

  if (editandoIndex !== null) {
    cenas[editandoIndex] = cena;
  } else {
    cenas.push(cena);
  }

  formCena.classList.add("hidden");
  renderizarCenas();
});

// Cancelar
cancelarCena.addEventListener("click", () => {
  formCena.classList.add("hidden");
});

// Renderizar lista
function renderizarCenas() {
  listaCenas.innerHTML = "";
  cenas.forEach((cena, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${cena.nome}</strong> - ${cena.acoes} (Intervalo: ${cena.intervalo}s)</span>
      <button onclick="toggleAtivar(${index})">
        ${cena.ativa ? "🔴 Desativar" : "🟢 Ativar"}
      </button>
    `;
    listaCenas.appendChild(li);
  });
}

// Ativar/Desativar
function toggleAtivar(index) {
  cenas[index].ativa = !cenas[index].ativa;
  renderizarCenas();
}
