/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { calcularMoraDeCuota, calcularMesesAtraso } from "./src/lib/calculoMora.js";
import { Cliente, Pago, Proyecto } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Configuración de rutas
const DB_PATH = path.resolve(process.cwd(), "src/data/db.json");

// Helper para leer base de datos
function leerDB(): { proyecto: Proyecto; clientes: Cliente[] } {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`Base de datos no encontrada en ${DB_PATH}`);
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error leyendo base de datos, usando estructura de respaldo.", err);
    return {
      proyecto: {
        id: "fincas_altos_del_plata",
        nombre: "Fincas Altos del Plata",
        valor_dolar_blue: 1250,
        last_blue_update: new Date().toISOString()
      },
      clientes: []
    };
  }
}

// Helper para guardar base de datos
function guardarDB(data: { proyecto: Proyecto; clientes: Cliente[] }) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error guardando base de datos:", err);
  }
}

app.use(express.json());

// Endpoint de Salud
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Obtener Información de Proyecto y Estadísticas resumidas
app.get("/api/proyecto", (req, res) => {
  const db = leerDB();
  
  // Calcular métricas
  let totalPagadoUsd = 0;
  let totalPagadoArs = 0;
  let clientesEnMora = 0;
  let clientesCaducados = 0;
  
  const enrichedClientes = db.clientes.map(c => {
    const meses = calcularMesesAtraso(c.cuotas_pagas, c.fecha_primer_pago);
    let estado: "Al Día" | "Riesgo de Mora" | "Mora Crítica" | "Caducado" = "Al Día";
    if (meses >= 6) {
      estado = "Caducado";
      clientesCaducados++;
    } else if (meses >= 1) {
      estado = "Riesgo de Mora";
      clientesEnMora++;
    }
    
    // Sumar cobros registrados
    c.pagos?.forEach(p => {
      totalPagadoUsd += p.monto;
      totalPagadoArs += p.monto_ars;
    });
    
    return {
      ...c,
      meses_atraso: meses,
      estado_pago: estado
    };
  });
  
  res.json({
    proyecto: db.proyecto,
    stats: {
      totalClientes: db.clientes.length,
      totalPagadoUsd: Math.round(totalPagadoUsd),
      totalPagadoArs: Math.round(totalPagadoArs),
      clientesEnMora,
      clientesCaducados
    }
  });
});

// Endpoint: Actualizar manualmente el valor del dólar blue
app.post("/api/proyecto/dolar", (req, res) => {
  const { valor } = req.body;
  if (!valor || typeof valor !== "number" || valor <= 0) {
    return res.status(400).json({ error: "Valor de dólar inválido." });
  }
  
  const db = leerDB();
  db.proyecto.valor_dolar_blue = valor;
  db.proyecto.last_blue_update = new Date().toISOString();
  guardarDB(db);
  
  res.json({ success: true, proyecto: db.proyecto });
});

// Endpoint: Buscar/Sincronizar el dólar blue desde dolarapi.com
app.get("/api/proyecto/dolar/fetch", async (req, res) => {
  try {
    const response = await fetch("https://dolarapi.com/v1/dolares/blue");
    if (!response.ok) {
      throw new Error("No se pudo obtener el valor desde dolarapi.com");
    }
    const info = await response.json();
    const rate = parseFloat(info.venta);
    
    if (rate && rate > 0) {
      const db = leerDB();
      db.proyecto.valor_dolar_blue = rate;
      db.proyecto.last_blue_update = new Date().toISOString();
      guardarDB(db);
      return res.json({ success: true, valor_dolar_blue: rate, source: "dolarapi.com" });
    }
    throw new Error("Tasa de dólar vacía o no válida.");
  } catch (err: any) {
    console.error("Fallo el fetch de dólar blue, usando el existente:", err.message);
    const db = leerDB();
    res.json({ success: false, valor_dolar_blue: db.proyecto.valor_dolar_blue, msg: err.message });
  }
});

// Endpoint: Obtener todos los clientes (enriquecidos con mora dinámica)
app.get("/api/clientes", (req, res) => {
  const db = leerDB();
  const today = new Date();
  
  const enriched = db.clientes.map(c => {
    const meses = calcularMesesAtraso(c.cuotas_pagas, c.fecha_primer_pago, today);
    let estado: "Al Día" | "Riesgo de Mora" | "Mora Crítica" | "Caducado" = "Al Día";
    if (meses >= 6) {
      estado = "Caducado";
    } else if (meses >= 1) {
      estado = "Riesgo de Mora";
    }
    
    return {
      ...c,
      cuota_actual: c.cuotas_pagas + 1,
      meses_atraso: meses,
      estado_pago: estado
    };
  });
  
  res.json(enriched);
});

