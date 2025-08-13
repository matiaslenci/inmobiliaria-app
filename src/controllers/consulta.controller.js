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
    if (!("CUENTA AGUA" in firstRow) || !("CUENTA TASA" in firstRow)) {
      fs.unlinkSync(req.file.path); // eliminar archivo subido
      return res.render("index", {
        title: "Consulta Liquidaciones",
        error:
          "No se encuentran las columnas 'CUENTA AGUA' y/o 'CUENTA TASA' en el archivo",
      });
    }

    const cuentasAgua = [];
    const cuentasTasas = [];

    jsonData.forEach((row) => {
      if (row["CUENTA AGUA"]) cuentasAgua.push(String(row["CUENTA AGUA"]));
      if (row["CUENTA TASA"]) cuentasTasas.push(String(row["CUENTA TASA"]));
    });

    const montosAgua = [];
    const montosTasas = [];

    // Procesar montos de agua
    for (let i = 0; i < cuentasAgua.length; i++) {
      try {
        const montoAgua = await obtenerMontoAgua(cuentasAgua[i]);
        montosAgua.push(montoAgua);
      } catch {
        montosAgua.push("Error al obtener monto agua");
      }
    }

    // Procesar montos de tasas
    for (let i = 0; i < cuentasTasas.length; i++) {
      try {
        const montoTasas = await obtenerMontoTasas(cuentasTasas[i]);
        montosTasas.push(montoTasas);
      } catch {
        montosTasas.push("Error al obtener monto tasas");
      }
    }

    // Eliminar archivo después de procesarlo
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error eliminando el archivo:", err);
    });

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

export const descargarPlantilla = (req, res) => {
  const columnas = [
    [
      "DIRECCION INMUEBLE",
      "CUENTA TASA",
      "CUENTA AGUA",
      "AUMENTO",
      "VALOR INICIAL",
      "INICIO",
      "FINALIZACIÓN",
    ],
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
