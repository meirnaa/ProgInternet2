// ====== Código Comum para Cabeçalho e Rodapé ======
const userAvatar = document.getElementById("user-avatar");
const userOptions = document.getElementById("user-options");
const logoutBtn = document.getElementById("logout-btn");
const themeBtn = document.getElementById("theme-btn");

// Alterna visibilidade das opções do usuário
userAvatar.addEventListener("click", () => {
    userOptions.style.display = userOptions.style.display === "flex" ? "none" : "flex";
});

// Sair da conta
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
});

// Aplica tema salvo no localStorage
if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
}

// Alterna tema e salva no localStorage
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Fecha menu ao clicar fora
document.addEventListener("click", (e) => {
    const isMenuOpen = window.getComputedStyle(userOptions).display === "flex";
    if (isMenuOpen && !userAvatar.contains(e.target) && !userOptions.contains(e.target)) {
        userOptions.style.display = "none";
    }
});

// ====== Lógica Específica da Página de Cenas ======
let cenas = JSON.parse(localStorage.getItem("cenas")) || [];
let editandoIndex = null;

const btnCriarCena = document.getElementById("btn-criar");
const btnListarCenas = document.getElementById("btn-listar");

const formCena = document.getElementById("form-cena");
const formTitulo = document.getElementById("form-titulo");
const nomeCena = document.getElementById("nomeCena");
const acoesCena = document.getElementById("acoesCena");
const intervaloCena = document.getElementById("intervaloCena");
const salvarCena = document.getElementById("salvarCena");
const cancelarCena = document.getElementById("cancelarCena");

const listaCenas = document.getElementById("cenas-ul");
const acoesCenasContainer = document.querySelector(".acoes-cenas");

// Inicializa a lista de cenas ao carregar a página
renderizarCenas(true);

// --- Funções de Cenas ---
function salvarCenas() {
    localStorage.setItem("cenas", JSON.stringify(cenas));
}

function toggleAtivar(index) {
    cenas[index].ativa = !cenas[index].ativa;
    renderizarCenas(true);
}

function renderizarCenas(showActions = true) {
    listaCenas.innerHTML = "";
    cenas.forEach((cena, index) => {
        const li = document.createElement("li");
        li.dataset.index = index;
        
        let actionsHTML = '';
        if (showActions) {
            const statusIcon = cena.ativa ? "🔴" : "🟢";
            const statusText = cena.ativa ? "Desativar" : "Ativar";
            const bordaClass = cena.ativa ? "borda-verde" : "borda-vermelha";

    li.classList.add(bordaClass);
            actionsHTML = `
                <button class="btn-ativar-item" data-index="${index}">${statusIcon} ${statusText}</button>
                <button class="btn-editar-item" data-index="${index}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-item" data-index="${index}"><i class="fas fa-trash"></i> Remover</button>
            `;
        }

        li.innerHTML = `
            <span><strong>${cena.nome}</strong> - ${cena.acoes} (Intervalo: ${cena.intervalo}s)</span>
            <div class="cenas-actions">
                ${actionsHTML}
            </div>
        `;
        listaCenas.appendChild(li);
    });

    if (showActions) {
        document.querySelectorAll(".btn-editar-item").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                editarCena(index);
            });
        });

        document.querySelectorAll(".btn-remover-item").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                removerCena(index);
            });
        });

        document.querySelectorAll(".btn-ativar-item").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                toggleAtivar(index);
            });
        });
    }

    salvarCenas();
}

function editarCena(index) {
    const cena = cenas[index];
    formTitulo.textContent = "Editar Cena";
    formCena.classList.remove("hidden");
    nomeCena.value = cena.nome;
    acoesCena.value = cena.acoes;
    intervaloCena.value = cena.intervalo;
    editandoIndex = index;
    listaCenas.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
}

function removerCena(index) {
    if (confirm(`Tem certeza que deseja remover a cena "${cenas[index].nome}"?`)) {
        cenas.splice(index, 1);
        renderizarCenas(true);
        salvarCenas();
    }
}

// --- Eventos dos Botões de Ação ---
btnCriarCena.addEventListener("click", () => {
    formTitulo.textContent = "Criar Cena";
    formCena.classList.remove("hidden");
    editandoIndex = null;
    nomeCena.value = "";
    acoesCena.value = "";
    intervaloCena.value = 5;
    listaCenas.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
});

btnListarCenas.addEventListener("click", () => {
    cenas.sort((a, b) => {
        if (a.nome < b.nome) return -1;
        if (a.nome > b.nome) return 1;
        return 0;
    });
    
    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");
    formCena.classList.add("hidden");
    renderizarCenas(false);
});

salvarCena.addEventListener("click", () => {
    if (!nomeCena.value) {
        alert("O nome da cena é obrigatório.");
        return;
    }

    const cena = {
        nome: nomeCena.value,
        acoes: acoesCena.value,
        intervalo: parseInt(intervaloCena.value),
        ativa: true
    };

    if (editandoIndex !== null) {
        cena.ativa = cenas[editandoIndex].ativa;
        cenas[editandoIndex] = cena;
    } else {
        cenas.push(cena);
    }

    formCena.classList.add("hidden");
    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");
    renderizarCenas(true);
});

cancelarCena.addEventListener("click", () => {
    formCena.classList.add("hidden");
    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");
});
