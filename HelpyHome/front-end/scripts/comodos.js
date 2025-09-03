// ===================================================================
// FUNÇÃO CENTRAL DE AUTENTICAÇÃO
// Esta função será usada para TODAS as chamadas ao backend.===================================================================
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Nenhum token encontrado, redirecionando para o login.');
        window.location.href = 'login.html';
        throw new Error('Token de autenticação não encontrado.');
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };
    const fetchOptions = { ...options, headers };
    const response = await fetch(url, fetchOptions);
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');
        console.error('Token inválido ou expirado. Redirecionando para o login.');
        window.location.href = 'login.html';
        throw new Error('Não autorizado.');
    }
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.erro || `Erro na requisição: ${response.statusText}`);
    }
    return response.json(); // Retorna os dados JSON diretamente
}

// ====== Código Comum para Cabeçalho e Rodapé ======
const userAvatar = document.getElementById("user-avatar");
const userOptions = document.getElementById("user-options");
const logoutBtn = document.getElementById("logout-btn");
const themeBtn = document.getElementById("theme-btn");

if (userAvatar) userAvatar.addEventListener("click", () => userOptions.style.display = userOptions.style.display === "flex" ? "none" : "flex");
if (localStorage.getItem("tema") === "dark") document.body.classList.add("dark-mode");
if (themeBtn) themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
});
document.addEventListener("click", (e) => {
    const isMenuOpen = userOptions && userOptions.style.display === "flex";
    if (isMenuOpen && !userAvatar.contains(e.target) && !userOptions.contains(e.target)) {
        userOptions.style.display = "none";
    }
});

// --- Funções de Cômodos ---
const btnCriarComodo = document.getElementById("btn-criar-comodo");
const formComodo = document.getElementById("form-comodo");
const nomeComodoInput = document.getElementById("nomeComodo");
const descricaoComodoInput = document.getElementById("descricaoComodo");
const salvarComodoBtn = document.getElementById("salvarComodo");
const cancelarComodoBtn = document.getElementById("cancelarComodo");
const listaComodos = document.getElementById("comodos-ul");
const comodosContainer = document.querySelector(".comodos-container");
const acoesComodosContainer = document.querySelector(".acoes-comodos");
const dispositivosSection = document.getElementById("dispositivos-container");
const erroComodo = document.getElementById("erroComodo");
let editandoComodoId = null;
const tituloPrincipal = document.querySelector(".comodos-container h2");

// --- Eventos Principais ---
if (btnCriarComodo) btnCriarComodo.addEventListener("click", () => {
    tituloPrincipal.innerText = "Criar Cômodo";
    tituloPrincipal.style.color = "#FF8C00";
    listaComodos.classList.add("hidden");
    acoesComodosContainer.classList.add("hidden");
    formComodo.classList.remove("hidden");
    nomeComodoInput.value = "";
    descricaoComodoInput.value = "";
    editandoComodoId = null;
});

if (cancelarComodoBtn) cancelarComodoBtn.addEventListener("click", () => {
    formComodo.classList.add("hidden");
    acoesComodosContainer.classList.remove("hidden");
    tituloPrincipal.innerText = "Gerenciamento de Cômodos";
    tituloPrincipal.style.color = "#000000";
    renderizarComodos(true);
    listaComodos.classList.remove("hidden");
    if(erroComodo) erroComodo.classList.add("hidden");
});

async function renderizarComodos(showActions = true) {
    listaComodos.innerHTML = "";
    try {
        const comodos = await fetchWithAuth("http://localhost:3000/comodo"); 
        if (comodos.length === 0) {
            listaComodos.innerHTML = `<p class="mensagem-vazia">Nenhum cômodo cadastrado ainda.</p>`;
            return;
        }

        for (const comodo of comodos) {
            const dispositivos = await fetchWithAuth(`http://localhost:3000/dispositivo-comodo?comodo_id=${comodo.id}`); // CORRIGIDO: Porta 3000
            comodo.qtdDispositivos = dispositivos.length;
        }

        comodos.forEach((comodo) => {
            const li = document.createElement("li");
            li.classList.add("comodo-item");
            li.dataset.id = comodo.id;
            const actionsHTML = showActions ? `
                <button class="btn-gerenciar-dispositivos" data-id="${comodo.id}"><i class="fas fa-tools"></i> Gerenciar</button>
                <button class="btn-editar-item" data-id="${comodo.id}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-item" data-id="${comodo.id}"><i class="fas fa-trash"></i> Remover</button>` : "";
            li.innerHTML = `
                <div class="comodo-info">
                    <div>
                        <h4>${comodo.nome}</h4>
                        <p>${comodo.descricao || "Sem descrição"}</p>
                        <p>Dispositivos: ${comodo.qtdDispositivos}</p>
                    </div>
                </div>
                <div class="comodo-actions">${actionsHTML}</div>`;
            listaComodos.appendChild(li);
        });

        if (showActions) addEventListenersComodos();
    } catch (err) {
        console.error("Erro ao renderizar cômodos:", err);
        listaComodos.innerHTML = "<li>Erro ao carregar cômodos</li>";
    }
}

