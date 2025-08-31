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


// --- Funções de Cômodos ---

// Referências aos elementos da página
const btnCriarComodo = document.getElementById("btn-criar-comodo");
const btnListarComodos = document.getElementById("btn-listar-comodos");
const formComodo = document.getElementById("form-comodo");
const formTituloComodo = document.getElementById("form-titulo-comodo");
const nomeComodo = document.getElementById("nomeComodo");
const descricaoComodo = document.getElementById("descricaoComodo");
const salvarComodo = document.getElementById("salvarComodo");
const cancelarComodo = document.getElementById("cancelarComodo");
const listaComodos = document.getElementById("comodos-ul");
const comodosContainer = document.querySelector(".comodos-container");
const acoesComodosContainer = document.querySelector(".acoes-comodos");
const dispositivosSection = document.getElementById("dispositivos-container");
const erroComodo = document.getElementById("erroComodo");

// variável de controle de edição
let editandoComodoIndex = null;
const tituloPrincipal = document.querySelector(".comodos-container h2");

// Carregar lista ao carregar a página
renderizarComodos(true);

// Botão Criar Cômodo
btnCriarComodo.addEventListener("click", () => {
    // Altera o título
    tituloPrincipal.innerText = "Criar Cômodo";
    tituloPrincipal.style.color = "#FF8C00";
    listaComodos.classList.add("hidden");

    acoesComodosContainer.classList.add("hidden");

    formTituloComodo.textContent = "Novo Cômodo";
    formComodo.classList.remove("hidden");
    nomeComodo.value = "";
    descricaoComodo.value = "";
    editandoComodoIndex = null; // resetar edição
});

// Botão Listar Cômodos
btnListarComodos.addEventListener("click", () => {
    renderizarComodos(false);
    formComodo.classList.add("hidden");
    acoesComodosContainer.classList.add("hidden");
    tituloPrincipal.innerText = "Lista de Cômodos";
    tituloPrincipal.style.color = "#FF8C00";
    
    // Cria botão voltar caso não exista
    if (!document.getElementById("btn-voltar")) {
        const btnVoltar = document.createElement("button");
        btnVoltar.id = "btn-voltar";

        btnVoltar.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
        btnVoltar.classList.add("btn-voltar");
        listaComodos.parentElement.appendChild(btnVoltar);

        btnVoltar.addEventListener("click", () => {
            formComodo.classList.add("hidden");
            acoesComodosContainer.classList.remove("hidden");
            tituloPrincipal.innerText = "Gerenciamento de Cômodos";
            tituloPrincipal.style.color = "#000000";

            btnVoltar.remove();
            renderizarComodos(true);
        });
    }
});

cancelarComodo.addEventListener("click", () => {
    formComodo.classList.add("hidden");   // Esconde o formulário
    formComodo.classList.add("hidden");
    acoesComodosContainer.classList.remove("hidden");

    tituloPrincipal.innerText = "Gerenciamento de Cômodos";
    tituloPrincipal.style.color = "#000000";
    renderizarComodos(true);                   // Mostra a lista atualizada
    listaComodos.classList.remove("hidden");
    erroComodo.textContent = "";
    erroComodo.classList.add("hidden");
});

