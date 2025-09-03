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

function visuSenhaLogin() {
    const passwordInput = document.getElementById("senha");
    const olhoIcon = document.getElementById("olho-icon-login");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        olhoIcon.classList.remove("fa-eye-slash");
        olhoIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        olhoIcon.classList.remove("fa-eye");
        olhoIcon.classList.add("fa-eye-slash");
    }
}

function visuSenhaCadastro() {
    const passwordInput = document.getElementById("senha-cadastro");
    const olhoIcon = document.getElementById("olho-icon-cadastro");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        olhoIcon.classList.remove("fa-eye-slash");
        olhoIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        olhoIcon.classList.remove("fa-eye");
        olhoIcon.classList.add("fa-eye-slash");
    }
}

function visuSenhaConfirmarCadastro() {
    const passwordInput = document.getElementById("conf-senha-cadastro");
    const olhoIcon = document.getElementById("olho-icon-conf");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        olhoIcon.classList.remove("fa-eye-slash");
        olhoIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        olhoIcon.classList.remove("fa-eye");
        olhoIcon.classList.add("fa-eye-slash");
    }
}

const mensagemErroDiv = document.getElementById("mensagem-erro-texto");

// Em login.js
async function validarFormulario(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("senha").value;
    const botaoEntrar = document.getElementById("botao-entrar");

    botaoEntrar.disabled = true;
    botaoEntrar.classList.add("desativado");

    const erro = verificarErro();

    if (erro) {
        document.getElementById("mensagem-erro").style.display = "block";
        botaoEntrar.classList.remove("desativado");
        botaoEntrar.disabled = false;
        return;
    } 
    
    const resultado = await verificarConta(email, password);

    if(resultado && resultado.token){ // Apenas checa se o resultado e o token existem
        // O token já foi salvo dentro de verificarConta()
        localStorage.setItem("usuarioLogado", JSON.stringify(resultado.usuario));
        ir_para_principal();     
    } else {
        mensagemErroDiv.innerHTML = `E-mail ou senha incorretos!`;
        document.getElementById("mensagem-erro").style.display = "block";
        botaoEntrar.classList.remove("desativado");
        botaoEntrar.disabled = false;
    } 
}

function ir_para_principal(){
    window.location.href = "home.html";
}

// Conectar o formulário de login
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("login");
    if (formLogin) {
        formLogin.addEventListener("submit", validarFormulario);
    }

    const formCadastro = document.getElementById("cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", validarFormularioCadastro);
    }
});


// Função para verificar se a conta existe no back
async function verificarConta(email, password) {
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha: password }),
            credentials: "include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log("Erro ao logar:", errorData.message);
            return null;
        }

        const data = await response.json();

        // 👉 Se o backend devolver token, salve no localStorage
        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        return { usuario: data.usuario, token: data.token };

    } catch (err) {
        console.error("Erro ao verificar conta:", err);
        return null;
    }
}


function verificarErro() {
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");

    if(emailInput.value.trim() === "" || senhaInput.value.trim() === ""){
        mensagemErroDiv.innerHTML = "Os campos email e senha não<br> podem estar vazios.";
        return true;
    }

    if (!isValidEmail(emailInput.value)) {
        mensagemErroDiv.innerHTML = "Por favor, insira um<br> endereço de e-mail válido.";
        return true;
    }

    if (senhaInput.value.length < 8) {
        mensagemErroDiv.innerHTML = "A senha deve conter 8 dígitos.";
        return true;
    }

    return false; 
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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


// ------ CADASTRO -------

const mensagemErroCadastroDiv = document.getElementById("mensagem-erro-cadastro-texto"); 
const botaoCriarConta = document.getElementById("botao-cadastrar");

function validarEmail() {
    const email = document.getElementById('email-cadastro').value;
    const emailExistente = localStorage.getItem('userEmail');

    if (emailExistente === email) {
        mensagemErroCadastroDiv.innerHTML = "Esse e-mail já está cadastrado.";
        document.getElementById("mensagem-erro-cadastro").style.display = "block";
        botaoCriarConta.classList.add("desativado");
        botaoCriarConta.disabled = true;
    } else {
        document.getElementById("mensagem-erro-cadastro").style.display = "none";
        botaoCriarConta.classList.remove("desativado");
        botaoCriarConta.disabled = false;
    }
}

function validarNome(nome) {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/; // apenas letras e espaços
    return regex.test(nome);
}

function verificarErroCadastro(dados) {
    if (dados.nome.trim() === "" || dados.email.trim() === "" || dados.senha.trim() === "" || dados.confirmar_senha.trim() === ""){
        exibirMensagemErroCadastro("Os campos nome, email e senha não<br> podem estar vazios.");
        return true;
    }

    if (!validarNome(dados.nome)) {
        exibirMensagemErroCadastro("O nome só pode conter<br> letras e espaços.");
        return true;
    }

    if (!isValidEmail(dados.email)) {
        exibirMensagemErroCadastro("Por favor, insira um<br> endereço de e-mail válido.");
        return true;
    }

    if (dados.senha.length < 8){
        exibirMensagemErroCadastro("A senha deve conter no mínimo 8 dígitos.");
        return true;
    }

    if (dados.senha !== dados.confirmar_senha) {
        exibirMensagemErroCadastro("As senhas não coincidem.");
        return true;
    }

    return false;
}

function exibirMensagemErroCadastro(mensagem) {
    mensagemErroCadastroDiv.innerHTML = mensagem;
    document.getElementById("mensagem-erro-cadastro").style.display = "block";
}

async function validarFormularioCadastro(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email-cadastro').value;
    const senha = document.getElementById('senha-cadastro').value;
    const confirmar_senha = document.getElementById('conf-senha-cadastro').value;

    const dados = { nome, email, senha, confirmar_senha };

    botaoCriarConta.disabled = true;
    botaoCriarConta.classList.add("desativado");

    // Realiza a validação do formulário
    const erro = verificarErroCadastro(dados);

    // Bloqueia os campos do formulário e o botão de envio
    document.getElementById("nome").disabled = true;
    document.getElementById("email-cadastro").disabled = true;
    document.getElementById("senha-cadastro").disabled = true;
    document.getElementById("conf-senha-cadastro").disabled = true;

    if (erro) {
    // Desbloqueia os campos do formulário e o botão de envio
        document.getElementById("nome").disabled = false;
        document.getElementById("senha-cadastro").disabled = false;
        document.getElementById("email-cadastro").disabled = false;
        document.getElementById("conf-senha-cadastro").disabled = false;
        botaoCriarConta.disabled = false;
        botaoCriarConta.classList.remove("desativado");

        return;
    }
    
    try {
        const response = await fetch("http://localhost:3000/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha }),
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            // 👉 aqui exibe qualquer erro vindo do servidor
            exibirMensagemErroCadastro(data.message || "Erro ao cadastrar.");
            botaoCriarConta.disabled = false;
            botaoCriarConta.classList.remove("desativado");
            return;
        }

        localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
        ir_para_principal();
    } catch (err) {
        console.error("Erro no cadastro:", err);
        exibirMensagemErroCadastro("Erro de conexão com servidor.");
        botaoCriarConta.disabled = false;
        botaoCriarConta.classList.remove("desativado");
    }

}