// Endpoint: Obtener cliente individual por ID (con historial enriquecido)
app.get("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const db = leerDB();
  const clienteIndex = db.clientes.findIndex(c => c.id === parseInt(id, 10));
  
  if (clienteIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  
  const c = db.clientes[clienteIndex];
  const meses = calcularMesesAtraso(c.cuotas_pagas, c.fecha_primer_pago);
  let estado: "Al Día" | "Riesgo de Mora" | "Mora Crítica" | "Caducado" = "Al Día";
  if (meses >= 6) {
    estado = "Caducado";
  } else if (meses >= 1) {
    estado = "Riesgo de Mora";
  }
  
  res.json({
    ...c,
    cuota_actual: c.cuotas_pagas + 1,
    meses_atraso: meses,
    estado_pago: estado
  });
});

// Endpoint: Crear nuevo Cliente (owner)
app.post("/api/clientes", (req, res) => {
  const { nombre, apellido, dni, plan, valor_cuota_usd, total_cuotas, manzana, lote, dia_cobro, fecha_primer_pago } = req.body;
  
  if (!nombre || !apellido || !dni || !plan || !valor_cuota_usd || !total_cuotas || !manzana || !lote || !fecha_primer_pago) {
    return res.status(400).json({ error: "Faltan campos obligatorios para registrar el cliente." });
  }
  
  const db = leerDB();
  
  // Evitar duplicados por DNI
  const exist = db.clientes.find(c => c.dni === dni);
  if (exist) {
    return res.status(400).json({ error: `Ya existe un propietario registrado con DNI ${dni}` });
  }
  
  const nuevoId = db.clientes.length > 0 ? Math.max(...db.clientes.map(c => c.id)) + 1 : 101;
  
  const nuevoCliente: Cliente = {
    id: nuevoId,
    nombre,
    apellido,
    dni,
    plan,
    cuotas_pagas: 0,
    total_cuotas: parseInt(total_cuotas, 10),
    valor_cuota_usd: parseFloat(valor_cuota_usd),
    manzana,
    lote,
    dia_cobro: dia_cobro || "10",
    fecha_primer_pago,
    pagos: []
  };
  
  db.clientes.push(nuevoCliente);
  guardarDB(db);
  
  res.json({ success: true, cliente: nuevoCliente });
});

// Endpoint: Editar Cliente
app.put("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, plan, valor_cuota_usd, total_cuotas, manzana, lote, dia_cobro, fecha_primer_pago, cuotas_pagas, email, contrasena } = req.body;
  
  const db = leerDB();
  const cIndex = db.clientes.findIndex(c => c.id === parseInt(id, 10));
  
  if (cIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  
  const original = db.clientes[cIndex];
  
  db.clientes[cIndex] = {
    ...original,
    nombre: nombre !== undefined ? nombre : original.nombre,
    apellido: apellido !== undefined ? apellido : original.apellido,
    dni: dni !== undefined ? dni : original.dni,
    plan: plan !== undefined ? plan : original.plan,
    valor_cuota_usd: valor_cuota_usd !== undefined ? parseFloat(valor_cuota_usd) : original.valor_cuota_usd,
    total_cuotas: total_cuotas !== undefined ? parseInt(total_cuotas, 10) : original.total_cuotas,
    manzana: manzana !== undefined ? manzana : original.manzana,
    lote: lote !== undefined ? lote : original.lote,
    dia_cobro: dia_cobro !== undefined ? dia_cobro : original.dia_cobro,
    fecha_primer_pago: fecha_primer_pago !== undefined ? fecha_primer_pago : original.fecha_primer_pago,
    cuotas_pagas: cuotas_pagas !== undefined ? parseInt(cuotas_pagas, 10) : original.cuotas_pagas,
    email: email !== undefined ? email : original.email,
    contrasena: contrasena !== undefined ? contrasena : original.contrasena
  };
  
  guardarDB(db);
  res.json({ success: true, cliente: db.clientes[cIndex] });
});

// Endpoint: Eliminar Cliente
app.delete("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const db = leerDB();
  
  const originalLength = db.clientes.length;
  db.clientes = db.clientes.filter(c => c.id !== parseInt(id, 10));
  
  if (db.clientes.length === originalLength) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  
  guardarDB(db);
  res.json({ success: true });
});

