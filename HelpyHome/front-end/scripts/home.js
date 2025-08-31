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

async function buscarDadosDashboard() {
    try {
        // Busca todos os cômodos
        const respComodos = await fetch("http://localhost:3000/comodo");
        const comodos = await respComodos.json();

        // Busca todos os dispositivos
        const respDispositivos = await fetch("http://localhost:3000/dispositivo");
        const dispositivos = await respDispositivos.json();

        // Quantidade total de dispositivos
        const totalDispositivos = dispositivos.length;

        // Quantidade de dispositivos ativos
        const dispositivosAtivos = dispositivos.filter(d => d.estado).length;

        // Quantidade de cômodos
        const totalComodos = comodos.length;

        // Agrupar por tipo de dispositivo
        const tipos = {};
        dispositivos.forEach(d => {
            if (!tipos[d.tipo]) tipos[d.tipo] = 0;
            tipos[d.tipo]++;
        });

        return { totalDispositivos, dispositivosAtivos, totalComodos, tipos };

    } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        return { totalDispositivos: 0, dispositivosAtivos: 0, totalComodos: 0, tipos: {} };
    }
}


// Chart 1: Dispositivos por tipo
let devicesChart;

async function atualizarGrafico() {
    const dados = await buscarDadosDashboard();

    const labels = Object.keys(dados.tipos);
    const values = Object.values(dados.tipos);
    const colors = ['#FF6F00', '#FF8F00', '#FFA000', '#FFB300', '#FFC107', '#FFD54F'];

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
  let range = end - start;
  let stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  let timer = setInterval(() => {
    current++;
    obj.textContent = current;
    if (current >= end) clearInterval(timer);
  }, stepTime);
}

async function atualizarContadores() {
    const dados = await buscarDadosDashboard();

    animateCounter("total-dispositivos", 0, dados.totalDispositivos, 800);
    animateCounter("dispositivos-ativos", 0, dados.dispositivosAtivos, 800);
    animateCounter("comodos", 0, dados.totalComodos, 800);
}

document.addEventListener("DOMContentLoaded", async () => {
    await atualizarContadores();
    await atualizarGrafico();
});


