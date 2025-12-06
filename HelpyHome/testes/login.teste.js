const { Builder, By, until } = require("selenium-webdriver");

(async function testLogin() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://127.0.0.1:5500/HelpyHome/front-end/login.html");

        await driver.findElement(By.id("email")).sendKeys("meirn19@gmail.com");
        await driver.findElement(By.id("senha")).sendKeys("12121212");

        await driver.findElement(By.id("botao-entrar")).click();

        await driver.sleep(2000);

        let urlAtual = await driver.getCurrentUrl();

        if (urlAtual.includes("home")) {
            console.log("\n✔ Login bem-sucedido!");
        } else {
            console.log("\n❌ Login falhou (não redirecionou). URL atual:", urlAtual);
        }

    } catch (erro) {
        console.error("\nErro no teste:", erro);
    } finally {
        await driver.quit();
    }
})();