async function renderizarComodos(showActions = true) {
    listaComodos.innerHTML = "";

    try {
        // Busca todos os cômodos
        const resp = await fetch("http://localhost:3000/comodo");
        const comodos = await resp.json();

        if (comodos.length === 0) {
            const msg = document.createElement("p");
            msg.textContent = "Nenhum cômodo cadastrado ainda.";
            msg.classList.add("mensagem-vazia");
            listaComodos.appendChild(msg);
            return;
        }

        // Busca a quantidade de dispositivos de cada cômodo em paralelo
        const promDispositivos = comodos.map(async comodo => {
            const respDisp = await fetch(`http://localhost:3000/dispositivo?comodo_id=${comodo.id}`);
            const dispositivos = await respDisp.json();
            comodo.qtdDispositivos = dispositivos.length;
        });

        await Promise.all(promDispositivos); 

        // Renderiza cada cômodo
        comodos.forEach((comodo) => {
            const li = document.createElement("li");
            li.classList.add("comodo-item");
            li.dataset.id = comodo.id;

            let actionsHTML = "";
            if (showActions) {
                actionsHTML = `
                    <button class="btn-gerenciar-dispositivos" data-id="${comodo.id}">
                        <i class="fas fa-tools"></i> Gerenciar Dispositivos
                    </button>
                    <button class="btn-editar-item" data-id="${comodo.id}">
                        <i class="fas fa-pen"></i> Editar
                    </button>
                    <button class="btn-remover-item" data-id="${comodo.id}">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                `;
            }

            li.innerHTML = `
                <div class="comodo-info">
                    <div>
                        <h4>${comodo.nome}</h4>
                        <p>${comodo.descricao || "Sem descrição"}</p>
                        <p>Dispositivos: ${comodo.qtdDispositivos}</p>
                    </div>
                </div>
                <div class="comodo-actions">
                    ${actionsHTML}
                </div>
            `;
            listaComodos.appendChild(li);
        });

        // Eventos dos botões
        if (showActions) {
            document.querySelectorAll(".btn-gerenciar-dispositivos").forEach(button => {
                button.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const id = e.currentTarget.dataset.id;
                    const resp = await fetch(`http://localhost:3000/comodo/${id}`);
                    const comodo = await resp.json();
                    exibirGerenciadorDispositivos(comodo);
                });
            });

            document.querySelectorAll(".btn-editar-item").forEach(button => {
                button.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const id = e.currentTarget.dataset.id;
                    const resp = await fetch(`http://localhost:3000/comodo/${id}`);
                    const comodo = await resp.json();
                    editarComodo(comodo);
                });
            });

            document.querySelectorAll(".btn-remover-item").forEach(button => {
                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const li = e.currentTarget.closest(".comodo-item");
                    const id = li.dataset.id;
                    const nome = li.querySelector("h4").textContent;
                    confirmarRemocaoComodo(id, nome);
                });
            });
        }

    } catch (err) {
        console.error("Erro ao renderizar cômodos:", err);
        listaComodos.innerHTML = "<li>Erro ao carregar cômodos</li>";
    }
}


// Editar cômodo
function editarComodo(comodo) {
    formTituloComodo.textContent = "Editar Cômodo";
    formComodo.classList.remove("hidden");
    nomeComodo.value = comodo.nome;
    descricaoComodo.value = comodo.descricao || "";
    editandoComodoIndex = comodo.id; // guardamos o id real do banco
}

// Remover cômodo direto do banco
async function removerComodo(id) {
    try {
        await fetch(`http://localhost:3000/comodo/${id}`, {
            method: "DELETE",
        });
        renderizarComodos();
    } catch (err) {
        console.error("Erro ao remover cômodo:", err);
    }
}

