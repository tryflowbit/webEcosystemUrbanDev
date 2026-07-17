/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Save, UserPlus, FileEdit } from "lucide-react";
import { Cliente } from "../types.js";

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Cliente>) => Promise<void>;
  clienteParaEditar?: Cliente | null;
}

export default function OwnerFormModal({
  isOpen,
  onClose,
  onSave,
  clienteParaEditar
}: OwnerFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [plan, setPlan] = useState("100% 220 cuotas");
  const [valorCuotaUsd, setValorCuotaUsd] = useState("250");
  const [totalCuotas, setTotalCuotas] = useState("220");
  const [manzana, setManzana] = useState("A");
  const [lote, setLote] = useState("01");
  const [diaCobro, setDiaCobro] = useState("10");
  const [fechaPrimerPago, setFechaPrimerPago] = useState("10/01/2025");
  const [loading, setLoading] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    if (clienteParaEditar) {
      setNombre(clienteParaEditar.nombre);
      setApellido(clienteParaEditar.apellido);
      setDni(clienteParaEditar.dni);
      setPlan(clienteParaEditar.plan);
      setValorCuotaUsd(clienteParaEditar.valor_cuota_usd.toString());
      setTotalCuotas(clienteParaEditar.total_cuotas.toString());
      setManzana(clienteParaEditar.manzana);
      setLote(clienteParaEditar.lote);
      setDiaCobro(clienteParaEditar.dia_cobro);
      setFechaPrimerPago(clienteParaEditar.fecha_primer_pago);
    } else {
      // Valores por defecto
      setNombre("");
      setApellido("");
      setDni("");
      setPlan("100% 220 cuotas");
      setValorCuotaUsd("250");
      setTotalCuotas("220");
      setManzana("A");
      setLote("01");
      setDiaCobro("10");
      setFechaPrimerPago("10/01/2025");
    }
    setErrorLocal("");
  }, [clienteParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorLocal("");

    // Validar fecha primer pago
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(fechaPrimerPago)) {
      setErrorLocal("La fecha del primer pago debe tener el formato DD/MM/YYYY (ej: 10/01/2025)");
      setLoading(false);
      return;
    }

    try {
      await onSave({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        plan: plan.trim(),
        valor_cuota_usd: parseFloat(valorCuotaUsd),
        total_cuotas: parseInt(totalCuotas, 10),
        manzana: manzana.trim().toUpperCase(),
        lote: lote.trim().padStart(2, "0"),
        dia_cobro: diaCobro.trim() || "10",
        fecha_primer_pago: fechaPrimerPago.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorLocal(err.message || "No se pudo guardar la información del propietario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            {clienteParaEditar ? (
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg">
                <FileEdit className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 bg-sky-50 dark:bg-sky-500/10 text-sky-500 rounded-lg">
                <UserPlus className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-display">
                {clienteParaEditar ? "Modificar Datos del Propietario" : "Registrar Nuevo Propietario"}
              </h3>
              <p className="text-[10px] text-gray-400">
                {clienteParaEditar ? `Modificando registro único ID ${clienteParaEditar.id}` : "Cree una cuenta comercial y de contacto para el propietario."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo / Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorLocal && (
            <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
              {errorLocal}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                Nombre(s)
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Alberto"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                Apellido(s)
              </label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
              />
            </div>

            {/* DNI */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                Número de DNI
              </label>
              <input
                type="text"
                required
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej. 32456789"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
              />
            </div>

            {/* Plan Comercial */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                Esquema Comercial (Plan)
              </label>
              <input
                type="text"
                required
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Ej. 100% 220 cuotas"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800/80 pt-5">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-display">
              Ubicación del Lote
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Manzana */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Mza.
                </label>
                <select
                  value={manzana}
                  onChange={(e) => setManzana(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                >
                  <option value="A">Manzana A</option>
                  <option value="B">Manzana B</option>
                  <option value="C">Manzana C</option>
                  <option value="D">Manzana D</option>
                  <option value="E">Manzana E</option>
                </select>
              </div>

              {/* Lote */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Lote Nº
                </label>
                <input
                  type="text"
                  required
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  placeholder="01"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                />
              </div>

              {/* Día Vencimiento Cobro */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Día de Venta/Cobro
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  required
                  value={diaCobro}
                  onChange={(e) => setDiaCobro(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                />
              </div>

              {/* Fecha de Lanzamiento / Primer Pago */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Fin de Gracia Inicial
                </label>
                <input
                  type="text"
                  required
                  value={fechaPrimerPago}
                  onChange={(e) => setFechaPrimerPago(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800/80 pt-5">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 font-display">
              Configuración de las Cuotas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Valor Cuota USD */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Monto Mensual Base (USD)
                </label>
                <input
                  type="number"
                  required
                  value={valorCuotaUsd}
                  onChange={(e) => setValorCuotaUsd(e.target.value)}
                  placeholder="250"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                />
              </div>

              {/* Total Cuotas */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  Plazo Total (Cuotas)
                </label>
                <input
                  type="number"
                  required
                  value={totalCuotas}
                  onChange={(e) => setTotalCuotas(e.target.value)}
                  placeholder="220"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer del Formulario */}
          <div className="border-t border-gray-100 dark:border-slate-800/80 pt-5 flex justify-end gap-3 bg-gray-50 dark:bg-slate-950/20 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{clienteParaEditar ? "Guardar Modificaciones" : "Registrar Propietario"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
