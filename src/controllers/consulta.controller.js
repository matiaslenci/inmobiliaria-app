import { obtenerSegundoMonto } from "../services/consulta.service.js";

export const mostrarFormulario = (req, res) => {
  res.render("aguas", {
    title: "Consulta Liquidaciones de Agua Corriente y Cloacas",
    error: null,
  });
};

export const procesarConsulta = async (req, res) => {
  const { nroCuenta } = req.body;
  if (!nroCuenta) {
    return res.render("aguas", {
      title: "Consulta Liquidaciones de Agua Corriente y Cloacas",
      error: "Debe ingresar un número de cuenta",
    });
  }

  try {
    /*    const arrayCuentas = [8535, 62566, 13653, 2426];

    for (const cuenta of arrayCuentas) {
      let monto = await obtenerSegundoMonto(cuenta);

      console.log(cuenta);
      console.log(monto);
    }
 */
    const monto = await obtenerSegundoMonto(nroCuenta);

    // Mostrar en la vista
    res.render("resultado", {
      title: "Resultado de consulta",
      nroCuenta,
      monto,
    });
  } catch (error) {
    console.error("Error al consultar:", error);
    res.render("aguas", {
      title: "Consulta tasas",
      error: "No se pudo obtener la información",
    });
  }
};
