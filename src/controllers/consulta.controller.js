import {
  obtenerMontoAgua,
  obtenerMontoTasas,
} from "../services/consulta.service.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

export const uploadExcelMiddleware = upload.single("archivoExcel");

export const uploadExcel = (req, res) => {
  res.render("index", {
    title: "Consulta Liquidaciones",
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
    const filePath = req.file.path;

    // Leer el Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON usando encabezados reales
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Validar que existan las columnas necesarias
    const firstRow = jsonData[0] || {};
    if (
      !("CUENTA AGUA" in firstRow) ||
      !("CUENTA TASA" in firstRow) ||
      !("CIUDAD" in firstRow)
    ) {
      fs.unlinkSync(req.file.path); // eliminar archivo subido
      return res.render("index", {
        title: "Consulta Liquidaciones",
        error:
          "No se encuentran las columnas 'CUENTA AGUA', 'CUENTA TASA' y/o 'CIUDAD' en el archivo",
      });
    }

    const cuentasAgua = [];
    const direcciones = [];
    const cuentasTasas = [];
    const ciudades = [];
    const locatarios = [];

    jsonData.forEach((row) => {
      if (row["DIRECCION INMUEBLE"]) {
        direcciones.push(String(row["DIRECCION INMUEBLE"]));
      }
      if (row["CUENTA AGUA"]) {
        cuentasAgua.push(String(row["CUENTA AGUA"]));
      }
      if (row["CUENTA TASA"]) {
        cuentasTasas.push(String(row["CUENTA TASA"]));
      }
      if (row["CIUDAD"]) {
        ciudades.push(String(row["CIUDAD"]).toUpperCase().trim());
      } else {
        ciudades.push("");
      }
      // Si existe la columna LOCATARIO, agregarla
      if ("LOCATARIO" in row) {
        locatarios.push(row["LOCATARIO"] ? String(row["LOCATARIO"]) : "");
      } else {
        locatarios.push("");
      }
    });

    const montosAgua = [];
    const montosTasas = [];

    // Procesar montos de agua y tasas según ciudad
    for (let i = 0; i < cuentasAgua.length; i++) {
      if (ciudades[i] === "SV") {
        montosAgua.push("");
      } else if (ciudades[i] === "ST") {
        try {
          const montoAgua = await obtenerMontoAgua(cuentasAgua[i]);
          montosAgua.push(montoAgua);
        } catch {
          montosAgua.push("Error al obtener monto agua");
        }
      } else {
        montosAgua.push("");
      }
    }

    for (let i = 0; i < cuentasTasas.length; i++) {
      if (ciudades[i] === "SV") {
        montosTasas.push("");
      } else if (ciudades[i] === "ST") {
        try {
          const montoTasas = await obtenerMontoTasas(cuentasTasas[i]);
          montosTasas.push(montoTasas);
        } catch {
          montosTasas.push("Error al obtener monto tasas");
        }
      } else {
        montosTasas.push("");
      }
    }

    // Eliminar archivo después de procesarlo
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error eliminando el archivo:", err);
    });

    res.render("resultado", {
      title: "Resultados Consulta",
      direcciones,
      ciudades,
      cuentasAgua,
      cuentasTasas,
      montosAgua,
      montosTasas,
      locatarios,
      totalRecords: Math.max(cuentasAgua.length, cuentasTasas.length),
      waterAccounts: cuentasAgua.filter((c) => c && c !== "-").length,
      taxAccounts: cuentasTasas.filter((c) => c && c !== "-").length,
    });
  } catch (error) {
    console.error(error);
    res.render("index", {
      title: "Consulta Liquidaciones",
      error: "Error procesando el archivo",
    });
  }
};

export const descargarPlantilla = (req, res) => {
  const columnas = [
    ["DIRECCION INMUEBLE", "CIUDAD", "CUENTA TASA", "CUENTA AGUA"],
  ];

  // Crear libro y hoja
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(columnas);

  xlsx.utils.book_append_sheet(workbook, worksheet, "Plantilla");

  // Convertir a buffer
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Enviar para descargar
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=plantilla_tasas.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
};
