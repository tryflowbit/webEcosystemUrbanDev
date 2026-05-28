'use client';
import { useState, useEffect } from 'react';
import mockData from './data/mockData.json';

export default function AdminDashboard() {
  // Estados de UI
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Estados de Datos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(mockData.clientes);
  const [selectedClient, setSelectedClient] = useState(null);

  // Alertas calculadas automáticamente
  const alertas = mockData.clientes.filter(c => c.meses_atraso >= 5);

  // Manejo del Theme (Dark/Light)
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Buscador
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
    <div className="min-h-screen">
      {/* NAVBAR */}
      <nav className="border-b bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {mockData.proyecto.nombre.toUpperCase()}
              </span>
              <span className="hidden sm:inline-block text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">
                Panel Admin
              </span>
            </div>

            {/* Acciones Derecha */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-xs text-gray-500 dark:text-slate-400 mr-4">
                Dólar Blue: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${mockData.proyecto.valor_dolar_blue}</span>
              </div>

              {/* Botón Theme */}
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors">
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              {/* Botón Notificaciones */}
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
                
                {/* Dropdown Notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 font-semibold text-sm text-gray-800 dark:text-slate-200">Alertas de Sistema</div>
                    <div className="max-h-64 overflow-y-auto">
                      {alertas.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">Todo en orden.</p>
                      ) : (
                        alertas.map(a => (
                          <div key={a.id} className="p-4 border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => {setSelectedClient(a); setShowNotifications(false);}}>
                            <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{a.apellido}, {a.nombre}</div>
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {a.meses_atraso >= 6 ? `Caducado (${a.meses_atraso} meses de atraso)` : `Riesgo inminente (${a.meses_atraso} meses de atraso)`}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">Lote {a.lote} (Mza {a.manzana})</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Hamburguesa */}
              <div className="relative">
                <button 
                  onClick={() => { setShowNavMenu(!showNavMenu); setShowNotifications(false); }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition-colors"
                >
                  ☰
                </button>

                {/* Dropdown Menu */}
                {showNavMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-50">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Configurar Cuenta</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-gray-100 dark:border-slate-700 mt-1 pt-2">Lista de Morosos</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">Cerrar Sesión</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VISTA 1: LISTADO DE CLIENTES */}
        {!selectedClient ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Directorio de Propietarios</h2>
              
              {/* Buscador */}
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  placeholder="Buscar por apellido, nombre o DNI..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 transition-all"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  Buscar
                </button>
              </form>

              {/* Tabla */}
              <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium">
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Lote</th>
                      <th className="p-4 hidden md:table-cell">Plan Acordado</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {searchResults.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900 dark:text-slate-200">{cliente.apellido}, {cliente.nombre}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-500">DNI: {cliente.dni}</div>
                        </td>
                        <td className="p-4 text-gray-700 dark:text-slate-300">
                          Mza {cliente.manzana} - L. {cliente.lote}
                        </td>
                        <td className="p-4 text-gray-700 dark:text-slate-300 hidden md:table-cell">
                          {cliente.plan}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border 
                            ${cliente.meses_atraso === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                              cliente.meses_atraso >= 6 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                              'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                            {cliente.estado_pago}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {/* El nuevo botón lógico */}
                          <button 
                            onClick={() => setSelectedClient(cliente)}
                            className="text-xs font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (

        /* VISTA 2: FICHA DETALLADA DEL CLIENTE */
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedClient(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors flex items-center gap-2"
            >
              ← Volver al directorio
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Tarjeta de Info Principal */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{selectedClient.apellido}, {selectedClient.nombre}</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">DNI: {selectedClient.dni}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border 
                      ${selectedClient.meses_atraso === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                        selectedClient.meses_atraso >= 6 ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                        'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                      {selectedClient.estado_pago}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Ubicación</p>
                    <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">Manzana {selectedClient.manzana} / Lote {selectedClient.lote}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Plan Acordado</p>
                    <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">{selectedClient.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Progreso</p>
                    <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">Cuota {selectedClient.cuota_actual}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider font-semibold">Valor Cuota Base</p>
                    <p className="text-gray-900 dark:text-slate-200 font-medium mt-1">${selectedClient.valor_cuota_usd} USD</p>
                  </div>
                </div>
              </div>

              {/* Panel de Cobranza Operativa */}
              <div className="bg-blue-50 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Gestión de Cobro</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                    Abonar próxima cuota ({selectedClient.cuota_actual + 1}). El sistema calculará intereses si corresponde.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {selectedClient.meses_atraso >= 6 ? (
                    <div className="bg-red-100 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20 text-center">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Contrato sujeto a rescisión</p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1">Requiere autorización de gerencia para procesar pagos.</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => alert(`Caja simulada: Se cobrará la cuota a ${selectedClient.nombre} ${selectedClient.apellido}.`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/20"
                    >
                      Procesar Nuevo Pago
                    </button>
                  )}
                  <button className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors">
                    Ver Historial de Recibos
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}