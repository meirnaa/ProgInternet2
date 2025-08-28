//Mudança entre cadastro e login by Lina
document.addEventListener('DOMContentLoaded', () => {
    const loginFormContainer = document.getElementById('login-form');
    const cadastroFormContainer = document.getElementById('cadastro-form');
    const linkCadastro = document.getElementById('link-cadastro');
    const linkLogin = document.getElementById('link-login');

    // Função para mostrar o formulário de login e esconder o de cadastro
    function mostrarLogin() {
        cadastroFormContainer.classList.remove('active');
        loginFormContainer.classList.add('active');
    }

    // Função para mostrar o formulário de cadastro e esconder o de login
    function mostrarCadastro() {
        loginFormContainer.classList.remove('active');
        cadastroFormContainer.classList.add('active');
    }

    // Adiciona o evento de clique para alternar entre os formulários
    linkCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarCadastro();
    });

    linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarLogin();
    });

});


//Clique nos botãos cadastro e login by Meir
const formLogin = document.getElementById('login');
const formCadastro = document.getElementById('cadastro');

formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  window.location.href = 'home.html';
});

formCadastro.addEventListener('submit', (e) => {
  e.preventDefault();
  window.location.href = 'home.html';
});


//Mudar de tema claro para escuro by Lina
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Função para alternar o tema
    function toggleTheme() {
        body.classList.toggle('dark-theme');
        // Opcional: Salvar a preferência do usuário no localStorage
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '🌙';
        }
    }

    // Verifica se há uma preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '☀️';
    }

    // Adiciona o evento de clique ao botão
    themeToggleBtn.addEventListener('click', toggleTheme);
});