function addEventListenersComodos() {
    document.querySelectorAll(".btn-gerenciar-dispositivos").forEach(btn => btn.addEventListener("click", handleGerenciarDispositivos));
    document.querySelectorAll(".btn-editar-item").forEach(btn => btn.addEventListener("click", handleEditarComodo));
    document.querySelectorAll(".btn-remover-item").forEach(btn => btn.addEventListener("click", handleRemoverComodo));
}

async function handleGerenciarDispositivos(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const comodo = await fetchWithAuth(`http://localhost:3000/comodo/${id}`); // CORRIGIDO: Porta 3000
    exibirGerenciadorDispositivos(comodo);
}

async function handleEditarComodo(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const comodo = await fetchWithAuth(`http://localhost:3000/comodo/${id}`); // CORRIGIDO: Porta 3000
    formComodo.classList.remove("hidden");
    nomeComodoInput.value = comodo.nome;
    descricaoComodoInput.value = comodo.descricao || "";
    editandoComodoId = comodo.id;
}

function handleRemoverComodo(e) {
    e.stopPropagation();
    const id = e.currentTarget.closest(".comodo-item").dataset.id;
    const nome = e.currentTarget.closest(".comodo-item").querySelector("h4").textContent;
    confirmarRemocaoComodo(id, nome);
}

if(salvarComodoBtn) salvarComodoBtn.addEventListener("click", async () => {
    if (!nomeComodoInput.value) {
        erroComodo.textContent = "O nome do cômodo é obrigatório.";
        erroComodo.classList.remove("hidden");
        return;
    }
    erroComodo.classList.add("hidden");
    const body = { nome: nomeComodoInput.value, descricao: descricaoComodoInput.value };
    const method = editandoComodoId ? "PUT" : "POST";
    const url = editandoComodoId ? `http://localhost:3000/comodo/${editandoComodoId}` : "http://localhost:3000/comodo"; // CORRIGIDO: Porta 3000
    try {
        await fetchWithAuth(url, { method, body: JSON.stringify(body) }); // CORRIGIDO: fetchWithAuth
        formComodo.classList.add("hidden");
        tituloPrincipal.innerText = "Gerenciamento de Cômodos";
        tituloPrincipal.style.color = "#000000";
        acoesComodosContainer.classList.remove("hidden");
        listaComodos.classList.remove("hidden");
        renderizarComodos();
    } catch (err) {
        console.error("Erro ao salvar cômodo:", err);
        erroComodo.textContent = "Erro ao salvar cômodo.";
        erroComodo.classList.remove("hidden");
    }
});

// --- Lógica de Dispositivos ---
let comodoSelecionadoId = null;
let editandoDispositivoId = null;

async function exibirGerenciadorDispositivos(comodo) {
    comodoSelecionadoId = comodo.id;
    comodosContainer.classList.add("hidden");
    dispositivosSection.classList.remove("hidden");
    dispositivosSection.innerHTML = `
        <div class="comodos-container">
            <h3>Dispositivos em: ${comodo.nome}</h3>
            <div class="acoes-dispositivos"><button id="btn-add-dispositivo"><i class="fa fa-plus"></i> Adicionar Dispositivo</button></div>
            <div id="form-dispositivo" class="form-dispositivo hidden">
                <h4 id="form-titulo-dispositivo">Novo Dispositivo</h4>
                <label for="nomeDispositivo">Nome:</label>
                <input type="text" id="nomeDispositivo" placeholder="Ex: Lâmpada do teto">
                <label for="tipoDispositivo">Tipo:</label>
                <input type="text" id="tipoDispositivo" placeholder="Ex: Iluminação">
                <p id="mensagem-erro-dispositivo" style="color:red;"></p>
                <div class="botoes-comodos">
                    <button id="salvarDispositivo">Salvar</button>
                    <button id="cancelarDispositivo" class="btn-cancelar">Cancelar</button>
                </div>
            </div>
            <ul id="lista-dispositivos" class="lista-dispositivos"></ul>
            <button id="btn-voltar-comodos" class="btn-voltar-comodos"><i class="fas fa-arrow-left"></i> Voltar</button>
        </div>`;
    await renderizarDispositivos();
    addEventListenersGerenciador();
}

