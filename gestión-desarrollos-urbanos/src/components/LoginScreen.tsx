/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { KeyRound, User, Sun, Moon, LogIn, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginProps {
  onLoginSuccess: (user: { role: "admin" | "owner"; clienteId?: number; nombre: string; email?: string }) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenHelp?: () => void;
}

export default function LoginScreen({ onLoginSuccess, isDarkMode, setIsDarkMode, onOpenHelp }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [propietarios, setPropietarios] = useState<any[]>([]);

  // Cargar propietarios en segundo plano para validar accesos por DNI
  useEffect(() => {
    fetch("/api/clientes")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No se pudieron cargar propietarios");
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPropietarios(data);
        }
      })
      .catch((err) => console.error("Error cargando propietarios para login:", err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const u = username.trim();
      const p = password.trim();

      // 1. Validar accesos administrativos
      if (u === "admin" && p === "1234") {
        onLoginSuccess({ role: "admin", nombre: "Administrador" });
        setLoading(false);
        return;
      }
      if (u === "FincasADP" && p === "Zsxdc1698") {
        onLoginSuccess({ role: "admin", nombre: "Administrador Altos del Plata" });
        setLoading(false);
        return;
      }
      
      // 1b. Mock login para propietarios (propietario / 369)
      if (u.toLowerCase() === "propietario" && p === "369") {
        const perez = propietarios.find((c) => c.id === 101) || { nombre: "Juan", apellido: "Pérez", id: 101, email: "juan.perez@lote.com" };
        onLoginSuccess({
          role: "owner",
          clienteId: 101,
          nombre: `${perez.nombre} ${perez.apellido}`,
          email: perez.email || "juan.perez@lote.com"
        });
        setLoading(false);
        return;
      }

      // 2. Validar propietarios por DNI o por Email
      const cleanUserDni = u.replace(/\D/g, "");
      const matched = propietarios.find((cli) => {
        const cleanCliDni = cli.dni.replace(/\D/g, "");
        const matchDni = cleanCliDni === cleanUserDni && cleanCliDni.length > 0;
        const matchEmail = cli.email && cli.email.trim().toLowerCase() === u.toLowerCase();
        return matchDni || matchEmail;
      });

      if (matched) {
        // En propietario, la contraseña es su contrasena configurada, o por defecto su propio DNI o "1234"
        const cleanPass = p.replace(/\D/g, "");
        const cleanCliDni = matched.dni.replace(/\D/g, "");
        
        const hasCustomPass = matched.contrasena && matched.contrasena.trim() !== "";
        let isPassValid = false;
        
        if (hasCustomPass) {
          if (p === matched.contrasena) {
            isPassValid = true;
          }
        } else {
          if (cleanPass === cleanCliDni || p === matched.dni || p === "1234") {
            isPassValid = true;
          }
        }

        if (isPassValid) {
          onLoginSuccess({
            role: "owner",
            clienteId: matched.id,
            nombre: `${matched.nombre} ${matched.apellido}`,
            email: matched.email || "sin_configurar@lote.com"
          });
          setLoading(false);
          return;
        } else {
          setError(
            hasCustomPass 
              ? "Contraseña incorrecta. Utilice la contraseña que configuró." 
              : "Contraseña incorrecta. Si es propietario, use su DNI (sin puntos) como contraseña."
          );
          setLoading(false);
          return;
        }
      }

      setError("Usuario o DNI no registrado. Si es propietario, verifique haber ingresado su DNI correctamente.");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row bg-[#FAF8F5] text-[#1C1A17] dark:bg-[#070707] dark:text-[#E6E2DC] transition-colors duration-500 overflow-hidden">
      
      {/* 50% LEFT PANEL: Premium Architectural & Editorial Brand Identity (Matches reference Image 1 & 2) */}
      <div className="hidden md:flex flex-col justify-between p-16 w-1/2 relative bg-transparent border-r border-[#E6DFD5]/40 dark:border-white/5 overflow-hidden">
        
        {/* Graph / Matrix grid background for architectural vibe */}
        <div className="absolute inset-0 bg-dot-matrix bg-grid-graph pointer-events-none opacity-80" />

        {/* Top left metadata */}
        <div className="relative z-20 flex flex-col items-start font-mono text-[10px] tracking-[0.25em] text-[#C5A880] uppercase font-bold">
          <span>ESTATE SUITE V5.0</span>
        </div>

        {/* Premium elegant serif headline */}
        <div className="relative z-20 my-auto space-y-8 max-w-md">
          <div className="space-y-2">
            <h1 className="text-6xl font-normal text-[#1C1A17] dark:text-white leading-[1.12] tracking-[0.05em] font-display uppercase">
              FINCAS
            </h1>
            <h1 className="text-4xl font-light italic text-[#1C1A17] dark:text-[#E6DFD5] leading-[1.12] tracking-[0.08em] font-display uppercase pl-0.5">
              DESARROLLOS
            </h1>
          </div>
          
          <div className="h-[1px] w-20 bg-[#C5A880]/60" />
          
          <p className="text-xs text-[#6B6458] dark:text-[#A59E92] leading-relaxed max-w-sm tracking-wide">
            Solución corporativa de alta gama para la gestión territorial y control de cobros y cuotas en tiempo real.
          </p>

          <div className="pt-2">
            <button 
              type="button"
              onClick={() => {
                if (onOpenHelp) {
                  onOpenHelp();
                } else {
                  alert("Para ingresar, los propietarios usan su número de DNI como usuario y contraseña por defecto. El personal de administración utiliza sus credenciales habilitadas.");
                }
              }}
              className="px-6 py-2.5 border border-[#C5A880]/50 hover:bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all cursor-pointer inline-flex items-center gap-2"
            >
              Guía de Acceso
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bottom row identifiers */}
        <div className="relative z-20 flex justify-between items-center text-[9px] tracking-[0.25em] text-[#6B6458]/70 dark:text-[#A59E92]/60 uppercase font-mono">
          <span>ALPES & ALTIPLANO</span>
          <span>© 2026 COBROS DIGITALES</span>
        </div>

      </div>

      {/* 50% RIGHT PANEL: User login card and interaction flow */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-14 lg:p-20 relative bg-[#FAF8F5] dark:bg-[#070707] z-20">
        
        {/* Architect scale background rules */}
        <div className="absolute inset-0 bg-dot-matrix pointer-events-none opacity-40 md:opacity-20" />

        {/* Top right alignment bar with theme toggle button (Image matching circular) */}
        <div className="flex justify-between items-center w-full max-w-md mx-auto md:max-w-none relative z-30">
          <div className="flex md:hidden flex-col items-start">
            <span className="font-display text-lg tracking-wider text-[#1C1A17] dark:text-white leading-none uppercase">
              FINCAS
            </span>
            <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-[#C5A880] mt-1 font-bold">
              ESTATE SUITE V5.0
            </span>
          </div>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full border border-black/10 dark:border-white/10 bg-transparent text-[#1C1A17] dark:text-white hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#C5A880]" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Elegant Centered Entry Form */}
        <div className="my-auto w-full max-w-sm mx-auto p-2 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
            className="space-y-8"
          >
            {/* Subsection tag and title */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C5A880] flex items-center gap-2 font-mono">
                <UserCheck className="w-3.5 h-3.5" />
                <span>ACCESO ÚNICO PROPIETARIOS</span>
              </span>
              <h2 className="text-3xl font-serif text-[#1C1A17] dark:text-white leading-tight font-normal tracking-wide uppercase">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-[#6B6458] dark:text-[#A59E92] leading-relaxed font-sans font-light">
                Si es <strong>propietario o titular</strong> de lote, por favor ingrese su número de DNI como usuario (y use su mismo DNI como contraseña) para consultar sus datos y pagos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Field 1: User / DNI */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#6B6458]/80 dark:text-[#A59E92] font-mono">
                  USUARIO O DNI DEL TITULAR
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A880]/70 group-focus-within:text-[#C5A880] transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. 12345678 o admin"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/55 dark:bg-white/[0.01] border border-[#E6DFD5] dark:border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30 focus:border-[#C5A880] dark:text-white transition-all placeholder:text-[#6B6458]/40 dark:placeholder:text-[#A59E92]/30 text-[#1C1A17] h-12"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-[#6B6458]/80 dark:text-[#A59E92] font-mono">
                  CONTRASEÑA DE INGRESO
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A880]/70 group-focus-within:text-[#C5A880] transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Escriba aquí su contraseña"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/55 dark:bg-white/[0.01] border border-[#E6DFD5] dark:border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#C5A880]/30 focus:border-[#C5A880] dark:text-white transition-all placeholder:text-[#6B6458]/40 dark:placeholder:text-[#A59E92]/30 text-[#1C1A17] h-12"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50/75 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs text-red-700 dark:text-red-400 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Solid sand/black high-contrast button (Matches reference images exactly) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-[#1C1A17] dark:bg-[#EAE6DF] hover:bg-[#2C2924] dark:hover:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#1C1A17] font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50 text-[10px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 font-mono h-12"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>INGRESAR AL PORTAL</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        </div>

        {/* Small Bottom Signature Line layout */}
        <div className="w-full max-w-sm mx-auto text-center md:max-w-none md:text-left text-[9px] text-[#6B6458]/60 dark:text-[#A59E92]/50 font-mono tracking-wider uppercase relative z-30">
          Acceso Protegido • Fincas Desarrollos Urbanos Argentinos
        </div>

      </div>

    </div>
  );
}
