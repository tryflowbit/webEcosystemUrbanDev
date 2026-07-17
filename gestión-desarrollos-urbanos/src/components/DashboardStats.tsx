/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DollarSign, Wallet, Users, AlertTriangle, RefreshCw, Check, ArrowUpRight, Award, ShieldAlert } from "lucide-react";
import { Proyecto } from "../types.js";
import { motion } from "motion/react";

interface DashboardStatsProps {
  proyecto: Proyecto;
  stats: {
    totalClientes: number;
    totalPagadoUsd: number;
    totalPagadoArs: number;
    clientesEnMora: number;
    clientesCaducados: number;
  };
  onUpdateDolar: (nuevoValor: number) => Promise<void>;
  onFetchDolar: () => Promise<void>;
  loadingDolar: boolean;
}

export default function DashboardStats({
  proyecto,
  stats,
  onUpdateDolar,
  onFetchDolar,
  loadingDolar
}: DashboardStatsProps) {
  const [editingDolar, setEditingDolar] = useState(false);
  const [inputDolar, setInputDolar] = useState(proyecto.valor_dolar_blue.toString());

  const handleSaveDolar = async () => {
    const val = parseFloat(inputDolar);
    if (!isNaN(val) && val > 0) {
      await onUpdateDolar(val);
      setEditingDolar(false);
    } else {
      alert("Por favor ingrese un valor de dólar válido superior a 0.");
    }
  };

  const formattedUpdateDate = proyecto.last_blue_update
    ? new Date(proyecto.last_blue_update).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "Sin registro";

  return (
    <div className="space-y-8 font-sans">
      
      {/* Ticker de Cotización de Divisas (Dólar Blue) */}
      <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
        
        <div className="space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
              Tipo de Cambio de Referencia
            </span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">API Activa</span>
          </div>

          <div className="flex items-center gap-4">
            {editingDolar ? (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-lg font-bold text-slate-400 pl-2">$</span>
                <input
                   type="number"
                   value={inputDolar}
                   onChange={(e) => setInputDolar(e.target.value)}
                   className="w-24 px-2 py-0.5 bg-transparent border-none text-sm font-bold text-slate-800 dark:text-white focus:outline-none"
                   autoFocus
                />
                <button
                  onClick={handleSaveDolar}
                  className="p-1 px-3 bg-brand-600 hover:bg-brand-700 text-[#FAF8F5] text-[10px] uppercase tracking-wider font-extrabold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={() => {
                    setInputDolar(proyecto.valor_dolar_blue.toString());
                    setEditingDolar(false);
                  }}
                  className="p-1 px-2 text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer font-bold uppercase font-mono"
                >
                  Atrás
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ${proyecto.valor_dolar_blue.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">ARS/USD</span>
                
                <button
                  onClick={() => setEditingDolar(true)}
                  className="ml-3 text-[10.5px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-500 dark:hover:text-brand-600 transition-colors uppercase tracking-wider font-mono cursor-pointer"
                >
                  [ Ajustar manual ]
                </button>
              </div>
            )}
          </div>
          
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            Sincronización cambiaria: {proyecto.last_blue_update ? new Date(proyecto.last_blue_update).toLocaleDateString("es-AR") : "---"} • {formattedUpdateDate} hs
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={onFetchDolar}
            disabled={loadingDolar}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1A17] dark:bg-[#E6DFD5] hover:bg-[#2C2924] dark:hover:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#1C1A17] text-[10px] uppercase tracking-widest font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm active:scale-98 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDolar ? "animate-spin" : ""}`} />
            <span>Consultar Cotización Online</span>
          </button>
        </div>

      </div>

      {/* Bento Grid layout de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Propietarios */}
        <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold block font-mono">
                Propietarios
              </span>
              <div className="p-1 px-2.5 bg-brand-50/60 dark:bg-brand-500/15 text-brand-750 dark:text-brand-500 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border border-brand-200 dark:border-brand-500/15">
                Padrón
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {stats.totalClientes}
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-normal">
                Carpetas activas registradas en el parcelamiento.
              </p>
            </div>
          </div>
        </div>

        {/* KPI 2: Recaudado USD */}
        <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold block font-mono">
                Total Pagado USD (Acumulado)
              </span>
              <div className="p-1 px-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/10">
                USD
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                ${stats.totalPagadoUsd.toLocaleString("es-AR")}
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-normal">
                Total de cuotas cobradas expresadas en dólares estadounidenses.
              </p>
            </div>
          </div>
        </div>

        {/* KPI 3: Pesos ARS */}
        <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold block font-mono">
                Ingresos Convertidos (ARS)
              </span>
              <div className="p-1 px-2.5 bg-brand-50/60 dark:bg-brand-500/15 text-brand-750 dark:text-brand-500 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border border-brand-200 dark:border-brand-500/15">
                Pesos
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                ${stats.totalPagadoArs.toLocaleString("es-AR")}
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-normal">
                Pesificación estimada líquida cobrada calculada al dólar comercial diario.
              </p>
            </div>
          </div>
        </div>

        {/* KPI 4: Mora Operativa */}
        <div className="bg-white dark:bg-[#121212]/75 border border-red-200 dark:border-red-900 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-300 bg-linear-to-b from-red-50/10 to-transparent dark:from-red-950/5">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase tracking-[0.2em] text-red-600 dark:text-red-400 font-bold block font-mono">
                Incidentes de Cobro
              </span>
              <div className="p-1 px-2.5 bg-red-105 dark:bg-red-500/10 text-red-650 dark:text-red-400 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border border-red-250 dark:border-red-800 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Mora</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-[#E2E8F0] flex items-baseline gap-1">
                <span>{stats.clientesEnMora + stats.clientesCaducados}</span>
                <span className="text-xs text-slate-400 font-sans">casos</span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase font-mono mt-1.5">
                <span className="text-amber-600 dark:text-amber-500 font-bold">Vencidos: {stats.clientesEnMora}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-red-600 dark:text-red-400">Críticos: {stats.clientesCaducados}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
