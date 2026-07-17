/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Briefcase,
  AlertOctagon,
  CreditCard,
  History,
  CheckCircle,
  HelpCircle,
  Info,
  DollarSign,
  TrendingDown,
  LogOut
} from "lucide-react";
import { Cliente, Pago, Proyecto, RecargoResult } from "../types.js";
import { calcularMoraDeCuota, getDiasDelMes } from "../lib/calculoMora.js";
import { motion, AnimatePresence } from "motion/react";

interface ClientDetailProps {
  cliente: Cliente;
  proyecto: Proyecto;
  onBack: () => void;
  onRegistrarPago: (cuotas: number, totalUsd: number) => Promise<void>;
  isOwnerMode?: boolean;
  onUpdateCredentials?: (clienteId: number, email: string, contrasena: string) => Promise<void>;
}

export default function ClientDetail({
  cliente,
  proyecto,
  onBack,
  onRegistrarPago,
  isOwnerMode = false,
  onUpdateCredentials
}: ClientDetailProps) {
  const [cuotasAPagar, setCuotasAPagar] = useState<number>(1);
  const [registroLoading, setRegistroLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  // Credenciales Propias (Editar para Propietario)
  const [newEmail, setNewEmail] = useState(cliente.email || "");
  const [newPass, setNewPass] = useState(cliente.contrasena || "");
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState(false);
  const [credsError, setCredsError] = useState("");

  // Sincronizar credenciales si el lote cambia
  useEffect(() => {
    setNewEmail(cliente.email || "");
    setNewPass(cliente.contrasena || "");
    setCredsSuccess(false);
    setCredsError("");
  }, [cliente]);

  const handleUpdateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setCredsError("El correo electrónico no puede estar vacío.");
      return;
    }
    if (!newPass.trim()) {
      setCredsError("La contraseña no puede estar vacía.");
      return;
    }
    setSavingCreds(true);
    setCredsSuccess(false);
    setCredsError("");
    try {
      if (onUpdateCredentials) {
        await onUpdateCredentials(cliente.id, newEmail.trim(), newPass.trim());
        setCredsSuccess(true);
        setTimeout(() => setCredsSuccess(false), 5000);
      }
    } catch (err: any) {
      setCredsError(err.message || "Error al actualizar.");
    } finally {
      setSavingCreds(false);
    }
  };

  // Planificación de simulación cambiaria local
  const [valorTotalUsd, setValorTotalUsd] = useState(0);
  const [valorTotalArs, setValorTotalArs] = useState(0);
  const [recargosSimulados, setRecargosSimulados] = useState<RecargoResult[]>([]);
  const [mensajeSimulado, setMensajeSimulado] = useState("");

  const dolarBlue = proyecto.valor_dolar_blue;



  // Recalcular simulación siempre que cambie la cantidad de cuotas o el valor base o el dólar
  useEffect(() => {
    let sumUsd = 0;
    const items: RecargoResult[] = [];
    const startCuota = cliente.cuotas_pagas + 1;

    for (let i = 0; i < cuotasAPagar; i++) {
      const numCuota = startCuota + i;
      if (numCuota > cliente.total_cuotas) break;

      const infoMora = calcularMoraDeCuota(
        cliente.valor_cuota_usd,
        cliente.dia_cobro,
        cliente.fecha_primer_pago,
        numCuota
      );

      const valorSurchargedUsd = cliente.valor_cuota_usd * (1 + infoMora.recargoPorcentaje / 100);
      sumUsd += valorSurchargedUsd;

      items.push({
        cuota: numCuota,
        mes: infoMora.mes,
        anio: infoMora.anio,
        recargoPorcentaje: infoMora.recargoPorcentaje,
        mensaje: infoMora.mensaje,
        valorOriginalUsd: cliente.valor_cuota_usd,
        valorSurchargedUsd: parseFloat(valorSurchargedUsd.toFixed(2)),
        diasRetraso: infoMora.diasRetraso
      });
    }

    setValorTotalUsd(parseFloat(sumUsd.toFixed(2)));
    setValorTotalArs(parseFloat((sumUsd * dolarBlue).toFixed(2)));
    setRecargosSimulados(items);
    setMensajeSimulado(items.map((it) => it.mensaje).join("\n"));
  }, [cuotasAPagar, cliente, dolarBlue]);

  // Handler para asentar cobro en el backend
  const handlePagarClick = async () => {
    const confirmMsg = isOwnerMode
      ? `¿Confirma que desea registrar el pago simulado de ${cuotasAPagar} cuota(s)?\n\n` +
        `Monto Total: USD $${valorTotalUsd.toFixed(2)} (equivalente a ARS $${valorTotalArs.toLocaleString("es-AR")} calculado a cotización $${dolarBlue}). esto actualizará su estado de cuenta en tiempo real.`
      : `¿Desea registrar el cobro de ${cuotasAPagar} cuota(s) para ${cliente.nombre} ${cliente.apellido}?\n\n` +
        `Monto Total: USD $${valorTotalUsd.toFixed(2)} (equivalente a ARS $${valorTotalArs.toLocaleString("es-AR")} calculado a $${dolarBlue}).`;

    if (window.confirm(confirmMsg)) {
      setRegistroLoading(true);
      try {
        await onRegistrarPago(cuotasAPagar, valorTotalUsd);
        setCuotasAPagar(1); // Reset select
      } catch (err: any) {
        alert("Sucedió un error al asentar el pago: " + err.message);
      } finally {
        setRegistroLoading(false);
      }
    }
  };

  // Nombres de los meses comerciales para el historial
  const obtenerNombreMesCuota = (cuotaNum: number): string => {
    try {
      const parts = cliente.fecha_primer_pago.split("/");
      const startMonth = parseInt(parts[1], 10);
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const index = (startMonth - 1 + cuotaNum - 1) % 12;
      return meses[index];
    } catch {
      return "Mes Comercial";
    }
  };

  // Soportar paginación del historial
  const totalPaginas = Math.ceil((cliente.pagos?.length || 0) / registrosPorPagina) || 1;
  const pagosPaginados =
    cliente.pagos
      ?.slice()
      .reverse()
      .slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina) || [];



  return (
    <div className="space-y-8 font-sans">
      
      {/* Back link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer group font-mono"
        >
          {isOwnerMode ? (
            <>
              <LogOut className="w-4 h-4 text-red-500 scale-x-[-1]" />
              <span className="text-red-650 dark:text-red-400">Cerrar Sesión (Panel Propietario)</span>
            </>
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Volver a la Nómina</span>
            </>
          )}
        </button>

        <span className="text-[10px] text-slate-400 font-mono">
          {isOwnerMode ? "PORTAL AUTO-GESTIÓN" : "FINCAS DIGITAL DESK v5"}
        </span>
      </div>

      {/* Alertas Críticas (Caducados) */}
      {cliente.estado_pago === "Caducado" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-red-105 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl flex items-start gap-3.5"
        >
          <div className="p-2.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 font-display uppercase tracking-wider">
              Contrato sujeto a rescisión (Mora límite excedida)
            </h4>
            <p className="text-xs text-red-700/80 dark:text-red-400/85 leading-relaxed">
              El titular acumula <strong className="font-bold text-red-800 dark:text-red-300">{cliente.meses_atraso} meses de atraso</strong> en sus cuotas de la parcela. Según las cláusulas de adhesión del contrato, superar los 6 meses de mora consecutiva habilita de pleno derecho al operador a proceder con la rescisión e inventariado inmediato de la parcela.
            </p>
          </div>
        </motion.div>
      )}

      {/* Master Grid: Detalle + Caja de Cobranza */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Ficha y Plano del Lote (2/3) */}
        <div className={`${isOwnerMode ? "lg:col-span-3" : "lg:col-span-2"} space-y-8`}>
          
          {/* Ficha del Propietario */}
          <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.05),transparent_60%)] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-[0.2em] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  Datos del Propietario • ID {cliente.id}
                </span>
                
                <h2 className="text-3xl text-slate-900 dark:text-white leading-tight font-serif tracking-wide uppercase font-normal">
                  {cliente.apellido}, {cliente.nombre}
                </h2>
                
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">DNI Nacional: {cliente.dni}</p>
              </div>

              <div>
                <span
                  className={`inline-block px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border
                    ${
                      cliente.estado_pago === "Al Día"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10"
                        : cliente.estado_pago === "Caducado"
                        ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/5 dark:text-red-400 dark:border-red-500/10 animate-pulse"
                        : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10"
                    }`}
                >
                  {cliente.estado_pago === "Al Día"
                    ? "Al Día"
                    : cliente.estado_pago === "Caducado"
                    ? "Mora Crítica (Caducado)"
                    : `Mora Moderada (${cliente.meses_atraso} Meses)`}
                </span>
              </div>
            </div>

            {/* Datos de Financiación */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Ubicación Parcela
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mza {cliente.manzana} - Lote {cliente.lote}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Plan Comercial
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 truncate" title={cliente.plan}>
                  {cliente.plan}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Progreso de Cuotas
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                  {cliente.cuotas_pagas} <span className="text-slate-400 font-normal">/</span> {cliente.total_cuotas} cuotas
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Valor Cuota Base
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                  ${cliente.valor_cuota_usd.toLocaleString("es-AR")} USD
                </p>
              </div>

            </div>

            {/* Condiciones de Cobro */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span>
                  Fecha de suscripción: <strong className="font-semibold text-slate-700 dark:text-slate-200">{cliente.fecha_primer_pago}</strong>.
                </span>
              </div>
              <div>
                Día de cobro acordado: <strong className="font-semibold text-slate-700 dark:text-slate-200">{cliente.dia_cobro} de cada mes</strong> (Vencimiento con recargos el día {parseInt(cliente.dia_cobro, 10) + 9}).
              </div>
            </div>

          </div>

          {/* Próximos Vencimientos y Plan de Financiación */}
          <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.03),transparent_60%)] pointer-events-none" />
            
            <div className="flex items-center gap-2 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6 font-sans">
              <Calendar className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono leading-none">
                Próxima Cuota a Pagar
              </h3>
            </div>

            {cliente.cuotas_pagas >= cliente.total_cuotas ? (
              <div className="text-center py-6">
                <span className="text-xs text-slate-400">Su plan comercial se encuentra 100% completado. No posee vencimientos futuros.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  Detalle de las cuotas adeudadas y el próximo vencimiento mensual programado para su lote.
                </p>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
                        <th className="p-3">Nº Cuota</th>
                        <th className="p-3">Período</th>
                        <th className="p-3">Vencimiento Máximo (Gracia)</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Recargo (Mora)</th>
                        <th className="p-3 text-right">Monto Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                      {(() => {
                        const listItems = [];
                        let foundNextNormal = false;
                        const baseCuota = cliente.cuotas_pagas + 1;
                        
                        for (let q = baseCuota; q <= cliente.total_cuotas; q++) {
                          const infoMora = calcularMoraDeCuota(
                            cliente.valor_cuota_usd,
                            cliente.dia_cobro,
                            cliente.fecha_primer_pago,
                            q,
                            new Date()
                          );
                          
                          const mesNombre = obtenerNombreMesCuota(q);
                          const diaCobroNum = parseInt(cliente.dia_cobro || "10", 10);
                          const diaLimiteNum = diaCobroNum + 9;
                          
                          if (infoMora.diasRetraso > 0) {
                            // Cuota adeudada (en mora)
                            listItems.push({
                              num: q,
                              periodo: `${mesNombre} ${infoMora.anio}`,
                              vencimiento: `Hasta el ${diaLimiteNum}/${infoMora.mes.toString().padStart(2, '0')}/${infoMora.anio}`,
                              recargo: `${infoMora.recargoPorcentaje}% (${infoMora.diasRetraso} d)`,
                              monto: cliente.valor_cuota_usd + (cliente.valor_cuota_usd * infoMora.recargoPorcentaje / 100),
                              estado: "Adeudada",
                              badgeColor: "bg-red-55 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20"
                            });
                          } else {
                            // Cuota a vencer normalmente
                            if (!foundNextNormal) {
                              listItems.push({
                                num: q,
                                periodo: `${mesNombre} ${infoMora.anio}`,
                                vencimiento: `Hasta el ${diaLimiteNum}/${infoMora.mes.toString().padStart(2, '0')}/${infoMora.anio}`,
                                recargo: "Sin Recargo",
                                monto: cliente.valor_cuota_usd,
                                estado: "Próxima a vencer",
                                badgeColor: "bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30"
                              });
                              foundNextNormal = true;
                            }
                          }
                        }

                        if (listItems.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400 dark:text-slate-500">
                                No cuenta con cuotas pendientes o próximas a vencer.
                              </td>
                            </tr>
                          );
                        }

                        return listItems.map((item) => (
                          <tr key={item.num} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-800 dark:text-white font-mono">Cuota {item.num}</td>
                            <td className="p-3 font-medium text-slate-600 dark:text-slate-350">{item.periodo}</td>
                            <td className="p-3 font-mono text-slate-450">{item.vencimiento}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono tracking-wider uppercase border ${item.badgeColor}`}>
                                {item.estado}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500 font-medium">{item.recargo}</td>
                            <td className="p-3 text-right font-semibold text-[#1C1A17] dark:text-[#E6E1DA] font-mono">
                              ${item.monto.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} USD
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha: Caja de Cobranza (1/3) */}
        {!isOwnerMode && (
          <div className="space-y-8">
            
            {/* Caja de Cobranza tradicional para Administradores de Urbanizaciones */}
            <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-xs transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(24,119,242,0.04),transparent_60%)] pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-sans">
                  <CreditCard className="w-5 h-5 text-[#C5A880]" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Caja de Cobranzas
                  </h3>
                </div>
                
                <p className="text-xs text-slate-400 dark:text-slate-505 leading-relaxed font-sans">
                  Asiente cobros manuales. El recargo moratorio es calculado de forma diaria después del período de prórroga automática.
                </p>

                {/* Selector de cuotas a liquidar */}
                <div className="space-y-2 font-sans">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Cuotas a Cobrar
                  </label>
                  
                  <select
                    value={cuotasAPagar}
                    onChange={(e) => setCuotasAPagar(parseInt(e.target.value, 10))}
                    disabled={cliente.cuotas_pagas >= cliente.total_cuotas}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold font-mono focus:outline-none dark:text-white transition-all cursor-pointer text-slate-900"
                  >
                    {Array.from(
                      { length: Math.min(9, cliente.total_cuotas - cliente.cuotas_pagas) },
                      (_, i) => i + 1
                    ).map((val) => (
                      <option key={val} value={val}>
                        PAGAR {val} {val === 1 ? "CUOTA" : "CUOTAS JUNTAS"}
                      </option>
                    ))}
                    {cliente.cuotas_pagas >= cliente.total_cuotas && (
                      <option value="0">Plan Comercial Completado</option>
                    )}
                  </select>
                  
                  <p className="text-[10px] text-slate-400 font-mono">
                    Siguiente cuota a liquidar: <strong>Nº {cliente.cuotas_pagas + 1}</strong>
                  </p>
                </div>

                {/* Desglose de Recargos Diarios */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 max-h-52 overflow-y-auto divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block pb-1 font-mono">
                    Desglose e Intereses
                  </span>
                  
                  {recargosSimulados.map((it) => (
                    <div key={it.cuota} className="text-xs pt-2 first:pt-0 space-y-1 font-sans">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 font-mono">
                        <span>Cuota Nº {it.cuota} ({obtenerNombreMesCuota(it.cuota)})</span>
                        <span className="text-brand-600 dark:text-brand-500">${it.valorSurchargedUsd.toFixed(2)} USD</span>
                      </div>
                      <p className="text-[10px] leading-relaxed">
                        {it.recargoPorcentaje > 0 ? (
                          <span className="text-amber-600 dark:text-amber-500 font-bold font-mono">
                            Mora del {it.recargoPorcentaje}% ({it.diasRetraso} días de retraso)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Prórroga activa sin recargos</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Conversion a Pesos (Ticker style) */}
                <div className="bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl space-y-2 font-sans">
                  <div className="flex justify-between items-baseline text-xs text-slate-400 dark:text-slate-500">
                    <span>Suma Total USD:</span>
                    <span className="font-mono text-slate-800 dark:text-white font-bold">
                      ${valorTotalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-baseline text-xs text-slate-400 dark:text-slate-500">
                    <span>Tasa Blue Oficial:</span>
                    <span className="font-mono text-slate-800 dark:text-white font-bold">
                      ${proyecto.valor_dolar_blue.toFixed(2)} ARS
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Total Pesos:</span>
                    <span className="text-xl font-extrabold text-[#1C1A17] dark:text-brand-500 tracking-tight">
                      ${valorTotalArs.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ARS
                    </span>
                  </div>
                </div>

                {/* Trigger */}
                {cliente.cuotas_pagas >= cliente.total_cuotas ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 rounded-xl text-center">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 uppercase tracking-wider font-mono font-sans animate-none">
                      <CheckCircle className="w-4 h-4" /> Plan Completado
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handlePagarClick}
                    disabled={registroLoading}
                    className="w-full relative overflow-hidden bg-[#1C1A17] dark:bg-[#EAE6DF] hover:bg-[#2C2924] dark:hover:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#1C1A17] font-extrabold py-3.5 rounded-xl shadow-md cursor-pointer disabled:opacity-50 text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-98 transition-all font-mono h-12"
                  >
                    {registroLoading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Registrar Cobranza</span>
                      </>
                    )}
                  </button>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Historial de Cobranzas indexadas (Libro de Caja) */}
      <div className="bg-white dark:bg-[#121212]/75 border border-[#E6DFD5] dark:border-white/10 rounded-3xl p-6 transition-colors duration-300">
        <div className="flex items-center gap-2 pb-5 border-b border-slate-200 dark:border-slate-800 mb-6">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono leading-none">
            Historial de Pagos Registrados
          </h3>
        </div>

        {cliente.pagos?.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-805 rounded-2xl">
            <span className="text-xs text-slate-400">Ninguna carga de pago registrada para este lote todavía.</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
                    <th className="p-4">Fecha Pago</th>
                    <th className="p-4">Cuota</th>
                    <th className="p-4">Mes</th>
                    <th className="p-4 text-slate-700 dark:text-slate-300">Monto USD</th>
                    <th className="p-4">Cotización del Dólar</th>
                    <th className="p-4 text-[#C5A880]">Pago en Pesos (ARS)</th>
                    <th className="p-4 text-right font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {pagosPaginados.map((pago) => (
                    <tr key={pago.cuota} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 font-mono text-slate-400">{pago.fecha}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-white">Cuota Nº {pago.cuota}</td>
                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{obtenerNombreMesCuota(pago.cuota)}</td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        ${pago.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-slate-450">${pago.dolar_blue.toFixed(2)}</td>
                      <td className="p-4 font-mono text-[#1C1A17] dark:text-[#E6E1DA] font-bold">
                        ${pago.monto_ars.toLocaleString("es-AR", { minimumFractionDigits: 2 })} ARS
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-500/20 text-[9px] font-bold rounded-lg uppercase tracking-wider font-mono">
                          <CheckCircle className="w-3 h-3" /> {pago.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {cliente.pagos && cliente.pagos.length > registrosPorPagina && (
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl gap-3 text-xs">
                <span className="text-slate-500 font-medium font-sans">
                  Resultados del <strong className="text-slate-800 dark:text-slate-200">{(paginaActual - 1) * registrosPorPagina + 1}</strong> al{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {Math.min(paginaActual * registrosPorPagina, cliente.pagos.length)}
                  </strong>{" "}
                  de <strong className="text-slate-800 dark:text-slate-200">{cliente.pagos.length}</strong> asientos conciliados.
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                    disabled={paginaActual === 1}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer font-bold uppercase text-[10px] tracking-wider font-mono"
                  >
                    Retroceder
                  </button>
                  <span className="text-slate-400 font-mono">
                    {paginaActual} / {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer font-bold uppercase text-[10px] tracking-wider font-mono"
                  >
                    Avanzar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
