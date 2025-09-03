// ===================================================================
// FUNÇÃO CENTRAL DE AUTENTICAÇÃO
// Esta função será usada para TODAS as chamadas ao backend.
// ===================================================================
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
        throw new Error(errorData.message || `Erro na requisição: ${response.statusText}`);
    }

    return response;
}

// ====== Código Comum para Cabeçalho e Rodapé ======
const userAvatar = document.getElementById("user-avatar");
const userOptions = document.getElementById("user-options");
const logoutBtn = document.getElementById("logout-btn");
const themeBtn = document.getElementById("theme-btn");

if (userAvatar) {
    userAvatar.addEventListener("click", () => {
        userOptions.style.display = window.getComputedStyle(userOptions).display === "flex" ? "none" : "flex";
    });
}

if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("tema", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
}

document.addEventListener("click", (e) => {
    const isMenuOpen = userOptions && window.getComputedStyle(userOptions).display === "flex";
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
const listaCenas = document.getElementById("cenas-ul");
const acoesCenasContainer = document.querySelector(".acoes-cenas");
const tituloPrincipal = document.querySelector(".cenas-container h2");
let erroDiv;

// --- Funções de Cenas ---
async function buscarCenas() {
    try {
        // AJUSTADO: Usa a função com autenticação
        const resp = await fetchWithAuth("http://localhost:3000/cena");
        cenas = await resp.json();
        renderizarCenas(true);
    } catch (err) {
        console.error("Erro ao buscar cenas:", err);
        if(listaCenas) listaCenas.innerHTML = "<li>Erro ao carregar cenas.</li>";
    }
}

async function removerCenaNoBanco(id) {
    if (!confirm("Tem certeza que deseja remover esta cena?")) return;

    try {
        // AJUSTADO: Usa a função com autenticação
        await fetchWithAuth(`http://localhost:3000/cena/${id}`, { method: "DELETE" });
        buscarCenas();
    } catch (err) {
        console.error("Erro ao remover cena:", err);
        mostrarErro("Não foi possível remover a cena");
    }
}

// Em cenas.js

// FUNÇÃO DE RENDERIZAÇÃO DE CENAS COM A EXIBIÇÃO DAS AÇÕES
function renderizarCenas(showActions = true) {
    listaCenas.innerHTML = "";
    if (cenas.length === 0) {
        listaCenas.innerHTML = `<p class="mensagem-vazia">Nenhuma cena cadastrada ainda.</p>`;
        return;
    }

    cenas.forEach((cena) => {
        const li = document.createElement("li");
        li.dataset.id = cena.id;

        // --- LÓGICA PARA CRIAR O RESUMO DAS AÇÕES ---
        let resumoAcoes = 'Nenhuma ação configurada.';
        if (cena.acoes && cena.acoes.length > 0) {
            resumoAcoes = cena.acoes.map(acao => {
                const acaoTexto = acao.estadoDispositivo ? 'Ligar' : 'Desligar';
                return `${acaoTexto} ${acao.nome}`;
            }).join('; ');
        }
        // --- FIM DA LÓGICA ---

        let actionsHTML = '';
        if (showActions) {
            const statusText = cena.estado ? "Desativar" : "Ativar";
            const bordaClass = cena.estado ? "borda-verde" : "borda-vermelha";

            li.classList.add(bordaClass);
            actionsHTML = `
                <button class="btn-ativar-item" data-id="${cena.id}">${statusText}</button>
                <button class="btn-editar-item" data-id="${cena.id}"><i class="fas fa-pen"></i> Editar</button>
                <button class="btn-remover-item" data-id="${cena.id}"><i class="fas fa-trash"></i> Remover</button>
            `;
        }

        li.innerHTML = `
            <div>
                <span class="cena-nome"><strong>${cena.nome}</strong></span>
                <span class="cena-acoes-resumo">${resumoAcoes}</span>
            </div>
            <div class="cenas-actions">
                ${actionsHTML}
            </div>
        `;
        listaCenas.appendChild(li);
    });

    if (showActions) {
        // Adiciona os event listeners para os botões (código que você já tem)
        document.querySelectorAll(".btn-editar-item").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                try {
                    const resp = await fetchWithAuth(`http://localhost:3000/cena/${id}`);
                    const cenaParaEditar = await resp.json();
                    editarCena(cenaParaEditar);
                } catch (err) {
                    console.error("Erro ao buscar detalhes da cena:", err);
                    mostrarErro("Não foi possível carregar os dados da cena para edição.");
                }
            });
        });
        document.querySelectorAll(".btn-remover-item").forEach(btn => {
            btn.addEventListener("click", (e) => removerCenaNoBanco(e.currentTarget.dataset.id));
        });
        document.querySelectorAll(".btn-ativar-item").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                await fetchWithAuth(`http://localhost:3000/cena/${id}/toggle`, { method: "PUT" });
                buscarCenas();
            });
        });
    }
}

