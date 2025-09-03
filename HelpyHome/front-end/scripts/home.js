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
  confirmarLogout();
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

async function fetchAuth(url, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Não autenticado");

    // garante que os headers existam
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro na requisição");
    }

    return response.json();
}


async function buscarDadosDashboard() {
    try {
        const comodos = await fetchAuth("http://localhost:3000/comodo");
        const dispositivos = await fetchAuth("http://localhost:3000/dispositivo");

        return { comodos, dispositivos };
    } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        throw err;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Busca todos os dados de uma vez
        const dados = await buscarDadosDashboard();

        // Atualiza contadores
        atualizarContadores(dados);

        // Atualiza gráfico
        atualizarGrafico(dados);

    } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        // opcional: exibir mensagem de erro para o usuário
    }
});


// Chart 1: Dispositivos por tipo
let devicesChart;
function atualizarGrafico(dados) {
    // Agrupa dispositivos por tipo
    const tipos = {};
    dados.dispositivos.forEach(d => {
        tipos[d.tipo] = (tipos[d.tipo] || 0) + 1;
    });

    let labels = Object.keys(tipos);
    let values = Object.values(tipos);
    const colors = ['#FF6F00', '#FF8F00', '#FFA000', '#FFB300', '#FFC107', '#FFD54F'];

    // Se não houver dispositivos, mostra valor padrão
    if (Object.keys(tipos).length === 0) {
        labels = ["Nenhum dispositivo"];
        values = [1];
        tipos["Nenhum dispositivo"] = 0;
        colors[0] = '#FF8F00';
    }

    if (devicesChart) {
        devicesChart.data.labels = labels;
        devicesChart.data.datasets[0].data = values;
        devicesChart.update();
    } else {
        const ctx1 = document.getElementById('devicesChart').getContext('2d');
        devicesChart = new Chart(ctx1, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}



// Chart 2: Uso da semana
const ctx2 = document.getElementById('usageChart').getContext('2d');
new Chart(ctx2, {
  type: 'line',
  data: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Horas de uso',
      data: [3, 2, 4, 5, 6, 4, 3],
      borderColor: '#FF6F00',
      backgroundColor: 'rgba(255,111,0,0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// Chart 3: Uso do mês
const ctx3 = document.getElementById('monthlyChart').getContext('2d');
new Chart(ctx3, {
  type: 'bar',
  data: {
    labels: Array.from({ length: 30 }, (_, i) => i + 1), // Dias 1 a 30
    datasets: [{
      label: 'Horas de uso por dia',
      data: [2,3,1,4,2,5,3,2,6,4,3,2,5,4,3,6,2,3,4,5,2,3,1,4,2,5,3,2,4,3],
      backgroundColor: '#FF8F00'
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function animateCounter(id, start, end, duration) {
  let obj = document.getElementById(id);

  if (start === end) {
    obj.textContent = end;
    return;
  }

  let range = end - start;
  let stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  let timer = setInterval(() => {
    current++;
    obj.textContent = current;
    if (current >= end) clearInterval(timer);
  }, stepTime);
}

function atualizarContadores(dados) {
    console.log(dados);
    const totalDispositivos = dados.dispositivos.length;
    const dispositivosAtivos = dados.dispositivos.filter(d => d.estado).length;
    const totalComodos = dados.comodos.length;

    animateCounter("total-dispositivos", 0, totalDispositivos, 800);
    animateCounter("dispositivos-ativos", 0, dispositivosAtivos, 800);
    animateCounter("comodos", 0, totalComodos, 800);
}

// Referências
const modal = document.getElementById("modal-confirm");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirmBtn = document.getElementById("modal-confirm-btn");

let comodoParaRemoverId = null;

function abrirModalConfirmacao(mensagem) {
    modalText.textContent = mensagem;
    modal.classList.remove("hidden");
}

function fecharModal() {
    modal.classList.add("hidden");
    comodoParaRemoverId = null;
}

// Eventos do modal
modalClose.addEventListener("click", fecharModal);
modalCancel.addEventListener("click", fecharModal);

// Confirmar remoção
modalConfirmBtn.addEventListener("click", async () => {
    await logout();
    fecharModal();
});

function confirmarLogout() {
    abrirModalConfirmacao(`Tem certeza que deseja sair da conta?`);
}

async function logout() {
    await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include"
    });
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const modalLogin = document.getElementById("modal-login");
    const modalLoginBtn = document.getElementById("modal-login-btn");

    if (!usuarioLogado) {
        // Exibe o modal
        modalLogin.classList.remove("hidden");

        // Bloqueia qualquer interação até clicar no botão
        modalLoginBtn.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});
