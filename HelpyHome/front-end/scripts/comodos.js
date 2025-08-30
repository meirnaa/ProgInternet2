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
    const isMenuOpen = userOptions.style.display === "flex";
    if (isMenuOpen && !userAvatar.contains(e.target) && !userOptions.contains(e.target)) {
        userOptions.style.display = "none";
    }
});

// ====== Lógica Específica da Página de Cômodos ======
let comodos = JSON.parse(localStorage.getItem("comodos")) || [];
let editandoComodoIndex = null;
let comodoSelecionadoIndex = null;
let editandoDispositivoIndex = null;

const btnCriarComodo = document.getElementById("btn-criar-comodo");
//const btnEditarComodo = document.getElementById("btn-editar-comodo"); // Removido do HTML
//const btnRemoverComodo = document.getElementById("btn-remover-comodo"); // Removido do HTML
const btnListarComodos = document.getElementById("btn-listar-comodos");

const formComodo = document.getElementById("form-comodo");
const formTituloComodo = document.getElementById("form-titulo-comodo");
const nomeComodo = document.getElementById("nomeComodo");
const descricaoComodo = document.getElementById("descricaoComodo");
const salvarComodo = document.getElementById("salvarComodo");
const cancelarComodo = document.getElementById("cancelarComodo");

const listaComodos = document.getElementById("comodos-ul");
const dispositivosSection = document.getElementById("dispositivos-container");
const comodosContainer = document.querySelector(".comodos-container");

// Inicializar a lista de cômodos ao carregar a página
renderizarComodos();

// --- Funções de Cômodos ---
function salvarComodos() {
    localStorage.setItem("comodos", JSON.stringify(comodos));
}

function renderizarComodos(showActions = true) {
    listaComodos.innerHTML = "";
    comodos.forEach((comodo, index) => {
        const li = document.createElement("li");
        li.classList.add('comodo-item');
        li.dataset.index = index;

        const dispositivosNomes = comodo.dispositivos.map(disp => disp.nome).join(', ');

        let actionsHTML = '';
        if (showActions) {
            actionsHTML = `
                <button class="btn-gerenciar-dispositivos" data-index="${index}"><i class="fas fa-tools"></i> Gerenciar Dispositivos</button>
                <button class="btn-editar-item" data-index="${index}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-item" data-index="${index}"><i class="fas fa-trash"></i> Remover</button>
            `;
        }

        li.innerHTML = `
            <div class="comodo-info">
                <div>
                    <h4>${comodo.nome}</h4>
                    <p>${comodo.descricao}</p>
                    <p>Dispositivos: ${dispositivosNomes || 'Nenhum'}</p>
                </div>
            </div>
            <div class="comodo-actions">
                ${actionsHTML}
            </div>
        `;
        listaComodos.appendChild(li);
    });

    document.querySelectorAll(".comodo-item").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".comodo-item").forEach(li => li.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    if (showActions) {
        document.querySelectorAll(".btn-gerenciar-dispositivos").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                comodoSelecionadoIndex = parseInt(index);
                exibirGerenciadorDispositivos(comodos[index]);
            });
        });

        document.querySelectorAll(".btn-editar-item").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                editarComodo(index);
            });
        });

        document.querySelectorAll(".btn-remover-item").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = e.currentTarget.dataset.index;
                removerComodo(index);
            });
        });
    }

    salvarComodos();
}

function editarComodo(index) {
    const comodo = comodos[index];
    formTituloComodo.textContent = "Editar Cômodo";
    formComodo.classList.remove("hidden");
    nomeComodo.value = comodo.nome;
    descricaoComodo.value = comodo.descricao;
    editandoComodoIndex = index;
    comodosContainer.classList.add("hidden");
    dispositivosSection.classList.add("hidden");
}

function removerComodo(index) {
    if (confirm(`Tem certeza que deseja remover o cômodo "${comodos[index].nome}"?`)) {
        comodos.splice(index, 1);
        renderizarComodos();
        salvarComodos();
    }
}

// --- Eventos dos Botões de Ação de Cômodos (parte superior) ---
btnCriarComodo.addEventListener("click", () => {
    formTituloComodo.textContent = "Novo Cômodo";
    formComodo.classList.remove("hidden");
    editandoComodoIndex = null;
    nomeComodo.value = "";
    descricaoComodo.value = "";
    listaComodos.classList.add("hidden");
    dispositivosSection.classList.add("hidden");
});

btnListarComodos.addEventListener("click", () => {
    comodosContainer.classList.remove("hidden");
    dispositivosSection.classList.add("hidden");
    formComodo.classList.add("hidden");
    listaComodos.classList.remove("hidden");
    renderizarComodos();
});

salvarComodo.addEventListener("click", () => {
    if (!nomeComodo.value) {
        alert("O nome do cômodo é obrigatório.");
        return;
    }

    const comodo = {
        nome: nomeComodo.value,
        descricao: descricaoComodo.value,
        dispositivos: editandoComodoIndex !== null ? comodos[editandoComodoIndex].dispositivos : []
    };

    if (editandoComodoIndex !== null) {
        comodos[editandoComodoIndex] = comodo;
    } else {
        comodos.push(comodo);
    }

    formComodo.classList.add("hidden");
    renderizarComodos();
    listaComodos.classList.remove("hidden");
});

cancelarComodo.addEventListener("click", () => {
    formComodo.classList.add("hidden");
    listaComodos.classList.remove("hidden");
});

