import * as cheerio from "cheerio";

export const obtenerMontoAgua = async (nroCuenta) => {
  try {
    const response = await fetch(
      "https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          parametricos: "9",
          parametricoSeleccionado: "",
          nroCuenta: String(nroCuenta),
          nroConvenio: "",
          codObra: "",
          nroContrato: "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const filasDatos = $("#divTablaLiquidacionesTUR table tr").slice(1); // salta la cabecera
    const primeraFila = filasDatos.first();
    const montoAgua = primeraFila.find("td").eq(5).text().trim();

    if (!montoAgua) {
      throw new Error(
        `No se encontró el segundo monto para la cuenta ${nroCuenta}`
      );
    }

    return montoAgua;
  } catch (error) {
    throw new Error(`Error al obtener el monto: ${error.message}`);
  }
};

export const obtenerMontoTasas = async (nroCuenta) => {
  try {
    const response = await fetch(
      "https://servicios.santotome.gob.ar:8443/liquidacionesweb/buscarLiquidaciones.do",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          parametricos: "5",
          parametricoSeleccionado: "",
          nroCuenta: String(nroCuenta),
          nroConvenio: "",
          codObra: "",
          nroContrato: "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const filasDatos = $("#divTablaLiquidacionesTUR table tr").slice(1); // salta la cabecera
    const primeraFila = filasDatos.first();
    const montoTasas = primeraFila.find("td").eq(5).text().trim();

    if (!montoTasas) {
      throw new Error(
        `No se encontró el segundo monto para la cuenta ${nroCuenta}`
      );
    }

    return montoTasas;
  } catch (error) {
    throw new Error(`Error al obtener el monto: ${error.message}`);
  }
};
