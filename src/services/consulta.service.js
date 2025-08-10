import * as cheerio from "cheerio";

export const obtenerSegundoMonto = async (nroCuenta) => {
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

  const monto2doVencimiento = $("#divTablaLiquidacionesTUR table tr.fila")
    .first()
    .find("td")
    .eq(5)
    .text()
    .trim();

  if (!monto2doVencimiento) {
    throw new Error("No se encontró el segundo monto");
  }

  return monto2doVencimiento;
};
