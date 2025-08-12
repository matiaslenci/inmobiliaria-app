import { obtenerSegundoMonto } from "../services/consulta.service.js";

export const mostrarFormulario = (req, res) => {
  res.render("index", {
    title: "Consulta tasas",
    error: null,
  });
};

export const procesarConsulta = async (req, res) => {
  const { nroCuenta } = req.body;
  if (!nroCuenta) {
    return res.render("index", {
      title: "Consulta tasas",
      error: "Debe ingresar un número de cuenta",
    });
  }

  try {
    const monto = await obtenerSegundoMonto(nroCuenta);

    // Mostrar en la vista
    res.render("resultado", {
      title: "Resultado de consulta",
      nroCuenta,
      monto,
    });
  } catch (error) {
    console.error("Error al consultar:", error);
    res.render("index", {
      title: "Consulta tasas",
      error: "No se pudo obtener la información",
    });
  }
};
