import { obtenerPdfUrl } from "../services/consulta-sauce.service.js";

export const renderConsultaSauce = (req, res) => {
  res.render("consulta-sauce", {
    pdfUrl: null,
    error: null,
  });
};

export const procesarConsulta = async (req, res) => {
  try {
    const { nroCuenta } = req.body;
    const pdfUrl = await obtenerPdfUrl(nroCuenta);

    res.render("consulta-sauce", {
      pdfUrl,
      error: null,
    });
  } catch (error) {
    res.render("consulta-sauce", {
      pdfUrl: null,
      error: error.message,
    });
  }
};