async function carregarComodos() {
    try {
        // AJUSTADO: Usa a função com autenticação
        const resp = await fetchWithAuth("http://localhost:3000/comodo");
        const comodos = await resp.json();

        if (comodos.length === 0) {
            const msg = document.createElement("p");
            msg.textContent = "Nenhum cômodo cadastrado ainda.";
            msg.classList.add("mensagem-vazia");
            if(listaComodos) listaComodos.appendChild(msg);
            return;
        }

        const promDispositivos = comodos.map(async comodo => {
            // AJUSTADO: Usa a função com autenticação
            const respDisp = await fetchWithAuth(`http://localhost:3000/dispositivo-comodo?comodo_id=${comodo.id}`);
            const dispositivos = await respDisp.json();
            comodo.qtdDispositivos = dispositivos.length;
        });

        await Promise.all(promDispositivos); 

        if (comodosContainer) comodosContainer.innerHTML = "";
        if (listaComodos) listaComodos.innerHTML = "";

        comodos.forEach((comodo) => {
            const li = document.createElement("li");
            li.classList.add("comodo-item");
            li.dataset.id = comodo.id;
            li.innerHTML = `
                <label>
                    <input type="checkbox" class="checkbox-comodo" value="${comodo.id}">
                    <strong>${comodo.nome}</strong> - ${comodo.descricao || "Sem descrição"} 
                    (Dispositivos: ${comodo.qtdDispositivos})
                </label>`;
            if(listaComodos) listaComodos.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao carregar cômodos/dispositivos:", err);
    }
}

// --- Eventos ---
// ====== Fluxo de Criação de Cenas ======
let novaCenaTemp = {};

if (btnCriarCena) {
    btnCriarCena.addEventListener("click", iniciarCriacaoCena);
}

function iniciarCriacaoCena() {
    tituloPrincipal.innerText = "Criar Nova Cena";
    tituloPrincipal.style.color = "#FF8C00";
    listaCenas.classList.add("hidden");
    if(listaComodos) listaComodos.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
    formCena.classList.remove("hidden");
    const nomeValor = novaCenaTemp.nome || "";
    const descValor = novaCenaTemp.descricao || "";
    formCena.innerHTML = `
        <label for="nome-cena">Nome da Cena:</label>
        <input type="text" id="nome-cena" placeholder="Ex: Cinema" value="${nomeValor}">
        <label for="descricao-cena">Descrição:</label>
        <textarea id="descricao-cena" placeholder="Ex: Cena que simula um cinema pessoal.">${descValor}</textarea>
    `;
    criarBotoesNavegacao(avancarParaSelecaoComodos, voltarParaLista);

}

function voltarParaFormulario() {
    tituloPrincipal.innerText = "Criar Nova Cena";
    tituloPrincipal.style.color = "#FF8C00";

    // Mostra o formulário
    formCena.classList.remove("hidden");

    // Esconde as outras etapas
    listaCenas.classList.add("hidden");
    listaComodos.classList.add("hidden");
    const listaDisp = document.getElementById("lista-dispositivos");
    if (listaDisp) listaDisp.classList.add("hidden");

    // Recria o formulário com os valores já digitados (se houver)
    const nomeValor = novaCenaTemp.nome || "";
    const descValor = novaCenaTemp.descricao || "";

    formCena.innerHTML = `
        <label for="nome-cena">Nome da Cena:</label>
        <input type="text" id="nome-cena" placeholder="Ex: Cinema" value="${nomeValor}">
        <label for="descricao-cena">Descrição:</label>
        <textarea id="descricao-cena" placeholder="Ex: Cena que simula um cinema pessoal.">${descValor}</textarea>
    `;

    // Voltar do formulário pode levar para lista, continuar leva para comodos
    criarBotoesNavegacao(avancarParaSelecaoComodos, voltarParaLista);
}


async function avancarParaSelecaoComodos() {
    const nome = document.getElementById("nome-cena").value.trim();
    const descricao = document.getElementById("descricao-cena").value.trim();
    if (!nome) {
        mostrarErro("Informe um nome para a cena!");
        return;
    }
    ocultarErro();

    novaCenaTemp.nome = nome;
    novaCenaTemp.descricao = descricao;
    const selecionados = document.querySelectorAll(".checkbox-comodo:checked");
    novaCenaTemp.comodosSelecionados = Array.from(selecionados).map(chk => chk.value);
    tituloPrincipal.innerText = "Selecionar Cômodos";
    formCena.classList.add("hidden");
    if(listaComodos) listaComodos.innerHTML = "";
    if(listaComodos) listaComodos.classList.remove("hidden");
    await carregarComodos();
    if (novaCenaTemp.comodosSelecionados) {
        document.querySelectorAll(".checkbox-comodo").forEach(chk => {
            chk.checked = novaCenaTemp.comodosSelecionados.includes(chk.value.toString());
        });
    }
    criarBotoesNavegacao(avancarParaSelecaoDispositivos, voltarParaFormulario);
}

function avancarParaSelecaoDispositivos() {
    const selecionados = document.querySelectorAll(".checkbox-comodo:checked");
    if (selecionados.length === 0) {
        mostrarErro("Selecione pelo menos um cômodo para continuar!");
        return;
    }
    novaCenaTemp.comodosSelecionados = Array.from(selecionados).map(chk => chk.value);
    ocultarErro();
    tituloPrincipal.innerText = "Selecionar Dispositivos";
    if(listaComodos) listaComodos.classList.add("hidden");
    carregarDispositivos(novaCenaTemp.comodosSelecionados);
    criarBotoesNavegacao(finalizarCena, voltarParaSelecaoComodos);
}

async function finalizarCena() {
    if (!novaCenaTemp.nome) {
        mostrarErro("Informe um nome para a cena antes de salvar!");
        return;
    }
    const checkboxes = document.querySelectorAll(".disp-checkbox:checked");
    if (checkboxes.length === 0) {
        mostrarErro("Selecione pelo menos um dispositivo para salvar a cena!");
        return;
    }

    try {
        // CORRIGIDO: Não envia mais o usuario_id
        const dataCena = {
            nome: novaCenaTemp.nome,
            descricao: novaCenaTemp.descricao || "",
            estado: false, 
        };

        let cenaResp;
        if (editandoId !== null) {
            // AJUSTADO: Usa a função com autenticação
            cenaResp = await fetchWithAuth(`http://localhost:3000/cena/${editandoId}`, {
                method: "PUT", body: JSON.stringify(dataCena)
            });
        } else {
            // AJUSTADO: Usa a função com autenticação
            cenaResp = await fetchWithAuth("http://localhost:3000/cena", {
                method: "POST", body: JSON.stringify(dataCena)
            });
        }

        const cena = await cenaResp.json();

        for (const chk of checkboxes) {
            const dispositivoId = chk.dataset.id;
            const estado = document.querySelector(`.estado-disp[data-id="${dispositivoId}"]`).value === "true";
            const intervalo = parseInt(document.querySelector(`.intervalo-disp[data-id="${dispositivoId}"]`).value) || 0;
            const ordem_execucao = parseInt(document.querySelector(`.ordem-disp[data-id="${dispositivoId}"]`).value) || 1;
            // AJUSTADO: Usa a função com autenticação
            await fetchWithAuth("http://localhost:3000/cena_acao", {
                method: "POST",
                body: JSON.stringify({
                    cena_id: cena.id, dispositivo_id: dispositivoId, intervalo, 
                    estadoDispositivo: estado, ordem_execucao
                })
            });
        }
        novaCenaTemp = {};
        editandoId = null;
        tituloPrincipal.innerText = "Gerenciamento de Cenas";
        tituloPrincipal.style.color = "#000";
        listaCenas.classList.remove("hidden");
        acoesCenasContainer.classList.remove("hidden");
        const listaDisp = document.getElementById("lista-dispositivos");
        if (listaDisp) {
            listaDisp.innerHTML = "";
            listaDisp.classList.add("hidden");
        }
        const navContainer = document.getElementById("botoes-navegacao");
        if (navContainer) navContainer.remove();
        ocultarErro();
        buscarCenas();
    } catch (err) {
        console.error("Erro ao salvar cena:", err);
        mostrarErro("Erro ao salvar a cena.");
    }
}

function criarBotoesNavegacao(onContinuar, onVoltar) {
    let navContainer = document.getElementById("botoes-navegacao");
    if (navContainer) navContainer.remove();
    navContainer = document.createElement("div");
    navContainer.id = "botoes-navegacao";
    navContainer.style.display = "flex";
    navContainer.style.justifyContent = "space-between";
    navContainer.style.marginTop = "20px";
    const btnVoltar = document.createElement("button");
    btnVoltar.classList.add("btn-navegacao");
    btnVoltar.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
    btnVoltar.addEventListener("click", () => {
        ocultarErro();
        if (onVoltar) onVoltar();
    });
    const btnContinuar = document.createElement("button");
    btnContinuar.classList.add("btn-navegacao");
    btnContinuar.innerHTML = `Continuar <i class="fas fa-arrow-right"></i>`;
    btnContinuar.addEventListener("click", () => {
        ocultarErro();
        if (onContinuar) onContinuar();
    });
    navContainer.appendChild(btnVoltar);
    navContainer.appendChild(btnContinuar);
    tituloPrincipal.parentElement.appendChild(navContainer);
}

function voltarParaLista() {
    formCena.classList.add("hidden");
    if(listaComodos) listaComodos.classList.add("hidden");
    tituloPrincipal.innerText = "Gerenciamento de Cenas";
    tituloPrincipal.style.color = "#000000";

    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");

    if (formCena) {
        formCena.reset?.();
        formCena.innerHTML = "";
    }

    novaCenaTemp = {};
    editandoId = null;
    const navContainer = document.getElementById("botoes-navegacao");
    if (navContainer) navContainer.remove();
}

function voltarParaSelecaoComodos() {
    if(listaComodos) listaComodos.classList.remove("hidden");
    tituloPrincipal.innerText = "Selecionar Cômodos";
    listaCenas.classList.add("hidden");
    formCena.classList.add("hidden");
    const listaDisp = document.getElementById("lista-dispositivos");
    if (listaDisp) listaDisp.innerHTML = "";
}

async function carregarDispositivos(idsSelecionados) {
    const container = document.getElementById("lista-dispositivos");
    if (!container) return;
    container.innerHTML = "";

    for (const comodoId of idsSelecionados) {
        // AJUSTADO: Usa a função com autenticação
        const resp = await fetchWithAuth(`http://localhost:3000/dispositivo-comodo?comodo_id=${comodoId}`);
        const dispositivos = await resp.json();
        // AJUSTADO: Usa a função com autenticação
        const resp2 = await fetchWithAuth(`http://localhost:3000/nome-do-comodo?comodo_id=${comodoId}`);
        const comodos = await resp2.json();
        if (dispositivos.length === 0) continue;
        const section = document.createElement("div");
        section.classList.add("comodo-section");
        const nomeComodo = comodos[0].nome || `Cômodo ${comodoId}`;
        section.innerHTML = `
            <h3 id="titulo-comodo">${nomeComodo}</h3>
            <form class="form-dispositivos">
                <ul class="lista-dispositivos">
                    ${dispositivos.map(d => `
                        <li class="dispositivo-item">
                            <label>
                                <input type="checkbox" class="disp-checkbox" data-id="${d.id}">
                                <strong>${d.nome}</strong> - ${d.tipo}
                            </label>
                            <select class="estado-disp" data-id="${d.id}">
                                <option value="true">Ligar</option>
                                <option value="false">Desligar</option>
                            </select>
                            <input type="number" class="ordem-disp" data-id="${d.id}" placeholder="Ordem" min="1">
                            <input type="number" class="intervalo-disp" data-id="${d.id}" placeholder="Intervalo (s)" min="0">
                        </li>`).join("")}
                </ul>
            </form>`;
        container.appendChild(section);
    }
}

function coletarConfiguracaoDispositivos() {
    const selecionados = document.querySelectorAll(".chk-dispositivo:checked");
    const acoes = [];
    selecionados.forEach(chk => {
        const id = chk.value;
        const estado = document.querySelector(`.estado-dispositivo[data-id="${id}"]`).value;
        const ordem = document.querySelector(`.ordem-dispositivo[data-id="${id}"]`).value;
        acoes.push({
            dispositivo_id: id,
            estadoDispositivo: estado === "true",
            ordem: parseInt(ordem) || 0
        });
    });
    return acoes;
}

if(btnListarCenas) {
    btnListarCenas.addEventListener("click", () => {
        cenas.sort((a, b) => a.nome.localeCompare(b.nome));
        listaCenas.classList.remove("hidden");
        formCena.classList.add("hidden");
        acoesCenasContainer.classList.add("hidden");
        renderizarCenas(false);
        tituloPrincipal.innerText = "Lista de Cenas";
        tituloPrincipal.style.color = "#FF8C00";
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
                tituloPrincipal.innerText = "Gerenciamento de Cenas";
                tituloPrincipal.style.color = "#000000";
                btnVoltar.remove();
            });
        }
    });
}

