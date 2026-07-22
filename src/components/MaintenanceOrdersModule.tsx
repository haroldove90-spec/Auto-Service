import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, Eye, Edit3, Trash2, Printer, Check, X,
  AlertCircle, CheckCircle2, Clock, Wrench, Shield, ArrowRight, CornerDownRight,
  Download, Layers, RefreshCw
} from 'lucide-react';
import { MaintenanceOrder, MaintenanceServiceType } from '../types';

interface MaintenanceOrdersModuleProps {
  maintenanceOrders: MaintenanceOrder[];
  addMaintenanceOrder: (order: Omit<MaintenanceOrder, 'id' | 'folio'>) => MaintenanceOrder;
  updateMaintenanceOrder: (id: string, order: Partial<MaintenanceOrder>) => void;
  deleteMaintenanceOrder: (id: string) => void;
}

const TIPO_FALLA_OPTIONS = [
  'ELECTRICA',
  'MECANICA',
  'NEUMATICA',
  'HIDRAULICA',
  'PROCESO',
  'ERROR DE OPERACIÓN',
  'PROGRAMACION',
  'FALTA DE MATERIAL',
  'TERMINÓ EL PLAN DE PRODUCCIÓN',
  'FALTO PERSONAL',
  'MEJORA AL EQUIPO'
];

const TIPO_SERVICIO_OPTIONS: MaintenanceServiceType[] = [
  'CORRECTIVO',
  'PREVENTIVO',
  'CAMBIO HTA SET-UP',
  'INSTALACION NUEVA',
  'MODIFICACION',
  'CFF',
  'OTROS ESPECIFIQUE'
];

