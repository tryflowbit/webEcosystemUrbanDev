'use client';
import { useState, useEffect } from 'react';
import mockData from './data/mockData.json';

export default function AppFlow() {
  // Estados del Flujo Principal
  // 'login' -> 'select_project' -> 'dashboard'
  const [currentStep, setCurrentStep] = useState('login');
  
  // Estados de UI y Preferencias
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Estados de Negocio y Datos
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(mockData.clientes);
  const [selectedClient, setSelectedClient] = useState(null);

  // Proyectos simulados para la demo
  const proyectos = [
    { id: 'fincas_altos_del_plata', nombre: 'Fincas Altos del Plata', lotes: 820, ubicacion: 'Buenos Aires', estado: 'Operativo' },
    { id: 'fincas_del_lago', nombre: 'Fincas del Lago', lotes: 450, ubicacion: 'Córdoba', estado: 'En Lanzamiento' },
    { id: 'fincas_del_valle', nombre: 'Fincas del Valle', lotes: 600, ubicacion: 'Mendoza', estado: 'Planificación' }
  ];

  const alertas = mockData.clientes.filter(c => c.meses_atraso >= 5);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Manejador de Login simulado
  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === 'admin' && password === '1234') {
      setLoginError('');
      setCurrentStep('select_project');
    } else {
      setLoginError('Credenciales incorrectas. Probá con admin / 1234');
    }
  };

  // Buscador de clientes
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase();
    const filtered = mockData.clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      c.apellido.toLowerCase().includes(term) ||
      c.dni.includes(term)
    );
    setSearchResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. PANTALLA DE LOGIN */}
      {currentStep === 'login' && (
        <div className="min-h-screen flex flex-col justify-center items-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">FINCAS DESARROLLOS</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Plataforma Unificada de Gestión Urbana</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">Usuario</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: admin"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                  {loginError}
                </p>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                Ingresar al Panel
              </button>
            </form>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="mt-6 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-slate-300 transition-colors">
            {isDarkMode ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
          </button>
        </div>
      )}

      {/* 2. PANTALLA DE SELECCIÓN DE PROYECTO */}
      {currentStep === 'select_project' && (
        <div className="min-h-screen max-w-5xl mx-auto px-4 py-16 flex flex-col justify-center">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">Acceso Concedido</span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 mt-3">Seleccione el Proyecto a Gestionar</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Su cuenta de administrador tiene acceso a las siguientes bases de datos:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proyectos.map((proyecto) => (
              <div 
                key={proyecto.id}
                onClick={() => {
                  if (proyecto.id === 'fincas_altos_del_plata') {
                    setSelectedProject(proyecto);
                    setCurrentStep('dashboard');
                  } else {
                    alert(`El proyecto "${proyecto.nombre}" está en simulación. Para la demo seleccioná Fincas Altos del Plata.`);
                  }
                }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all hover:-translate-y-1 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-700">
                      {proyecto.ubicacion.toUpperCase()}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${proyecto.id === 'fincas_altos_del_plata' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">Inventario estimado: {proyecto.lotes} lotes totales.</p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-400">{proyecto.estado}</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Gestionar →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={() => setCurrentStep('login')} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-slate-300 underline transition-colors">
              ← Volver al login
            </button>
          </div>
        </div>
      )}

      {/* 3. EL DASHBOARD OPERATIVO */}
      {currentStep === 'dashboard' && (
        <div className="min-h-screen">
          {/* NAVBAR */}
          <nav className="border-b bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                
                <div className="flex items-center gap-3">
                  <button onClick={() => { setCurrentStep('select_project'); setSelectedClient(null); }} className="text-sm hover:bg-gray-100 dark:hover:bg-slate-800 p-1.5 rounded-lg text-gray-400 mr-1">
                    🏢 Cambiar Barrio
                  </button>
                  <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400">
                    {selectedProject?.nombre.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:block text-xs text-gray-500 dark:text-slate-400 mr-4">
                    Dólar Blue: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${mockData.proyecto.valor_dolar_blue}</span>
                  </div>

                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors">
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>

                  {/* Campanita Alertas */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowNotifications(!showNotifications); setShowNavMenu(false); }}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors relative"
                    >
                      🔔
                      {alertas.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 font-semibold text-sm text-gray-800 dark:text-slate-200">Alertas de Mora Crítica</div>
                        <div className="max-h-64 overflow-y-auto">
                          {alertas.map(a => (
                            <div key={a.id} className="p-4 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => {setSelectedClient(a); setShowNotifications(false);}}>
                              <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{a.apellido}, {a.nombre}</div>
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {a.meses_atraso >= 6 ? `Caducado (${a.meses_atraso} meses)` : `Riesgo Alto (${a.meses_atraso} meses)`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hamburguesa */}
                  <div className="relative">
                    <button onClick={() => { setShowNavMenu(!showNavMenu); setShowNotifications(false); }} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors">
                      ☰
                    </button>
                    {showNavMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-50">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700" onClick={() => alert('Módulo de deudores en simulación para la demo')}>Lista Completa de Morosos</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-slate-700 mt-1 pt-2" onClick={() => { setCurrentStep('login'); setSelectedProject(null); setSelectedClient(null); }}>Cerrar Sesión</button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </nav>

          {/* CUERPO DEL DASHBOARD */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!selectedClient ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Buscador Integrado de Propietarios</h2>
                
                <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Buscar por apellido, nombre o DNI..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                    Buscar
                  </button>
                </form>

                <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium">
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4 hidden md:table-cell">Plan Técnico Acordado</th>
                        <th className="p-4">Estado Financiero</th>
                        <th className="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {searchResults.map((cliente) => (
                        <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-gray-900 dark:text-slate-200">{cliente.apellido}, {cliente.nombre}</div>
                            <div className="text-xs text-gray-500">DNI: {cliente.dni}</div>
                          </td>
                          <td className="p-4 text-gray-700 dark:text-slate-300">Mza {cliente.manzana} - L. {cliente.lote}</td>
                          <td className="p-4 text-gray-700 dark:text-slate-300 hidden md:table-cell">{cliente.plan}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border 
                              ${cliente.meses_atraso === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                                cliente.meses_atraso >= 6 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                                'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                              {cliente.estado_pago}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => setSelectedClient(cliente)} className="text-xs font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* PANEL DETALLADO DEL CLIENTE SELECCIONADO */
              <div className="space-y-6">
                <button onClick={() => setSelectedClient(null)} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-2">
                  ← Volver al listado de propietarios
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{selectedClient.apellido}, {selectedClient.nombre}</h2>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">DNI técnico: {selectedClient.dni}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border 
                        ${selectedClient.meses_atraso === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                          selectedClient.meses_atraso >= 6 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                        {selectedClient.estado_pago}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-slate-800 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Ubicación del Lote</p>
                        <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">Manzana {selectedClient.manzana} / Lote {selectedClient.lote}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Esquema Comercial</p>
                        <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">{selectedClient.plan}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Progreso Financiero</p>
                        <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">Cuota liquidada N° {selectedClient.cuota_actual}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Monto Base de Cuota</p>
                        <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">${selectedClient.valor_cuota_usd} USD</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Caja de Cobranza</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                        Procesar el cobro de la cuota N° {selectedClient.cuota_actual + 1}. El sistema indexará intereses por mora automáticamente.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedClient.meses_atraso >= 6 ? (
                        <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20 text-center">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Lote Sujeto a Rescisión</p>
                          <p className="text-xs text-red-600 dark:text-red-500 mt-1">Se superó el límite de tolerancia de 6 meses de impago.</p>
                        </div>
                      ) : (
                        <button onClick={() => alert(`Procesando pago simulado para la cuota ${selectedClient.cuota_actual + 1}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md">
                          Registrar Cobro
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </main>
        </div>
      )}

    </div>
  );
}