// --- Lógica de Dispositivos ---
function exibirGerenciadorDispositivos(comodo) {
    comodosContainer.classList.add("hidden");
    dispositivosSection.classList.remove("hidden");
    dispositivosSection.innerHTML = `
        <div class="comodos-container">
            <h3>Dispositivos em: ${comodo.nome}</h3>
            <div class="acoes-dispositivos">
                <button id="btn-add-dispositivo"><i class="fa fa-plus"></i> Adicionar Dispositivo</button>
            </div>
            <div id="form-dispositivo" class="form-dispositivo hidden">
                <h4 id="form-titulo-dispositivo">Novo Dispositivo</h4>
                <label for="nomeDispositivo">Nome:</label>
                <input type="text" id="nomeDispositivo" placeholder="Ex: Lâmpada do teto">
                <label for="tipoDispositivo">Tipo:</label>
                <input type="text" id="tipoDispositivo" placeholder="Ex: Lâmpada, Termostato">
                <button id="salvarDispositivo">Salvar</button>
                <button id="cancelarDispositivo" class="btn-cancelar">Cancelar</button>
            </div>
            <ul id="lista-dispositivos" class="lista-dispositivos">
                </ul>
            <button id="btn-voltar-comodos" class="btn-voltar-comodos"><i class="fas fa-arrow-left"></i> Voltar para Cômodos</button>
        </div>
    `;
    renderizarDispositivos(comodo.dispositivos);

    document.getElementById("btn-add-dispositivo").addEventListener("click", () => {
        document.getElementById("form-dispositivo").classList.remove("hidden");
        document.getElementById("form-titulo-dispositivo").textContent = "Novo Dispositivo";
        document.getElementById("nomeDispositivo").value = "";
        document.getElementById("tipoDispositivo").value = "";
        editandoDispositivoIndex = null;
    });

    document.getElementById("salvarDispositivo").addEventListener("click", salvarDispositivo);
    document.getElementById("cancelarDispositivo").addEventListener("click", () => {
        document.getElementById("form-dispositivo").classList.add("hidden");
    });
    document.getElementById("btn-voltar-comodos").addEventListener("click", () => {
        dispositivosSection.classList.add("hidden");
        comodosContainer.classList.remove("hidden");
    });
}

function renderizarDispositivos(dispositivos) {
    const listaDispositivos = document.getElementById("lista-dispositivos");
    listaDispositivos.innerHTML = "";
    dispositivos.forEach((dispositivo, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${dispositivo.nome} (${dispositivo.tipo})</span>
            <div class="dispositivo-actions">
                <button class="btn-editar-dispositivo" data-index="${index}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-dispositivo" data-index="${index}"><i class="fas fa-trash"></i> Remover</button>
            </div>
        `;
        listaDispositivos.appendChild(li);
    });

    document.querySelectorAll(".btn-editar-dispositivo").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.currentTarget.dataset.index;
            editarDispositivo(index);
        });
    });

    document.querySelectorAll(".btn-remover-dispositivo").forEach(button => {
        button.addEventListener("click", (e) => {
            const index = e.currentTarget.dataset.index;
            removerDispositivo(index);
        });
    });
}

function salvarDispositivo() {
    const nome = document.getElementById("nomeDispositivo").value;
    const tipo = document.getElementById("tipoDispositivo").value;

    if (!nome || !tipo) {
        alert("Nome e tipo do dispositivo são obrigatórios.");
        return;
    }

    if (editandoDispositivoIndex !== null) {
        comodos[comodoSelecionadoIndex].dispositivos[editandoDispositivoIndex] = { nome, tipo };
    } else {
        const novoDispositivo = { nome, tipo };
        if (comodoSelecionadoIndex !== null) {
            comodos[comodoSelecionadoIndex].dispositivos.push(novoDispositivo);
        }
    }

    editandoDispositivoIndex = null;

    renderizarDispositivos(comodos[comodoSelecionadoIndex].dispositivos);
    salvarComodos();
    document.getElementById("form-dispositivo").classList.add("hidden");
    document.getElementById("nomeDispositivo").value = "";
    document.getElementById("tipoDispositivo").value = "";
}

function editarDispositivo(index) {
    const dispositivo = comodos[comodoSelecionadoIndex].dispositivos[index];
    const nomeInput = document.getElementById("nomeDispositivo");
    const tipoInput = document.getElementById("tipoDispositivo");
    const formDispositivo = document.getElementById("form-dispositivo");
    const formTitulo = document.getElementById("form-titulo-dispositivo");

    formTitulo.textContent = "Editar Dispositivo";
    nomeInput.value = dispositivo.nome;
    tipoInput.value = dispositivo.tipo;
    formDispositivo.classList.remove("hidden");
    editandoDispositivoIndex = index;
}

function removerDispositivo(index) {
    if (confirm(`Tem certeza que deseja remover o dispositivo "${comodos[comodoSelecionadoIndex].dispositivos[index].nome}"?`)) {
        comodos[comodoSelecionadoIndex].dispositivos.splice(index, 1);
        renderizarDispositivos(comodos[comodoSelecionadoIndex].dispositivos);
        salvarComodos();
    }
}

// Substitua esta função
btnListarComodos.addEventListener("click", () => {
    // Ordena os cômodos em ordem alfabética crescente
    comodos.sort((a, b) => {
        if (a.nome < b.nome) return -1;
        if (a.nome > b.nome) return 1;
        return 0;
    });

    comodosContainer.classList.remove("hidden");
    dispositivosSection.classList.add("hidden");
    formComodo.classList.add("hidden");
    listaComodos.classList.remove("hidden");
    renderizarComodos(false); // <--- Chama a função sem botões
});
