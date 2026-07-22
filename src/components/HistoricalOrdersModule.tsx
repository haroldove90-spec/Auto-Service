import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Download, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Check, 
  Wrench, 
  Clock, 
  User, 
  Tag, 
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { HistoricalMaintenanceOrder } from '../types';

interface HistoricalOrdersModuleProps {
  historicalOrders: HistoricalMaintenanceOrder[];
  addHistoricalOrder: (order: Omit<HistoricalMaintenanceOrder, 'id'>) => void;
  updateHistoricalOrder: (id: string, updated: Partial<HistoricalMaintenanceOrder>) => void;
  deleteHistoricalOrder: (id: string) => void;
}

export const HistoricalOrdersModule: React.FC<HistoricalOrdersModuleProps> = ({
  historicalOrders,
  addHistoricalOrder,
  updateHistoricalOrder,
  deleteHistoricalOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState<string>('todos');
  const [selectedTipoServicio, setSelectedTipoServicio] = useState<string>('todos');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<HistoricalMaintenanceOrder | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    folio: 2824,
    fechaSolicitud: '6-Jan',
    horaSolicitada: '14:00',
    mes: '1-Jan',
    cw: 2,
    fechaSolicitudCompleta: '1/6/25 2:00 PM',
    solicitante: 'Carina L',
    equipo: 'Dobladora',
    centroDeCostos: '5208',
    tipoMantenimiento: 'Cambio htta.',
    tecnico1: 'Ruben Diaz',
    tecnico2: 'Ivan Diaz',
    fechaCierre: '6-Jan',
    horaCierre: '15:30',
    fechaCierreCompleta: '1/6/2025',
    tiempoRequeridoMin: 90,
    tipoFalla: 'DT-01 (CAMBIO HTTA.)',
    tipoServicio: 'Set-Up',
    correctivo: 'Set-Up',
    nav: 'N/A',
    descripcionServicio: ''
  });

  // Unique list of equipos for filters
  const uniqueEquipos = useMemo(() => {
    const set = new Set<string>();
    historicalOrders.forEach(o => {
      if (o.equipo) set.add(o.equipo);
    });
    return Array.from(set).sort();
  }, [historicalOrders]);

  // Unique list of tipos de servicio
  const uniqueTiposServicio = useMemo(() => {
    const set = new Set<string>();
    historicalOrders.forEach(o => {
      if (o.tipoServicio) set.add(o.tipoServicio);
    });
    return Array.from(set).sort();
  }, [historicalOrders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return historicalOrders.filter(order => {
      const matchesSearch = 
        String(order.folio).includes(searchTerm) ||
        order.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tecnico1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.tecnico2 && order.tecnico2.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.tipoMantenimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tipoFalla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.centroDeCostos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.descripcionServicio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEquipo = selectedEquipo === 'todos' || order.equipo === selectedEquipo;
      const matchesTipoServicio = selectedTipoServicio === 'todos' || order.tipoServicio === selectedTipoServicio;

      return matchesSearch && matchesEquipo && matchesTipoServicio;
    });
  }, [historicalOrders, searchTerm, selectedEquipo, selectedTipoServicio]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = historicalOrders.length;
    const totalMinutes = historicalOrders.reduce((acc, o) => acc + (Number(o.tiempoRequeridoMin) || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Group by tipoServicio
    const setupCount = historicalOrders.filter(o => o.tipoServicio?.toLowerCase().includes('set-up')).length;
    const correctivoCount = historicalOrders.filter(o => o.tipoServicio?.toLowerCase().includes('correctivo')).length;

    return {
      totalCount,
      totalMinutes,
      totalHours,
      setupCount,
      correctivoCount
    };
  }, [historicalOrders]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'Folio',
      'Fecha solicita',
      'Hora Solicitada',
      'Mes',
      'CW',
      'Fecha solicitud',
      'Solicitante',
      'Equipo',
      'Centro de C.',
      'Tipo Mantenimiento',
      'Tecnico 1',
      'Tecnico 2',
      'Fecha Cierre',
      'Hora Cierre',
      'Fecha de Cierre',
      'Tiempo reque',
      'Tipo de Falla',
      'Tipo de Servicio',
      'Correctivo',
      'NAV',
      'Descripcion Servicio'
    ];

    const rows = filteredOrders.map(o => [
      o.folio,
      `"${o.fechaSolicitud || ''}"`,
      `"${o.horaSolicitada || ''}"`,
      `"${o.mes || ''}"`,
      o.cw || '',
      `"${o.fechaSolicitudCompleta || ''}"`,
      `"${o.solicitante || ''}"`,
      `"${o.equipo || ''}"`,
      `"${o.centroDeCostos || ''}"`,
      `"${o.tipoMantenimiento || ''}"`,
      `"${o.tecnico1 || ''}"`,
      `"${o.tecnico2 || ''}"`,
      `"${o.fechaCierre || ''}"`,
      `"${o.horaCierre || ''}"`,
      `"${o.fechaCierreCompleta || ''}"`,
      o.tiempoRequeridoMin || 0,
      `"${o.tipoFalla || ''}"`,
      `"${o.tipoServicio || ''}"`,
      `"${o.correctivo || ''}"`,
      `"${o.nav || ''}"`,
      `"${(o.descripcionServicio || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Historial_Ordenes_Mantenimiento_2025_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open modal for new order or editing
  const handleOpenForm = (orderToEdit?: HistoricalMaintenanceOrder) => {
    if (orderToEdit) {
      setEditingId(orderToEdit.id);
      setFormData({
        folio: orderToEdit.folio,
        fechaSolicitud: orderToEdit.fechaSolicitud,
        horaSolicitada: orderToEdit.horaSolicitada,
        mes: orderToEdit.mes,
        cw: orderToEdit.cw,
        fechaSolicitudCompleta: orderToEdit.fechaSolicitudCompleta,
        solicitante: orderToEdit.solicitante,
        equipo: orderToEdit.equipo,
        centroDeCostos: orderToEdit.centroDeCostos,
        tipoMantenimiento: orderToEdit.tipoMantenimiento,
        tecnico1: orderToEdit.tecnico1,
        tecnico2: orderToEdit.tecnico2 || 'N/A',
        fechaCierre: orderToEdit.fechaCierre,
        horaCierre: orderToEdit.horaCierre,
        fechaCierreCompleta: orderToEdit.fechaCierreCompleta,
        tiempoRequeridoMin: orderToEdit.tiempoRequeridoMin,
        tipoFalla: orderToEdit.tipoFalla,
        tipoServicio: orderToEdit.tipoServicio,
        correctivo: orderToEdit.correctivo,
        nav: orderToEdit.nav || 'N/A',
        descripcionServicio: orderToEdit.descripcionServicio
      });
    } else {
      setEditingId(null);
      const nextFolio = historicalOrders.length > 0 ? Math.max(...historicalOrders.map(o => o.folio)) + 1 : 2824;
      setFormData({
        folio: nextFolio,
        fechaSolicitud: '6-Jan',
        horaSolicitada: '08:00',
        mes: '1-Jan',
        cw: 2,
        fechaSolicitudCompleta: new Date().toLocaleString(),
        solicitante: 'Fany Michel',
        equipo: 'Linea 1',
        centroDeCostos: '5201',
        tipoMantenimiento: 'Cambio htta.',
        tecnico1: 'Ruben Diaz',
        tecnico2: 'Ivan Diaz',
        fechaCierre: '6-Jan',
        horaCierre: '09:30',
        fechaCierreCompleta: new Date().toLocaleDateString(),
        tiempoRequeridoMin: 90,
        tipoFalla: 'DT-01 (CAMBIO HTTA.)',
        tipoServicio: 'Set-Up',
        correctivo: 'Set-Up',
        nav: 'N/A',
        descripcionServicio: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcionServicio.trim()) {
      alert('Por favor ingrese la descripción del servicio efectuado.');
      return;
    }

    if (editingId) {
      updateHistoricalOrder(editingId, formData);
    } else {
      addHistoricalOrder(formData);
    }

    setShowFormModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                ARCHIVO ORDENES DE TRABAJO MANTENIMIENTO
              </h2>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                Módulo oficial para consultar, filtrar, registrar y exportar el historial operativo 2025/2026.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 border border-emerald-400/30"
              title="Exportar a Excel (.csv)"
            >
              <Download size={16} />
              <span>Exportar Excel (.csv)</span>
            </button>

            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#FA5210] hover:bg-[#e04505] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 border border-orange-400/30"
            >
              <Plus size={16} />
              <span>Registrar Orden</span>
            </button>
          </div>
        </div>

        {/* METRICS DASHBOARD CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Histórico</span>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1">
              {stats.totalCount} <span className="text-xs text-slate-400 font-normal">órdenes</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-amber-400 block uppercase tracking-wider">Tiempo Invertido</span>
            <div className="text-2xl font-black text-amber-300 mt-1 flex items-baseline gap-1">
              {stats.totalHours} <span className="text-xs text-amber-400 font-normal">hrs ({stats.totalMinutes} min)</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-blue-400 block uppercase tracking-wider">Set-Up / Cambios</span>
            <div className="text-2xl font-black text-blue-300 mt-1">
              {stats.setupCount} <span className="text-xs text-blue-400 font-normal">eventos</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] font-bold text-red-400 block uppercase tracking-wider">Correctivos</span>
            <div className="text-2xl font-black text-red-300 mt-1">
              {stats.correctivoCount} <span className="text-xs text-red-400 font-normal">intervenciones</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por Folio, Equipo, Técnico, Falla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter size={14} />
            <span>Filtros:</span>
          </div>

          <select
            value={selectedEquipo}
            onChange={(e) => setSelectedEquipo(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          >
            <option value="todos">Todos los Equipos</option>
            {uniqueEquipos.map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>

          <select
            value={selectedTipoServicio}
            onChange={(e) => setSelectedTipoServicio(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          >
            <option value="todos">Todos los Tipos de Servicio</option>
            {uniqueTiposServicio.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(searchTerm || selectedEquipo !== 'todos' || selectedTipoServicio !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEquipo('todos');
                setSelectedTipoServicio('todos');
              }}
              className="text-xs text-red-600 font-semibold hover:underline px-2"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* TABLE VIEW FOR DESKTOP & SCROLL CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#FA5210]" />
            <span>Registros Encontrados: {filteredOrders.length}</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Desliza horizontalmente para ver todas las columnas del formato oficial</span>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 uppercase text-[10px] tracking-wider font-extrabold sticky top-0 z-10 border-b border-slate-800">
                <th className="p-2.5 text-center w-12 border-r border-slate-800">Acciones</th>
                <th className="p-2.5 border-r border-slate-800 bg-slate-950 text-amber-400 font-black">Folio</th>
                <th className="p-2.5 border-r border-slate-800">Fecha Sol.</th>
                <th className="p-2.5 border-r border-slate-800">Hora</th>
                <th className="p-2.5 border-r border-slate-800">Mes</th>
                <th className="p-2.5 border-r border-slate-800 text-center">CW</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[120px]">Fecha Completa Sol.</th>
                <th className="p-2.5 border-r border-slate-800">Solicitante</th>
                <th className="p-2.5 border-r border-slate-800 font-bold text-white min-w-[110px]">Equipo</th>
                <th className="p-2.5 border-r border-slate-800 text-center">Centro C.</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[120px]">Tipo Mantenimiento</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[110px]">Técnico 1</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[110px]">Técnico 2</th>
                <th className="p-2.5 border-r border-slate-800">Fecha Cierre</th>
                <th className="p-2.5 border-r border-slate-800">Hora Cierre</th>
                <th className="p-2.5 border-r border-slate-800">Fecha Cierre Compl.</th>
                <th className="p-2.5 border-r border-slate-800 text-center font-black text-amber-300">Min Reque.</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[140px]">Tipo Falla</th>
                <th className="p-2.5 border-r border-slate-800 min-w-[110px]">Tipo Servicio</th>
                <th className="p-2.5 border-r border-slate-800">Correctivo</th>
                <th className="p-2.5 border-r border-slate-800">NAV</th>
                <th className="p-2.5 min-w-[280px]">Descripción Servicio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={22} className="p-8 text-center text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 text-slate-300" />
                    No se encontraron órdenes de mantenimiento con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-amber-50/60 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                  >
                    <td className="p-2 text-center border-r border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setShowDetailModal(order)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenForm(order)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la orden Folio #${order.folio}?`)) {
                              deleteHistoricalOrder(order.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="p-2.5 font-extrabold text-slate-900 border-r border-slate-200 bg-amber-50/40 text-center">
                      #{order.folio}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.fechaSolicitud}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.horaSolicitada}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.mes}</td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-800">{order.cw}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600 whitespace-nowrap text-[11px]">{order.fechaSolicitudCompleta}</td>
                    <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap">{order.solicitante}</td>
                    <td className="p-2.5 border-r border-slate-200 font-extrabold text-blue-900 whitespace-nowrap">{order.equipo}</td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-700">{order.centroDeCostos}</td>
                    <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">{order.tipoMantenimiento}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-800 whitespace-nowrap">{order.tecnico1}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600 whitespace-nowrap">{order.tecnico2 || 'N/A'}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.fechaCierre}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.horaCierre}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600 whitespace-nowrap text-[11px]">{order.fechaCierreCompleta}</td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-black text-amber-700 bg-amber-50/50">
                      {order.tiempoRequeridoMin}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-medium text-slate-800 text-[11px]">{order.tipoFalla}</td>
                    <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        order.tipoServicio?.toLowerCase().includes('set-up')
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : order.tipoServicio?.toLowerCase().includes('correctivo')
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {order.tipoServicio}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">{order.correctivo}</td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600 font-mono text-[11px]">{order.nav || 'N/A'}</td>
                    <td className="p-2.5 text-slate-700 max-w-xs truncate" title={order.descripcionServicio}>
                      {order.descripcionServicio}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM: REGISTER / EDIT HISTORICAL MAINTENANCE ORDER */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FA5210] text-white rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white">
                    {editingId ? `Editar Orden Folio #${formData.folio}` : 'Registrar Nueva Orden de Mantenimiento'}
                  </h3>
                  <p className="text-xs text-slate-300">Completa la información conforme a la bitácora oficial</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* SECTION 1: DATOS DE SOLICITUD */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                  <Calendar size={16} className="text-[#FA5210]" />
                  1. Datos de Solicitud y Tiempo
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Folio *</label>
                    <input
                      type="number"
                      required
                      value={formData.folio}
                      onChange={(e) => setFormData({ ...formData, folio: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha Solicitud (Día-Mes)</label>
                    <input
                      type="text"
                      placeholder="e.g. 6-Jan"
                      value={formData.fechaSolicitud}
                      onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hora Solicitada</label>
                    <input
                      type="text"
                      placeholder="e.g. 14:00"
                      value={formData.horaSolicitada}
                      onChange={(e) => setFormData({ ...formData, horaSolicitada: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mes</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-Jan"
                      value={formData.mes}
                      onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Semana CW</label>
                    <input
                      type="number"
                      value={formData.cw}
                      onChange={(e) => setFormData({ ...formData, cw: parseInt(e.target.value) || 1 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Fecha Solicitud Completa</label>
                    <input
                      type="text"
                      placeholder="e.g. 1/6/25 2:00 PM"
                      value={formData.fechaSolicitudCompleta}
                      onChange={(e) => setFormData({ ...formData, fechaSolicitudCompleta: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Solicitante *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fany Michel, Carina L"
                      value={formData.solicitante}
                      onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: EQUIPO Y CLASIFICACION */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                  <Wrench size={16} className="text-[#FA5210]" />
                  2. Equipo, Centro de Costos y Tipo Mantenimiento
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Equipo *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dobladora, Linea 1, Prensa 2"
                      value={formData.equipo}
                      onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-blue-900 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Centro de Costos / Num Equipo</label>
                    <input
                      type="text"
                      placeholder="e.g. 5208, 5201, 5209"
                      value={formData.centroDeCostos}
                      onChange={(e) => setFormData({ ...formData, centroDeCostos: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo Mantenimiento</label>
                    <input
                      type="text"
                      placeholder="e.g. Cambio htta., Falta de aceite, Limpieza"
                      value={formData.tipoMantenimiento}
                      onChange={(e) => setFormData({ ...formData, tipoMantenimiento: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TECNICOS Y CIERRE */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                  <User size={16} className="text-[#FA5210]" />
                  3. Técnicos Asignados y Tiempos de Cierre
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Técnico 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ruben Diaz, Juan Manuel"
                      value={formData.tecnico1}
                      onChange={(e) => setFormData({ ...formData, tecnico1: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Técnico 2</label>
                    <input
                      type="text"
                      placeholder="e.g. Ivan Diaz, Eduardo Salinas"
                      value={formData.tecnico2}
                      onChange={(e) => setFormData({ ...formData, tecnico2: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha Cierre</label>
                    <input
                      type="text"
                      placeholder="e.g. 6-Jan"
                      value={formData.fechaCierre}
                      onChange={(e) => setFormData({ ...formData, fechaCierre: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hora Cierre</label>
                    <input
                      type="text"
                      placeholder="e.g. 15:30"
                      value={formData.horaCierre}
                      onChange={(e) => setFormData({ ...formData, horaCierre: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fecha Cierre Completa</label>
                    <input
                      type="text"
                      placeholder="e.g. 1/6/2025"
                      value={formData.fechaCierreCompleta}
                      onChange={(e) => setFormData({ ...formData, fechaCierreCompleta: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tiempo Requerido (Minutos) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.tiempoRequeridoMin}
                      onChange={(e) => setFormData({ ...formData, tiempoRequeridoMin: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-extrabold text-amber-700 bg-amber-50 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: CLASIFICACION TECNICA Y DESCRIPCION */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
                  <Tag size={16} className="text-[#FA5210]" />
                  4. Tipo de Falla, Servicio, NAV y Descripción Operativa
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Falla</label>
                    <input
                      type="text"
                      placeholder="e.g. DT-01 (CAMBIO HTTA.)"
                      value={formData.tipoFalla}
                      onChange={(e) => setFormData({ ...formData, tipoFalla: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Servicio</label>
                    <input
                      type="text"
                      placeholder="e.g. Set-Up, Correctivo, Ajuste proceso"
                      value={formData.tipoServicio}
                      onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Correctivo</label>
                    <input
                      type="text"
                      placeholder="e.g. Set-Up, Limpieza estaciones"
                      value={formData.correctivo}
                      onChange={(e) => setFormData({ ...formData, correctivo: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NAV</label>
                    <input
                      type="text"
                      placeholder="e.g. 21147 (4x) o N/A"
                      value={formData.nav}
                      onChange={(e) => setFormData({ ...formData, nav: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descripción del Servicio Efectuado *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detalla minuciosamente los trabajos realizados en el equipo, piezas sustituidas, ajustes de sensor, etc."
                    value={formData.descripcionServicio}
                    onChange={(e) => setFormData({ ...formData, descripcionServicio: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FA5210] text-white font-bold rounded-xl hover:bg-[#e04505] transition-colors shadow-md flex items-center gap-2"
                >
                  <Check size={16} />
                  <span>{editingId ? 'Guardar Cambios' : 'Registrar en Historial'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR A SINGLE RECORD */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg font-black text-sm">
                  #{showDetailModal.folio}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{showDetailModal.equipo}</h3>
                  <p className="text-xs text-slate-500">Centro de Costos: <span className="font-bold text-slate-700">{showDetailModal.centroDeCostos}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Solicitante</span>
                <span className="font-bold text-slate-800">{showDetailModal.solicitante}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha & Hora Solicitud</span>
                <span className="font-bold text-slate-800">{showDetailModal.fechaSolicitudCompleta} ({showDetailModal.horaSolicitada})</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Técnicos Atendieron</span>
                <span className="font-bold text-slate-800">{showDetailModal.tecnico1} {showDetailModal.tecnico2 ? `/ ${showDetailModal.tecnico2}` : ''}</span>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-bold block">Tiempo Requerido</span>
                <span className="font-extrabold text-amber-900 text-sm">{showDetailModal.tiempoRequeridoMin} minutos</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tipo Falla / Servicio</span>
                <span className="font-bold text-slate-800">{showDetailModal.tipoFalla} • {showDetailModal.tipoServicio}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">NAV</span>
                <span className="font-mono font-bold text-slate-800">{showDetailModal.nav || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Descripción Detallada del Servicio</span>
              <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                {showDetailModal.descripcionServicio}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
