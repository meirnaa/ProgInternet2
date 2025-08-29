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