export default function MaintenanceOrdersModule({
  maintenanceOrders,
  addMaintenanceOrder,
  updateMaintenanceOrder,
  deleteMaintenanceOrder
}: MaintenanceOrdersModuleProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MaintenanceOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<MaintenanceOrder | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Create/Edit
  const defaultFormData = (): Omit<MaintenanceOrder, 'id' | 'folio'> => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);
    return {
      status: 'En_Proceso',
      documentCode: 'MT0301F1',
      revision: 'Rev. 01',
      createdBy: 'A. Castellanos',
      lastUpdate: '24-Oct-2025',
      solicitante: '',
      area: 'Área de Prensas / Ensamble',
      fechaSolicitud: today,
      nombreEquipo: '',
      proyecto: 'Proyecto T+H Automotive',
      horaInicial: nowTime,
      tipoServicio: 'CORRECTIVO',
      tipoServicioOtros: '',
      tipoAjuste: '',
      descripcionFalla: '',
      ordenAtendidaPor: 'A. Castellanos / T. Mantenimiento',
      fechaMantenimiento: today,
      horaFinal: '',
      recibeProduccionFirmaHora: '',
      recibeCalidadFirmaHora: '',
      refaccionesUtilizadas: '',
      numeroNAV: '',
      descripcionServicioEfectuado: '',
      tipoFalla: []
    };
  };

  const [formData, setFormData] = useState<Omit<MaintenanceOrder, 'id' | 'folio'>>(defaultFormData());

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingOrder(null);
    setFormData(defaultFormData());
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (order: MaintenanceOrder) => {
    setEditingOrder(order);
    const { id, folio, ...rest } = order;
    setFormData(rest);
    setIsCreateOpen(true);
  };

  // Toggle Falla Checkbox
  const handleToggleFalla = (falla: string) => {
    setFormData(prev => {
      const exists = prev.tipoFalla.includes(falla);
      return {
        ...prev,
        tipoFalla: exists
          ? prev.tipoFalla.filter(f => f !== falla)
          : [...prev.tipoFalla, falla]
      };
    });
  };

  // Submit Form (Save or Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.solicitante.trim()) {
      alert('Por favor ingresa el nombre del Solicitante.');
      return;
    }
    if (!formData.nombreEquipo.trim()) {
      alert('Por favor ingresa el Nombre del Equipo.');
      return;
    }

    if (editingOrder) {
      updateMaintenanceOrder(editingOrder.id, formData);
    } else {
      addMaintenanceOrder(formData);
    }

    setIsCreateOpen(false);
    setEditingOrder(null);
  };

  // Filtered List
  const filteredOrders = maintenanceOrders.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      order.folio.toString().includes(term) ||
      order.solicitante.toLowerCase().includes(term) ||
      order.nombreEquipo.toLowerCase().includes(term) ||
      order.area.toLowerCase().includes(term) ||
      order.proyecto.toLowerCase().includes(term) ||
      order.numeroNAV.toLowerCase().includes(term) ||
      order.ordenAtendidaPor.toLowerCase().includes(term);

    const matchesType = filterType === 'TODOS' || order.tipoServicio === filterType;
    const matchesStatus = filterStatus === 'TODOS' || order.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalOrders = maintenanceOrders.length;
  const correctivosCount = maintenanceOrders.filter(o => o.tipoServicio === 'CORRECTIVO').length;
  const preventivosCount = maintenanceOrders.filter(o => o.tipoServicio === 'PREVENTIVO').length;
  const enProcesoCount = maintenanceOrders.filter(o => o.status === 'En_Proceso').length;
  const completadosCount = maintenanceOrders.filter(o => o.status === 'Completado').length;

  return (
    <div className="space-[#FA5210] space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FA5210] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Documento Oficial MT0301F1
            </span>
            <span className="text-xs text-slate-400 font-mono">Rev. 01 • Created by A. Castellanos</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2 font-display">
            <FileText className="w-7 h-7 text-[#FA5210]" />
            Órdenes de Trabajo y Mantenimiento
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Módulo ejecutivo de captura, seguimiento, consulta y dictamen técnico de fallas en equipos e instalaciones.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          id="btn-nueva-orden-ot"
          className="flex items-center justify-center gap-2 bg-[#FA5210] hover:bg-[#ff6122] text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#FA5210]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Nueva Orden de Trabajo</span>
        </button>
      </div>

      {/* KPI METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Órdenes</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalOrders}</p>
          <span className="text-[10px] text-slate-400">Registradas en sistema</span>
        </div>

        <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 shadow-sm">
          <p className="text-xs text-red-700 font-medium flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-red-600" />
            Correctivos
          </p>
          <p className="text-2xl font-black text-red-900 mt-1 font-mono">{correctivosCount}</p>
          <span className="text-[10px] text-red-600">Atención inmediata</span>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-sm">
          <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Preventivos
          </p>
          <p className="text-2xl font-black text-blue-900 mt-1 font-mono">{preventivosCount}</p>
          <span className="text-[10px] text-blue-600">Programados</span>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
            En Proceso
          </p>
          <p className="text-2xl font-black text-amber-900 mt-1 font-mono">{enProcesoCount}</p>
          <span className="text-[10px] text-amber-600">Trabajando en bahía</span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completados
          </p>
          <p className="text-2xl font-black text-emerald-900 mt-1 font-mono">{completadosCount}</p>
          <span className="text-[10px] text-emerald-600">Liberados por producción</span>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Folio, Equipo, Solicitante, NAV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filtros:
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          >
            <option value="TODOS">Todos los Tipos</option>
            {TIPO_SERVICIO_OPTIONS.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          >
            <option value="TODOS">Todos los Estatus</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En_Proceso">En Proceso</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* TABLE OF MAINTENANCE ORDERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Folio OT</th>
                <th className="py-3.5 px-4">Solicitante / Área</th>
                <th className="py-3.5 px-4">Equipo / Proyecto</th>
                <th className="py-3.5 px-4">Tipo Servicio</th>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Atendida Por</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No se encontraron órdenes de trabajo registradas con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-[#FA5210] text-sm">
                      #{order.folio}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.solicitante}</div>
                      <div className="text-[11px] text-slate-400">{order.area}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{order.nombreEquipo}</div>
                      <div className="text-[10px] text-slate-400">{order.proyecto}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.tipoServicio === 'CORRECTIVO' ? 'bg-red-100 text-red-800 border border-red-200' :
                        order.tipoServicio === 'PREVENTIVO' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {order.tipoServicio}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>{order.fechaSolicitud}</div>
                      <div className="text-[10px] text-slate-400">{order.horaInicial} hrs</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {order.ordenAtendidaPor || 'Sin asignar'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'Completado' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'En_Proceso' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Pendiente' ? 'bg-slate-100 text-slate-700' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'Completado' && <Check className="w-3 h-3" />}
                        {order.status === 'En_Proceso' && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingOrder(order)}
                          title="Ver / Imprimir Formato Oficial MT0301F1"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          title="Editar Registro"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(order.id)}
                          title="Eliminar Registro"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src="https://appdesignproyectos.com/tha.png" 
                  alt="T+H Automotive" 
                  className="h-9 w-auto bg-black/40 p-1 rounded-lg border border-white/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-black tracking-tight font-display text-white">
                    {editingOrder ? `Editar Orden OT Folio #${editingOrder.folio}` : 'Alta de Nueva Orden de Trabajo Mantenimiento'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Formato Oficial MT0301F1 • T+H AUTOMOTIVE</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* SECTION 1: PARA SER LLENADA POR EL AREA QUE REQUIERE EL SERVICIO */}
              <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="bg-slate-800 text-white text-xs font-black uppercase px-3 py-1.5 rounded-md tracking-wider">
                  PARA SER LLENADA POR EL ÁREA QUE REQUIERE EL SERVICIO
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Solicitante *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez / Ing. Producción"
                      value={formData.solicitante}
                      onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Área
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Prensas / Ensamble"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.fechaSolicitud}
                      onChange={(e) => setFormData({ ...formData, fechaSolicitud: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nombre del equipo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Prensa Hidráulica H-500"
                      value={formData.nombreEquipo}
                      onChange={(e) => setFormData({ ...formData, nombreEquipo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Proyecto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Proyecto Chasis T+H"
                      value={formData.proyecto}
                      onChange={(e) => setFormData({ ...formData, proyecto: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Hora inicial
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicial}
                      onChange={(e) => setFormData({ ...formData, horaInicial: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* TIPO DE SERVICIO RADIO GRID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Tipo de Servicio
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIPO_SERVICIO_OPTIONS.map((tipo) => (
                      <label
                        key={tipo}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                          formData.tipoServicio === tipo
                            ? 'bg-[#FA5210] text-white border-[#FA5210] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipoServicio"
                          checked={formData.tipoServicio === tipo}
                          onChange={() => setFormData({ ...formData, tipoServicio: tipo })}
                          className="sr-only"
                        />
                        <span className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                          {formData.tipoServicio === tipo && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </span>
                        <span className="truncate">{tipo}</span>
                      </label>
                    ))}
                  </div>

                  {formData.tipoServicio === 'OTROS ESPECIFIQUE' && (
                    <input
                      type="text"
                      placeholder="Especifique otro tipo de servicio..."
                      value={formData.tipoServicioOtros || ''}
                      onChange={(e) => setFormData({ ...formData, tipoServicioOtros: e.target.value })}
                      className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Anote aquí el tipo de ajuste
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ajuste de válvulas de presión y alineación de guías"
                    value={formData.tipoAjuste}
                    onChange={(e) => setFormData({ ...formData, tipoAjuste: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Descripción de la falla, servicio o requerimiento reportado
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Escriba a detalle la síntoma o necesidad expresada por producción..."
                    value={formData.descripcionFalla}
                    onChange={(e) => setFormData({ ...formData, descripcionFalla: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#FA5210]"
                  />
                </div>
              </div>

              {/* SECTION 2: PARA SER LLENADA POR MANTENIMIENTO */}
              <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="bg-slate-800 text-white text-xs font-black uppercase px-3 py-1.5 rounded-md tracking-wider">
                  PARA SER LLENADA POR MANTENIMIENTO
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Orden atendida por
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. A. Castellanos / T. Mantenimiento"
                      value={formData.ordenAtendidaPor}
                      onChange={(e) => setFormData({ ...formData, ordenAtendidaPor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Fecha mantenimiento
                    </label>
                    <input
                      type="date"
                      value={formData.fechaMantenimiento}
                      onChange={(e) => setFormData({ ...formData, fechaMantenimiento: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Hora final
                    </label>
                    <input
                      type="time"
                      value={formData.horaFinal}
                      onChange={(e) => setFormData({ ...formData, horaFinal: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Firma y hora de quien recibe de producción
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ing. R. Gómez (11:50 hrs)"
                      value={formData.recibeProduccionFirmaHora}
                      onChange={(e) => setFormData({ ...formData, recibeProduccionFirmaHora: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Firma y hora de quien recibe de calidad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Lic. M. Torres (12:00 hrs)"
                      value={formData.recibeCalidadFirmaHora}
                      onChange={(e) => setFormData({ ...formData, recibeCalidadFirmaHora: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Cantidad y descripción de las refacciones utilizadas
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1x O-Ring NBR 90, 2 Lts Aceite ISO VG 68"
                      value={formData.refaccionesUtilizadas}
                      onChange={(e) => setFormData({ ...formData, refaccionesUtilizadas: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#FA5210]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Número NAV
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. NAV-88402"
                      value={formData.numeroNAV}
                      onChange={(e) => setFormData({ ...formData, numeroNAV: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#FA5210] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Descripción del servicio efectuado
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalle los trabajos mecánicos, eléctricos o de calibración ejecutados..."
                    value={formData.descripcionServicioEfectuado}
                    onChange={(e) => setFormData({ ...formData, descripcionServicioEfectuado: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#FA5210]"
                  />
                </div>

                {/* TIPO DE FALLA CHECKBOX GRID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                    Tipo de falla (Marque todas las que apliquen)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {TIPO_FALLA_OPTIONS.map((falla) => {
                      const checked = formData.tipoFalla.includes(falla);
                      return (
                        <button
                          type="button"
                          key={falla}
                          onClick={() => handleToggleFalla(falla)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold text-left transition-all cursor-pointer ${
                            checked
                              ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-amber-400 border-amber-400 text-slate-900' : 'border-slate-300'
                          }`}>
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="truncate">{falla}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ESTATUS SELECT */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Estatus de la Orden OT
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FA5210]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En_Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FA5210] hover:bg-[#ff6122] text-white text-xs font-bold transition-all shadow-md shadow-[#FA5210]/20 cursor-pointer"
                >
                  {editingOrder ? 'Guardar Cambios' : 'Registrar Orden OT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED VIEW & PRINTABLE REPLICA MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            {/* Action Bar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FA5210]" />
                <span className="font-bold text-sm">Vista de Impresión Formato MT0301F1</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-[#FA5210] hover:bg-[#ff6122] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Descargar PDF</span>
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PRINTABLE PAPER REPLICA FORM MATCHING USER IMAGE EXACTLY */}
            <div className="p-6 md:p-8 bg-white font-sans text-slate-900 text-xs print:p-0">
              <div className="border-2 border-black">
                
                {/* HEADER TABLE */}
                <div className="grid grid-cols-12 border-b-2 border-black text-center font-bold">
                  <div className="col-span-4 border-r-2 border-black p-2 flex items-center justify-center bg-white">
                    <img 
                      src="https://appdesignproyectos.com/tha.png" 
                      alt="T+H Automotive Logo" 
                      className="max-h-12 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="col-span-5 border-r-2 border-black p-2 flex items-center justify-center uppercase tracking-wide text-sm bg-slate-100 font-black">
                    ORDEN DE TRABAJO MANTENIMIENTO
                  </div>
                  <div className="col-span-3 p-2 flex items-center justify-center font-mono font-black text-sm bg-slate-100">
                    FOLIO # {viewingOrder.folio}
                  </div>
                </div>

                {/* SECTION 1 HEADER BAR */}
                <div className="bg-slate-200 border-b-2 border-black text-center font-black uppercase tracking-wider text-[11px] py-1.5">
                  PARA SER LLENADA POR EL AREA QUE REQUIERE EL SERVICIO
                </div>

                {/* SECTION 1 ROWS */}
                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-7 border-r border-black p-1.5">
                    <span className="font-bold">Solicitante: </span>
                    <span className="font-semibold">{viewingOrder.solicitante}</span>
                  </div>
                  <div className="col-span-3 border-r border-black p-1.5">
                    <span className="font-bold">Área: </span>
                    <span>{viewingOrder.area}</span>
                  </div>
                  <div className="col-span-2 p-1.5">
                    <span className="font-bold">Fecha: </span>
                    <span className="font-mono">{viewingOrder.fechaSolicitud}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-7 border-r border-black p-1.5">
                    <span className="font-bold">Nombre del equipo: </span>
                    <span className="font-semibold">{viewingOrder.nombreEquipo}</span>
                  </div>
                  <div className="col-span-3 border-r border-black p-1.5">
                    <span className="font-bold">Proyecto: </span>
                    <span>{viewingOrder.proyecto}</span>
                  </div>
                  <div className="col-span-2 p-1.5">
                    <span className="font-bold">Hora inicial: </span>
                    <span className="font-mono">{viewingOrder.horaInicial}</span>
                  </div>
                </div>

                {/* TIPO DE SERVICIO TABLE ROW */}
                <div className="grid grid-cols-7 border-b border-black text-center text-[10px] font-bold bg-slate-50">
                  <div className="p-1 border-r border-black">TIPO DE SERVICIO:</div>
                  <div className={`p-1 border-r border-black ${viewingOrder.tipoServicio === 'CORRECTIVO' ? 'bg-black text-white' : ''}`}>CORRECTIVO</div>
                  <div className={`p-1 border-r border-black ${viewingOrder.tipoServicio === 'PREVENTIVO' ? 'bg-black text-white' : ''}`}>PREVENTIVO</div>
                  <div className={`p-1 border-r border-black ${viewingOrder.tipoServicio === 'CAMBIO HTA SET-UP' ? 'bg-black text-white' : ''}`}>CAMBIO HTA SET-UP</div>
                  <div className={`p-1 border-r border-black ${viewingOrder.tipoServicio === 'INSTALACION NUEVA' ? 'bg-black text-white' : ''}`}>INSTALACION NUEVA</div>
                  <div className={`p-1 border-r border-black ${viewingOrder.tipoServicio === 'MODIFICACION' ? 'bg-black text-white' : ''}`}>MODIFICACION</div>
                  <div className={`p-1 ${viewingOrder.tipoServicio === 'OTROS ESPECIFIQUE' ? 'bg-black text-white' : ''}`}>
                    {viewingOrder.tipoServicio === 'OTROS ESPECIFIQUE' ? (viewingOrder.tipoServicioOtros || 'OTROS') : 'OTROS'}
                  </div>
                </div>

                <div className="border-b border-black p-1.5">
                  <span className="font-bold">ANOTE AQUÍ EL TIPO DE AJUSTE: </span>
                  <span>{viewingOrder.tipoAjuste || 'N/A'}</span>
                </div>

                <div className="border-b-2 border-black p-2 min-h-[50px]">
                  <span className="font-bold block mb-1">Descripción de la falla, servicio o requerimiento reportado:</span>
                  <p className="text-slate-800 whitespace-pre-line">{viewingOrder.descripcionFalla || 'Sin observaciones registradas.'}</p>
                </div>

                {/* SECTION 2 HEADER BAR */}
                <div className="bg-slate-200 border-b-2 border-black text-center font-black uppercase tracking-wider text-[11px] py-1.5">
                  PARA SER LLENADA POR MANTENIMIENTO
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-6 border-r border-black p-1.5">
                    <span className="font-bold">Orden atendida por: </span>
                    <span className="font-semibold">{viewingOrder.ordenAtendidaPor || 'N/A'}</span>
                  </div>
                  <div className="col-span-3 border-r border-black p-1.5">
                    <span className="font-bold">Fecha: </span>
                    <span className="font-mono">{viewingOrder.fechaMantenimiento || viewingOrder.fechaSolicitud}</span>
                  </div>
                  <div className="col-span-3 p-1.5">
                    <span className="font-bold">Hora final: </span>
                    <span className="font-mono">{viewingOrder.horaFinal || 'En atención'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black">
                  <div className="border-r border-black p-1.5">
                    <span className="font-bold">Firma y hora de quien recibe de producción: </span>
                    <span>{viewingOrder.recibeProduccionFirmaHora || 'Pendiente'}</span>
                  </div>
                  <div className="p-1.5">
                    <span className="font-bold">Firma y hora de quien recibe de calidad: </span>
                    <span>{viewingOrder.recibeCalidadFirmaHora || 'Pendiente'}</span>
                  </div>
                </div>

                <div className="border-b border-black p-2 min-h-[40px]">
                  <span className="font-bold block">Cantidad y descripción de las refacciones utilizadas:</span>
                  <span>{viewingOrder.refaccionesUtilizadas || 'Ninguna / Sin refacciones adicionadas.'}</span>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-4 border-r border-black p-1.5 font-mono">
                    <span className="font-bold font-sans">Número NAV: </span>
                    <span>{viewingOrder.numeroNAV || 'N/A'}</span>
                  </div>
                  <div className="col-span-8 p-1.5">
                    <span className="font-bold">Descripción del servicio efectuado: </span>
                    <span>{viewingOrder.descripcionServicioEfectuado || 'En desarrollo.'}</span>
                  </div>
                </div>

                {/* TIPO DE FALLA GRID TABLE REPLICA */}
                <div className="border-b-2 border-black">
                  <div className="grid grid-cols-12">
                    <div className="col-span-3 border-r border-black p-2 font-bold bg-slate-100 flex items-center uppercase text-[10px]">
                      Tipo de falla:
                    </div>
                    <div className="col-span-9 grid grid-cols-3 text-[10px] text-center font-bold">
                      {TIPO_FALLA_OPTIONS.map((falla, idx) => {
                        const isChecked = viewingOrder.tipoFalla.includes(falla);
                        return (
                          <div key={falla} className={`p-1.5 border-b border-r border-black flex items-center justify-between ${isChecked ? 'bg-slate-900 text-white font-black' : ''}`}>
                            <span className="truncate">{falla}</span>
                            <span className="font-mono text-[11px] ml-1">[{isChecked ? 'X' : '  '}]</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* FOOTER DOCUMENT METADATA */}
                <div className="grid grid-cols-12 text-[10px] font-mono p-1.5 bg-slate-50 font-bold">
                  <div className="col-span-4">{viewingOrder.documentCode} ORDEN DE TRABAJO MANTENIMIENTO</div>
                  <div className="col-span-2 text-center">{viewingOrder.revision}</div>
                  <div className="col-span-3 text-center">Created by: {viewingOrder.createdBy}</div>
                  <div className="col-span-3 text-right">Last Update: {viewingOrder.lastUpdate}</div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 cursor-pointer"
              >
                Cerrar Vista
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">¿Eliminar esta Orden de Trabajo?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Esta acción borrará permanentemente la orden OT del registro local. ¿Deseas continuar?
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteMaintenanceOrder(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
