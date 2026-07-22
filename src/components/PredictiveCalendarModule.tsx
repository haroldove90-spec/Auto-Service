import React, { useState } from 'react';
import { 
  Calendar, Activity, AlertTriangle, CheckCircle, Clock, Plus, Search, 
  Filter, Download, Edit3, Trash2, Shield, User, Bell, ChevronRight, X, 
  Check, FileSpreadsheet, Zap, Info, ArrowUpRight
} from 'lucide-react';
import { 
  EquipmentCalendarRow, 
  PredictiveMaintenanceRecord, 
  PlannedFrequencyCode, 
  ExecutionStatusCode,
  MaintenanceReminder
} from '../types';

interface PredictiveCalendarModuleProps {
  calendarEquipment: EquipmentCalendarRow[];
  predictiveRecords: PredictiveMaintenanceRecord[];
  addEquipmentToCalendar: (eq: Omit<EquipmentCalendarRow, 'id'>) => EquipmentCalendarRow;
  updateCalendarCell: (
    equipmentId: string, 
    weekNumber: number, 
    cellType: 'planned' | 'realized', 
    value: PlannedFrequencyCode | ExecutionStatusCode | ''
  ) => void;
  updateEquipmentDetails: (id: string, partial: Partial<EquipmentCalendarRow>) => void;
  deleteEquipmentFromCalendar: (id: string) => void;
  addPredictiveRecord: (rec: Omit<PredictiveMaintenanceRecord, 'id'>) => PredictiveMaintenanceRecord;
  deletePredictiveRecord: (id: string) => void;
  addReminder: (rem: Omit<MaintenanceReminder, 'id'>) => MaintenanceReminder;
}

const MONTHS_CONFIG = [
  { name: 'ENERO', weeks: [1, 2, 3, 4] },
  { name: 'FEBRERO', weeks: [5, 6, 7, 8, 9] },
  { name: 'MARZO', weeks: [10, 11, 12, 13] },
  { name: 'ABRIL', weeks: [14, 15, 16, 17, 18] },
  { name: 'MAYO', weeks: [19, 20, 21, 22] },
  { name: 'JUNIO', weeks: [23, 24, 25, 26] },
  { name: 'JULIO', weeks: [27, 28, 29, 30, 31] },
  { name: 'AGOSTO', weeks: [32, 33, 34, 35] },
  { name: 'SEPT.', weeks: [36, 37, 38, 39, 40] },
  { name: 'OCTUBRE', weeks: [41, 42, 43, 44] },
  { name: 'NOV.', weeks: [45, 46, 47, 48] },
  { name: 'DIC.', weeks: [49, 50, 51, 52] },
];

