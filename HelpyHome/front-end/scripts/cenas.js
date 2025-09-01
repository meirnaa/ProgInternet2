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

const listaCenas = document.getElementById("cenas-ul");
const acoesCenasContainer = document.querySelector(".acoes-cenas");
const tituloPrincipal = document.querySelector(".cenas-container h2");
let erroDiv;

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

                // Opcional: pode disparar a execução no backend
                await fetch(`http://localhost:3000/cena/${id}/executar`, { method: "POST" });

                buscarCenas();
            });
        });
    }
}

async function carregarComodos() {
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

        // Busca a quantidade de dispositivos de cada cômodo
        const promDispositivos = comodos.map(async comodo => {
            const respDisp = await fetch(`http://localhost:3000/dispositivo?comodo_id=${comodo.id}`);
            const dispositivos = await respDisp.json();
            comodo.qtdDispositivos = dispositivos.length;
        });

        await Promise.all(promDispositivos); 

        comodosContainer.innerHTML = "";
        listaComodos.innerHTML = "";

        // Renderiza cada cômodo com checkbox
        comodos.forEach((comodo) => {
            const li = document.createElement("li");
            li.classList.add("comodo-item");
            li.dataset.id = comodo.id;

            li.innerHTML = `
                <label>
                    <input type="checkbox" class="checkbox-comodo" value="${comodo.id}">
                    <strong>${comodo.nome}</strong> - ${comodo.descricao || "Sem descrição"} 
                    (Dispositivos: ${comodo.qtdDispositivos})
                </label>
            `;
            listaComodos.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao carregar cômodos/dispositivos:", err);
    }
}

// --- Eventos ---
// ====== Fluxo de Criação de Cenas ======
let novaCenaTemp = {};

btnCriarCena.addEventListener("click", iniciarCriacaoCena);

// 👉 Passo 1: formulário com nome/descrição
function iniciarCriacaoCena() {
    tituloPrincipal.innerText = "Criar Nova Cena";
    tituloPrincipal.style.color = "#FF8C00";

    listaCenas.classList.add("hidden");
    listaComodos.classList.add("hidden");
    acoesCenasContainer.classList.add("hidden");
    formCena.classList.remove("hidden");

    // Mantém valores se existirem
    const nomeValor = novaCenaTemp.nome || "";
    const descValor = novaCenaTemp.descricao || "";

    formCena.innerHTML = `
        <label for="nome-cena">Nome da Cena:</label>
        <input type="text" id="nome-cena" placeholder="Ex: Cinema" value="${nomeValor}">
        <label for="descricao-cena">Descrição:</label>
        <textarea id="descricao-cena" placeholder="Ex: Cena que simula um cinema pessoal dentro da casa.">${descValor}</textarea>
    `;

    criarBotoesNavegacao(avancarParaSelecaoComodos, voltarParaLista);
}

// 👉 Passo 2: seleção de cômodos
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

    // Pega os checkboxes de cômodos selecionados na tela atual, se houver
    const selecionados = document.querySelectorAll(".checkbox-comodo:checked");
    novaCenaTemp.comodosSelecionados = Array.from(selecionados).map(chk => chk.value);

    tituloPrincipal.innerText = "Selecionar Cômodos";
    formCena.classList.add("hidden");
    listaComodos.innerHTML = "";
    listaComodos.classList.remove("hidden");

    await carregarComodos();

    // Marca os cômodos previamente selecionados
    if (novaCenaTemp.comodosSelecionados) {
        document.querySelectorAll(".checkbox-comodo").forEach(chk => {
            chk.checked = novaCenaTemp.comodosSelecionados.includes(chk.value.toString());
        });
    }

    criarBotoesNavegacao(avancarParaSelecaoDispositivos, voltarParaLista);
}


// 👉 Passo 3: seleção de dispositivos por cômodo
function avancarParaSelecaoDispositivos() {
    const selecionados = document.querySelectorAll(".checkbox-comodo:checked");
    if (selecionados.length === 0) {
        mostrarErro("Selecione pelo menos um cômodo para continuar!");
        return;
    }

    // Salva os IDs selecionados em novaCenaTemp
    novaCenaTemp.comodosSelecionados = Array.from(selecionados).map(chk => chk.value);

    ocultarErro();

    tituloPrincipal.innerText = "Selecionar Dispositivos";
    listaComodos.classList.add("hidden");

    carregarDispositivos(novaCenaTemp.comodosSelecionados);

    criarBotoesNavegacao(finalizarCena, voltarParaSelecaoComodos);
}


function voltarParaSelecaoComodos() {
    listaComodos.classList.remove("hidden");
    tituloPrincipal.innerText = "Selecionar Cômodos";
    listaCenas.classList.add("hidden");
    formCena.classList.add("hidden");

    // Limpa a lista de dispositivos
    const listaDisp = document.getElementById("lista-dispositivos");
    if (listaDisp) listaDisp.innerHTML = "";

    // NÃO resetar os checkboxes aqui
}


