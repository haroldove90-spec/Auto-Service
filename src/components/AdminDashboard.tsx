import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Briefcase, FileText, Settings, Users, AlertTriangle, 
  Plus, Search, Download, Trash, Check, X, Shield, RefreshCw, Layers, Award,
  Calendar, Clock, Activity, CheckSquare, Zap, BarChart2, Wrench
} from 'lucide-react';
import { 
  Client, Vehicle, Employee, InventoryItem, Supplier, ServiceOrder, Transaction, 
  WorkshopSettings, PurchaseOrder, MaintenanceOrder, EquipmentCalendarRow, 
  PredictiveMaintenanceRecord, MaintenanceReminder, HistoricalMaintenanceOrder, PlannedFrequencyCode, ExecutionStatusCode 
} from '../types';
import MaintenanceOrdersModule from './MaintenanceOrdersModule';
import PredictiveCalendarModule from './PredictiveCalendarModule';
import RemindersModule from './RemindersModule';
import { HistoricalOrdersModule } from './HistoricalOrdersModule';

interface AdminDashboardProps {
  clients: Client[];
  vehicles: Vehicle[];
  employees: Employee[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  orders: ServiceOrder[];
  maintenanceOrders?: MaintenanceOrder[];
  addMaintenanceOrder?: (order: Omit<MaintenanceOrder, 'id' | 'folio'>) => MaintenanceOrder;
  updateMaintenanceOrder?: (id: string, order: Partial<MaintenanceOrder>) => void;
  deleteMaintenanceOrder?: (id: string) => void;
  
  // Predictive Calendar & Reminders props
  calendarEquipment?: EquipmentCalendarRow[];
  predictiveRecords?: PredictiveMaintenanceRecord[];
  reminders?: MaintenanceReminder[];
  addEquipmentToCalendar?: (eq: Omit<EquipmentCalendarRow, 'id'>) => EquipmentCalendarRow;
  updateCalendarCell?: (
    equipmentId: string, 
    weekNumber: number, 
    cellType: 'planned' | 'realized', 
    value: PlannedFrequencyCode | ExecutionStatusCode | ''
  ) => void;
  updateEquipmentDetails?: (id: string, partial: Partial<EquipmentCalendarRow>) => void;
  deleteEquipmentFromCalendar?: (id: string) => void;
  addPredictiveRecord?: (rec: Omit<PredictiveMaintenanceRecord, 'id'>) => PredictiveMaintenanceRecord;
  deletePredictiveRecord?: (id: string) => void;
  addReminder?: (rem: Omit<MaintenanceReminder, 'id'>) => MaintenanceReminder;
  markReminderAttended?: (id: string) => void;
  markReminderRead?: (id: string) => void;
  deleteReminder?: (id: string) => void;

  // Historical Orders props
  historicalOrders?: HistoricalMaintenanceOrder[];
  addHistoricalOrder?: (order: Omit<HistoricalMaintenanceOrder, 'id'>) => void;
  updateHistoricalOrder?: (id: string, updated: Partial<HistoricalMaintenanceOrder>) => void;
  deleteHistoricalOrder?: (id: string) => void;

  transactions: Transaction[];
  purchaseOrders: PurchaseOrder[];
  settings: WorkshopSettings;
  setSettings: (s: WorkshopSettings) => void;
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  updateEmployee: (e: Employee) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  handleClientCreditPayment: (clientId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => void;
  resetDatabase: () => void;
  activeTab?: 'mantenimiento' | 'calendario_predic' | 'recordatorios' | 'historial_ordenes' | 'personnel' | 'config';
  setActiveTab?: (tab: 'mantenimiento' | 'calendario_predic' | 'recordatorios' | 'historial_ordenes' | 'personnel' | 'config') => void;
}

export default function AdminDashboard({
  clients,
  vehicles,
  employees,
  inventory,
  suppliers,
  orders,
  maintenanceOrders = [],
  addMaintenanceOrder = () => ({} as any),
  updateMaintenanceOrder = () => {},
  deleteMaintenanceOrder = () => {},
  calendarEquipment = [],
  predictiveRecords = [],
  reminders = [],
  addEquipmentToCalendar = () => ({} as any),
  updateCalendarCell = () => {},
  updateEquipmentDetails = () => {},
  deleteEquipmentFromCalendar = () => {},
  addPredictiveRecord = () => ({} as any),
  deletePredictiveRecord = () => {},
  addReminder = () => ({} as any),
  markReminderAttended = () => {},
  markReminderRead = () => {},
  deleteReminder = () => {},
  historicalOrders = [],
  addHistoricalOrder = () => {},
  updateHistoricalOrder = () => {},
  deleteHistoricalOrder = () => {},
  transactions,
  purchaseOrders,
  settings,
  setSettings,
  addEmployee,
  updateEmployee,
  addTransaction,
  handleClientCreditPayment,
  resetDatabase,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab
}: AdminDashboardProps) {
  const [localTab, setLocalTab] = useState<'mantenimiento' | 'calendario_predic' | 'recordatorios' | 'historial_ordenes' | 'personnel' | 'config'>('calendario_predic');
  const activeTab = propActiveTab || localTab;
  const setActiveTab = propSetActiveTab || setLocalTab;

  
  // Interactive Master Calendar states
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedCalendarOrder, setSelectedCalendarOrder] = useState<ServiceOrder | null>(null);

  // Automatic triggers states
  const [schedVehicleId, setSchedVehicleId] = useState(vehicles[0]?.id || '');
  const [schedServiceType, setSchedServiceType] = useState('Afinación Mayor');
  const [schedTriggerType, setSchedTriggerType] = useState<'fecha' | 'uso'>('fecha');
  const [schedValue, setSchedValue] = useState('2026-08-01');
  const [scheduledPreventives, setScheduledPreventives] = useState<{
    id: string;
    vehicleId: string;
    serviceType: string;
    trigger: string;
    status: 'Pendiente' | 'Generado';
  }[]>([
    { id: 'prev-1', vehicleId: 'veh-1', serviceType: 'Afinación Mayor (60k km)', trigger: 'Cada 10,000 km (Uso)', status: 'Pendiente' },
    { id: 'prev-2', vehicleId: 'veh-2', serviceType: 'Inspección de Frenos y Suspensión', trigger: '2026-08-15 (Calendario)', status: 'Pendiente' },
    { id: 'prev-3', vehicleId: 'veh-3', serviceType: 'Cambio de Aceite Sintético', trigger: 'Cada 5,000 km (Uso)', status: 'Pendiente' }
  ]);
  
  const [approvedCorrectiveIds, setApprovedCorrectiveIds] = useState<string[]>([]);
  
  // Financial metrics calculations
  const totalIncome = transactions
    .filter(t => t.type === 'Ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Closed vs Active orders
  const activeOrders = orders.filter(o => o.status !== 'Listo_Entrega').length;
  const closedOrders = orders.filter(o => o.status === 'Listo_Entrega').length;

  // Average Ticket Size (derived from payments in completed orders)
  const completedOrdersWithPayments = orders.filter(o => o.payments.length > 0);
  const totalPaymentsFromOrders = completedOrdersWithPayments.reduce((sum, o) => {
    return sum + o.payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);
  const avgTicket = completedOrdersWithPayments.length > 0 
    ? Math.round(totalPaymentsFromOrders / completedOrdersWithPayments.length) 
    : 0;

  // Stock alerts
  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  // Mechanic Productivity calculation (horas facturadas vs horas trabajadas)
  // Billed Hours = Sum of qty of labor line items for completed orders
  // Worked Hours = Actual clock-in clocked accumulated hours
  const mechanics = employees.filter(e => e.role === 'Mecanico' && e.active);
  const mechanicProductivity = mechanics.map(mech => {
    const mechOrders = orders.filter(o => o.mechanicId === mech.id);
    
    // Total hours clocked in
    const hoursWorked = mechOrders.reduce((sum, o) => sum + o.totalHoursWorked, 0);

    // Total hours billed (approved labor item quantity * unitPrice)
    // For simplicity, let's look at approved labor item quantities
    const hoursBilled = mechOrders.reduce((sum, o) => {
      if (o.status === 'Listo_Entrega') {
        const laborQty = o.items
          .filter(item => item.type === 'mano_de_obra' && item.approved)
          .reduce((itemSum, item) => itemSum + item.qty, 0);
        return sum + laborQty;
      }
      return sum;
    }, 0);

    // Commission earned: sum of (labor approved line prices * commission rate) for completed orders
    const commissionsEarned = mechOrders.reduce((sum, o) => {
      if (o.status === 'Listo_Entrega') {
        const totalLaborApproved = o.items
          .filter(item => item.type === 'mano_de_obra' && item.approved)
          .reduce((itemSum, item) => itemSum + (item.qty * item.unitPrice), 0);
        return sum + (totalLaborApproved * (mech.commissionRate / 100));
      }
      return sum;
    }, 0);

    return {
      name: mech.name,
      worked: parseFloat(hoursWorked.toFixed(1)),
      billed: hoursBilled || 2, // fallback for mock data rendering if 0
      commissions: commissionsEarned
    };
  });

  // State for Personnel Modal / Fields
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<'Cajero' | 'Asesor' | 'Mecanico'>('Mecanico');
  const [newEmpCommission, setNewEmpCommission] = useState(15);
  const [newEmpPhone, setNewEmpPhone] = useState('');

  // State for Credit Payment Modal
  const [selectedCreditClient, setSelectedCreditClient] = useState<Client | null>(null);
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);
  const [creditPaymentMethod, setCreditPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');

  // State for Manual Transaction
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txType, setTxType] = useState<'Ingreso' | 'Egreso'>('Egreso');
  const [txCategory, setTxCategory] = useState<'Nomina' | 'Servicios' | 'Proveedor' | 'Otros'>('Otros');
  const [txAmount, setTxAmount] = useState(0);
  const [txDesc, setTxDesc] = useState('');

  // State for Settings Form
  const [settingsForm, setSettingsForm] = useState<WorkshopSettings>(settings);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(settingsForm);
    alert('Configuración maestra guardada con éxito.');
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPhone) return;
    addEmployee({
      name: newEmpName,
      role: newEmpRole,
      commissionRate: newEmpRole === 'Cajero' ? 0 : newEmpCommission,
      active: true,
      phone: newEmpPhone
    });
    setNewEmpName('');
    setNewEmpPhone('');
    setShowAddEmpModal(false);
  };