export default function PredictiveCalendarModule({
  calendarEquipment,
  predictiveRecords,
  addEquipmentToCalendar,
  updateCalendarCell,
  updateEquipmentDetails,
  deleteEquipmentFromCalendar,
  addPredictiveRecord,
  deletePredictiveRecord,
  addReminder
}: PredictiveCalendarModuleProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'records' | 'register'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekCell, setSelectedWeekCell] = useState<{
    equipmentId: string;
    equipmentName: string;
    weekNumber: number;
    cellType: 'planned' | 'realized';
    currentVal: string;
  } | null>(null);

  // New Equipment Modal state
  const [showNewEquipmentModal, setShowNewEquipmentModal] = useState(false);
  const [newEqCode, setNewEqCode] = useState('');
  const [newEqName, setNewEqName] = useState('');
  const [newEqTech, setNewEqTech] = useState('A. Castellanos');
  const [newEqOutOfService, setNewEqOutOfService] = useState(false);

  // New Predictive Record Form state
  const [recordEqId, setRecordEqId] = useState('');
  const [recordWeek, setRecordWeek] = useState(30);
  const [recordMonth, setRecordMonth] = useState('JULIO');
  const [recordFreq, setRecordFreq] = useState<'MENSUAL' | 'BIMESTRAL' | 'ANUAL' | 'PREDICTIVO'>('PREDICTIVO');
  const [recordStatus, setRecordStatus] = useState<ExecutionStatusCode>('OK');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordTech, setRecordTech] = useState('A. Castellanos');
  const [recordVibration, setRecordVibration] = useState('1.2 mm/s RMS (Dentro de norma)');
  const [recordTemp, setRecordTemp] = useState(45);
  const [recordOil, setRecordOil] = useState('Buen estado - Transparente');
  const [recordObs, setRecordObs] = useState('');

  // Toast / notification feedback
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Cell rendering helpers
  const getPlannedBadgeStyle = (code?: PlannedFrequencyCode) => {
    switch (code) {
      case 'M': return 'bg-[#00A3E0] text-slate-900 font-extrabold'; // Cyan
      case 'B': return 'bg-[#1E3A8A] text-white font-extrabold'; // Dark Blue
      case 'A': return 'bg-[#00B0F0] text-slate-900 font-extrabold'; // Light Blue/Cyan
      case 'P': return 'bg-purple-600 text-white font-extrabold';
      default: return '';
    }
  };

  const getRealizedBadgeStyle = (code?: ExecutionStatusCode) => {
    switch (code) {
      case 'OK': return 'bg-[#00B050] text-white font-extrabold'; // Green
      case 'X': return 'bg-[#FF0000] text-white font-extrabold'; // Red
      case 'PROCESO': return 'bg-[#FFFF00] text-slate-900 font-extrabold'; // Yellow
      case 'EC': return 'bg-[#FFC000] text-slate-900 font-extrabold'; // Orange
      default: return '';
    }
  };

  // Filter equipment
  const filteredEquipment = calendarEquipment.filter(eq => 
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Monthly statistics calculations
  const getMonthStats = (weeks: number[]) => {
    let plannedCount = 0;
    let realizedCount = 0;

    calendarEquipment.forEach(eq => {
      if (eq.outOfService) return;
      weeks.forEach(w => {
        if (eq.planned[w]) plannedCount++;
        if (eq.realized[w] === 'OK') realizedCount++;
      });
    });

    const percent = plannedCount > 0 ? Math.round((realizedCount / plannedCount) * 100) : 0;
    return { plannedCount, realizedCount, percent };
  };

  // Form submission handler for new predictive record
  const handleSavePredictiveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEq = calendarEquipment.find(e => e.id === recordEqId);
    if (!selectedEq && !recordEqId) {
      alert('Por favor selecciona un equipo');
      return;
    }
    const eqName = selectedEq ? `${selectedEq.code} - ${selectedEq.name}` : recordEqId;

    addPredictiveRecord({
      equipmentId: recordEqId,
      equipmentName: eqName,
      weekNumber: Number(recordWeek),
      monthName: recordMonth,
      frequency: recordFreq,
      plannedCode: recordFreq === 'MENSUAL' ? 'M' : recordFreq === 'BIMESTRAL' ? 'B' : recordFreq === 'ANUAL' ? 'A' : 'P',
      executionStatus: recordStatus,
      scheduledDate: recordDate,
      completionDate: recordStatus === 'OK' ? recordDate : undefined,
      technician: recordTech,
      vibrationLevel: recordVibration,
      temperatureC: Number(recordTemp),
      oilCondition: recordOil,
      observations: recordObs || 'Registro ingresado desde formulario predictivo.'
    });

    // Update calendar cell automatically
    if (selectedEq) {
      updateCalendarCell(
        selectedEq.id, 
        Number(recordWeek), 
        'realized', 
        recordStatus
      );
    }

    triggerFeedback(`✅ Registro de Mantenimiento Predictivo guardado correctamente para ${eqName}`);
    setActiveTab('records');
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqCode || !newEqName) return;
    addEquipmentToCalendar({
      code: newEqCode,
      name: newEqName,
      assignedTechnician: newEqTech,
      outOfService: newEqOutOfService,
      notes: newEqOutOfService ? 'EQUIPO FUERA DE USO' : undefined,
      planned: {},
      realized: {}
    });
    setShowNewEquipmentModal(false);
    setNewEqCode('');
    setNewEqName('');
    triggerFeedback('✅ Nuevo equipo registrado en el calendario.');
  };

  const handleGenerateAutomaticReminders = () => {
    let count = 0;
    const currentWeek = 30; // Current operational week
    calendarEquipment.forEach(eq => {
      if (eq.outOfService) return;
      // Check current and upcoming week
      [currentWeek, currentWeek + 1].forEach(w => {
        if (eq.planned[w] && !eq.realized[w]) {
          addReminder({
            title: `Recordatorio de Mantenimiento Preventivo (Semana ${w})`,
            equipmentName: `${eq.code} - ${eq.name}`,
            weekNumber: w,
            type: 'PROXIMO',
            dueDate: `2026-07-${20 + (w - 30) * 7}`,
            urgency: w === currentWeek ? 'CRITICA' : 'ALTA',
            message: `Equipo ${eq.name} tiene programado mantenimiento (${eq.planned[w]}) en la semana ${w}.`,
            read: false,
            attended: false,
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          });
          count++;
        }
      });
    });

    triggerFeedback(`🔔 ¡Se han generado ${count} recordatorios automáticos de mantenimiento próximo!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <Zap className="text-amber-400" size={20} />
          <span className="text-sm font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#FA5210] text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wider uppercase">PERIODO 2026</span>
            <span className="text-amber-400 font-mono text-xs tracking-widest font-bold">T+H AUTOMOTIVE</span>
          </div>
          <h1 className="text-2xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
            <Calendar className="text-[#FA5210]" size={26} />
            CALENDARIO DE MANTENIMIENTOS PREVENTIVOS Y PREDICTIVOS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Programación Anual y Seguimiento Semanal de Desempeño Operativo (Semanas 1 a 52)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowNewEquipmentModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
          >
            <Plus size={16} />
            Agregar Equipo
          </button>
          <button
            onClick={handleGenerateAutomaticReminders}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FA5210] hover:bg-[#e04507] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FA5210]/30 transition-all"
          >
            <Bell size={16} />
            Generar Recordatorios
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={15} />
            Matriz de Calendario (S1 - S52)
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'records'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity size={15} />
            Historial de Registros Predictivos
            <span className="ml-1 bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {predictiveRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-[#FA5210] text-white shadow-md shadow-[#FA5210]/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 size={15} />
            Formulario de Registro Predictivo
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por equipo o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
            />
          </div>
        )}
      </div>

      {/* TAB 1: CALENDAR MATRIX */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Legend Header bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-700">
              <span className="font-bold text-slate-900 mr-2">Simbología & Códigos:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1E3A8A] text-white text-[11px] font-bold">
                B
              </span>
              <span>Bimestral Planeado</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00A3E0] text-slate-900 text-[11px] font-extrabold">
                M
              </span>
              <span>Mensual Planeado</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00B0F0] text-slate-900 text-[11px] font-extrabold">
                A
              </span>
              <span>Anual Planeado</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00B050] text-white text-[11px] font-bold">
                OK
              </span>
              <span>Realizado</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF0000] text-white text-[11px] font-bold">
                X
              </span>
              <span>No Realizado / Reprogramado</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFFF00] text-slate-900 text-[11px] font-bold">
                OK
              </span>
              <span>En Proceso</span>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFC000] text-slate-900 text-[11px] font-bold">
                EC
              </span>
              <span>Equipo Caído</span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              * Haz clic en cualquier celda para cambiar su estado interactivamente.
            </div>
          </div>

          {/* Interactive Table Container with Horizontal Scroll */}
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-md">
            <table className="w-full text-center border-collapse text-[10px]">
              <thead>
                {/* Months Row Header */}
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                  <th className="p-2 border-r border-slate-700 min-w-[160px] text-left sticky left-0 bg-slate-900 z-20">
                    Equipo / Área
                  </th>
                  <th className="p-2 border-r border-slate-700 w-16">Tipo</th>
                  {MONTHS_CONFIG.map((m) => (
                    <th 
                      key={m.name} 
                      colSpan={m.weeks.length} 
                      className="p-1.5 border-r border-slate-700 uppercase tracking-wider text-[11px] bg-slate-800"
                    >
                      {m.name}
                    </th>
                  ))}
                </tr>

                {/* Weeks Row Header */}
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-1 border-r border-slate-300 sticky left-0 bg-slate-100 z-20"></th>
                  <th className="p-1 border-r border-slate-300"></th>
                  {MONTHS_CONFIG.flatMap(m => m.weeks).map(w => (
                    <th key={w} className="p-1 border-r border-slate-200 min-w-[24px]">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredEquipment.map((eq) => {
                  if (eq.outOfService) {
                    return (
                      <tr key={eq.id} className="border-b border-slate-200 bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                        <td className="p-2 text-left font-bold text-slate-800 border-r border-slate-300 sticky left-0 bg-amber-50 z-10 flex items-center justify-between">
                          <span>{eq.code} - {eq.name}</span>
                          <button 
                            onClick={() => deleteEquipmentFromCalendar(eq.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 rounded"
                            title="Eliminar equipo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                        <td className="p-1 border-r border-slate-300 font-bold text-slate-500">
                          -
                        </td>
                        <td 
                          colSpan={52} 
                          className="p-2 font-black text-amber-800 tracking-widest text-xs uppercase text-center bg-amber-100/70 border-r border-slate-300"
                        >
                          {eq.notes || 'EQUIPO FUERA DE USO'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <React.Fragment key={eq.id}>
                      {/* Row 1: Planeado */}
                      <tr className="border-t border-slate-300 bg-white hover:bg-slate-50/80 transition-colors">
                        <td 
                          rowSpan={2} 
                          className="p-2 text-left font-bold text-slate-800 border-r border-slate-300 sticky left-0 bg-white z-10 align-middle shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-extrabold text-slate-900">{eq.code} - {eq.name}</div>
                              {eq.assignedTechnician && (
                                <div className="text-[9px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                  <User size={10} /> {eq.assignedTechnician}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => deleteEquipmentFromCalendar(eq.id)}
                              className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors"
                              title="Eliminar equipo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="p-1 font-bold text-slate-600 bg-slate-50 border-r border-slate-300 text-[9px]">
                          Planeado
                        </td>
                        {MONTHS_CONFIG.flatMap(m => m.weeks).map(w => {
                          const plannedCode = eq.planned[w];
                          return (
                            <td 
                              key={`p-${eq.id}-${w}`} 
                              onClick={() => setSelectedWeekCell({
                                equipmentId: eq.id,
                                equipmentName: `${eq.code} - ${eq.name}`,
                                weekNumber: w,
                                cellType: 'planned',
                                currentVal: plannedCode || ''
                              })}
                              className={`p-1 border-r border-slate-200 cursor-pointer hover:ring-2 hover:ring-[#FA5210] transition-all ${getPlannedBadgeStyle(plannedCode)}`}
                              title={`Semana ${w}: Planeado [${plannedCode || 'Sin asignar'}]`}
                            >
                              {plannedCode || ''}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Row 2: Realizado */}
                      <tr className="border-b border-slate-300 bg-white hover:bg-slate-50/80 transition-colors">
                        <td className="p-1 font-bold text-slate-600 bg-slate-50 border-r border-slate-300 text-[9px]">
                          Realizado
                        </td>
                        {MONTHS_CONFIG.flatMap(m => m.weeks).map(w => {
                          const realizedCode = eq.realized[w];
                          return (
                            <td 
                              key={`r-${eq.id}-${w}`} 
                              onClick={() => setSelectedWeekCell({
                                equipmentId: eq.id,
                                equipmentName: `${eq.code} - ${eq.name}`,
                                weekNumber: w,
                                cellType: 'realized',
                                currentVal: realizedCode || ''
                              })}
                              className={`p-1 border-r border-slate-200 cursor-pointer hover:ring-2 hover:ring-[#FA5210] transition-all ${getRealizedBadgeStyle(realizedCode)}`}
                              title={`Semana ${w}: Realizado [${realizedCode || 'Pendiente'}]`}
                            >
                              {realizedCode || ''}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* MONTHLY METRICS SUMMARY ROWS */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td className="p-2 text-left font-extrabold text-slate-900 border-r border-slate-300 sticky left-0 bg-slate-100 z-10" colSpan={2}>
                    Mantenimientos Planeados (M & A)
                  </td>
                  {MONTHS_CONFIG.map(m => {
                    const stats = getMonthStats(m.weeks);
                    return (
                      <td 
                        key={`m-plan-${m.name}`} 
                        colSpan={m.weeks.length} 
                        className="p-1.5 border-r border-slate-300 font-extrabold text-slate-800 text-center text-xs bg-slate-200/60"
                      >
                        {stats.plannedCount}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-slate-100 font-bold">
                  <td className="p-2 text-left font-extrabold text-slate-900 border-r border-slate-300 sticky left-0 bg-slate-100 z-10" colSpan={2}>
                    Mantenimientos Realizados (M & A)
                  </td>
                  {MONTHS_CONFIG.map(m => {
                    const stats = getMonthStats(m.weeks);
                    return (
                      <td 
                        key={`m-real-${m.name}`} 
                        colSpan={m.weeks.length} 
                        className="p-1.5 border-r border-slate-300 font-extrabold text-emerald-700 text-center text-xs bg-emerald-50/60"
                      >
                        {stats.realizedCount}
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-slate-900 text-white font-black border-b-2 border-slate-900">
                  <td className="p-2 text-left font-black text-amber-400 border-r border-slate-700 sticky left-0 bg-slate-900 z-10" colSpan={2}>
                    CUMPLIMIENTO %
                  </td>
                  {MONTHS_CONFIG.map(m => {
                    const stats = getMonthStats(m.weeks);
                    return (
                      <td 
                        key={`m-cump-${m.name}`} 
                        colSpan={m.weeks.length} 
                        className={`p-1.5 border-r border-slate-700 font-black text-center text-xs ${
                          stats.percent >= 90 ? 'text-emerald-400' : stats.percent >= 70 ? 'text-amber-400' : 'text-red-400'
                        }`}
                      >
                        {stats.percent}%
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* NOTES FOOTER SECTION MATCHING IMAGE */}
          <div className="p-5 bg-amber-100/90 border border-amber-300 rounded-2xl text-xs space-y-3 text-slate-950 shadow-sm">
            <div className="font-black text-amber-950 text-sm flex items-center gap-2 border-b border-amber-200/80 pb-2">
              <Info size={18} className="text-amber-800" />
              NOTAS Y REGLAS OPERATIVAS DEL CALENDARIO:
            </div>
            <ol className="list-decimal list-inside space-y-2 font-semibold text-slate-900 leading-relaxed">
              <li>
                <strong className="text-slate-950 font-extrabold">Para los mantenimientos preventivos con frecuencia MENSUAL:</strong> la semana es solamente referencia ya que se realiza conforme a disponibilidad del equipo siempre y cuando se realice dentro del mismo mes.
              </li>
              <li>
                <strong className="text-slate-950 font-extrabold">Para los mantenimientos preventivos con frecuencia BIMESTRAL:</strong> se valida con producción para que se pueda realizar conforme a la disponibilidad del equipo siempre y cuando se realice dentro del mismo tiempo de los 2 meses.
              </li>
              <li>
                <strong className="text-slate-950 font-extrabold">Los mantenimientos preventivos con frecuencia ANUAL:</strong> son planeados a realizarse en la última semana del año aunque pudiera realizarse antes de acuerdo a disponibilidad, siempre y cuando la frecuencia no exceda 12 meses.
              </li>
              <li>
                <strong className="text-slate-950 font-extrabold">Los mantenimientos preventivos a los troqueles y herramientas de doblez:</strong> se realiza de forma MENSUAL, en caso de que no se hayan utilizado durante el mes solamente se realiza limpieza.
              </li>
            </ol>
            <div className="pt-2 text-[11px] text-slate-700 font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-amber-300/80 mt-2 gap-1">
              <span>Last Update: 3-Sept-2025 • Updated by: Alejandro Castellanos</span>
              <span>Documento Oficial T+H Automotive • Versión 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE REGISTROS PREDICTIVOS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registros Analíticos y Mediciones Predictivas</h3>
              <p className="text-xs text-slate-500">Parámetros de temperatura, nivel de vibración RMS y análisis de lubricantes.</p>
            </div>
            <button
              onClick={() => setActiveTab('register')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FA5210] text-white text-xs font-bold rounded-xl shadow hover:bg-[#e04507] transition-all"
            >
              <Plus size={15} />
              Nuevo Registro Predictivo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictiveRecords.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEMANA {rec.weekNumber} • {rec.monthName}</span>
                    <h4 className="font-extrabold text-slate-900 text-base">{rec.equipmentName}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getRealizedBadgeStyle(rec.executionStatus)}`}>
                    {rec.executionStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Vibración RMS</span>
                    <span className="font-bold text-slate-800">{rec.vibrationLevel || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Temperatura</span>
                    <span className="font-bold text-slate-800">{rec.temperatureC ? `${rec.temperatureC} °C` : 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[10px] block">Aceite / Lubricación</span>
                    <span className="font-medium text-slate-700">{rec.oilCondition || 'N/A'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  "{rec.observations}"
                </p>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <User size={12} /> {rec.technician}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]">{rec.scheduledDate}</span>
                    <button 
                      onClick={() => deletePredictiveRecord(rec.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FORMULARIO DE REGISTRO PREDICTIVO / PREVENTIVO */}
      {activeTab === 'register' && (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Edit3 className="text-[#FA5210]" size={20} />
              Formulario de Registro de Mantenimiento Predictivo & Preventivo
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Captura las mediciones de campo (vibración, temperatura, condición de lubricación) e impacta directamente en el calendario.
            </p>
          </div>

          <form onSubmit={handleSavePredictiveRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipo / Máquina *</label>
                <select
                  value={recordEqId}
                  onChange={(e) => setRecordEqId(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FA5210] focus:bg-white"
                >
                  <option value="">-- Seleccionar Equipo --</option>
                  {calendarEquipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} - {eq.name} {eq.outOfService ? '(FUERA DE USO)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mes y Semana Operativa *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={recordMonth}
                    onChange={(e) => setRecordMonth(e.target.value)}
                    className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {MONTHS_CONFIG.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={recordWeek}
                    onChange={(e) => setRecordWeek(Number(e.target.value))}
                    required
                    placeholder="Semana (1-52)"
                    className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frecuencia Planeada</label>
                <select
                  value={recordFreq}
                  onChange={(e) => setRecordFreq(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="MENSUAL">MENSUAL (M)</option>
                  <option value="BIMESTRAL">BIMESTRAL (B)</option>
                  <option value="ANUAL">ANUAL (A)</option>
                  <option value="PREDICTIVO">PREDICTIVO (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Ejecución *</label>
                <select
                  value={recordStatus}
                  onChange={(e) => setRecordStatus(e.target.value as ExecutionStatusCode)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="OK">OK - Mantenimiento Realizado</option>
                  <option value="X">X - No Realizado (Reprogramado)</option>
                  <option value="PROCESO">OK (Amarillo) - En Proceso</option>
                  <option value="EC">EC - Equipo Caído</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Técnico Responsable</label>
                <input
                  type="text"
                  value={recordTech}
                  onChange={(e) => setRecordTech(e.target.value)}
                  required
                  placeholder="Ej. A. Castellanos"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Programada / Ejecución</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* PREDICTIVE MEASUREMENTS SECTION */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                Mediciones de Diagnóstico Predictivo
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nivel Vibración (RMS)</label>
                  <input
                    type="text"
                    value={recordVibration}
                    onChange={(e) => setRecordVibration(e.target.value)}
                    placeholder="Ej. 1.2 mm/s"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    value={recordTemp}
                    onChange={(e) => setRecordTemp(Number(e.target.value))}
                    placeholder="Ej. 45"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Aceite / Lub</label>
                  <input
                    type="text"
                    value={recordOil}
                    onChange={(e) => setRecordOil(e.target.value)}
                    placeholder="Ej. Limpio / Dieléctrico OK"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones / Recomendaciones Técnicas</label>
              <textarea
                rows={3}
                value={recordObs}
                onChange={(e) => setRecordObs(e.target.value)}
                placeholder="Detalla hallazgos de desgaste, componentes sustituidos o razones de reprogramación..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#FA5210]"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#FA5210] hover:bg-[#e04507] rounded-xl shadow-lg shadow-[#FA5210]/30 transition-all flex items-center gap-2"
              >
                <Check size={16} />
                Guardar e Impactar Calendario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CELL CLICKER MODAL */}
      {selectedWeekCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">SEMANA {selectedWeekCell.weekNumber}</span>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedWeekCell.equipmentName}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Actualizar Celda ({selectedWeekCell.cellType === 'planned' ? 'Planeado' : 'Realizado'})
                </span>
              </div>
              <button onClick={() => setSelectedWeekCell(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {selectedWeekCell.cellType === 'planned' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'planned', 'M');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#00A3E0] text-slate-900 font-black text-xs hover:opacity-90"
                >
                  M - Mensual
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'planned', 'B');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#1E3A8A] text-white font-black text-xs hover:opacity-90"
                >
                  B - Bimestral
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'planned', 'A');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#00B0F0] text-slate-900 font-black text-xs hover:opacity-90"
                >
                  A - Anual
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'planned', '');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
                >
                  Vaciar Celda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'realized', 'OK');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#00B050] text-white font-black text-xs hover:opacity-90"
                >
                  OK - Realizado
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'realized', 'X');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#FF0000] text-white font-black text-xs hover:opacity-90"
                >
                  X - Reprogramado
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'realized', 'PROCESO');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#FFFF00] text-slate-900 font-black text-xs hover:opacity-90"
                >
                  OK - En Proceso
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'realized', 'EC');
                    setSelectedWeekCell(null);
                  }}
                  className="p-3 rounded-xl bg-[#FFC000] text-slate-900 font-black text-xs hover:opacity-90"
                >
                  EC - Equipo Caído
                </button>
                <button
                  onClick={() => {
                    updateCalendarCell(selectedWeekCell.equipmentId, selectedWeekCell.weekNumber, 'realized', '');
                    setSelectedWeekCell(null);
                  }}
                  className="col-span-2 p-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
                >
                  Vaciar Estado Realizado
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW EQUIPMENT MODAL */}
      {showNewEquipmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Agregar Nuevo Equipo al Calendario</h3>
              <button onClick={() => setShowNewEquipmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Código de Equipo *</label>
                <input
                  type="text"
                  value={newEqCode}
                  onChange={(e) => setNewEqCode(e.target.value)}
                  placeholder="Ej. 5213"
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Equipo *</label>
                <input
                  type="text"
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  placeholder="Ej. Torno CNC Haas"
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Técnico Asignado</label>
                <input
                  type="text"
                  value={newEqTech}
                  onChange={(e) => setNewEqTech(e.target.value)}
                  placeholder="Ej. A. Castellanos"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="outOfServCheck"
                  checked={newEqOutOfService}
                  onChange={(e) => setNewEqOutOfService(e.target.checked)}
                  className="rounded text-[#FA5210] focus:ring-[#FA5210]"
                />
                <label htmlFor="outOfServCheck" className="text-xs font-bold text-slate-700">
                  Marcar como "EQUIPO FUERA DE USO"
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewEquipmentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#FA5210] rounded-xl shadow"
                >
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