// 👉 Passo final: salvar cena + ações
async function finalizarCena() {
    // Garante que a cena tenha nome
    if (!novaCenaTemp.nome) {
        mostrarErro("Informe um nome para a cena antes de salvar!");
        return;
    }

    // Garante que haja dispositivos selecionados
    const checkboxes = document.querySelectorAll(".disp-checkbox:checked");
    if (checkboxes.length === 0) {
        mostrarErro("Selecione pelo menos um dispositivo para salvar a cena!");
        return;
    }

    try {

        // Salva cena
        const dataCena = {
            nome: novaCenaTemp.nome,
            descricao: novaCenaTemp.descricao || "",
            estado: false,
            usuario_id: 1
        };
        console.log(dataCena);

        let cenaResp;
        if (editandoId !== null) {
            cenaResp = await fetch(`http://localhost:3000/cena/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataCena)
            });
        } else {
            cenaResp = await fetch("http://localhost:3000/cena", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataCena)
            });
        }

        const cena = await cenaResp.json();

        // Salva ações dos dispositivos
        for (const chk of checkboxes) {
            const dispositivoId = chk.dataset.id;

            // Estado: converter string para boolean
            const estado = document.querySelector(`.estado-disp[data-id="${dispositivoId}"]`).value === "true";

            // Intervalo: pegar número e evitar NaN
            const intervalo = parseInt(document.querySelector(`.intervalo-disp[data-id="${dispositivoId}"]`).value) || 0;

            // Ordem de execução: pegar número e evitar NaN
            const ordem_execucao = parseInt(document.querySelector(`.ordem-disp[data-id="${dispositivoId}"]`).value) || 1;

            await fetch("http://localhost:3000/cena_acao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cena_id: cena.id,
                    dispositivo_id: dispositivoId,
                    intervalo,
                    estadoDispositivo: estado,
                    ordem_execucao
                })
            });
        }

        // Limpa temporário
        novaCenaTemp = {};
        editandoId = null;

        // Volta para lista
        tituloPrincipal.innerText = "Gerenciamento de Cenas";
        tituloPrincipal.style.color = "#000";
        listaCenas.classList.remove("hidden");
        acoesCenasContainer.classList.remove("hidden");
        const listaDisp = document.getElementById("lista-dispositivos");
        if (listaDisp) listaDisp.innerHTML = "";
        listaDisp.classList.add("hidden");

        const navContainer = document.getElementById("botoes-navegacao");
        if (navContainer) navContainer.remove();

        ocultarErro();
        buscarCenas();
    } catch (err) {
        console.error("Erro ao salvar cena:", err);
        mostrarErro("Erro ao salvar a cena.");
    }
}

// --- Navegação (Voltar/Continuar) ---
function criarBotoesNavegacao(onContinuar, onVoltar) {
    let navContainer = document.getElementById("botoes-navegacao");
    if (navContainer) navContainer.remove();

    navContainer = document.createElement("div");
    navContainer.id = "botoes-navegacao";
    navContainer.style.display = "flex";
    navContainer.style.justifyContent = "space-between";
    navContainer.style.marginTop = "20px";

    // Botão voltar
    const btnVoltar = document.createElement("button");
    btnVoltar.classList.add("btn-navegacao");
    btnVoltar.innerHTML = `<i class="fas fa-arrow-left"></i> Voltar`;
    btnVoltar.addEventListener("click", () => {
        ocultarErro();
        if (onVoltar) onVoltar();
    });

    // Botão continuar
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

// --- Voltar auxiliares ---
function voltarParaLista() {
    formCena.classList.add("hidden");
    listaComodos.classList.add("hidden");
    tituloPrincipal.innerText = "Gerenciamento de Cenas";
    tituloPrincipal.style.color = "#000000";

    listaCenas.classList.remove("hidden");
    acoesCenasContainer.classList.remove("hidden");

    const navContainer = document.getElementById("botoes-navegacao");
    if (navContainer) navContainer.remove();
}

function voltarParaSelecaoComodos() {
    listaComodos.classList.remove("hidden");
    tituloPrincipal.innerText = "Selecionar Cômodos";
    listaCenas.classList.add("hidden");
    formCena.classList.add("hidden");

    // Limpa a lista de dispositivos
    const listaDisp = document.getElementById("lista-dispositivos");
    if (listaDisp) listaDisp.innerHTML = "";
}

async function carregarDispositivos(idsSelecionados) {
    const container = document.getElementById("lista-dispositivos");
    container.innerHTML = "";

    for (const comodoId of idsSelecionados) {
        const resp = await fetch(`http://localhost:3000/dispositivo?comodo_id=${comodoId}`);
        const dispositivos = await resp.json();

        const resp2 = await fetch(`http://localhost:3000/nome-do-comodo?comodo_id=${comodoId}`);
        const comodos = await resp2.json();

        if (dispositivos.length === 0) continue;

        const section = document.createElement("div");
        section.classList.add("comodo-section");

        // Pega o nome do cômodo (do primeiro dispositivo ou via API do cômodo)
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
                            <input type="number" class="ordem-disp" data-id="${d.id}" placeholder="Ordem de execução" min="1">
                            <input type="number" class="intervalo-disp" data-id="${d.id}" placeholder="Intervalo (s)" min="0">
                        </li>
                    `).join("")}
                </ul>
            </form>
        `;


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

    console.log("Ações configuradas:", acoes);
    return acoes;
}


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

function mostrarErro(msg) {
    const navContainer = document.getElementById("botoes-navegacao");
    if (!navContainer) return;

    if (!erroDiv) {
        // cria wrapper antes dos botões
        const wrapper = document.createElement("div");
        wrapper.id = "botoes-navegacao-anterior";
        navContainer.parentNode.insertBefore(wrapper, navContainer);

        erroDiv = document.createElement("div");
        erroDiv.classList.add("mensagem-erro");
        wrapper.appendChild(erroDiv);
    }

    erroDiv.textContent = msg;
    erroDiv.classList.remove("hidden"); // garante que apareça
}

function ocultarErro() {
    if (erroDiv) {
        erroDiv.classList.add("hidden");
    }
}

const listaComodos = document.getElementById("comodos-ul");
const comodosContainer = document.getElementById("comodos-container");


// Inicializa lista
buscarCenas();