function addEventListenersGerenciador() {
    document.getElementById("btn-add-dispositivo").addEventListener("click", () => {
        document.getElementById("form-dispositivo").classList.remove("hidden");
        document.getElementById("lista-dispositivos").classList.add("hidden");
        document.getElementById("btn-voltar-comodos").classList.add("hidden");
        editandoDispositivoId = null;
    });
    document.getElementById("cancelarDispositivo").addEventListener("click", () => {
        document.getElementById("form-dispositivo").classList.add("hidden");
        document.getElementById("lista-dispositivos").classList.remove("hidden");
        document.getElementById("btn-voltar-comodos").classList.remove("hidden");
    });
    document.getElementById("btn-voltar-comodos").addEventListener("click", () => {
        dispositivosSection.classList.add("hidden");
        comodosContainer.classList.remove("hidden");
        renderizarComodos();
    });
    document.getElementById("salvarDispositivo").addEventListener("click", salvarDispositivo);
}

async function renderizarDispositivos() {
    const listaDispositivos = document.getElementById("lista-dispositivos");
    listaDispositivos.innerHTML = "";
    try {
        const dispositivos = await fetchWithAuth(`http://localhost:3000/dispositivo-comodo?comodo_id=${comodoSelecionadoId}`); // CORRIGIDO: Porta 3000
        if (dispositivos.length === 0) {
            listaDispositivos.innerHTML = `<p class="mensagem-vazia">Nenhum dispositivo cadastrado ainda.</p>`;
            return;
        }
        dispositivos.forEach(d => {
            const li = document.createElement("li");
            li.dataset.id = d.id;
            const bordaClass = d.estado ? "borda-verde" : "borda-vermelha";
            li.classList.add(bordaClass);
            li.innerHTML = `
                <span>${d.nome} (${d.tipo})</span>
                <div class="dispositivo-actions">
                    <button class="btn-toggle-estado" data-id="${d.id}">${d.estado ? 'Desligar' : 'Ligar'}</button>
                    <button class="btn-editar-dispositivo" data-id="${d.id}"><i class="fas fa-pen"></i> Editar</button>
                     <button class="btn-remover-dispositivo" data-id="${d.id}"><i class="fas fa-trash"></i> Remover</button>
                </div>`;
            listaDispositivos.appendChild(li);
        });
        addEventListenersDispositivos();
    } catch (err) {
        console.error("Erro ao carregar dispositivos:", err);
        listaDispositivos.innerHTML = "<li>Erro ao carregar dispositivos</li>";
    }
}

function addEventListenersDispositivos() {
    document.querySelectorAll(".btn-toggle-estado").forEach(btn => btn.addEventListener("click", toggleEstadoDispositivo));
    document.querySelectorAll(".btn-editar-dispositivo").forEach(btn => btn.addEventListener("click", handleEditarDispositivo));
    document.querySelectorAll(".btn-remover-dispositivo").forEach(btn => btn.addEventListener("click", handleRemoverDispositivo));
}

// Função que faz a mágica acontecer, no comodos.js

async function toggleEstadoDispositivo(e) {
    const id = e.currentTarget.dataset.id;
    try {
        // 1. Busca o dispositivo atual para saber seu estado
        const dispositivo = await fetchWithAuth(`http://localhost:3000/dispositivo/${id}`);
        
        // 2. Prepara o corpo da requisição com o estado invertido
        const body = { ...dispositivo, estado: !dispositivo.estado };
        
        // 3. Envia a atualização para o servidor
        await fetchWithAuth(`http://localhost:3000/dispositivo/${id}`, { 
            method: "PUT", 
            body: JSON.stringify(body) 
        });
        
        // 4. Atualiza a lista para mostrar o novo estado
        renderizarDispositivos();
    } catch (err) {
        console.error("Erro ao alternar estado:", err);
    }
}

