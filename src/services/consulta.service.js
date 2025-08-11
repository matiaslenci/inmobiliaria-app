import * as cheerio from "cheerio";

export const obtenerSegundoMonto = async (
  nroCuenta,
  nroLiquidacion = "2903794"
) => {
  try {
    /**
     * Realiza una solicitud POST a la URL especificada para obtener las liquidaciones
     * y luego analiza el HTML para encontrar el monto del segundo vencimiento de la liquidación
     * especificada por nroLiquidacion.
     */
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

    let monto2doVencimiento = null;

    $("#divTablaLiquidacionesTUR table tr.fila").each((i, element) => {
      const liquidacionActual = $(element).find("td").first().text().trim();
      if (liquidacionActual === nroLiquidacion) {
        monto2doVencimiento = $(element).find("td").eq(5).text().trim();
      }
    });

    if (!monto2doVencimiento) {
      throw new Error(`No se encontró la liquidación ${nroLiquidacion}`);
    }

    return monto2doVencimiento;
  } catch (error) {
    throw new Error(`Error al obtener el monto: ${error.message}`);
  }
};
