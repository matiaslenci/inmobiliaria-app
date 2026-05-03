import {
  obtenerMontoAgua,
  obtenerMontoTasas,
} from "../services/consulta.service.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import os from "os";

const upload = multer({ dest: os.tmpdir() });

export const uploadExcelMiddleware = upload.single("archivoExcel");

export const uploadExcel = (req, res) => {
  res.render("index", { title: "Consulta Liquidaciones", error: null });
};

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const esValorReal = (v) =>
  v != null && String(v).trim() !== "" && String(v).trim() !== "-";

export const procesarConsulta = async (req, res) => {
  if (!req.file) {
    return res.render("index", {
      title: "Consulta Liquidaciones",
      error: "Debes subir un archivo Excel",
    });
  }

  const filePath = req.file.path;

  try {
    const periodo = req.body.periodo || "mes-siguiente";
    const filaIndice = periodo === "este-mes" ? 0 : 1;

    const hoy = new Date();
    const mesSeleccionado =
      periodo === "este-mes"
        ? MESES[hoy.getMonth()]
        : MESES[(hoy.getMonth() + 1) % 12];
    const periodoTexto = periodo === "este-mes" ? "Este Mes" : "Mes Siguiente";

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      defval: "",
      blankrows: true,
    });

    const firstRow = jsonData[0] || {};
    if (!("CUENTA AGUA" in firstRow) || !("CUENTA TASA" in firstRow)) {
      return res.render("index", {
        title: "Consulta Liquidaciones",
        error: "No se encuentran las columnas 'CUENTA AGUA' y/o 'CUENTA TASA' en el archivo",
      });
    }

    const direcciones = [];
    const cuentasAgua = [];
    const cuentasTasas = [];
    const locatarios = [];

    for (const row of jsonData) {
      direcciones.push(esValorReal(row["DIRECCION INMUEBLE"]) ? String(row["DIRECCION INMUEBLE"]) : "-");
      cuentasAgua.push(esValorReal(row["CUENTA AGUA"]) ? String(row["CUENTA AGUA"]) : "-");
      cuentasTasas.push(esValorReal(row["CUENTA TASA"]) ? String(row["CUENTA TASA"]) : "-");
      locatarios.push(esValorReal(row["LOCATARIO"]) ? String(row["LOCATARIO"]) : "-");
    }

    const procesarEnLotes = async (cuentas, funcionConsulta, batchSize = 5, baseDelay = 500) => {
      const resultados = new Array(cuentas.length).fill("-");
      let consecutiveErrors = 0;

      for (let i = 0; i < cuentas.length; i += batchSize) {
        const indices = [];
        const promesas = [];

        for (let j = i; j < Math.min(i + batchSize, cuentas.length); j++) {
          if (cuentas[j] && cuentas[j] !== "-") {
            promesas.push(
              funcionConsulta(cuentas[j], filaIndice)
                .then((resultado) => ({ ok: true, resultado }))
                .catch((error) => ({ ok: false, error: error.message }))
            );
            indices.push(j);
          }
        }

        if (promesas.length === 0) continue;

        const loteResultados = await Promise.all(promesas);
        let erroresEnLote = 0;

        loteResultados.forEach(({ ok, resultado }, idx) => {
          if (ok) {
            resultados[indices[idx]] = resultado;
          } else {
            resultados[indices[idx]] = "Error al obtener monto";
            erroresEnLote++;
          }
        });

        consecutiveErrors = erroresEnLote > promesas.length * 0.5
          ? consecutiveErrors + 1
          : 0;

        if (i + batchSize < cuentas.length) {
          await new Promise((r) => setTimeout(r, baseDelay + consecutiveErrors * 300));
        }
      }

      return resultados;
    };

    const montosAgua = await procesarEnLotes(cuentasAgua, obtenerMontoAgua);
    await new Promise((r) => setTimeout(r, 1000));
    const montosTasas = await procesarEnLotes(cuentasTasas, obtenerMontoTasas);

    res.render("resultado", {
      title: "Resultados Consulta",
      direcciones,
      cuentasAgua,
      cuentasTasas,
      montosAgua,
      montosTasas,
      locatarios,
      totalRecords: Math.max(cuentasAgua.length, cuentasTasas.length),
      waterAccounts: cuentasAgua.filter((c) => c && c !== "-").length,
      taxAccounts: cuentasTasas.filter((c) => c && c !== "-").length,
      periodo,
      mesSeleccionado,
      periodoTexto,
    });
  } catch (error) {
    console.error(error);
    res.render("index", {
      title: "Consulta Liquidaciones",
      error: "Error procesando el archivo",
    });
  } finally {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
};

export const descargarPlantilla = (req, res) => {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet([
    ["DIRECCION INMUEBLE", "CUENTA TASA", "CUENTA AGUA"],
  ]);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Plantilla");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=plantilla_tasas.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
};

export const descargarResultados = (req, res) => {
  const {
    direcciones = [],
    cuentasAgua = [],
    cuentasTasas = [],
    montosAgua = [],
    montosTasas = [],
    locatarios = [],
  } = req.body;

  const mostrarLocatario = Array.isArray(locatarios) && locatarios.some(esValorReal);
  const mostrarDireccion = Array.isArray(direcciones) && direcciones.some(esValorReal);

  const columnas = [];
  if (mostrarDireccion) columnas.push("DIRECCION INMUEBLE");
  if (mostrarLocatario) columnas.push("LOCATARIO");
  columnas.push("CUENTA AGUA", "MONTO AGUA", "CUENTA TASA", "MONTO TASAS");

  const total = Math.max(
    direcciones.length,
    cuentasAgua.length,
    cuentasTasas.length,
    montosAgua.length,
    montosTasas.length,
    locatarios.length
  );

  const filas = [columnas];
  for (let i = 0; i < total; i++) {
    const fila = [];
    if (mostrarDireccion) fila.push(direcciones[i] || "");
    if (mostrarLocatario) fila.push(locatarios[i] || "");
    fila.push(
      cuentasAgua[i] || "",
      montosAgua[i] || "",
      cuentasTasas[i] || "",
      montosTasas[i] || ""
    );
    filas.push(fila);
  }

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, xlsx.utils.aoa_to_sheet(filas), "Resultados");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=resultados_tasas.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
};
