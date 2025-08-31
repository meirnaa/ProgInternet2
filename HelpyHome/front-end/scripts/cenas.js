// ====== Código Comum para Cabeçalho e Rodapé ======
const userAvatar = document.getElementById("user-avatar");
const userOptions = document.getElementById("user-options");
const logoutBtn = document.getElementById("logout-btn");
const themeBtn = document.getElementById("theme-btn");

userAvatar.addEventListener("click", () => {
    userOptions.style.display = window.getComputedStyle(userOptions).display === "flex" ? "none" : "flex";
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
});

if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

document.addEventListener("click", (e) => {
    const isMenuOpen = window.getComputedStyle(userOptions).display === "flex";
    if (isMenuOpen && !userAvatar.contains(e.target) && !userOptions.contains(e.target)) {
        userOptions.style.display = "none";
    }
});

// ====== Lógica Específica da Página de Cenas ======
let cenas = [];
let editandoId = null;

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
const tituloPrincipal = document.querySelector(".cenas-container h2");

// --- Funções de Cenas ---
async function buscarCenas() {
    try {
        const resp = await fetch("http://localhost:3000/cena");
        cenas = await resp.json();
        renderizarCenas(true);
    } catch (err) {
        console.error("Erro ao buscar cenas:", err);
        listaCenas.innerHTML = "<li>Erro ao carregar cenas</li>";
    }
}

async function salvarCenaNoBanco() {
    const data = {
        nome: nomeCena.value,
        acoes: acoesCena.value,
        intervalo: parseInt(intervaloCena.value),
        ativa: true
    };

    try {
        if (editandoId !== null) {
            await fetch(`http://localhost:3000/cena/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            await fetch("http://localhost:3000/cena", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        formCena.classList.add("hidden");
        listaCenas.classList.remove("hidden");
        acoesCenasContainer.classList.remove("hidden");
        buscarCenas();
    } catch (err) {
        console.error("Erro ao salvar cena:", err);
        mostrarErro("Não foi possível salvar a cena");
    }
}

async function removerCenaNoBanco(id) {
    if (!confirm("Tem certeza que deseja remover esta cena?")) return;

    try {
        await fetch(`http://localhost:3000/cena/${id}`, { method: "DELETE" });
        buscarCenas();
    } catch (err) {
        console.error("Erro ao remover cena:", err);
        mostrarErro("Não foi possível remover a cena");
    }
}

function renderizarCenas(showActions = true) {
    listaCenas.innerHTML = "";

    if (cenas.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "Nenhuma cena cadastrada ainda.";
        msg.classList.add("mensagem-vazia");
        listaCenas.appendChild(msg);
        return;
    }

    cenas.forEach((cena) => {
        const li = document.createElement("li");
        li.dataset.id = cena.id;

        let actionsHTML = '';
        if (showActions) {
            const statusIcon = cena.ativa ? "🔴" : "🟢";
            const statusText = cena.ativa ? "Desativar" : "Ativar";
            const bordaClass = cena.ativa ? "borda-verde" : "borda-vermelha";

            li.classList.add(bordaClass);
            actionsHTML = `
                <button class="btn-ativar-item" data-id="${cena.id}">${statusIcon} ${statusText}</button>
                <button class="btn-editar-item" data-id="${cena.id}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-item" data-id="${cena.id}"><i class="fas fa-trash"></i> Remover</button>
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
        document.querySelectorAll(".btn-editar-item").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                const resp = await fetch(`http://localhost:3000/cena/${id}`);
                const cena = await resp.json();
                editarCena(cena);
            });
        });

        document.querySelectorAll(".btn-remover-item").forEach(btn => {
            btn.addEventListener("click", (e) => removerCenaNoBanco(e.currentTarget.dataset.id));
        });

        document.querySelectorAll(".btn-ativar-item").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                await fetch(`http://localhost:3000/cena/${id}/toggle`, { method: "PUT" });
                buscarCenas();
            });
        });
    }
}

function editarCena(cena) {
    formTitulo.textContent = "Editar Cena";
    formCena.classList.remove("hidden");
    nomeCena.value = cena.nome;
    acoesCena.value = cena.acoes;
    intervaloCena.value = cena.intervalo;
    editandoId = cena.id;

    listaCenas.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
}

// --- Eventos ---
btnCriarCena.addEventListener("click", () => {
    formTitulo.textContent = "Criar Cena";
    formCena.classList.remove("hidden");
    editandoId = null;
    nomeCena.value = "";
    acoesCena.value = "";
    intervaloCena.value = 5;
    listaCenas.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
});

btnListarCenas.addEventListener("click", () => {
    cenas.sort((a, b) => a.nome.localeCompare(b.nome));

    listaCenas.classList.remove("hidden");
    formCena.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
    renderizarCenas(false);

    // Altera o título
    tituloPrincipal.innerText = "Lista de Cenas";
    tituloPrincipal.style.color = "#FF8C00";

    // Cria botão voltar caso não exista
    if (!document.getElementById("btn-voltar")) {
        const btnVoltar = document.createElement("button");
        btnVoltar.id = "btn-voltar";

        btnVoltar.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
        btnVoltar.classList.add("btn-voltar");
        listaCenas.parentElement.appendChild(btnVoltar);

        btnVoltar.addEventListener("click", () => {
            listaCenas.classList.remove("hidden");
            formCena.classList.add("hidden");
            acoesCenasContainer.classList.remove("hidden");

            // 🔹 Volta o título para "Gerenciamento de Cenas"
            tituloPrincipal.innerText = "Gerenciamento de Cenas";
            tituloPrincipal.style.color = "#000000";

            btnVoltar.remove();
        });
    }
});

// Cancelar
cancelarCena.addEventListener("click", () => {
    formCena.classList.add("hidden");
    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");
});

// Função para mostrar mensagens de erro
function mostrarErro(msg) {
    let erroDiv = document.querySelector(".mensagem-erro");
    if (!erroDiv) {
        erroDiv = document.createElement("div");
        erroDiv.classList.add("mensagem-erro");
        formCena.appendChild(erroDiv);
    }
    erroDiv.textContent = msg;
}

// Inicializa lista
buscarCenas();
