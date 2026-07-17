/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Building2, MapPin, ArrowRight, LogOut } from "lucide-react";
import { motion } from "motion/react";

interface ProjectSelectionProps {
  onSelectProject: (id: string) => void;
  onLogout: () => void;
}

export default function ProjectSelection({ onSelectProject, onLogout }: ProjectSelectionProps) {
  const proyectos = [
    {
      id: "fincas_altos_del_plata",
      nombre: "Fincas Altos del Plata",
      lotes: 820,
      ubicacion: "Buenos Aires",
      estado: "Fase Operativa",
      descripcion: "Desarrollo de montaña premium con infraestructura completa de servicios subterráneos, caminos integrados y club house con cava propia.",
      activo: true,
      imagen: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fincas_del_lago",
      nombre: "Fincas del Lago",
      lotes: 450,
      ubicacion: "Córdoba",
      estado: "En Lanzamiento",
      descripcion: "Desarrollo premium con laguna artificial templada de 3 hectáreas, lotes náuticos de alto perfil y muelle de embarcaciones propio.",
      activo: false,
      imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "fincas_del_valle",
      nombre: "Fincas del Valle",
      lotes: 600,
      ubicacion: "Mendoza",
      estado: "En Planificación",
      descripcion: "Macrolotes residenciales de montaña con viñedos integrados, bodega boutique de autor y caballerizas comunes.",
      activo: false,
      imagen: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <div className="min-h-screen relative py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] text-[#1C1A17] dark:bg-[#070707] dark:text-[#E6E2DC] transition-colors duration-500 overflow-hidden">
      
      {/* Precision Blueprint Lines background */}
      <div className="absolute inset-0 bg-dot-matrix bg-grid-graph pointer-events-none opacity-90" />
      
      <div className="max-w-6xl mx-auto relative z-10 space-y-16">
        
        {/* Luxe Editorial Headers (Mixed Sans and Serif Italic) */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            className="inline-block text-[10px] font-bold text-[#C5A880] uppercase font-mono"
          >
            SAAS MULTIDISTRITO • DESARROLLOS
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="text-3xl sm:text-4xl lg:text-5xl text-[#1C1A17] dark:text-white leading-tight uppercase font-light font-display tracking-[0.12em]"
          >
            Seleccionar <span className="text-[#C5A880] font-normal">—</span> Desarrollo
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-[#6B6458] dark:text-[#A59E92] max-w-md mx-auto leading-relaxed font-sans font-light"
          >
            Seleccione el barrio para ver el estado de los lotes, consultar pagos y registrar cobros de manera simple.
          </motion.p>
        </div>

        {/* Gray/Beige Bento Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {proyectos.map((proyecto, idx) => (
            <motion.div
              key={proyecto.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + idx * 0.08, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
              onClick={() => {
                if (proyecto.activo) {
                  onSelectProject(proyecto.id);
                } else {
                  alert(
                    `El desarrollo "${proyecto.nombre}" está en etapa de preventa y estructuración inicial. Para esta demo interactiva, ingrese a Fincas Altos del Plata.`
                  );
                }
              }}
              className={`bg-white dark:bg-[#121212]/70 border ${
                proyecto.activo
                  ? "border-[#E6DFD5] dark:border-white/10 hover:border-[#C5A880] hover:-translate-y-1 cursor-pointer"
                  : "border-[#E6DFD5]/40 dark:border-white/5 opacity-55 cursor-not-allowed"
              } rounded-2xl overflow-hidden transition-all duration-500 flex flex-col h-full group relative`}
            >
              
              {/* Grayscale Architectural Thumbnail */}
              <div className="h-48 relative overflow-hidden bg-slate-900">
                <img
                  src={proyecto.imagen}
                  alt={proyecto.nombre}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale brightness-[0.80] group-hover:scale-105 group-hover:grayscale-50 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                
                {/* Location pill */}
                <div className="absolute top-4 left-4">
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase bg-black/75 text-[#FAF8F5] px-2.5 py-1 rounded-md border border-white/10 font-mono">
                    {proyecto.ubicacion}
                  </span>
                </div>

                {/* Status indicator */}
                <div className="absolute top-4 right-4 bg-black/75 p-1 px-2.5 rounded-full border border-white/5 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      proyecto.activo ? "bg-[#C5A880] animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-[8.5px] font-bold text-white uppercase font-mono leading-none tracking-wider">
                    {proyecto.activo ? "Activo" : "Estructuración"}
                  </span>
                </div>
              </div>

              {/* Developer Metadata and Title */}
              <div className="p-7 flex-1 flex flex-col justify-between space-y-6 relative z-10">
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A880] font-bold block font-mono">
                    {proyecto.estado.toUpperCase()}
                  </span>
                  
                  {/* Clean elegant serif uppercase font for property names */}
                  <h3 className="text-lg font-display tracking-[0.08em] uppercase text-[#1C1A17] dark:text-white group-hover:text-[#C5A880] transition-colors leading-snug">
                    {proyecto.nombre}
                  </h3>
                  
                  <p className="text-xs text-[#6B6458] dark:text-[#A59E92] leading-relaxed line-clamp-3 font-sans font-light">
                    {proyecto.descripcion}
                  </p>
                </div>

                {/* Technical stats bar */}
                <div className="pt-5 border-t border-[#E6DFD5]/40 dark:border-white/10 flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-1.5 text-[#6B6458] dark:text-[#A59E92] font-mono">
                    <Building2 className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>
                      <strong className="text-[#1C1A17] dark:text-[#E6E1DA] font-semibold">{proyecto.lotes}</strong> LOTES
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#1C1A17] dark:text-[#C5A880] font-bold font-mono tracking-wider group-hover:translate-x-1.5 transition-transform uppercase text-[9.5px]">
                    <span>{proyecto.activo ? "Entrar" : "Pendiente"}</span>
                    <ArrowRight className="w-3 h-3 text-[#C5A880]" />
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Minimalist Bottom Row */}
        <div className="pt-10 border-t border-[#E6DFD5]/50 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9.5px] font-mono tracking-[0.2em] uppercase text-[#6B6458]/70 dark:text-[#A59E92]/60">
          <span>SISTEMA DE GESTIÓN DE BARRIOS</span>
          
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#C5A880]" />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>

      </div>
    </div>
  );
}
