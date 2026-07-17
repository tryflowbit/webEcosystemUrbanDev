/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pago {
  fecha: string;
  cuota: number;
  monto: number;       // en USD
  monto_ars: number;   // en ARS
  dolar_blue: number;  // tasa utilizada
  estado: string;      // "Pagado", etc.
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  plan: string;
  cuotas_pagas: number;
  total_cuotas: number;
  valor_cuota_usd: number;
  manzana: string;
  lote: string;
  dia_cobro: string; // ej: "10"
  fecha_primer_pago: string; // "DD/MM/YYYY"
  pagos: Pago[];
  
  // Atributos de credenciales y acceso
  email?: string;
  contrasena?: string;
  
  // Atributos de cálculo dinámico
  meses_atraso?: number;
  estado_pago?: "Al Día" | "Riesgo de Mora" | "Mora Crítica" | "Caducado";
}

export interface Proyecto {
  id: string;
  nombre: string;
  valor_dolar_blue: number;
  last_blue_update?: string;
  lotes?: number;
  ubicacion?: string;
  estado?: string;
}

export interface RecargoResult {
  cuota: number;
  mes: number;
  anio: number;
  recargoPorcentaje: number;
  mensaje: string;
  valorOriginalUsd: number;
  valorSurchargedUsd: number;
  diasRetraso: number;
}

export interface CalculoRecargosResponse {
  valorTotalUsd: number;
  valorTotalArs: number;
  recargos: RecargoResult[];
  mensajeCompleto: string;
}