function mostrarErro(msg) {
    const navContainer = document.getElementById("botoes-navegacao");
    if (!navContainer) return;
    if (!erroDiv) {
        const wrapper = document.createElement("div");
        wrapper.id = "botoes-navegacao-anterior";
        navContainer.parentNode.insertBefore(wrapper, navContainer);
        erroDiv = document.createElement("div");
        erroDiv.classList.add("mensagem-erro");
        wrapper.appendChild(erroDiv);
    }
    erroDiv.textContent = msg;
    erroDiv.classList.remove("hidden");
}

function ocultarErro() {
    if (erroDiv) {
        erroDiv.classList.add("hidden");
    }
}

const listaComodos = document.getElementById("comodos-ul");
const comodosContainer = document.getElementById("comodos-container");

const modal = document.getElementById("modal-confirm");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");

let comodoParaRemoverId = null;
let dispositivoParaRemoverId = null;
let acaoModal = null;

function abrirModalConfirmacao(mensagem, acao, id = null) {
    if(!modalText || !modal) return;
    modalText.textContent = mensagem;
    acaoModal = acao;
    if (acao === "comodo") comodoParaRemoverId = id;
    if (acao === "dispositivo") dispositivoParaRemoverId = id;
    modal.classList.remove("hidden");
}

function fecharModal() {
    if(!modal) return;
    modal.classList.add("hidden");
    comodoParaRemoverId = null;
    dispositivoParaRemoverId = null;
    acaoModal = null;
}

