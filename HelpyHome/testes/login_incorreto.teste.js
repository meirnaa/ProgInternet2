const { Builder, By, until } = require("selenium-webdriver");

(async function testLoginIncorreto() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://127.0.0.1:5500/HelpyHome/front-end/login.html");

        await driver.findElement(By.id("email")).sendKeys("email_invalido@teste.com");
        await driver.findElement(By.id("senha")).sendKeys("senhaErrada");
        await driver.findElement(By.id("botao-entrar")).click();

        await driver.sleep(2000);

        const msgErro = await driver.findElement(By.id("mensagem-erro-texto")).getText();

        if (msgErro && msgErro.length > 0) {
            console.log("\n✔ Teste de login incorreto passou! Mensagem exibida:", msgErro);
        } else {
            console.log("\n❌ A mensagem de erro não foi exibida.");
        }

    } catch (erro) {
        console.error("Erro no teste:", erro);
    } finally {
        await driver.quit();
    }
})();