// Endpoint: Simulador de Pago con Mora (Calcula montos, días e intereses)
app.post("/api/clientes/:id/calcular-pago", (req, res) => {
  const { id } = req.params;
  const { cuotas } = req.body; // Cantidad de cuotas que el usuario planea pagar (1 a 9)
  
  const db = leerDB();
  const c = db.clientes.find(cli => cli.id === parseInt(id, 10));
  
  if (!c) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  
  const totalAPagarInt = cuotas ? parseInt(cuotas, 10) : 1;
  const dolarBlue = db.proyecto.valor_dolar_blue;
  
  let valorTotalUsd = 0;
  const recargos = [];
  const startCuota = c.cuotas_pagas + 1;
  
  for (let i = 0; i < totalAPagarInt; i++) {
    const numCuota = startCuota + i;
    if (numCuota > c.total_cuotas) break; // Límite de cuotas del plan
    
    const infoMora = calcularMoraDeCuota(c.valor_cuota_usd, c.dia_cobro, c.fecha_primer_pago, numCuota);
    
    const valorSurchargedUsd = c.valor_cuota_usd * (1 + infoMora.recargoPorcentaje / 100);
    valorTotalUsd += valorSurchargedUsd;
    
    recargos.push({
      cuota: numCuota,
      mes: infoMora.mes,
      anio: infoMora.anio,
      recargoPorcentaje: infoMora.recargoPorcentaje,
      mensaje: infoMora.mensaje,
      valorOriginalUsd: c.valor_cuota_usd,
      valorSurchargedUsd: parseFloat(valorSurchargedUsd.toFixed(2)),
      diasRetraso: infoMora.diasRetraso
    });
  }
  
  const valorTotalArs = valorTotalUsd * dolarBlue;
  const mensajeCompleto = recargos.map(r => r.mensaje).join("\n");
  
  res.json({
    valorTotalUsd: parseFloat(valorTotalUsd.toFixed(2)),
    valorTotalArs: parseFloat(valorTotalArs.toFixed(2)),
    recargos,
    mensajeCompleto
  });
});

// Endpoint: Confirmar Cobro del Propietario (Registra pagos reales en la base de datos)
app.post("/api/clientes/:id/pagar", (req, res) => {
  const { id } = req.params;
  const { cuotas, recargos } = req.body; // recargos array es opcional, recalculamos del lado del servidor para máxima seguridad
  
  const db = leerDB();
  const cIndex = db.clientes.findIndex(cli => cli.id === parseInt(id, 10));
  
  if (cIndex === -1) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }
  
  const c = db.clientes[cIndex];
  const cuotasAPagar = cuotas ? parseInt(cuotas, 10) : 1;
  
  if (c.cuotas_pagas >= c.total_cuotas) {
    return res.status(400).json({ error: "El plan ya ha sido cancelado en su totalidad." });
  }
  
  if (c.cuotas_pagas + cuotasAPagar > c.total_cuotas) {
    return res.status(400).json({ error: "La cantidad de cuotas excede el límite del plan." });
  }
  
  const dollarBlue = db.proyecto.valor_dolar_blue;
  const nuevosPagos: Pago[] = [];
  const startCuota = c.cuotas_pagas + 1;
  const fechaHoy = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  for (let i = 0; i < cuotasAPagar; i++) {
    const numCuota = startCuota + i;
    
    // Calcular mora de servidor
    const infoMora = calcularMoraDeCuota(c.valor_cuota_usd, c.dia_cobro, c.fecha_primer_pago, numCuota);
    const usdFinal = c.valor_cuota_usd * (1 + infoMora.recargoPorcentaje / 100);
    const arsFinal = usdFinal * dollarBlue;
    
    const pagoObj: Pago = {
      fecha: fechaHoy,
      cuota: numCuota,
      monto: parseFloat(usdFinal.toFixed(2)),
      monto_ars: parseFloat(arsFinal.toFixed(2)),
      dolar_blue: dollarBlue,
      estado: "Pagado"
    };
    
    nuevosPagos.push(pagoObj);
  }
  
  // Agregar al historial de pagos del propietario
  c.pagos = c.pagos || [];
  c.pagos.push(...nuevosPagos);
  
  // Actualizar el número de cuotas pagas
  c.cuotas_pagas += cuotasAPagar;
  
  db.clientes[cIndex] = c;
  guardarDB(db);
  
  res.json({
    success: true,
    message: `Pago de ${cuotasAPagar} cuota(s) registrado exitosamente.`,
    cliente: {
      ...c,
      cuota_actual: c.cuotas_pagas + 1
    }
  });
});

async function run() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

run().catch(err => {
  console.error("Hubo un error al arrancar la aplicación full-stack:", err);
});