if (modalClose) modalClose.addEventListener("click", fecharModal);
if (modalCancel) modalCancel.addEventListener("click", fecharModal);

if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener("click", async () => {
        if (acaoModal === "logout") {
            logout();
        }
        fecharModal();
    });
}

function confirmarLogout() {
    abrirModalConfirmacao("Tem certeza que deseja sair da conta?", "logout");
}

// AJUSTADO: Função de logout simplificada
function logout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token"); // O mais importante
    window.location.href = "login.html";
}

// AJUSTADO: Bloquear acesso se não estiver logado
document.addEventListener("DOMContentLoaded", () => {
    // A verificação agora é pelo token, que é o que realmente importa para o backend.
    const token = localStorage.getItem("token");
    const modalLogin = document.getElementById("modal-login");
    const modalLoginBtn = document.getElementById("modal-login-btn");

    if (!token) {
        if (modalLogin) modalLogin.classList.remove("hidden");
        if (modalLoginBtn) {
            modalLoginBtn.addEventListener("click", () => {
                window.location.href = "login.html";
            });
        }
    } else {
        buscarCenas();
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        confirmarLogout();
    });
}

function editarCena(cena) {
    // 1. Guarda o ID da cena que estamos editando
    editandoId = cena.id;

    // 2. Preenche o objeto temporário com os dados da cena existente
    novaCenaTemp = {
        nome: cena.nome,
        descricao: cena.descricao,
        // (outros campos como comodos e dispositivos serão carregados nos próximos passos)
    };

    // 3. Inicia o fluxo de edição a partir do primeiro passo (o mesmo da criação)
    iniciarCriacaoCena();

    // 4. Altera o título para indicar que é uma edição
    tituloPrincipal.innerText = "Editar Cena";
}