async function handleEditarDispositivo(e) {
    const id = e.currentTarget.dataset.id;
    const dispositivo = await fetchWithAuth(`http://localhost:3000/dispositivo/${id}`);
    document.getElementById("form-dispositivo").classList.remove("hidden");
    document.getElementById("form-titulo-dispositivo").textContent = "Editar Dispositivo";
    document.getElementById("nomeDispositivo").value = dispositivo.nome;
    document.getElementById("tipoDispositivo").value = dispositivo.tipo;
    editandoDispositivoId = id;
}

function handleRemoverDispositivo(e) {
    const id = e.currentTarget.dataset.id;
    const nome = e.currentTarget.closest("li").querySelector("span").textContent.split(" (")[0];
    confirmarRemocaoDispositivo(id, nome);
}

async function salvarDispositivo() {
    const nome = document.getElementById("nomeDispositivo").value;
    const tipo = document.getElementById("tipoDispositivo").value;
    const erroMsg = document.getElementById("mensagem-erro-dispositivo");
    if (!nome || !tipo) {
        erroMsg.textContent = "Nome e tipo são obrigatórios.";
        return;
    }
    erroMsg.textContent = "";
    const body = { nome, tipo, comodo_id: comodoSelecionadoId, estado: false };
    const method = editandoDispositivoId ? "PUT" : "POST";
    const url = editandoDispositivoId ? `http://localhost:3000/dispositivo/${editandoDispositivoId}` : "http://localhost:3000/dispositivo";
    try {
        await fetchWithAuth(url, { method, body: JSON.stringify(body) });
        document.getElementById("form-dispositivo").classList.add("hidden");
        document.getElementById("lista-dispositivos").classList.remove("hidden");
        document.getElementById("btn-voltar-comodos").classList.remove("hidden");
        renderizarDispositivos();
    } catch (err) {
        console.error("Erro ao salvar dispositivo:", err);
        erroMsg.textContent = "Erro ao salvar dispositivo.";
    }
}

// --- Funções de Modal e Logout ---
const modal = document.getElementById("modal-confirm");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");
let itemParaRemover = { id: null, tipo: null };

function abrirModalConfirmacao(mensagem, tipo, id) {
    modalText.textContent = mensagem;
    itemParaRemover = { id, tipo };
    modal.classList.remove("hidden");
}

function fecharModal() {
    modal.classList.add("hidden");
    itemParaRemover = { id: null, tipo: null };
}

if(modalClose) modalClose.addEventListener("click", fecharModal);
if(modalCancel) modalCancel.addEventListener("click", fecharModal);
if(modalConfirmBtn) modalConfirmBtn.addEventListener("click", async () => {
    if (itemParaRemover.tipo === "logout") logout();
    else if (itemParaRemover.tipo === "comodo") await fetchWithAuth(`http://localhost:3000/comodo/${itemParaRemover.id}`, { method: "DELETE" }).then(() => renderizarComodos()); // CORRIGIDO
    else if (itemParaRemover.tipo === "dispositivo") await fetchWithAuth(`http://localhost:3000/dispositivo/${itemParaRemover.id}`, { method: "DELETE" }).then(() => renderizarDispositivos()); // CORRIGIDO
    fecharModal();
});

function confirmarRemocaoComodo(id, nome) {
    abrirModalConfirmacao(`Tem certeza que deseja remover o cômodo "${nome}"?`, "comodo", id);
}
function confirmarRemocaoDispositivo(id, nome) {
    abrirModalConfirmacao(`Tem certeza que deseja remover o dispositivo "${nome}"?`, "dispositivo", id);
}
function confirmarLogout() {
    abrirModalConfirmacao("Tem certeza que deseja sair da conta?", "logout");
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// --- Inicialização da Página ---
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token"); // CORRIGIDO
    if (!token) {
        document.body.innerHTML = "<h1>Acesso Negado</h1><p>Você precisa fazer <a href='login.html'>login</a> para acessar esta página.</p>";
    } else {
        renderizarComodos();
    }
});

if(logoutBtn) logoutBtn.addEventListener("click", confirmarLogout);