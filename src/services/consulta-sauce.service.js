import { chromium } from "playwright";

export const obtenerPdfUrl = async (codigoNumerico) => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();

    await page.goto(
      `http://muni020.ddns.net:5080/cgi-bin/menuurbanos.exe?valido:${codigoNumerico}`
    );

    await page.waitForSelector("#oBtn1");
    await page.click("#oBtn1");

    await page.waitForSelector("#oGet1");
    const ultimoValue = await page.evaluate(() => {
      const select = document.getElementById("oGet1");
      return select.options[select.options.length - 1].value;
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
