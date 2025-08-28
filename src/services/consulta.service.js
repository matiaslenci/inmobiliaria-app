import * as cheerio from "cheerio";

export const obtenerMontoAgua = async (nroCuenta) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 10 segundos timeout

    const response = await fetch(
      "https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: new URLSearchParams({
          parametricos: "9",
          parametricoSeleccionado: "",
          nroCuenta: String(nroCuenta),
          nroConvenio: "",
          codObra: "",
          nroContrato: "",
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const filasDatos = $("#divTablaLiquidacionesTUR table tr").slice(1); // salta la cabecera
    const segundaFila = filasDatos.eq(1); // segunda fila de datos (índice 1)
    const montoAgua = segundaFila.find("td").eq(5).text().trim();

    if (!montoAgua) {
      throw new Error(
        `No se encontró el segundo monto para la cuenta ${nroCuenta}`
      );
    }

    return montoAgua;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timeout en consulta de agua para cuenta ${nroCuenta}`);
    }
    throw new Error(`Error al obtener monto agua: ${error.message}`);
  }
};

export const obtenerMontoTasas = async (nroCuenta) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(
      "https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: new URLSearchParams({
          parametricos: "5",
          parametricoSeleccionado: "",
          nroCuenta: String(nroCuenta),
          nroConvenio: "",
          codObra: "",
          nroContrato: "",
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const filasDatos = $("#divTablaLiquidacionesTUR table tr").slice(1); // salta la cabecera
    const segundaFila = filasDatos.eq(1); // segunda fila de datos (índice 1)
    const montoTasas = segundaFila.find("td").eq(5).text().trim();
    if (!montoTasas) {
      throw new Error(
        `No se encontró el segundo monto para la cuenta ${nroCuenta}`
      );
    }

    return montoTasas;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timeout en consulta de tasas para cuenta ${nroCuenta}`);
    }
    throw new Error(`Error al obtener monto tasas: ${error.message}`);
  }
};