// Salvar (criar ou atualizar) cômodo
salvarComodo.addEventListener("click", async () => {
    // Limpa mensagem de erro anterior
    erroComodo.textContent = "";
    erroComodo.classList.add("hidden");

    if (!nomeComodo.value) {
        erroComodo.textContent = "O nome do cômodo é obrigatório.";
        erroComodo.classList.remove("hidden");
        return;
    }

    const body = {
        nome: nomeComodo.value,
        descricao: descricaoComodo.value
    };

    try {
        if (editandoComodoIndex) {
            // atualizar
            await fetch(`http://localhost:3000/comodo/${editandoComodoIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        } else {
            // criar
            await fetch("http://localhost:3000/comodo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        }

        formComodo.classList.add("hidden");
        tituloPrincipal.innerText = "Gerenciamento de Cômodos";
        tituloPrincipal.style.color = "#000000";        
        renderizarComodos();
        acoesComodosContainer.classList.remove("hidden");
        listaComodos.classList.remove("hidden");
        erroComodo.textContent = "";
        erroComodo.classList.add("hidden");

    } catch (err) {
        console.error("Erro ao salvar cômodo:", err);
    }
});

// Referências
const modal = document.getElementById("modal-confirm");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");

let comodoParaRemoverId = null;

// Função para abrir modal
function abrirModalConfirmacao(mensagem, comodoId) {
    modalText.textContent = mensagem;
    comodoParaRemoverId = comodoId;
    modal.classList.remove("hidden");
}

// Fechar modal
function fecharModal() {
    modal.classList.add("hidden");
    comodoParaRemoverId = null;
}

// Eventos do modal
modalClose.addEventListener("click", fecharModal);
modalCancel.addEventListener("click", fecharModal);

// Confirmar remoção
modalConfirmBtn.addEventListener("click", async () => {
    if (comodoParaRemoverId) {
        await removerComodo(comodoParaRemoverId);
        comodoParaRemoverId = null;
    } else if (dispositivoParaRemoverId) {
        await removerDispositivo(dispositivoParaRemoverId);
        dispositivoParaRemoverId = null;
    }
    fecharModal();
});

// Substituir o confirm padrão
function confirmarRemocaoComodo(id, nome) {
    abrirModalConfirmacao(`Tem certeza que deseja remover o cômodo "${nome}"?`, id);
}



// --- Lógica de Dispositivos ---

let comodoSelecionadoId = null;
let editandoDispositivoId = null;

// Exibir gerenciador de dispositivos de um cômodo
async function exibirGerenciadorDispositivos(comodo) {
    comodoSelecionadoId = comodo.id; // guarda o id do banco
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
                <div class="botoes-comodos">
                    <button id="salvarDispositivo">Salvar</button>
                    <button id="cancelarDispositivo" class="btn-cancelar">Cancelar</button>
                </div>
            </div>
            <ul id="lista-dispositivos" class="lista-dispositivos"></ul>
            <button id="btn-voltar-comodos" class="btn-voltar-comodos"><i class="fas fa-arrow-left"></i> Voltar</button>
        </div>
    `;

    // Carrega os dispositivos do banco
    await renderizarDispositivos();

    document.getElementById("btn-add-dispositivo").addEventListener("click", () => {
        document.getElementById("lista-dispositivos").classList.add("hidden");
        document.getElementById("form-dispositivo").classList.remove("hidden");
        document.getElementById("form-titulo-dispositivo").textContent = "Novo Dispositivo";
        document.getElementById("nomeDispositivo").value = "";
        document.getElementById("tipoDispositivo").value = "";
        editandoDispositivoId = null;
        document.getElementById("btn-voltar-comodos").classList.add("hidden");
    });

    document.getElementById("salvarDispositivo").addEventListener("click", salvarDispositivo);
    document.getElementById("cancelarDispositivo").addEventListener("click", () => {
        document.getElementById("lista-dispositivos").classList.remove("hidden");
        document.getElementById("form-dispositivo").classList.add("hidden");
        mostrarMensagemErro("");
        document.getElementById("btn-voltar-comodos").classList.remove("hidden");
        renderizarDispositivos();
    });
    document.getElementById("btn-voltar-comodos").addEventListener("click", () => {
        dispositivosSection.classList.add("hidden");
        comodosContainer.classList.remove("hidden");
    });
}

// Renderiza dispositivos do banco
async function renderizarDispositivos() {
    const listaDispositivos = document.getElementById("lista-dispositivos");
    listaDispositivos.innerHTML = "";

    try {
const resp = await fetch(`http://localhost:3000/dispositivo?comodo_id=${comodoSelecionadoId}`);
        const dispositivos = await resp.json();

        if (dispositivos.length === 0) {
            const msg = document.createElement("p");
            msg.textContent = "Nenhum dispositivo cadastrado ainda.";
            msg.classList.add("mensagem-vazia");
            listaDispositivos.appendChild(msg);
            return;
        }
        
        dispositivos.forEach(dispositivo => {
            const li = document.createElement("li");
            li.dataset.id = dispositivo.id;

            // Define ícone e texto do estado
            const statusIcon = dispositivo.estado ? "🔴" : "🟢";
            const statusText = dispositivo.estado ? "Desligar" : "Ligar";
            const bordaClass = dispositivo.estado ? "borda-verde" : "borda-vermelha";
            li.classList.add(bordaClass);

            li.innerHTML = `
                <span>${dispositivo.nome} (${dispositivo.tipo})</span>
                <div class="dispositivo-actions">
                    <button class="btn-toggle-estado" data-id="${dispositivo.id}">${statusIcon} ${statusText}</button>
                    <button class="btn-editar-dispositivo" data-id="${dispositivo.id}"><i class="fas fa-pen"></i> Editar</button>
                    <button class="btn-remover-dispositivo" data-id="${dispositivo.id}"><i class="fas fa-trash"></i> Remover</button>
                </div>
            `;
            listaDispositivos.appendChild(li);
        });

        listaDispositivos.querySelectorAll(".btn-editar-dispositivo").forEach(button => {
            button.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                const resp = await fetch(`http://localhost:3000/dispositivo/${id}`);
                const dispositivo = await resp.json();
                editarDispositivo(dispositivo);
            });
        });

        listaDispositivos.querySelectorAll(".btn-remover-dispositivo").forEach(button => {
            button.addEventListener("click", (e) => {
                const li = e.currentTarget.closest("li");
                const id = li.dataset.id;
                const nome = li.querySelector("span").textContent.split(" (")[0]; // pega só o nome
                confirmarRemocaoDispositivo(id, nome);
            });
        });

        listaDispositivos.querySelectorAll(".btn-toggle-estado").forEach(button => {
            button.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                await toggleEstadoDispositivo(id);
                renderizarDispositivos();
            });
        });


    } catch (err) {
        console.error("Erro ao carregar dispositivos:", err);
        listaDispositivos.innerHTML = "<li>Erro ao carregar dispositivos</li>";
    }
}

