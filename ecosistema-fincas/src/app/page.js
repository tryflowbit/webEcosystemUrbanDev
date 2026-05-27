'use client';
import { useState } from 'react';
import mockData from './data/mockData.json';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, lotes, clientes_morosos

  // Función de búsqueda simulada basada en tu lógica original
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = mockData.clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      c.apellido.toLowerCase().includes(term) ||
      c.dni.includes(term)
    );
    setSearchResults(filtered);
  };

  return (
    <div className="min-height-screen bg-slate-950 text-slate-100 font-sans">
      {/* Barra de Navegación Superior */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-cyan-400">FINCAS DEL PLATA</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">Panel Admin (DEMO)</span>
        </div>
        <div className="text-sm text-slate-400">
          Cotización Dólar Blue: <span className="text-emerald-400 font-semibold">${mockData.proyecto.valor_dolar_blue} ARS</span>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Selector de Vistas de la Demo */}
        <div className="flex gap-2 border-b border-slate-800 pb-px">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === 'overview' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Gestión de Cobros
          </button>
          <button 
            onClick={() => setActiveTab('lotes')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all ${activeTab === 'lotes' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Mapa de Lotes ({mockData.lotes.length})
          </button>
        </div>

        {/* VISTA 1: GESTIÓN DE COBROS Y BÚSQUEDA */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel de Búsqueda de Clientes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 text-slate-200">Buscar Propietario</h2>
                <form onSubmit={handleSearch} className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Ingrese nombre, apellido o DNI..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 transition-all text-slate-200"
                  />
                  <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/10">
                    Buscar
                  </button>
                </form>

                {/* Tabla de Resultados Dinámica */}
                {searchResults.length > 0 ? (
                  <div className="mt-6 overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Ubicación</th>
                          <th className="p-4">Plan (Cuotas)</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                        {searchResults.map((cliente) => (
                          <tr key={cliente.id} className="hover:bg-slate-800/30 transition-all">
                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{cliente.apellido}, {cliente.nombre}</div>
                              <div className="text-xs text-slate-500">DNI: {cliente.dni}</div>
                            </td>
                            <td className="p-4 text-slate-300">Manzana {cliente.manzana} - Lote {cliente.lote}</td>
                            <td className="p-4 text-slate-300">{cliente.cuota_actual}/{cliente.total_cuotas}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cliente.caducado ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                {cliente.estado_pago}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => alert(`Abriendo caja de cobro para el lote ${cliente.manzana}-${cliente.lote}. Próxima cuota base: $${cliente.valor_cuota_usd} USD.`)}
                                className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-700 transition-all"
                              >
                                Cobrar Cuota
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : searchTerm && (
                  <div className="mt-4 text-sm text-slate-500 bg-slate-950 p-4 border border-slate-800 rounded-lg">
                    No se encontraron registros coincidentes.
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Alertas Lateral: Control de Caducidades */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-semibold text-slate-200">Alertas de Morosidad</h2>
                <div className="space-y-3">
                  {mockData.clientes.filter(c => c.caducado).map(c => (
                    <div key={c.id} className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-red-400 text-sm">{c.apellido}, {c.nombre}</span>
                        <span className="text-[10px] uppercase bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-400 font-semibold">CADUCADO</span>
                      </div>
                      <p className="text-xs text-slate-400">Superó los 6 meses sin registrar actividad de pagos en el Lote {c.lote} (Mza {c.manzana}).</p>
                      <button 
                        onClick={() => alert(`Acción simulada: Lote ${c.manzana}-${c.lote} marcado como 'Disponible' en el inventario. Contrato rescindido.`)}
                        className="text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2.5 py-1 rounded transition-all font-medium w-full"
                      >
                        Liberar Terreno y Rescindir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: INVENTARIO DE LOTES (EFECTO DE CONTROL URBANO) */}
        {activeTab === 'lotes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-200">Estado General del Fraccionamiento</h2>
              <p className="text-xs text-slate-500 mt-1">Control visual del inventario técnico y lotes recuperados por vías legales.</p>
            </div>

            {/* Grilla Visual de Lotes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {mockData.lotes.map(lote => (
                <div 
                  key={lote.id} 
                  className={`p-4 rounded-lg border flex flex-col justify-between transition-all group relative ${
                    lote.estado === 'Vendido' ? 'bg-slate-950 border-slate-800 text-slate-400' :
                    lote.estado === 'Liberado por Mora' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/5' :
                    'bg-cyan-500/5 border-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/5'
                  }`}
                >
                  <div>
                    <span className="text-xs text-slate-500 block">Manzana {lote.manzana}</span>
                    <span className="text-xl font-bold tracking-tight">Lote {lote.lote}</span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase mt-4 block">
                    {lote.estado}
                  </span>

                  {/* Tooltip con información extendida para lotes liberados */}
                  {lote.estado === 'Liberado por Mora' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-slate-300 text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all w-56 shadow-2xl z-20 mb-2">
                      {lote.historial_moroso}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}