import {
  obtenerMontoAgua,
  obtenerMontoTasas,
} from "../services/consulta.service.js";
import multer from "multer";
import xlsx from "xlsx";

const upload = multer({ dest: "uploads/" });

export const uploadExcelMiddleware = upload.single("archivoExcel");

export const uploadExcel = (req, res) => {
  res.render("index", {
    title: "Consulta Liquidaciones",
    error: null,
  });
};

export const mostrarFormulario = (req, res) => {
  res.render("aguas", {
    title: "Consulta Liquidaciones de Agua Corriente y Cloacas",
    error: null,
  });
};

export const procesarConsulta = async (req, res) => {
  if (!req.file) {
    return res.render("index", {
      title: "Consulta Liquidaciones",
      error: "Debes subir un archivo Excel",
    });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const cuentasAgua = [];
    const cuentasTasas = [];

    jsonData.forEach((row) => {
      if (row["CUENTA AGUA"]) cuentasAgua.push(String(row["CUENTA AGUA"]));
      if (row["CUENTA TASA"]) cuentasTasas.push(String(row["CUENTA TASA"]));
    });

    const montosAgua = [];
    const montosTasas = [];

    // Por cada cuenta, obtenemos el monto y lo guardamos en el array correspondiente
    for (let i = 0; i < cuentasAgua.length; i++) {
      try {
        const montoAgua = await obtenerMontoAgua(cuentasAgua[i]);
        montosAgua.push(montoAgua);
      } catch {
        montosAgua.push("Error al obtener monto agua");
      }
    }

    for (let i = 0; i < cuentasTasas.length; i++) {
      try {
        const montoTasas = await obtenerMontoTasas(cuentasTasas[i]);
        montosTasas.push(montoTasas);
      } catch {
        montosTasas.push("Error al obtener monto tasas");
      }
    }

    // Enviar los arrays de montos a la vista
    res.render("resultado", {
      title: "Resultados Consulta",
      cuentasAgua,
      cuentasTasas,
      montosAgua,
      montosTasas,
    });
  } catch (error) {
    console.error(error);
    res.render("index", {
      title: "Consulta Liquidaciones",
      error: "Error procesando el archivo",
    });
  }
};

export const procesarConsulta2 = async (req, res) => {
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
    const monto = await obtenerMontoAgua(nroCuenta);

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