// Função para alternar estado do dispositivo
async function toggleEstadoDispositivo(id) {
    try {
        const resp = await fetch(`http://localhost:3000/dispositivo/${id}`);
        const dispositivo = await resp.json();
        const novoEstado = !dispositivo.estado;

        await fetch(`http://localhost:3000/dispositivo/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: dispositivo.nome,
                tipo: dispositivo.tipo,
                estado: novoEstado,
                comodo_id: dispositivo.comodo_id
            })
        });
    } catch (err) {
        console.error("Erro ao alternar estado do dispositivo:", err);
        mostrarMensagemErro("Não foi possível alterar o estado.");
    }
}

// Salvar ou atualizar dispositivo no banco
async function salvarDispositivo() {
    const nome = document.getElementById("nomeDispositivo").value;
    const tipo = document.getElementById("tipoDispositivo").value;

    if (!nome || !tipo) {
        mostrarMensagemErro("Nome e tipo do dispositivo são obrigatórios.");
        return;
    }

    try {
        if (editandoDispositivoId) {
            // Atualizar dispositivo
            await fetch(`http://localhost:3000/dispositivo/${editandoDispositivoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, tipo, comodo_id: comodoSelecionadoId })
            });
        } else {
            // Criar dispositivo
            await fetch("http://localhost:3000/dispositivo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, tipo, comodo_id: comodoSelecionadoId })
            });
        }

        document.getElementById("form-dispositivo").classList.add("hidden");
        document.getElementById("lista-dispositivos").classList.remove("hidden");
        mostrarMensagemErro("");
        document.getElementById("btn-voltar-comodos").classList.remove("hidden");
        await renderizarDispositivos();
    } catch (err) {
        console.error("Erro ao salvar dispositivo:", err);
        mostrarMensagemErro("Erro ao salvar dispositivo.");
    }
}

// Editar dispositivo (preenche formulário)
function editarDispositivo(dispositivo) {
    document.getElementById("form-titulo-dispositivo").textContent = "Editar Dispositivo";
    document.getElementById("nomeDispositivo").value = dispositivo.nome;
    document.getElementById("tipoDispositivo").value = dispositivo.tipo;
    document.getElementById("form-dispositivo").classList.remove("hidden");
    editandoDispositivoId = dispositivo.id;
}

let dispositivoParaRemoverId = null;

function confirmarRemocaoDispositivo(id, nome) {
    dispositivoParaRemoverId = id;
    modalText.textContent = `Tem certeza que deseja remover o dispositivo "${nome}"?`;
    modal.classList.remove("hidden");
}

// Remover dispositivo
async function removerDispositivo(id) {
    try {
        await fetch(`http://localhost:3000/dispositivo/${id}`, { method: "DELETE" });
        await renderizarDispositivos();
    } catch (err) {
        console.error("Erro ao remover dispositivo:", err);
        mostrarMensagemErro("Erro ao remover dispositivo.");
    }
}

// Função para exibir mensagens de erro embaixo do formulário
function mostrarMensagemErro(msg) {
    let container = document.getElementById("mensagem-erro");
    if (!container) {
        container = document.createElement("p");
        container.id = "mensagem-erro";
        container.style.color = "red";
        document.getElementById("form-dispositivo").appendChild(container);
    }
    container.textContent = msg;
}
