import * as cheerio from "cheerio";

const BASE_URL =
  "https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do";

const PARAMETRICOS = { agua: "9", tasas: "5" };

const fetchMonto = async (nroCuenta, parametricos, filaIndice, tipo) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: new URLSearchParams({
        parametricos,
        parametricoSeleccionado: "",
        nroCuenta: String(nroCuenta),
        nroConvenio: "",
        codObra: "",
        nroContrato: "",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const $ = cheerio.load(await response.text());
    const monto = $("#divTablaLiquidacionesTUR table tr")
      .slice(1)
      .eq(filaIndice)
      .find("td")
      .eq(5)
      .text()
      .trim();

    if (!monto) {
      throw new Error(
        `No se encontró monto en fila ${filaIndice + 1} para cuenta ${nroCuenta}`
      );
    }

    return monto;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timeout en consulta de ${tipo} para cuenta ${nroCuenta}`);
    }
    throw new Error(`Error al obtener monto ${tipo}: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const obtenerMontoAgua = (nroCuenta, filaIndice = 1) =>
  fetchMonto(nroCuenta, PARAMETRICOS.agua, filaIndice, "agua");

export const obtenerMontoTasas = (nroCuenta, filaIndice = 1) =>
  fetchMonto(nroCuenta, PARAMETRICOS.tasas, filaIndice, "tasas");