  const handleRegisterCreditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditClient || creditPaymentAmount <= 0) return;
    handleClientCreditPayment(selectedCreditClient.id, creditPaymentAmount, creditPaymentMethod);
    setSelectedCreditClient(null);
    setCreditPaymentAmount(0);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0 || !txDesc) return;
    addTransaction({
      type: txType,
      category: txCategory,
      amount: txAmount,
      description: txDesc
    });
    setTxAmount(0);
    setTxDesc('');
    setShowAddTxModal(false);
  };

  // Export transactions to CSV
  const exportTransactionsToCSV = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.category,
      `$${t.amount}`,
      t.description.replace(/,/g, ' ')
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Financiero_AutoService_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Tab Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        {/* Mobile/Tablet Dropdown Select */}
        <div className="block lg:hidden w-full">
          <label htmlFor="admin-mobile-tab-select" className="block text-xs font-bold text-slate-500 mb-1">Módulo del Administrador</label>
          <select
            id="admin-mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA5210]"
          >
            <option value="calendario_predic">📅 Calendario de Mantenimiento Predictivo (Mensual & Anual)</option>
            <option value="recordatorios">🔔 Recordatorios y Alertas</option>
            <option value="historial_ordenes">📊 Historial Órdenes de Mantenimiento (Archivo 2025/2026)</option>
            <option value="mantenimiento">📋 Órdenes de Trabajo MT0301F1</option>
            <option value="personnel">👥 Personal u Operarios</option>
            <option value="config">⚙️ Configuración Maestra</option>
          </select>
        </div>

        {/* Desktop Horizontal Tabs Menu */}
        <div className="hidden lg:flex gap-2 flex-wrap">
          <button
            id="tab-calendario-predic"
            onClick={() => setActiveTab('calendario_predic')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'calendario_predic'
                ? 'bg-[#FA5210] text-white shadow-md shadow-[#FA5210]/20 ring-2 ring-[#FA5210]/30'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} />
            Calendario Mantenimiento Predictivo (2026)
          </button>
          <button
            id="tab-recordatorios"
            onClick={() => setActiveTab('recordatorios')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'recordatorios'
                ? 'bg-[#FA5210] text-white shadow-md shadow-[#FA5210]/20 ring-2 ring-[#FA5210]/30'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Zap size={16} />
            Recordatorios y Alertas
            {reminders.filter(r => !r.attended).length > 0 && (
              <span className="ml-1 bg-white text-red-600 px-1.5 py-0.2 rounded-full text-[10px] font-black shadow-sm">
                {reminders.filter(r => !r.attended).length}
              </span>
            )}
          </button>
          <button
            id="tab-mantenimiento"
            onClick={() => setActiveTab('mantenimiento')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'mantenimiento'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText size={16} />
            Órdenes de Trabajo MT0301F1
          </button>
          <button
            id="tab-historial-ordenes"
            onClick={() => setActiveTab('historial_ordenes')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'historial_ordenes'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers size={16} />
            Historial Órdenes Mantenimiento
          </button>
          <button
            id="tab-personnel"
            onClick={() => setActiveTab('personnel')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'personnel'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={16} />
            Personal
          </button>
          <button
            id="tab-config"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'config'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings size={16} />
            Configuración
          </button>
        </div>

        
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
          <span className="text-xs text-slate-400 block lg:hidden font-medium">Panel General</span>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro de restablecer todos los datos del taller a los valores de prueba originales? Se perderán los cambios de esta sesión.')) {
                resetDatabase();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
          >
            <RefreshCw size={12} />
            Reiniciar Demo
          </button>
        </div>
      </div>

      {/* PREDICTIVE CALENDAR TAB */}
      {activeTab === 'calendario_predic' && (
        <PredictiveCalendarModule
          calendarEquipment={calendarEquipment}
          predictiveRecords={predictiveRecords}
          addEquipmentToCalendar={addEquipmentToCalendar}
          updateCalendarCell={updateCalendarCell}
          updateEquipmentDetails={updateEquipmentDetails}
          deleteEquipmentFromCalendar={deleteEquipmentFromCalendar}
          addPredictiveRecord={addPredictiveRecord}
          deletePredictiveRecord={deletePredictiveRecord}
          addReminder={addReminder}
        />
      )}

      {/* REMINDERS & ALERTS TAB */}
      {activeTab === 'recordatorios' && (
        <RemindersModule
          reminders={reminders}
          addReminder={addReminder}
          markReminderAttended={markReminderAttended}
          markReminderRead={markReminderRead}
          deleteReminder={deleteReminder}
          addMaintenanceOrder={addMaintenanceOrder}
          navigateToOT={() => setActiveTab('mantenimiento')}
        />
      )}

      {/* MAINTENANCE ORDERS TAB */}
      {activeTab === 'mantenimiento' && (
        <MaintenanceOrdersModule
          maintenanceOrders={maintenanceOrders}
          addMaintenanceOrder={addMaintenanceOrder}
          updateMaintenanceOrder={updateMaintenanceOrder}
          deleteMaintenanceOrder={deleteMaintenanceOrder}
        />
      )}

      {/* HISTORICAL MAINTENANCE ORDERS TAB */}
      {activeTab === 'historial_ordenes' && (
        <HistoricalOrdersModule
          historicalOrders={historicalOrders}
          addHistoricalOrder={addHistoricalOrder}
          updateHistoricalOrder={updateHistoricalOrder}
          deleteHistoricalOrder={deleteHistoricalOrder}
        />
      )}


      {/* METRICS & KPIs TAB */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturación Mensual</p>
                <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">
                  ${totalIncome.toLocaleString('es-MX')} MXN
                </h3>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +14.8% vs plan estratégico
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilidad Neta</p>
                <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">
                  ${netProfit.toLocaleString('es-MX')} MXN
                </h3>
                <span className="text-xs text-slate-500 mt-1">
                  Margen: {totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0}% sobre operado
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Promedio</p>
                <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">
                  ${avgTicket.toLocaleString('es-MX')} MXN
                </h3>
                <span className="text-xs text-slate-500 mt-1">
                  Eficiencia de mezcla comercial
                </span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Órdenes Activas vs Cerradas</p>
                <h3 className="text-2xl font-bold font-display text-slate-800 mt-1">
                  {activeOrders} / {closedOrders}
                </h3>
                <span className="text-xs text-slate-500 mt-1">
                  Total registradas: {orders.length}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Briefcase size={24} />
              </div>
            </div>
          </div>

          {/* MODULE A: OEE REPORTING, MTBF, MTTR & RELIABILITY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* OEE REPORT CARD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 font-display flex items-center gap-1.5">
                    <Activity size={18} className="text-[#FA5210]" />
                    Reporte de Eficiencia General del Taller (OEE)
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-xs animate-pulse">
                    OEE Actual: 80.2%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  El indicador OEE mide de manera holística la productividad del taller bajo el estándar de manufactura y servicio de clase mundial:
                  <span className="block font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-700 text-center my-2 font-bold text-[11px]">
                    OEE (%) = Disponibilidad × Rendimiento × Calidad
                  </span>
                </p>

                {/* The OEE Equation Components */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  {/* Disponibilidad */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">Disponibilidad</p>
                    <p className="text-2xl font-extrabold text-indigo-600 mt-1">94.5%</p>
                    <p className="text-[10px] text-slate-400 mt-1">Tiempo real operado vs programado en taller</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '94.5%' }}></div>
                    </div>
                  </div>

                  {/* Rendimiento */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">Rendimiento</p>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">87.8%</p>
                    <p className="text-[10px] text-slate-400 mt-1">Horas facturadas vs reales registradas</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '87.8%' }}></div>
                    </div>
                  </div>

                  {/* Calidad */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">Calidad</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">96.5%</p>
                    <p className="text-[10px] text-slate-400 mt-1">Vehículos entregados sin retrabajo / reclamo</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-50 h-1.5 rounded-full" style={{ width: '96.5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start mt-2">
                <Zap size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-900">Análisis Ejecutivo de OEE</p>
                  <p className="text-emerald-700 leading-relaxed mt-0.5">
                    Con un <strong className="font-bold">OEE de 80.2%</strong>, el taller se encuentra a un 4.8% de alcanzar la meta de clase mundial (85.0%). El principal cuello de botella se ubica en el <strong className="font-bold">Rendimiento (87.8%)</strong>, originado por los tiempos muertos en la espera de autorizaciones de presupuestos y refacciones.
                  </p>
                </div>
              </div>
            </div>

            {/* RELIABILITY INDICATORS: MTBF & MTTR */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-4">
                  <Clock size={18} className="text-[#FA5210]" />
                  Confiabilidad y Mantenibilidad
                </h4>

                {/* MTBF */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-slate-700">MTBF (Tiempo Medio Entre Fallas)</p>
                      <p className="text-[10px] text-slate-400">Intervalo promedio en que un vehículo reingresa por falla correctiva</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold font-mono text-[#FA5210]">184.2 Hrs</p>
                    </div>
                  </div>
                  {/* Tiny simulated sparkline bar */}
                  <div className="flex items-end gap-1 h-8 pt-1">
                    {[35, 45, 52, 40, 58, 62, 70, 65, 80, 75, 88].map((val, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-sm ${i === 10 ? 'bg-[#FA5210]' : 'bg-orange-100'}`} 
                        style={{ height: `${val}%` }}
                        title={`Mes ${i + 1}: ${val * 2} hrs`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* MTTR */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-slate-700">MTTR (Tiempo Medio de Reparación)</p>
                      <p className="text-[10px] text-slate-400">Tiempo transcurrido desde el diagnóstico hasta liberar la reparación</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold font-mono text-[#FA5210]">3.8 Hrs</p>
                    </div>
                  </div>
                  {/* Tiny simulated sparkline bar */}
                  <div className="flex items-end gap-1 h-8 pt-1">
                    {[80, 75, 70, 65, 58, 52, 48, 44, 40, 38, 38].map((val, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-sm ${i === 10 ? 'bg-[#FA5210]' : 'bg-orange-100'}`} 
                        style={{ height: `${val}%` }}
                        title={`Mes ${i + 1}: ${val / 10} hrs`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
                *Cálculo automatizado en base a la fecha/hora de ingreso, apertura y cierre de órdenes en bahías mecánicas.
              </div>
            </div>
          </div>

          {/* PARETO DIAGRAM (CAUSE ANALYSIS) & TIEMPOS MUERTOS ANALYSIS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PARETO DIAGRAM (80/20) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-bold text-slate-800 font-display">Gráfica de Pareto Integrada (Análisis 80/20)</h4>
                  <p className="text-xs text-slate-500">Clasificación de fallas recurrentes para identificar el 20% de causas que provocan el 80% de paros</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-semibold bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                  Ley de Pareto Activa
                </div>
              </div>

              {/* Advanced Custom SVG Pareto Graph with bars and cumulative percentage line */}
              <div className="space-y-4 pt-2">
                {[
                  { label: 'Sistema de Frenos (Esponjoso/Fuga)', count: 32, percentage: 38, cumulative: 38 },
                  { label: 'Afinación / Falla de Combustión', count: 21, percentage: 25, cumulative: 63 },
                  { label: 'Suspensión y Amortiguación', count: 15, percentage: 18, cumulative: 81 },
                  { label: 'Sistema Eléctrico / Sensores', count: 10, percentage: 12, cumulative: 93 },
                  { label: 'Enfriamiento / Fugas Radiador', count: 6, percentage: 7, cumulative: 100 }
                ].map((item, index) => {
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1 rounded">#{index + 1}</span>
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">{item.count} casos ({item.percentage}%)</span>
                          <span className="font-bold text-[#FA5210] bg-[#FA5210]/5 px-1.5 py-0.2 rounded">Acum: {item.cumulative}%</span>
                        </div>
                      </div>

                      <div className="relative flex items-center">
                        {/* Bars representing individual percentage */}
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
                          <div 
                            className={`h-4 rounded-full transition-all duration-500 ${
                              item.cumulative <= 81 ? 'bg-[#FA5210]' : 'bg-[#FA5210]/30'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                          
                          {/* Overlay representation of cumulative line path */}
                          <div 
                            className="absolute inset-y-0 right-0 bg-[#8D6A28]/20 transition-all duration-500 border-l border-dashed border-[#8D6A28]" 
                            style={{ left: `${100 - item.cumulative}%` }}
                            title="Porcentaje acumulado de problemas"
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900 leading-relaxed flex gap-2">
                <AlertTriangle size={16} className="text-[#8D6A28] shrink-0 mt-0.5" />
                <p>
                  <strong className="font-bold">Análisis de Causa Raíz:</strong> Frenos, Afinación y Suspensión representan el <strong className="font-bold">81% del total de las fallas</strong> atendidas en el taller. Alejandro Castellanos debe priorizar stock en balatas, bujías y amortiguadores para agilizar el MTTR de estas 3 familias.
                </p>
              </div>
            </div>

            {/* TIEMPOS MUERTOS ANALYSIS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-4">
                  <AlertTriangle size={18} className="text-amber-500" />
                  Análisis de Tiempos Muertos
                </h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Distribución visual de los paros de trabajo activos en bahías que merman la eficiencia operativa:
                </p>

                <div className="space-y-4">
                  {[
                    { reason: 'Espera de Refacciones', pct: 45, color: 'bg-red-500', count: '18.4 hrs acum.' },
                    { reason: 'Falta de Herramienta Especial', pct: 20, color: 'bg-amber-500', count: '8.2 hrs acum.' },
                    { reason: 'Espera de Autorización del Cliente', pct: 25, color: 'bg-indigo-600', count: '10.5 hrs acum.' },
                    { reason: 'Dudas Técnicas / Esquemas', pct: 10, color: 'bg-slate-400', count: '4.1 hrs acum.' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.reason}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`${item.color} h-2.5 rounded-full transition-all duration-500`} 
                          style={{ width: `${item.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Total tiempo de paro registrado: 41.2 Hrs</span>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                  ● 3 órdenes pausadas actualmente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLANIFICACIÓN Y MANTENIMIENTO PREVENTIVO TAB */}
      {activeTab === 'preventive' && (
        <div className="space-y-6">
          {/* Top Info Header */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-lg font-bold font-display flex items-center gap-2 text-[#FA5210]">
                <Calendar size={20} />
                Planificación Estratégica y Calendario Maestro
              </h4>
              <p className="text-xs text-slate-400">
                Administra citas en bahías, programa mantenimientos periódicos y aprueba órdenes de trabajo correctivas de urgencia.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-[#FA5210]/20 text-[#FA5210] border border-[#FA5210]/30 px-3 py-1 rounded-lg">
                Gerencia: Alejandro Castellanos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MASTER INTERACTIVE CALENDAR (Col-Span 2) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h5 className="font-bold text-slate-800">Calendario Maestro de Bahías</h5>
                  <p className="text-[11px] text-slate-500">Distribución de servicios activos y preventivos programados</p>
                </div>
                {/* View toggles */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-end">
                  {(['month', 'week', 'day'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCalendarView(view)}
                      className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${
                        calendarView === view 
                          ? 'bg-white text-slate-800 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {view === 'month' ? 'Mes' : view === 'week' ? 'Semana' : 'Día'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar Grid Representation */}
              {calendarView === 'month' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 font-display">Julio 2026</span>
                    <span className="text-[10px] text-slate-400">7 Bahías de Trabajo Activas</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 border-b border-slate-100 pb-1">
                    <span>Lunes</span><span>Martes</span><span>Miércoles</span><span>Jueves</span><span>Viernes</span><span>Sábado</span><span>Domingo</span>
                  </div>

                  {/* Calendar Days representing 28 days of month */}
                  <div className="grid grid-cols-7 gap-2.5 min-h-[220px]">
                    {Array.from({ length: 28 }).map((_, index) => {
                      const dayNumber = index + 1;
                      
                      // Map some fake service associations for the calendar visual
                      let matchedOrders = [] as ServiceOrder[];
                      if (dayNumber === 16 && orders.length > 0) matchedOrders = [orders[0]];
                      if (dayNumber === 17 && orders.length > 1) matchedOrders = [orders[1]];
                      if (dayNumber === 20 && orders.length > 2) matchedOrders = [orders[2]];
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-1.5 border rounded-lg min-h-[60px] flex flex-col justify-between transition-all ${
                            dayNumber === 16 
                              ? 'bg-orange-50/50 border-[#FA5210] ring-1 ring-[#FA5210]/20' 
                              : 'bg-slate-50/20 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${
                            dayNumber === 16 ? 'text-[#FA5210]' : 'text-slate-400'
                          }`}>
                            {dayNumber}
                          </span>

                          <div className="space-y-1">
                            {matchedOrders.map((o) => (
                              <button
                                key={o.id}
                                onClick={() => setSelectedCalendarOrder(o)}
                                className="w-full text-left p-0.5 px-1 rounded text-[9px] truncate font-semibold block transition-all hover:scale-105"
                                style={{
                                  backgroundColor: o.status === 'Listo_Entrega' ? '#DEF7EC' : '#FEF3C7',
                                  color: o.status === 'Listo_Entrega' ? '#03543F' : '#78350F',
                                  borderLeft: `2.5px solid ${o.status === 'Listo_Entrega' ? '#10B981' : '#F59E0B'}`
                                }}
                                title={`${o.id}: ${o.vehicleId}`}
                              >
                                {o.id} ({o.vehicleId.split('-')[1] || o.vehicleId})
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarView === 'week' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium">Cronograma de la Semana Actual (Bahía 1 a 7)</p>
                  <div className="space-y-2">
                    {orders.slice(0, 4).map((o, index) => {
                      const clientObj = clients.find(c => c.id === o.clientId);
                      const vehicleObj = vehicles.find(v => v.id === o.vehicleId);
                      return (
                        <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#FA5210] bg-orange-100 px-2 py-0.5 rounded text-[10px]">{o.id}</span>
                            <div>
                              <p className="font-bold text-slate-800">{vehicleObj?.brand} {vehicleObj?.model} ({vehicleObj?.plate})</p>
                              <p className="text-[10px] text-slate-500">Cliente: {clientObj?.name} • Mecánico Asignado: {o.mechanicId || 'Sin asignar'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'Listo_Entrega' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarView === 'day' && (
                <div className="space-y-3 text-center py-6 text-slate-500">
                  <p className="text-xs">No hay citas agendadas adicionales para hoy.</p>
                  <button 
                    onClick={() => setCalendarView('month')}
                    className="px-3 py-1.5 bg-[#FA5210] text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all"
                  >
                    Volver a Vista Mensual
                  </button>
                </div>
              )}

              {/* CALENDAR ORDER DETAILED MODAL */}
              {selectedCalendarOrder && (
                <div className="p-4 bg-slate-50 border border-orange-200 rounded-xl relative space-y-3">
                  <button
                    onClick={() => setSelectedCalendarOrder(null)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                  <h6 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-[10px] bg-[#FA5210] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                      {selectedCalendarOrder.id}
                    </span>
                    Detalles de Orden de Trabajo en Calendario
                  </h6>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Cliente & Vehículo</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {clients.find(c => c.id === selectedCalendarOrder.clientId)?.name || 'Desconocido'}
                      </p>
                      <p className="text-slate-500 font-medium">
                        {vehicles.find(v => v.id === selectedCalendarOrder.vehicleId)?.brand} {vehicles.find(v => v.id === selectedCalendarOrder.vehicleId)?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Mecánico y Horas</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        {employees.find(e => e.id === selectedCalendarOrder.mechanicId)?.name || 'Sin Asignar'}
                      </p>
                      <p className="text-slate-500 font-mono">
                        Acumulado: {selectedCalendarOrder.totalHoursWorked} hrs de labor
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Monto estimado: <strong>${selectedCalendarOrder.items.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0).toLocaleString()} MXN</strong></span>
                    <button
                      onClick={() => {
                        alert('Redireccionando al panel de asignación...');
                        setSelectedCalendarOrder(null);
                      }}
                      className="px-3 py-1 bg-[#FA5210] text-white font-bold text-[11px] rounded-lg hover:bg-orange-600 transition-all"
                    >
                      Ver en Panel de Tareas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PREVENTIVE AUTOMATIC TRIGGERS & CORRECTIVE APPROVAL */}
            <div className="space-y-6">
              
              {/* AUTOMATIC PREVENTIVE TRIGGERS */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap size={16} className="text-[#FA5210]" />
                    Disparadores Automáticos (Preventivos)
                  </h5>
                  <p className="text-[11px] text-slate-500">Programa generación automática de OTs por fecha o uso (kilometraje)</p>
                </div>

                {/* Form to schedule a trigger */}
                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-150 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Vehículo de Cliente</label>
                    <select
                      value={schedVehicleId}
                      onChange={(e) => setSchedVehicleId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Disparar por</label>
                      <select
                        value={schedTriggerType}
                        onChange={(e) => setSchedTriggerType(e.target.value as 'fecha' | 'uso')}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="fecha">Fecha Calendario</option>
                        <option value="uso">Kilometraje (Uso)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Valor Umbral</label>
                      <input
                        type={schedTriggerType === 'fecha' ? 'date' : 'number'}
                        value={schedValue}
                        onChange={(e) => setSchedValue(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                        placeholder="Ej: 10000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Servicio a Generar</label>
                    <select
                      value={schedServiceType}
                      onChange={(e) => setSchedServiceType(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="Afinación Mayor">Afinación Mayor</option>
                      <option value="Cambio de Aceite Sintético">Cambio de Aceite Sintético</option>
                      <option value="Servicio de Frenos Completos">Servicio de Frenos Completos</option>
                      <option value="Inspección de Puntos de Seguridad">Inspección de Puntos de Seguridad</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (!schedVehicleId) return;
                      const matchedVeh = vehicles.find(v => v.id === schedVehicleId);
                      const triggerDesc = schedTriggerType === 'fecha' 
                        ? `${schedValue} (Calendario)` 
                        : `Cada ${schedValue} km (Uso - Odómetro actual: ${matchedVeh?.mileage || 0} km)`;
                      
                      setScheduledPreventives([
                        ...scheduledPreventives,
                        {
                          id: `prev-${Date.now()}`,
                          vehicleId: schedVehicleId,
                          serviceType: schedServiceType,
                          trigger: triggerDesc,
                          status: 'Pendiente'
                        }
                      ]);
                      alert('Disparador de mantenimiento preventivo registrado correctamente.');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-center transition-all cursor-pointer"
                  >
                    + Registrar Disparador Preventivo
                  </button>
                </div>

                {/* Scheduled list */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {scheduledPreventives.map((p) => {
                    const matchedVeh = vehicles.find(v => v.id === p.vehicleId);
                    return (
                      <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center gap-2">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{p.serviceType}</p>
                          <p className="text-[10px] text-slate-500">Vehículo: {matchedVeh?.brand} {matchedVeh?.model} • {p.trigger}</p>
                        </div>
                        <div>
                          {p.status === 'Pendiente' ? (
                            <button
                              onClick={() => {
                                setScheduledPreventives(scheduledPreventives.map(item => 
                                  item.id === p.id ? { ...item, status: 'Generado' } : item
                                ));
                                alert(`¡Orden de Trabajo Preventiva generada con éxito para ${matchedVeh?.brand}! Se ha asignado a la fila de bahías.`);
                              }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] rounded-md transition-all whitespace-nowrap cursor-pointer"
                            >
                              Generar OT
                            </button>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-md whitespace-nowrap">
                              ✓ OT Generada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CORRECTIVE OT APPROVAL */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckSquare size={16} className="text-[#FA5210]" />
                    Aprobación de Órdenes Correctivas (Urgentes)
                  </h5>
                  <p className="text-[11px] text-slate-500">Valida y prioriza reparaciones imprevistas reportadas por grúa o avería súbita</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'OT-COR-01', veh: 'Ford Mustang (77X-MX)', falla: 'Humo en cofre y pérdida de potencia (Sobrecalentamiento)', priority: 'Alta' },
                    { id: 'OT-COR-02', veh: 'Nissan Versa (88A-CD)', falla: 'Falla total de frenos reportada por cliente', priority: 'Urgente' }
                  ].map((cor, idx) => {
                    const isApproved = approvedCorrectiveIds.includes(cor.id);
                    return (
                      <div key={idx} className="p-3 bg-red-50/40 border border-red-100 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-800">{cor.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            cor.priority === 'Urgente' ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {cor.priority}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{cor.veh}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{cor.falla}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-red-100">
                          {!isApproved ? (
                            <>
                              <button
                                onClick={() => alert('Orden de Trabajo Correctiva rechazada/archivada.')}
                                className="px-2 py-1 text-[9px] font-semibold text-slate-500 hover:text-red-600"
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => {
                                  setApprovedCorrectiveIds([...approvedCorrectiveIds, cor.id]);
                                  alert(`OT ${cor.id} aprobada con éxito. Se ha ordenado el diagnóstico inmediato en bahía.`);
                                }}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-950 text-white font-bold text-[10px] rounded-md cursor-pointer transition-all"
                              >
                                Aprobar OT
                              </button>
                            </>
                          ) : (
                            <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                              ✓ OT Aprobada para Diagnóstico
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FINANCES & LEDGER TAB */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuentas por Cobrar (Crédito Clientes)</p>
              <h4 className="text-xl font-bold font-display text-amber-700 mt-1">
                ${clients.reduce((sum, c) => sum + c.creditBalance, 0).toLocaleString('es-MX')} MXN
              </h4>
              <p className="text-[10px] text-slate-500">Crédito otorgado a clientes preferenciales con cuenta abierta.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuentas por Pagar (OC Pendientes)</p>
              <h4 className="text-xl font-bold font-display text-red-700 mt-1">
                ${purchaseOrders.filter(po => po.status === 'Pendiente').reduce((sum, po) => sum + po.total, 0).toLocaleString('es-MX')} MXN
              </h4>
              <p className="text-[10px] text-slate-500">Deuda por surtir con proveedores por órdenes de compra solicitadas.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pérdidas y Ganancias (P&L)</p>
                <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mt-1.5 ${netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {netProfit >= 0 ? 'Ganancia' : 'Pérdida'}: ${Math.abs(netProfit).toLocaleString('es-MX')} MXN
                </span>
              </div>
              <button
                onClick={exportTransactionsToCSV}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Download size={14} />
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Ledger (Ingresos y Egresos) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Libro Diario de Transacciones</h4>
                  <p className="text-xs text-slate-500">Historial completo de flujos de caja e ingresos del taller</p>
                </div>
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all"
                >
                  <Plus size={14} />
                  Registrar Gasto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="p-3">ID</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-semibold text-slate-500">{tx.id}</td>
                        <td className="p-3 text-slate-600">{tx.date}</td>
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${
                            tx.type === 'Ingreso' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {tx.category === 'Pago_Cliente' && 'Pago de Cliente'}
                          {tx.category === 'Proveedor' && 'Proveedor'}
                          {tx.category === 'Nomina' && 'Nómina'}
                          {tx.category === 'Servicios' && 'Servicios Públicos'}
                          {tx.category === 'Otros' && 'Otros Gastos'}
                        </td>
                        <td className={`p-3 font-bold ${
                          tx.type === 'Ingreso' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'Ingreso' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-500 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clients with credit balance */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
                Créditos Vigentes (Por Cobrar)
              </h4>
              <div className="flex-1 overflow-y-auto space-y-3">
                {clients.filter(c => c.creditBalance > 0).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No hay saldos vencidos de clientes.</p>
                ) : (
                  clients.filter(c => c.creditBalance > 0).map((c, index) => (
                    <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex flex-col justify-between gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{c.name}</p>
                          <p className="text-[10px] text-slate-500">Cel: {c.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-red-600">${c.creditBalance.toLocaleString()} MXN</p>
                          <p className="text-[9px] text-slate-400">Límite: ${c.creditLimit.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setSelectedCreditClient(c);
                            setCreditPaymentAmount(c.creditBalance);
                          }}
                          className="px-2.5 py-1 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all"
                        >
                          Abonar / Liquidar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ADD MANUAL TRANSACTION MODAL */}
          {showAddTxModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800">Registrar Gasto de Caja</h4>
                  <button onClick={() => setShowAddTxModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Tipo</label>
                      <select 
                        value={txType} 
                        onChange={(e) => setTxType(e.target.value as 'Ingreso' | 'Egreso')}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-700"
                      >
                        <option value="Egreso">Egreso (Gasto)</option>
                        <option value="Ingreso">Ingreso (Entrada)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Categoría</label>
                      <select 
                        value={txCategory} 
                        onChange={(e) => setTxCategory(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                      >
                        <option value="Nomina">Nómina / Sueldos</option>
                        <option value="Servicios">Servicios Públicos (Luz/Agua)</option>
                        <option value="Proveedor">Pago a Proveedor</option>
                        <option value="Otros">Otros Gastos Varios</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Monto ($ MXN)</label>
                    <input 
                      type="number" 
                      required 
                      value={txAmount || ''} 
                      onChange={(e) => setTxAmount(parseFloat(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                      placeholder="Monto en pesos"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Descripción / Concepto</label>
                    <textarea 
                      required
                      value={txDesc} 
                      onChange={(e) => setTxDesc(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg h-20 focus:outline-amber-500" 
                      placeholder="Especifica el concepto del pago..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button 
                      type="button" 
                      onClick={() => setShowAddTxModal(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Registrar Egreso
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CREDIT ABONO MODAL */}
          {selectedCreditClient && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800">Registrar Cobro de Crédito</h4>
                  <button onClick={() => setSelectedCreditClient(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
                  <p><strong>Cliente:</strong> {selectedCreditClient.name}</p>
                  <p><strong>Deuda Actual:</strong> ${selectedCreditClient.creditBalance.toLocaleString()} MXN</p>
                </div>

                <form onSubmit={handleRegisterCreditPayment} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Monto a Abonar/Liquidar</label>
                    <input 
                      type="number" 
                      required 
                      max={selectedCreditClient.creditBalance}
                      value={creditPaymentAmount || ''} 
                      onChange={(e) => setCreditPaymentAmount(parseFloat(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                      placeholder="Monto a pagar"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Método de Pago</label>
                    <select 
                      value={creditPaymentMethod} 
                      onChange={(e) => setCreditPaymentMethod(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta Bancaria</option>
                      <option value="Transferencia">Transferencia CLABE</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button 
                      type="button" 
                      onClick={() => setSelectedCreditClient(null)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Registrar Cobro
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERSONNEL & COMMISSIONS TAB (MANAGEMENT OF WORKLOAD, COSTS AND PAYROLL) */}
      {activeTab === 'personnel' && (
        <div className="space-y-6">
          
          {/* PANEL DE CARGA DE TRABAJO (7 MECHANICS MONITOR) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 font-display flex items-center gap-2">
                <Users size={18} className="text-[#FA5210]" />
                Panel de Carga de Trabajo en Tiempo Real (7 Técnicos)
              </h4>
              <p className="text-xs text-slate-500">
                Monitorea el estatus operativo, asignación de bahías y avance de órdenes para optimizar la capacidad instalada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.filter(e => e.role === 'Mecanico').map((mech, index) => {
                // Determine mock active tasks, statuses, and times dynamically for visual completeness
                const mockStates = [
                  { status: 'Activo', color: 'bg-emerald-500 text-emerald-800 border-emerald-200', desc: 'Afinación Mayor en OS-1001', pct: 65 },
                  { status: 'Pausado', color: 'bg-red-500 text-red-800 border-red-200', desc: 'Frenos en OS-1002 (Espera Refacción)', pct: 35 },
                  { status: 'Disponible', color: 'bg-slate-500 text-slate-800 border-slate-200', desc: 'En bahía de lavado / Diagnóstico', pct: 0 },
                  { status: 'Activo', color: 'bg-emerald-500 text-emerald-800 border-emerald-200', desc: 'Sistema de Enfriamiento en OS-1003', pct: 85 },
                  { status: 'En Capacitación', color: 'bg-purple-500 text-purple-800 border-purple-200', desc: 'Curso de Motores Híbridos CDMX', pct: 0 },
                  { status: 'Disponible', color: 'bg-slate-500 text-slate-800 border-slate-200', desc: 'Esperando Asignación de OT', pct: 0 },
                  { status: 'Activo', color: 'bg-emerald-500 text-emerald-800 border-emerald-200', desc: 'Alineación y Balanceo en OS-1004', pct: 40 }
                ];
                const state = mockStates[index % mockStates.length];
                
                return (
                  <div key={mech.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{mech.name}</h5>
                        <p className="text-[10px] text-slate-400">Técnico Operativo • Bahía #{index + 1}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${state.color} border`}>
                        {state.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-600 font-medium truncate">{state.desc}</p>
                      {state.pct > 0 ? (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#FA5210] h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${state.pct}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>Avance</span>
                            <span>{state.pct}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">Sin cronómetro activo</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                      <span>Comisión: <strong>{mech.commissionRate}%</strong></span>
                      <span className="font-mono text-slate-400">{mech.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MONITOREO DE COSTOS TOTALES (ACUMULADOS POR VEHÍCULO) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 font-display flex items-center gap-2">
                <DollarSign size={18} className="text-[#FA5210]" />
                Monitoreo de Costos Operativos Totales por Unidad
              </h4>
              <p className="text-xs text-slate-500">
                Acumulado histórico de egresos e inversiones de mano de obra + refacciones consumidas por vehículo de cliente.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3">Vehículo / Placa</th>
                    <th className="p-3">Cliente Propietario</th>
                    <th className="p-3">Costo de Refacciones</th>
                    <th className="p-3">Costo de Mano de Obra</th>
                    <th className="p-3">Costo Total Acumulado</th>
                    <th className="p-3 text-right">Estatus de Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, index) => {
                    const clientObj = clients.find(c => c.id === v.ownerId);
                    // Generate realistic mock numbers for individual vehicle costs dynamically based on indices
                    const partsCost = (index + 1) * 3150;
                    const laborCost = (index + 1) * 2200;
                    const totalCost = partsCost + laborCost;

                    return (
                      <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{v.brand} {v.model}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{v.plate} • {v.year}</p>
                        </td>
                        <td className="p-3 text-slate-600">{clientObj?.name || 'Cliente Particular'}</td>
                        <td className="p-3 text-slate-600 font-mono">${partsCost.toLocaleString()} MXN</td>
                        <td className="p-3 text-slate-600 font-mono">${laborCost.toLocaleString()} MXN</td>
                        <td className="p-3 font-bold text-[#FA5210] font-mono">${totalCost.toLocaleString()} MXN</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            index % 3 === 0 ? 'bg-emerald-100 text-emerald-800' :
                            index % 3 === 1 ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index % 3 === 0 ? 'Entregado' : index % 3 === 1 ? 'En Bahía' : 'Aprobado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EMPLOYEES LIST & COMMISSIONS SETTINGS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 font-display">Nómina y Gestión de Personal</h4>
                <p className="text-xs text-slate-500">Alta de asesores, mecánicos operativos y configuración de esquemas de comisiones</p>
              </div>
              <button
                onClick={() => setShowAddEmpModal(true)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus size={16} />
                Dar de Alta Personal
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Puesto / Rol</th>
                    <th className="p-3">Teléfono</th>
                    <th className="p-3">Comisión configurada</th>
                    <th className="p-3">Estatus</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{emp.name}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          emp.role === 'Asesor' ? 'bg-blue-100 text-blue-800' :
                          emp.role === 'Mecanico' ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{emp.phone}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {emp.role === 'Cajero' ? (
                          <span className="text-slate-400 italic">Sueldo Base (Sin comisión)</span>
                        ) : (
                          <span>{emp.commissionRate}% sobre {emp.role === 'Mecanico' ? 'mano de obra' : 'servicios atendidos'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {emp.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            const newRate = prompt(`Configurar nuevo esquema de comisión para ${emp.name} (Porcentaje actual: ${emp.commissionRate}%)`, emp.commissionRate.toString());
                            if (newRate !== null) {
                              updateEmployee({ ...emp, commissionRate: parseInt(newRate) || 0 });
                            }
                          }}
                          disabled={emp.role === 'Cajero'}
                          className="text-xs text-amber-600 hover:text-amber-800 font-bold disabled:text-slate-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Comisión
                        </button>
                        <button
                          onClick={() => updateEmployee({ ...emp, active: !emp.active })}
                          className={`text-xs font-bold cursor-pointer ${emp.active ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                        >
                          {emp.active ? 'Baja' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

          {/* ADD EMPLOYEE MODAL */}
          {showAddEmpModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800">Dar de Alta Nuevo Empleado</h4>
                  <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={newEmpName} 
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                      placeholder="Ej. Martín Domínguez"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Puesto / Rol</label>
                      <select 
                        value={newEmpRole} 
                        onChange={(e) => setNewEmpRole(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                      >
                        <option value="Mecanico">Mecánico Operativo</option>
                        <option value="Asesor">Asesor de Servicio</option>
                        <option value="Cajero">Cajero / Administrativo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Teléfono</label>
                      <input 
                        type="tel" 
                        required 
                        value={newEmpPhone} 
                        onChange={(e) => setNewEmpPhone(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                        placeholder="Ej. 55-1234-5678"
                      />
                    </div>
                  </div>

                  {newEmpRole !== 'Cajero' && (
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">
                        Comisión (%) sobre {newEmpRole === 'Mecanico' ? 'Mano de Obra' : 'Venta Total'}
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={newEmpCommission} 
                        onChange={(e) => setNewEmpCommission(parseInt(e.target.value) || 0)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button 
                      type="button" 
                      onClick={() => setShowAddEmpModal(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Registrar Personal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

      {/* SYSTEM CONFIGURATION TAB */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 font-display">
              Personalización de Plantillas y Datos Fiscales
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Nombre Comercial del Taller</label>
                <input 
                  type="text" 
                  value={settingsForm.name} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">RFC (Cédula Fiscal México)</label>
                <input 
                  type="text" 
                  value={settingsForm.rfc} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, rfc: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500 font-mono" 
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Teléfono Público</label>
                <input 
                  type="text" 
                  value={settingsForm.phone} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={settingsForm.email} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Dirección del Establecimiento</label>
                <input 
                  type="text" 
                  value={settingsForm.address} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Datos Bancarios para Transferencia</label>
                <input 
                  type="text" 
                  value={settingsForm.bankDetails} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Términos y Condiciones (Orden de Servicio y Facturas)</label>
                <textarea 
                  value={settingsForm.terms} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, terms: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg h-24 focus:outline-amber-500" 
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Tasa de Impuesto IVA (%)</label>
                <input 
                  type="number" 
                  value={settingsForm.taxRate} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-amber-500" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button 
                type="submit" 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 text-xs rounded-lg shadow-sm transition-all"
              >
                Guardar Configuración
              </button>
            </div>
          </form>

          {/* Payment Gateways / Integrations Mock */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 font-display">
              Pasarelas de Pago e Integraciones
            </h4>

            <div className="space-y-4 text-xs">
              <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Terminal Clip / Mercado Pago</span>
                  <span className="px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 rounded-full text-[9px]">ACTIVO</span>
                </div>
                <p className="text-[10px] text-slate-500">Permite registrar cobros con tarjeta bancaria de manera presencial sincronizando el ID de la orden.</p>
              </div>

              <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Facturación CFDI v4.0 (SAT)</span>
                  <span className="px-2 py-0.5 font-bold bg-slate-100 text-slate-500 rounded-full text-[9px]">CONECTADO</span>
                </div>
                <p className="text-[10px] text-slate-500">Conexión con PAC autorizado para timbrado automático de facturas al liquidar las órdenes.</p>
              </div>

              <div className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Notificaciones por WhatsApp API</span>
                  <span className="px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 rounded-full text-[9px]">ACTIVO</span>
                </div>
                <p className="text-[10px] text-slate-500">Permite enviar cotizaciones digitales y actualizaciones de estado automáticamente al celular del cliente.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
