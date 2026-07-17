import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, MessageSquare, Search, Send, RefreshCw, HelpCircle, ChevronRight, Info, PhoneCall } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_DATABASE_OWNER: FAQItem[] = [
  {
    id: "como_ingresar_owner",
    question: "¿Cómo ingresar al portal y claves de acceso?",
    answer: "Para ingresar debés usar tu número de DNI (sin puntos) tanto en el campo de 'Usuario' como en 'Contraseña' por defecto. Una vez que ingreses, vas a poder cambiar esta clave por razones de seguridad desde el menú superior derecho en tu perfil de usuario.",
    keywords: ["cómo ingresar", "como ingresar", "guía de acceso", "guia de acceso", "usuario", "contraseña", "dni", "entrar", "clave", "ingreso", "contrasena", "login"]
  },
  {
    id: "recargo_mora_owner",
    question: "¿Por qué tiene recargo o mora cada cuota?",
    answer: "Las cuotas vencen ordinariamente el día 10 de cada mes (o el día estipulado en tu boleto). Tu cuenta cuenta con un período de gracia de 10 días corridos (hasta el día 20 de ese mismo mes) sin recargos. A partir del día 21, se aplica una mora diaria del 1% sobre el valor neto de la cuota adeudada, acumulada hasta la fecha en que realices y se procese el pago.",
    keywords: ["recargo", "cuotas", "mora", "vencimiento", "gracia", "retraso", "por que", "pagar más"]
  },
  {
    id: "valor_mora_diaria_owner",
    question: "¿De cuánto es el recargo por mora diaria?",
    answer: "El recargo por mora diaria es del 1% sobre el valor de la cuota en dólares (USD) o su equivalente en pesos. Este cargo se computa acumulativamente por cada día corrido de atraso a partir del vencimiento del periodo de gracia (generalmente el día 20 del mes) hasta que se acredite el pago por la administración.",
    keywords: ["cuanto", "porcentaje", "diaria", "mora", "recargo", "interes", "calculo", "multa"]
  },
  {
    id: "modificar_contrasena_owner",
    question: "¿Cómo puedo modificar mi contraseña de acceso?",
    answer: "Podés cambiar tu contraseña haciendo clic en tu perfil en la esquina superior derecha (donde figura tu nombre), seleccionar la opción 'Cambiar Credenciales', ingresar tu nuevo correo/contraseña y guardar los cambios.",
    keywords: ["contraseña", "clave", "password", "modificar", "cambiar", "ingreso", "acceso", "perfil"]
  },
  {
    id: "cotizacion_dolar_owner",
    question: "¿Qué valor del dólar se toma para pagar en pesos?",
    answer: "Para pesificar la cuota emitida en USD, se toma como referencia la cotización del 'Dólar Blue vendedor' oficial del día de pago. La administración actualiza esta cotización periódicamente para mantener la equidad. Al registrarse tu cobro, la cotización de ese día queda fijada e inmutable en tu recibo final.",
    keywords: ["dólar", "dolar", "blue", "pesos", "ars", "cotización", "cotizacion", "cambio", "conversión", "tipo de cambio"]
  },
  {
    id: "mora_critica_owner",
    question: "¿Cuándo ingresa una cuenta en Mora Crítica o Caducidad?",
    answer: "Una cuenta ingresa en estado de 'Mora Crítica' o 'Caducado' cuando acumula un atraso equivalente o mayor a 6 cuotas correlativas impagas. Bajo estas condiciones, se notificará al propietario para regularizar la situación según las condiciones y plazos estipulados en el boleto de compra-venta.",
    keywords: ["mora critica", "critica", "critico", "caducidad", "caducado", "cuantas cuotas", "perder lote", "rescisión", "rescindir", "judicial"]
  },
  {
    id: "contacto_soporte_owner",
    question: "¿Con quién me contacto para informar pagos o dudas?",
    answer: "Para informar transferencias, presentar comprobantes de pago o aclarar cualquier duda, podés contactarte directamente al correo institucional de administración: adp.fincas@gmail.com, o bien escribir al número de teléfono oficial de atención al propietario.",
    keywords: ["contacto", "soporte", "comprobante", "transferencia", "enviar pago", "ayuda", "administrador", "telefono", "mail", "oficina"]
  }
];

