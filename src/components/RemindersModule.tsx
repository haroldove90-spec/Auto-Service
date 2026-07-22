import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Check, Trash2, 
  Plus, Calendar, Wrench, ChevronRight, FileText, ExternalLink, Zap, Volume2
} from 'lucide-react';
import { MaintenanceReminder, MaintenanceOrder } from '../types';

interface RemindersModuleProps {
  reminders: MaintenanceReminder[];
  addReminder: (rem: Omit<MaintenanceReminder, 'id'>) => MaintenanceReminder;
  markReminderAttended: (id: string) => void;
  markReminderRead: (id: string) => void;
  deleteReminder: (id: string) => void;
  addMaintenanceOrder?: (order: Omit<MaintenanceOrder, 'id' | 'folio'>) => MaintenanceOrder;
  navigateToOT?: () => void;
}

export default function RemindersModule({
  reminders,
  addReminder,
  markReminderAttended,
  markReminderRead,
  deleteReminder,
  addMaintenanceOrder,
  navigateToOT
}: RemindersModuleProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'CRITICAL' | 'ATTENDED'>('ALL');
  const [showNewReminderModal, setShowNewReminderModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Form state
  const [title, setTitle] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [weekNumber, setWeekNumber] = useState(30);
  const [type, setType] = useState<'PROXIMO' | 'VENCIDO' | 'EN_PROCESO' | 'EQUIPO_CAIDO'>('PROXIMO');
  const [urgency, setUrgency] = useState<'CRITICA' | 'ALTA' | 'MEDIA' | 'INFO'>('ALTA');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      new Notification('🔔 Notificaciones Activadas en T+H Automotive', {
        body: 'Recibirás alertas automáticas de mantenimientos preventivos y equipos caídos.',
        icon: '/favicon.ico'
      });
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (filterType === 'PENDING') return !r.attended;
    if (filterType === 'CRITICAL') return r.urgency === 'CRITICA' || r.type === 'EQUIPO_CAIDO';
    if (filterType === 'ATTENDED') return r.attended;
    return true;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !equipmentName) return;
    addReminder({
      title,
      equipmentName,
      weekNumber: Number(weekNumber),
      type,
      urgency,
      dueDate,
      message,
      read: false,
      attended: false,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });

    setShowNewReminderModal(false);
    setTitle('');
    setEquipmentName('');
    setMessage('');
  };

  const handleGenerateOTFromReminder = (rem: MaintenanceReminder) => {
    if (addMaintenanceOrder) {
      addMaintenanceOrder({
        status: 'Pendiente',
        documentCode: 'MT0301F1',
        revision: 'Rev. 01',
        createdBy: 'Sistema de Recordatorios',
        lastUpdate: new Date().toISOString().split('T')[0],
        solicitante: 'Mantenimiento Preventivo / Alertas',
        area: 'Área de Maquinaria T+H',
        fechaSolicitud: new Date().toISOString().split('T')[0],
        nombreEquipo: rem.equipmentName,
        proyecto: 'Mantenimiento Programado',
        horaInicial: '08:00',
        tipoServicio: rem.type === 'EQUIPO_CAIDO' ? 'CORRECTIVO' : 'PREVENTIVO',
        tipoAjuste: rem.title,
        descripcionFalla: rem.message,
        ordenAtendidaPor: 'Por Asignar',
        fechaMantenimiento: rem.dueDate,
        horaFinal: '',
        recibeProduccionFirmaHora: '',
        recibeCalidadFirmaHora: '',
        refaccionesUtilizadas: '',
        numeroNAV: 'NAV-PENDING',
        descripcionServicioEfectuado: '',
        tipoFalla: [rem.type === 'EQUIPO_CAIDO' ? 'EMERGENCIA' : 'PREVENTIVO_CALENDARIO']
      });

      markReminderAttended(rem.id);
      alert(`✅ Se ha generado la Orden de Trabajo MT0301F1 para ${rem.equipmentName}`);
      if (navigateToOT) navigateToOT();
    }
  };

  const getUrgencyBadge = (u: string) => {
    switch (u) {
      case 'CRITICA': return 'bg-red-500 text-white font-black animate-pulse';
      case 'ALTA': return 'bg-amber-500 text-slate-900 font-extrabold';
      case 'MEDIA': return 'bg-blue-500 text-white font-bold';
      default: return 'bg-slate-200 text-slate-700 font-medium';
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'EQUIPO_CAIDO': return <ShieldAlert size={18} className="text-red-500" />;
      case 'VENCIDO': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'EN_PROCESO': return <Clock size={18} className="text-yellow-500" />;
      default: return <Bell size={18} className="text-blue-500" />;
    }
  };

  const pendingCount = reminders.filter(r => !r.attended).length;
  const criticalCount = reminders.filter(r => (r.urgency === 'CRITICA' || r.type === 'EQUIPO_CAIDO') && !r.attended).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wider uppercase flex items-center gap-1">
              <Zap size={12} /> SISTEMA DE ALERTAS EN TIEMPO REAL
            </span>
            {criticalCount > 0 && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {criticalCount} Críticas Pendientes
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
            <Bell className="text-[#FA5210]" size={26} />
            RECORDATORIOS Y NOTIFICACIONES DE MANTENIMIENTO
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Alertas automáticas de fechas próximas, mantenimientos reprogramados y equipos caídos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-xl shadow-md transition-all"
            >
              <Volume2 size={16} />
              Activar Notificaciones Push
            </button>
          )}

          <button
            onClick={() => setShowNewReminderModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FA5210] hover:bg-[#e04507] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FA5210]/30 transition-all"
          >
            <Plus size={16} />
            Crear Recordatorio Manual
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({reminders.length})
          </button>
          <button
            onClick={() => setFilterType('PENDING')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterType === 'PENDING'
                ? 'bg-[#FA5210] text-white shadow shadow-[#FA5210]/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pendientes por Atender ({pendingCount})
          </button>
          <button
            onClick={() => setFilterType('CRITICAL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterType === 'CRITICAL'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🚨 Críticos & Equipos Caídos ({criticalCount})
          </button>
          <button
            onClick={() => setFilterType('ATTENDED')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterType === 'ATTENDED'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Atendidos / Resueltos
          </button>
        </div>
      </div>

      {/* Reminders Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReminders.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-500 opacity-60" />
            <p className="font-bold text-sm text-slate-700">Sin recordatorios en esta categoría</p>
            <p className="text-xs text-slate-400 mt-0.5">Todos los equipos están al día y operando correctamente.</p>
          </div>
        ) : (
          filteredReminders.map((rem) => (
            <div
              key={rem.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-3 relative ${
                rem.attended 
                  ? 'border-slate-200 opacity-75 bg-slate-50/50' 
                  : rem.urgency === 'CRITICA'
                  ? 'border-red-300 ring-2 ring-red-500/10 bg-red-50/20'
                  : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 mt-0.5">
                    {getTypeIcon(rem.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      SEMANA {rem.weekNumber} • VENCE: {rem.dueDate}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{rem.title}</h3>
                    <span className="text-xs font-bold text-[#FA5210] flex items-center gap-1 mt-0.5">
                      <Wrench size={12} /> {rem.equipmentName}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getUrgencyBadge(rem.urgency)}`}>
                  {rem.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                {rem.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Creado: {rem.createdAt}</span>

                <div className="flex flex-wrap items-center gap-2">
                  {!rem.attended && (
                    <>
                      <button
                        onClick={() => handleGenerateOTFromReminder(rem)}
                        className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <FileText size={13} />
                        Generar OT (MT0301F1)
                      </button>
                      <button
                        onClick={() => markReminderAttended(rem.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                      >
                        <Check size={13} />
                        Marcar Resuelto
                      </button>
                    </>
                  )}

                  {rem.attended && (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Atendido / Resuelto
                    </span>
                  )}

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"
                    title="Eliminar recordatorio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW MANUAL REMINDER MODAL */}
      {showNewReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Crear Nuevo Recordatorio de Mantenimiento</h3>
              <button onClick={() => setShowNewReminderModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título del Recordatorio *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Revisión preventiva de filtros de compresor"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipo Afectado *</label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="Ej. 5201 - Punzonadora 1"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semana Operativa</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nivel de Urgencia</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="CRITICA">CRÍTICA (Alerta)</option>
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="INFO">INFORMATIVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mensaje / Detalle de la Alerta</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe detalles o instrucciones para el equipo técnico..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewReminderModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#FA5210] rounded-xl shadow"
                >
                  Guardar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
