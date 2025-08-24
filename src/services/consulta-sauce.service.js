import { chromium } from "playwright";

export const obtenerPdfUrl = async (codigoNumerico) => {
  const browser = await chromium.launch({ headless: false });
  try {
    const page = await browser.newPage();

    // 1. Navegar a la URL inicial con el código
    await page.goto(
      `http://muni020.ddns.net:5080/cgi-bin/menuurbanos.exe?valido:${codigoNumerico}`
    );

    // 2. Esperar y hacer clic en el botón oBtn1
    await page.waitForSelector("#oBtn1");
    await page.click("#oBtn1");

    // 3. En la nueva página, esperar por el select y obtener el último option
    await page.waitForSelector("#oGet1");
    const ultimoValue = await page.evaluate(() => {
      const select = document.getElementById("oGet1");
      const options = select.options;
      return options[options.length - 1].value;
    });

    if (!ultimoValue) {
      throw new Error("No se encontró el valor del último option");
    }

    return ultimoValue;
  } catch (error) {
    throw new Error(`Error en el scraping: ${error.message}`);
  } finally {
    await browser.close();
  }
};