const FAQ_DATABASE_ADMIN: FAQItem[] = [
  {
    id: "actualizar_dolar_admin",
    question: "¿Cómo actualizo la cotización del dólar blue?",
    answer: "Podés ir a la solapa 'Dólar Blue' en el menú lateral de navegación y presionar el botón 'Consultar Cotización Actual y Sincronizar'. Esto llamará a la API de DolarApi en tiempo real para traer el valor vendedor oficial y actualizará instantáneamente el saldo convertido en pesos de todos los propietarios.",
    keywords: ["actualizar dolar", "dolar blue", "cotizacion", "sincronizar", "valor d", "blue", "sincro", "dolarapi"]
  },
  {
    id: "registrar_cobro_admin",
    question: "¿Cómo registro un cobro o cuota pagada?",
    answer: "Hacé clic en el propietario correspondiente dentro de la lista de Propietarios, luego andá a la solapa de 'Historial de Cuotas' o seleccioná el atajo directo 'Registrar Cobro'. Completá el monto abonado (pesos o dólares), seleccioná la fecha y presioná 'Confirmar Recibo'. El sistema recalculará la mora y el estado automáticamente.",
    keywords: ["cobro", "registrar", "pago", "cuota", "pagado", "recibo", "monto", "cargar"]
  },
  {
    id: "calculo_mora_admin",
    question: "¿Cómo calcula el sistema el recargo por mora diaria?",
    answer: "El sistema toma el 1% diario acumulado a partir del día siguiente al período de gracia (normalmente el 20 de cada mes). Si el pago se realiza posterior a ese día, calcula de manera transparente los días transcurridos y multiplica el 1% para sumarlo al total adeudado. Podés eximir la mora de una cuota de manera manual desmarcando la casilla correspondiente al cargar el cobro.",
    keywords: ["calculo mora", "interes", "mora diaria", "recargo", "gracia", "1 por ciento", "dias", "atraso"]
  },
  {
    id: "editar_propietario_admin",
    question: "¿Cómo modifico las credenciales o datos de un lote?",
    answer: "En el listado de propietarios, buscá al cliente y hacé clic en el botón de edición (icono lápiz) o bien presioná el botón 'Nuevo Propietario' arriba a la derecha. Allí podés modificar su nombre, lote, saldo, correo y cambiar/reestablecer la contraseña directamente.",
    keywords: ["editar propietario", "modificar lote", "credenciales", "contraseña propietario", "cambiar clave", "nuevo", "lote"]
  },
  {
    id: "mi_cuenta_admin",
    question: "¿Cómo cambio mis datos de administrador?",
    answer: "Hacé clic sobre tu foto o nombre en la esquina superior derecha, seleccioná 'Mi Cuenta Admin' o 'Configuración de Sistema' para actualizar tu correo o contraseña del panel de administración.",
    keywords: ["cuenta admin", "credenciales admin", "cambiar mi clave", "configuracion", "correo admin"]
  }
];

interface HelpChatbotProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  userRole?: "admin" | "owner" | null;
}

