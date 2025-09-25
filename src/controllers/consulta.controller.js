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

    // Obtener el período seleccionado (este-mes = índice 0, mes-siguiente = índice 1)
    const periodo = req.body.periodo || "mes-siguiente";
    const filaIndice = periodo === "este-mes" ? 0 : 1;

    // Calcular el mes correspondiente para mostrar en resultados
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const hoy = new Date();
    const mesActual = meses[hoy.getMonth()];
    const mesSiguiente = meses[(hoy.getMonth() + 1) % 12];
    const mesSeleccionado = periodo === "este-mes" ? mesActual : mesSiguiente;
    const periodoTexto = periodo === "este-mes" ? "Este Mes" : "Mes Siguiente";

    // Leer el Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON usando encabezados reales, preservando filas/celdas vacías
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      defval: "", // devuelve cadena vacía en celdas vacías para no desplazar columnas
      blankrows: true, // preserva filas completamente vacías para no desalinear
    });

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
      // Dirección
      if (
        row["DIRECCION INMUEBLE"] &&
        String(row["DIRECCION INMUEBLE"]).trim() !== ""
      ) {
        direcciones.push(String(row["DIRECCION INMUEBLE"]));
      } else {
        direcciones.push("-");
      }
      // Cuenta Agua
      if (row["CUENTA AGUA"] && String(row["CUENTA AGUA"]).trim() !== "") {
        cuentasAgua.push(String(row["CUENTA AGUA"]));
      } else {
        cuentasAgua.push("-");
      }
      // Cuenta Tasa
      if (row["CUENTA TASA"] && String(row["CUENTA TASA"]).trim() !== "") {
        cuentasTasas.push(String(row["CUENTA TASA"]));
      } else {
        cuentasTasas.push("-");
      }
      // Ciudad
      if (row["CIUDAD"] && String(row["CIUDAD"]).trim() !== "") {
        ciudades.push(String(row["CIUDAD"]).toUpperCase().trim());
      } else {
        ciudades.push("-");
      }
      // Locatario
      if (
        "LOCATARIO" in row &&
        row["LOCATARIO"] &&
        String(row["LOCATARIO"]).trim() !== ""
      ) {
        locatarios.push(String(row["LOCATARIO"]));
      } else {
        locatarios.push("-");
      }
    });

    // Función para procesar en lotes con control de concurrencia optimizado
    const procesarEnLotes = async (
      cuentas,
      ciudadesArray,
      funcionConsulta,
      filaIndice,
      batchSize = 5,
      baseDelay = 500
    ) => {
      const resultados = new Array(cuentas.length).fill("-");
      let procesados = 0;
      let errores = 0;
      let consecutiveErrors = 0;

      for (let i = 0; i < cuentas.length; i += batchSize) {
        const lote = [];
        const indices = [];

        // Preparar lote de máximo batchSize elementos
        for (let j = i; j < Math.min(i + batchSize, cuentas.length); j++) {
          // Solo procesar si la cuenta no es vacía ni guion
          if (ciudadesArray[j] === "ST" && cuentas[j] && cuentas[j] !== "-") {
            lote.push(
              funcionConsulta(cuentas[j], filaIndice)
                .then((resultado) => ({ exito: true, resultado }))
                .catch((error) => ({ exito: false, error: error.message }))
            );
            indices.push(j);
          } else {
            // Si la cuenta es vacía o guion, dejar el resultado como "-"
            resultados[j] = "-";
          }
        }

        if (lote.length > 0) {
          try {
            const resultadosLote = await Promise.all(lote);
            let erroresEnLote = 0;

            resultadosLote.forEach((resultado, idx) => {
              if (resultado.exito) {
                resultados[indices[idx]] = resultado.resultado;
                procesados++;
              } else {
                resultados[indices[idx]] = "Error al obtener monto";
                errores++;
                erroresEnLote++;
                console.error(
                  `Error en cuenta ${cuentas[indices[idx]]}: ${resultado.error}`
                );
              }
            });

            // Ajuste dinámico del delay basado en errores
            if (erroresEnLote > lote.length * 0.5) {
              consecutiveErrors++;
            } else {
              consecutiveErrors = 0;
            }

            // Delay entre lotes con backoff adaptativo
            if (i + batchSize < cuentas.length) {
              const adaptiveDelay = baseDelay + consecutiveErrors * 300;
              await new Promise((resolve) =>
                setTimeout(resolve, adaptiveDelay)
              );
            }
          } catch (error) {
            console.error(
              `Error crítico procesando lote ${i}-${i + batchSize}:`,
              error
            );
            consecutiveErrors++;
            // Llenar con errores los índices del lote fallido
            indices.forEach((idx) => {
              resultados[idx] = "Error al obtener monto";
              errores++;
            });
          }
        }
      }

      return resultados;
    };

    // Procesar agua primero con configuración optimizada
    const montosAgua = await procesarEnLotes(
      cuentasAgua,
      ciudades,
      obtenerMontoAgua,
      filaIndice,
      5,
      500
    );

    // Delay reducido entre tipos de consulta
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Procesar tasas después con configuración optimizada
    const montosTasas = await procesarEnLotes(
      cuentasTasas,
      ciudades,
      obtenerMontoTasas,
      filaIndice,
      5,
      500
    );

    // Eliminar archivo después de procesarlo
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error eliminando el archivo:", err);
    }

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
      periodo,
      mesSeleccionado,
      periodoTexto,
    });
  } catch (error) {
    console.error(error);

    // Eliminar archivo también en caso de error
    try {
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkError) {
      console.error("Error eliminando archivo después del error:", unlinkError);
    }

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

// Nueva función para exportar los resultados procesados a Excel
export const descargarResultados = (req, res) => {
  // Los datos deben ser enviados por el cliente (POST) o almacenados en sesión
  // Aquí se asume que los datos llegan por POST (body)
  const {
    direcciones = [],
    ciudades = [],
    cuentasAgua = [],
    cuentasTasas = [],
    montosAgua = [],
    montosTasas = [],
    locatarios = [],
  } = req.body;

  // Determinar si hay columna locatario y dirección
  const esValorInformativo = (v) =>
    typeof v === "string" && v.trim() !== "" && v.trim() !== "-";

  const mostrarLocatario =
    Array.isArray(locatarios) && locatarios.some((l) => esValorInformativo(l));
  const mostrarDireccion =
    Array.isArray(direcciones) &&
    direcciones.some((d) => esValorInformativo(d));

  // Encabezados dinámicos
  const columnas = [];
  if (mostrarDireccion) columnas.push("DIRECCION INMUEBLE");
  if (mostrarLocatario) columnas.push("LOCATARIO");
  columnas.push(
    "CIUDAD",
    "CUENTA AGUA",
    "MONTO AGUA",
    "CUENTA TASA",
    "MONTO TASAS"
  );

  // Construir filas
  const filas = [columnas];
  const total = Math.max(
    direcciones.length,
    ciudades.length,
    cuentasAgua.length,
    cuentasTasas.length,
    montosAgua.length,
    montosTasas.length,
    locatarios.length
  );
  for (let i = 0; i < total; i++) {
    const fila = [];
    if (mostrarDireccion) fila.push(direcciones[i] || "");
    if (mostrarLocatario) fila.push(locatarios[i] || "");
    fila.push(
      ciudades[i] || "",
      cuentasAgua[i] || "",
      montosAgua[i] || "",
      cuentasTasas[i] || "",
      montosTasas[i] || ""
    );
    filas.push(fila);
  }

  // Crear libro y hoja
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(filas);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Resultados");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=resultados_tasas.xlsx"
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
};