export default function HelpChatbot({ isOpen: propIsOpen, setIsOpen: propSetIsOpen, userRole = null }: HelpChatbotProps = {}) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : setLocalIsOpen;

  // Select database based on current role
  const isDocAdmin = userRole === "admin";
  const activeFaqDatabase = isDocAdmin ? FAQ_DATABASE_ADMIN : FAQ_DATABASE_OWNER;

  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; timestamp: Date; isFAQSelection?: boolean }>>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [showAttentionDot, setShowAttentionDot] = useState(true);

  // Initialize or reset welcome message when userRole changes
  useEffect(() => {
    const welcomeText = isDocAdmin
      ? "¡Hola, Administrador! Bienvenido al soporte técnico y guía rápida de la plataforma. Estoy aquí para asistirte con el registro de cobros, configuración de mora, sincronización de la API de Dólar Blue y administración de propietarios. ¿En qué puedo ayudarte hoy?"
      : "¡Hola! Bienvenido al asistente de ayuda de Altos del Plata. Estoy aquí para aclarar tus dudas sobre las fechas de vencimiento, cálculo de mora, cotización del dólar blue y acceso a tu portal. ¿Qué te gustaría consultar hoy?";
    
    setMessages([
      {
        sender: "bot",
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [userRole, isDocAdmin]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When forced open externally, clear the attention notification indicator
  useEffect(() => {
    if (isOpen) {
      setShowAttentionDot(false);
    }
  }, [isOpen]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSelectFAQ = (faq: FAQItem) => {
    // Add user message
    const userMsg = {
      sender: "user" as const,
      text: faq.question,
      timestamp: new Date(),
      isFAQSelection: true
    };

    // Add bot response
    const botMsg = {
      sender: "bot" as const,
      text: faq.answer,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputSearch("");
  };

  const handleSearchSend = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputSearch.trim().toLowerCase();
    if (!query) return;

    // Add user message to state
    const userMsg = {
      sender: "user" as const,
      text: inputSearch,
      timestamp: new Date()
    };

    // Search matches in FAQ Database
    const matchedFaqs = activeFaqDatabase.filter(item => 
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.keywords.some(kw => kw.includes(query) || query.includes(kw))
    );

    let replyText = "";
    if (matchedFaqs.length > 0) {
      if (matchedFaqs.length === 1) {
        replyText = matchedFaqs[0].answer;
      } else {
        replyText = `Encontré varias respuestas que podrían interesarte:\n\n` + 
          matchedFaqs.map((f, i) => `${i + 1}. • ${f.question}: ${f.answer}`).join("\n\n");
      }
    } else {
      replyText = `Lo siento, no encontré respuestas exactas para "${inputSearch}". \n\nTe recomiendo probar buscando con palabras clave simples, o hacer clic directamente en las preguntas rápidas del menú de arriba.`;
    }

    const botMsg = {
      sender: "bot" as const,
      text: replyText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputSearch("");
  };

  const handleResetChat = () => {
    const welcomeText = isDocAdmin
      ? "Soporte reiniciado. Seleccioná una de las preguntas rápidas o escribí una palabra clave abajo."
      : "Menú reiniciado. Seleccioná una de las preguntas frecuentes o escribí una palabra clave abajo para asistirte.";

    setMessages([
      {
        sender: "bot",
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
    setInputSearch("");
  };

  // Filter FAQ list based on user typing
  const filteredFaqs = inputSearch.trim() === "" 
    ? activeFaqDatabase 
    : activeFaqDatabase.filter(item => 
        item.question.toLowerCase().includes(inputSearch.toLowerCase()) || 
        item.keywords.some(kw => kw.includes(inputSearch.toLowerCase()))
      );

  return (
    <div id="assist-bot-container" className="fixed bottom-6 right-6 z-55 font-sans pointer-events-auto">
      
      {/* 1. FLOATING CHAT BUBBLE TRIGGER */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="assist-bot-trigger"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            onClick={() => {
              setIsOpen(true);
              setShowAttentionDot(false);
            }}
            className="w-14 h-14 rounded-full bg-[#1C1A17] dark:bg-[#EAE6DF] border border-[#C5A880]/40 text-[#C5A880] dark:text-[#1C1A17] hover:bg-[#2C2924] dark:hover:bg-[#FAF8F5] flex items-center justify-center shadow-2xl relative cursor-pointer group active:scale-95 transition-all outline-none"
            title="Asistente de Consulta Rápida"
          >
            <Bot className="w-6.5 h-6.5 stroke-[2]" />
            
            {showAttentionDot && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-900 flex items-center justify-center text-[8px] font-black font-mono animate-bounce text-white">
                !
              </span>
            )}

            {/* Hover help tooltip */}
            <span className="absolute right-16 bg-[#0F1014] text-[#E8E4D9] text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 hover:opacity-100 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap border border-slate-800">
              ¿Dudas? Chat de Ayuda
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. CHAT DRAWER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="assist-bot-panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-88 sm:w-96 max-h-[580px] h-[520px] bg-white dark:bg-[#0F1014] border border-[#E5E7EB] dark:border-[#202125] rounded-2xl shadow-2xl flex flex-col overflow-hidden shadow-black/20 dark:shadow-black/70"
          >
            {/* Header section (Facebook / WhatsApp Brand Style) */}
            <header className="px-4 py-3 bg-[#1C1A17] dark:bg-[#121316] text-[#FAF8F5] dark:text-[#E6E1DA] border-b border-[#C5A880]/20 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/5 dark:bg-white/10 flex items-center justify-center border border-[#C5A880]/30">
                  <Bot className="w-5.5 h-5.5 text-[#C5A880]" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold font-display tracking-widest leading-none uppercase text-white">Asistente ADP</h4>
                  <span className="text-[9px] font-bold text-[#C5A880] flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-pulse" />
                    En línea • Inteligente
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Cerrar asistencia"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Chat message list area */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-[#090A0D] space-y-3 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-1.5 animate-fade-in`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0 mb-1">
                      <Bot className="w-3.5 h-3.5 text-stone-500" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs text-left leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === "user"
                        ? "bg-[#C5A880]/20 dark:bg-[#C5A880]/15 text-[#1C1A17] dark:text-[#E8E4D9] border border-[#C5A880]/35 rounded-tr-none font-medium"
                        : "bg-white dark:bg-[#121316] text-[#0f172a] dark:text-[#E8E4D9] rounded-tl-none border border-stone-150 dark:border-[#202125]"
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[8.5px] font-mono mt-1 text-right leading-none ${
                        msg.sender === "user" ? "text-[#C5A880]" : "text-stone-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Selector option prompt tiles */}
            <div className="px-3.5 py-2.5 bg-stone-100 dark:bg-[#101217] border-t border-[#E5E7EB] dark:border-[#1E2024]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-[#C5A880]" />
                  Preguntas Predeterminadas
                </span>
                
                {messages.length > 1 && (
                  <button 
                    onClick={handleResetChat} 
                    className="text-[9px] uppercase font-bold text-[#C5A880] hover:text-[#BA9A73] flex items-center gap-1 font-mono transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Reiniciar
                  </button>
                )}
              </div>

              {/* Dynamic scrollable questions tray */}
              <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {filteredFaqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleSelectFAQ(faq)}
                    className="w-full text-left p-2.5 bg-white hover:bg-stone-50 dark:bg-[#16171d] dark:hover:bg-[#1c1e26] border border-stone-200 dark:border-[#25272e] rounded-xl text-[11px] font-semibold text-stone-750 dark:text-stone-300 transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <span className="truncate pr-2 group-hover:text-[#C5A880] dark:group-hover:text-[#C5A880]">{faq.question}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
                {filteredFaqs.length === 0 && (
                  <div className="text-[10px] py-2 text-stone-400 text-center font-mono">
                    No hay preguntas recomendadas para tu búsqueda.
                  </div>
                )}
              </div>
            </div>

            {/* Keyword Input Box Search or send */}
            <form
              onSubmit={handleSearchSend}
              className="p-3 bg-white dark:bg-[#121316] border-t border-[#E5E7EB] dark:border-[#202125] flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscá o escribí: mora, dolar, clave..."
                  value={inputSearch}
                  onChange={(e) => setInputSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-xl text-xs font-semibold focus:outline-none dark:text-white placeholder:text-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputSearch.trim()}
                className="w-10 h-10 rounded-xl bg-[#1C1A17] dark:bg-[#E6DFD5] text-[#FAF8F5] dark:text-[#1C1A17] border border-[#C5A880]/30 hover:bg-[#2C2924] dark:hover:bg-[#FAF8F5] flex items-center justify-center disabled:opacity-40 shrink-0 cursor-pointer active:scale-95 transition-all outline-none shadow-sm"
                title="Presione para consultar"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
