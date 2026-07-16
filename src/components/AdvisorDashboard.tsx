import React, { useState } from 'react';
import { 
  Plus, Search, UserPlus, Car, CheckSquare, Calendar, History, Send, 
  Trash, Check, X, FileText, ChevronRight, AlertCircle, MapPin, Sparkles, UserCheck,
  Camera, Upload, Trash2, AlertTriangle
} from 'lucide-react';
import { Client, Vehicle, Employee, InventoryItem, ServiceOrder, BudgetLineItem, OrderStatus, Checklist } from '../types';

interface AdvisorDashboardProps {
  clients: Client[];
  vehicles: Vehicle[];
  employees: Employee[];
  inventory: InventoryItem[];
  orders: ServiceOrder[];
  addClient: (c: Omit<Client, 'id' | 'creditBalance'>) => Client;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Vehicle;
  createServiceOrder: (o: Omit<ServiceOrder, 'id' | 'items' | 'timeLogs' | 'isClockedIn' | 'isPaused' | 'totalHoursWorked' | 'payments'>) => ServiceOrder;
  addOrderItem: (orderId: string, item: Omit<BudgetLineItem, 'id' | 'approved'>) => void;
  deleteOrderItem: (orderId: string, itemId: string) => void;
  approveBudgetLine: (orderId: string, itemId: string, approved: boolean) => void;
  registerOrderPayment: (orderId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Credito') => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function AdvisorDashboard({
  clients,
  vehicles,
  employees,
  inventory,
  orders,
  addClient,
  addVehicle,
  createServiceOrder,
  addOrderItem,
  deleteOrderItem,
  approveBudgetLine,
  registerOrderPayment,
  updateOrderStatus
}: AdvisorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reception' | 'quotes' | 'agenda' | 'crm'>('reception');

  // Search filter states
  const [clientSearch, setClientSearch] = useState('');
  const [crmSearch, setCrmSearch] = useState('');

  // Reception workflow states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [reportedFailure, setReportedFailure] = useState('');
  
  // New Client Form
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientCreditLimit, setNewClientCreditLimit] = useState(0);

  // New Vehicle Form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehBrand, setNewVehBrand] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehYear, setNewVehYear] = useState(new Date().getFullYear());
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehVin, setNewVehVin] = useState('');
  const [newVehMileage, setNewVehMileage] = useState(0);
  const [newVehColor, setNewVehColor] = useState('');
  const [newVehEngomado, setNewVehEngomado] = useState<'yellow'|'pink'|'red'|'green'|'blue'>('pink');
  const [newVehPlateEnding, setNewVehPlateEnding] = useState('8');

  // Entry Checklist State
  const [checklist, setChecklist] = useState<Checklist>({
    scratches: false,
    dents: false,
    fuelLevel: 50,
    tools: true,
    spareTire: true,
    jack: true,
    extinguisher: false,
    photos: []
  });

  // Live camera and device photo capture states & handlers
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setShowCameraModal(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      setCameraStream(mediaStream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 150);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("No se pudo acceder a la cámara en vivo. El navegador puede requerir HTTPS o permisos especiales. Se recomienda usar la subida de fotos que automáticamente activa la cámara nativa en tu móvil.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg', 0.85);
        setChecklist(prev => ({
          ...prev,
          photos: [...prev.photos, dataUri]
        }));
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64String = reader.result;
            setChecklist(prev => ({
              ...prev,
              photos: [...prev.photos, base64String]
            }));
          }
        };
        reader.readAsDataURL(file as File);
      });
    }
  };

  const removePhoto = (index: number) => {
    setChecklist(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Quotation selected order
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const activeQuoteOrder = orders.find(o => o.id === selectedOrderId);

  // Quote item inputs
  const [newItemType, setNewItemType] = useState<'refaccion' | 'mano_de_obra'>('mano_de_obra');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // Selected payment values
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Credito'>('Efectivo');

  // Agenda/Bays Booking State
  const [agenda, setAgenda] = useState<{
    id: string; date: string; time: string; vehiclePlate: string; bay: string; mechanicId: string; purpose: string;
  }[]>([
    { id: '1', date: '2026-07-16', time: '09:00', vehiclePlate: '931-WYZ', bay: 'Bahía 1 - Rampa', mechanicId: 'emp-2', purpose: 'Cambio de Balatas' },
    { id: '2', date: '2026-07-16', time: '11:00', vehiclePlate: '582-ABC', bay: 'Bahía 2 - Eléctrico', mechanicId: 'emp-3', purpose: 'Afinación Mayor' },
    { id: '3', date: '2026-07-16', time: '14:00', vehiclePlate: '123-XYZ', bay: 'Bahía 3 - Suspensión', mechanicId: 'emp-2', purpose: 'Revisión Tren Motriz' }
  ]);
  const [bookingDate, setBookingDate] = useState('2026-07-16');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingPlate, setBookingPlate] = useState('');
  const [bookingBay, setBookingBay] = useState('Bahía 1 - Rampa');
  const [bookingMech, setBookingMech] = useState('emp-2');
  const [bookingPurpose, setBookingPurpose] = useState('');

  // Submit check-in handler (Create Service Order)
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !selectedVehicleId || !reportedFailure) {
      alert('Favor de seleccionar un cliente, un vehículo e ingresar el motivo de visita.');
      return;
    }

    const assignedAdvisor = employees.find(e => e.role === 'Asesor' && e.active);
    const assignedMechanic = employees.find(e => e.role === 'Mecanico' && e.active);

    const created = createServiceOrder({
      clientId: selectedClientId,
      vehicleId: selectedVehicleId,
      advisorId: assignedAdvisor?.id || 'emp-1',
      mechanicId: assignedMechanic?.id || 'emp-2',
      reportedFailure,
      checklist,
      diagnostics: '',
      diagnosticPhotos: [],
      status: 'Diagnostico',
      dateOpened: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    alert(`¡Orden de Servicio ${created.id} creada exitosamente!\nSu estatus inicial es 'En Diagnóstico'.`);
    setSelectedOrderId(created.id);
    setActiveTab('quotes'); // redirect to quotes to add budget lines

    // Reset fields
    setReportedFailure('');
    setChecklist({
      scratches: false,
      dents: false,
      fuelLevel: 50,
      tools: true,
      spareTire: true,
      jack: true,
      extinguisher: false,
      photos: []
    });
  };

  const handleAddClientForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;
    const added = addClient({
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail,
      address: newClientAddress,
      creditLimit: newClientCreditLimit
    });
    setSelectedClientId(added.id);
    setShowAddClient(false);
    // Clear
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientAddress('');
  };

  const handleAddVehicleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert('Debe tener un cliente seleccionado para asociarle el auto.');
      return;
    }
    if (!newVehBrand || !newVehModel || !newVehPlate) return;
    const added = addVehicle({
      ownerId: selectedClientId,
      brand: newVehBrand,
      model: newVehModel,
      year: newVehYear,
      plate: newVehPlate,
      vin: newVehVin,
      mileage: newVehMileage,
      color: newVehColor,
      engomadoColor: newVehEngomado,
      plateEnding: newVehPlateEnding
    });
    setSelectedVehicleId(added.id);
    setShowAddVehicle(false);
    // Clear
    setNewVehBrand('');
    setNewVehModel('');
    setNewVehPlate('');
    setNewVehVin('');
    setNewVehMileage(0);
    setNewVehColor('');
  };

  // Budget calculations
  const getOrderSubtotal = (order: ServiceOrder) => {
    return order.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  };
  const getOrderTax = (order: ServiceOrder) => {
    return getOrderSubtotal(order) * (16 / 100); // 16% IVA Mexico
  };
  const getOrderTotal = (order: ServiceOrder) => {
    return getOrderSubtotal(order) + getOrderTax(order);
  };
  const getOrderAmountPaid = (order: ServiceOrder) => {
    return order.payments.reduce((sum, p) => sum + p.amount, 0);
  };
  const getOrderBalance = (order: ServiceOrder) => {
    return getOrderTotal(order) - getOrderAmountPaid(order);
  };

  const handleAddItemToQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuoteOrder || !newItemDesc || newItemPrice <= 0) return;
    addOrderItem(activeQuoteOrder.id, {
      type: newItemType,
      description: newItemDesc,
      qty: newItemQty,
      unitPrice: newItemPrice
    });
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingPlate || !bookingPurpose) return;
    const newBook = {
      id: `bk-${Date.now()}`,
      date: bookingDate,
      time: bookingTime,
      vehiclePlate: bookingPlate,
      bay: bookingBay,
      mechanicId: bookingMech,
      purpose: bookingPurpose
    };
    setAgenda(prev => [...prev, newBook]);
    setBookingPlate('');
    setBookingPurpose('');
    alert('Cita de mantenimiento y bahía de trabajo agendada con éxito.');
  };

  // Filter clients/vehicles
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  );

  const clientVehicles = vehicles.filter(v => v.ownerId === selectedClientId);

  return (
    <div id="advisor-dashboard-container" className="space-y-6 pb-28 md:pb-32">
      {/* Tab Menu */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        {/* Mobile/Tablet Dropdown Select */}
        <div className="block lg:hidden w-full">
          <label htmlFor="advisor-mobile-tab-select" className="block text-xs font-bold text-slate-500 mb-1">Módulo de Asesor / Recepción</label>
          <select
            id="advisor-mobile-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'reception' | 'quotes' | 'agenda' | 'crm')}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8D6A28]"
          >
            <option value="reception">🚗 Recepción y Órdenes</option>
            <option value="quotes">💵 Cotizaciones y Cobros</option>
            <option value="agenda">📅 Agenda y Bahías</option>
            <option value="crm">🕒 CRM Clínico del Auto</option>
          </select>
        </div>

        {/* Desktop Horizontal Tabs Menu */}
        <div className="hidden lg:flex gap-2">
          <button
            id="advisor-tab-reception"
            onClick={() => setActiveTab('reception')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'reception'
                ? 'bg-[#8D6A28] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Car size={16} />
            Recepción y Órdenes
          </button>
          <button
            id="advisor-tab-quotes"
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'quotes'
                ? 'bg-[#8D6A28] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} />
            Cotizaciones y Cobros
          </button>
          <button
            id="advisor-tab-agenda"
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'agenda'
                ? 'bg-[#8D6A28] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} />
            Agenda y Bahías
          </button>
          <button
            id="advisor-tab-crm"
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'crm'
                ? 'bg-[#8D6A28] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History size={16} />
            CRM Clínico del Auto
          </button>
        </div>
      </div>

      {/* RECEPTION & CHECK-IN TAB */}
      {activeTab === 'reception' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* STEP 1: Select Client & Vehicle */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 font-display">
              <UserCheck size={18} className="text-amber-600" />
              1. Cliente y Vehículo
            </h4>

            {/* Search Client */}
            <div className="space-y-2 text-xs">
              <label className="block text-slate-500 font-medium">Buscar Cliente</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre o celular..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-amber-500"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Client List */}
            <div className="border border-slate-100 rounded-lg max-h-[140px] overflow-y-auto text-xs divide-y divide-slate-50">
              {filteredClients.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setSelectedVehicleId('');
                  }}
                  className={`w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    selectedClientId === c.id ? 'bg-amber-50/50 border-l-4 border-amber-500' : ''
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.phone} • {c.email}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>

            {/* Quick add client button */}
            <button
              type="button"
              onClick={() => setShowAddClient(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-dashed border-amber-200"
            >
              <UserPlus size={14} />
              Dar de Alta Nuevo Cliente
            </button>

            {/* Vehicle Selection */}
            {selectedClientId && (
              <div className="space-y-3 pt-2">
                <label className="block text-slate-500 font-medium text-xs">Vehículos del Cliente</label>
                {clientVehicles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Este cliente no tiene autos vinculados.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {clientVehicles.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`text-left p-2.5 border rounded-lg text-xs hover:bg-slate-50 transition-all ${
                          selectedVehicleId === v.id 
                            ? 'border-amber-500 bg-amber-50/50 shadow-sm' 
                            : 'border-slate-200'
                        }`}
                      >
                        <p className="font-bold text-slate-800">{v.brand} {v.model} ({v.year})</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Placas: {v.plate} • Kilómetros: {v.mileage.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowAddVehicle(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-dashed border-indigo-200"
                >
                  <Plus size={14} />
                  Asociar Nuevo Automóvil
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Checklist & walkaround */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 font-display text-sm md:text-base">
                <CheckSquare size={20} className="text-amber-600" />
                2. Checklist e Inventario de Entrada
              </h4>
              <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Auditoría Completa
              </span>
            </div>

            {/* Interactive Car Damage Blueprint Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mapa de Daños de Carrocería</span>
                <span className="text-[10px] text-slate-400 italic">Haz clic en los botones para registrar daños</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Visual Front/Rear/Side Toggles */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Inspección de Daños</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setChecklist(prev => ({ ...prev, scratches: !prev.scratches }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        checklist.scratches 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        checklist.scratches ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Sparkles size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">Rayones</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{checklist.scratches ? 'Reportado' : 'Ninguno'}</p>
                      </div>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setChecklist(prev => ({ ...prev, dents: !prev.dents }))}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        checklist.dents 
                          ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        checklist.dents ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <AlertTriangle size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">Golpes</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{checklist.dents ? 'Reportado' : 'Ninguno'}</p>
                      </div>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <span>Los daños se registrarán de forma permanente en el expediente técnico.</span>
                  </div>
                </div>

                {/* Car Silhouette Diagram representation */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-900 flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden">
                  {/* Subtle technical background grid */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                  
                  {/* Top-down abstract blueprint car skeleton */}
                  <div className="w-44 h-16 relative flex items-center justify-center select-none pointer-events-none">
                    {/* Abstract outline */}
                    <div className="absolute w-40 h-14 border-2 border-slate-600 rounded-xl flex justify-between items-center px-1">
                      {/* wheels */}
                      <div className="absolute -top-1 left-5 w-6 h-2 bg-slate-700 rounded-sm"></div>
                      <div className="absolute -top-1 right-5 w-6 h-2 bg-slate-700 rounded-sm"></div>
                      <div className="absolute -bottom-1 left-5 w-6 h-2 bg-slate-700 rounded-sm"></div>
                      <div className="absolute -bottom-1 right-5 w-6 h-2 bg-slate-700 rounded-sm"></div>
                      
                      {/* cabin windshield */}
                      <div className="absolute left-10 right-10 top-2 bottom-2 border border-slate-700/60 rounded flex items-center justify-center bg-slate-800/20">
                        <span className="text-[7px] text-slate-600 font-mono">CABIN</span>
                      </div>
                    </div>
                    {/* front grid */}
                    <div className="absolute left-0 w-2 h-8 border border-slate-600 bg-slate-800 rounded-l flex items-center justify-center"></div>
                    {/* rear trunk */}
                    <div className="absolute right-0 w-2 h-8 border border-slate-600 bg-slate-800 rounded-r"></div>
                    
                    {/* Status lights on top of blueprint if damage active */}
                    {checklist.scratches && (
                      <div className="absolute left-4 top-2 w-3.5 h-3.5 rounded-full bg-rose-500/30 animate-ping flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      </div>
                    )}
                    {checklist.dents && (
                      <div className="absolute right-8 bottom-2 w-3.5 h-3.5 rounded-full bg-rose-500/30 animate-ping flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-3 uppercase tracking-wider">Esquema Técnico de Carrocería</span>
                </div>
              </div>
            </div>

            {/* Premium Interactive Gas Tank Needle Gauge */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nivel de Combustible</span>
                  <span className="text-[11px] text-slate-400">Verifica el nivel del tanque actual</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${checklist.fuelLevel <= 25 ? 'bg-red-500' : checklist.fuelLevel <= 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                  <span className="font-bold text-slate-800 text-xs font-mono">{checklist.fuelLevel}% Tanque</span>
                </div>
              </div>

              {/* Graphical Needle SVG Gauge */}
              <div className="flex flex-col items-center justify-center py-1">
                <svg className="w-44 h-22 overflow-visible" viewBox="0 0 100 50">
                  <defs>
                    <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="25%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer curved arc */}
                  <path 
                    d="M 15,45 A 35,35 0 0,1 85,45" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                  />
                  
                  {/* Colored indicator arc overlay */}
                  <path 
                    d="M 15,45 A 35,35 0 0,1 85,45" 
                    fill="none" 
                    stroke="url(#gauge-grad)" 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                    strokeDasharray={`${(checklist.fuelLevel / 100) * 110} 110`}
                    className="transition-all duration-500 ease-out"
                  />
                  
                  {/* Gauge ticks */}
                  <text x="11" y="49" className="text-[4px] font-bold font-mono fill-slate-400">E</text>
                  <text x="21" y="27" className="text-[4px] font-bold font-mono fill-slate-400">1/4</text>
                  <text x="47" y="14" className="text-[4px] font-bold font-mono fill-slate-400">1/2</text>
                  <text x="74" y="27" className="text-[4px] font-bold font-mono fill-slate-400">3/4</text>
                  <text x="86" y="49" className="text-[4px] font-bold font-mono fill-slate-400">F</text>
                  
                  {/* Pivot center */}
                  <circle cx="50" cy="45" r="3" fill="#334155" />
                  <circle cx="50" cy="45" r="1" fill="#ffffff" />
                  
                  {/* Needle */}
                  <line 
                    x1="50" 
                    y1="45" 
                    x2={50 + 28 * Math.cos((-180 + (checklist.fuelLevel / 100) * 180) * Math.PI / 180)}
                    y2={45 + 28 * Math.sin((-180 + (checklist.fuelLevel / 100) * 180) * Math.PI / 180)}
                    stroke="#1e293b" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out origin-[50px_45px]"
                  />
                </svg>

                {/* Slider selector dots */}
                <div className="w-full max-w-sm mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={checklist.fuelLevel}
                    onChange={(e) => setChecklist(prev => ({ ...prev, fuelLevel: parseInt(e.target.value) }))}
                    className="w-full accent-amber-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-[9px] font-bold mt-2 px-1 gap-1">
                    <button type="button" onClick={() => setChecklist(prev => ({ ...prev, fuelLevel: 0 }))} className={`px-2 py-0.5 rounded transition-colors ${checklist.fuelLevel === 0 ? 'bg-red-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Vacío (0%)</button>
                    <button type="button" onClick={() => setChecklist(prev => ({ ...prev, fuelLevel: 25 }))} className={`px-2 py-0.5 rounded transition-colors ${checklist.fuelLevel === 25 ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>1/4 (25%)</button>
                    <button type="button" onClick={() => setChecklist(prev => ({ ...prev, fuelLevel: 50 }))} className={`px-2 py-0.5 rounded transition-colors ${checklist.fuelLevel === 50 ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Medio (50%)</button>
                    <button type="button" onClick={() => setChecklist(prev => ({ ...prev, fuelLevel: 75 }))} className={`px-2 py-0.5 rounded transition-colors ${checklist.fuelLevel === 75 ? 'bg-lime-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>3/4 (75%)</button>
                    <button type="button" onClick={() => setChecklist(prev => ({ ...prev, fuelLevel: 100 }))} className={`px-2 py-0.5 rounded transition-colors ${checklist.fuelLevel === 100 ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Lleno (100%)</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessories Checklist - Styled Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Herramientas y Accesorios a bordo</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, tools: !prev.tools }))}
                  className={`flex items-center justify-between p-2.5 border rounded-xl font-bold transition-all ${
                    checklist.tools 
                      ? 'bg-amber-50/50 border-amber-300 text-slate-850' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="truncate">Herramienta básica</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    checklist.tools ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-transparent'
                  }`}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, spareTire: !prev.spareTire }))}
                  className={`flex items-center justify-between p-2.5 border rounded-xl font-bold transition-all ${
                    checklist.spareTire 
                      ? 'bg-amber-50/50 border-amber-300 text-slate-850' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="truncate">Llanta refacción</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    checklist.spareTire ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-transparent'
                  }`}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, jack: !prev.jack }))}
                  className={`flex items-center justify-between p-2.5 border rounded-xl font-bold transition-all ${
                    checklist.jack 
                      ? 'bg-amber-50/50 border-amber-300 text-slate-850' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="truncate">Gato hidráulico</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    checklist.jack ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-transparent'
                  }`}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, extinguisher: !prev.extinguisher }))}
                  className={`flex items-center justify-between p-2.5 border rounded-xl font-bold transition-all ${
                    checklist.extinguisher 
                      ? 'bg-amber-50/50 border-amber-300 text-slate-850' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="truncate">Extintor</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    checklist.extinguisher ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 text-transparent'
                  }`}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                </button>
              </div>
            </div>

            {/* Photographic Evidence Uplink Block */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                    <Camera size={14} className="text-slate-500" />
                    Fotografías de Evidencia
                  </span>
                  <span className="text-[11px] text-slate-400">Captura o sube el estado del auto</span>
                </div>
                {checklist.photos.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px] font-mono">
                    {checklist.photos.length} {checklist.photos.length === 1 ? 'Foto' : 'Fotos'}
                  </span>
                )}
              </div>

              {/* Upload & Camera Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Camera Trigger for Browser */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md group active:scale-95"
                >
                  <Camera size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Cámara en Vivo</span>
                </button>

                {/* Upload / Native Camera Capture Trigger for Mobile Device */}
                <label
                  htmlFor="camera-capture-input"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md group active:scale-95 text-center"
                >
                  <Upload size={14} className="group-hover:translate-y-[-1px] transition-transform" />
                  <span>Cámara Móvil / Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="camera-capture-input"
                  />
                </label>
              </div>

              {/* Photo Evidence Gallery */}
              {checklist.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-h-[140px] overflow-y-auto">
                  {checklist.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-slate-250 group bg-slate-950">
                      <img 
                        src={photo} 
                        alt={`Evidencia ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        title="Eliminar foto"
                      >
                        <Trash2 size={11} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white px-1 py-0.5 rounded text-[8px] font-mono leading-none">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                    <Camera size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Sin Evidencia Fotográfica</p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5 mx-auto">Toma fotos en vivo o súbelas como auditoría física.</p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: Motivo de visita & Open Order */}
          <form onSubmit={handleCreateOrder} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 font-display">
                <FileText size={18} className="text-amber-600" />
                3. Motivo e Inicio del Servicio
              </h4>

              <div>
                <label className="block text-slate-500 font-medium text-xs mb-1">Falla Reportada / Síntomas</label>
                <textarea
                  required
                  value={reportedFailure}
                  onChange={(e) => setReportedFailure(e.target.value)}
                  placeholder="Ej. El pedal de freno vibra en pendientes pronunciadas. Tironea por las mañanas..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs h-32 focus:outline-amber-500"
                />
              </div>

              {selectedClientId && selectedVehicleId && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-800 space-y-1">
                  <p><strong>Cliente:</strong> {clients.find(c => c.id === selectedClientId)?.name}</p>
                  <p><strong>Vehículo:</strong> {vehicles.find(v => v.id === selectedVehicleId)?.brand} {vehicles.find(v => v.id === selectedVehicleId)?.model}</p>
                  <p className="text-[10px] text-slate-400 mt-1">* Se asignará el asesor de guardia y el primer mecánico disponible.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Send size={14} />
              Registrar Entrada y Abrir Orden
            </button>
          </form>

          {/* ADD CLIENT FORM MODAL */}
          {showAddClient && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800">Dar de Alta Nuevo Cliente</h4>
                  <button onClick={() => setShowAddClient(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddClientForm} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Nombre Completo</label>
                    <input type="text" required value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Ej. Juan de la Barrera" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Celular / WhatsApp</label>
                      <input type="tel" required value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="55-1234-5678" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Email</label>
                      <input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="ejemplo@correo.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Dirección</label>
                    <input type="text" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Calle, Colonia, CDMX" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Límite de Crédito ($ MXN)</label>
                    <input type="number" value={newClientCreditLimit} onChange={(e) => setNewClientCreditLimit(parseFloat(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg" />
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button type="button" onClick={() => setShowAddClient(false)} className="px-3 py-1.5 text-slate-600">Cancelar</button>
                    <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded-lg shadow-sm">Registrar Cliente</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD VEHICLE FORM MODAL */}
          {showAddVehicle && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-slate-800 font-display">Asociar Vehículo al Cliente</h4>
                  <button onClick={() => setShowAddVehicle(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddVehicleForm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Marca</label>
                      <input type="text" required value={newVehBrand} onChange={(e) => setNewVehBrand(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Volkswagen" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Modelo</label>
                      <input type="text" required value={newVehModel} onChange={(e) => setNewVehModel(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Jetta" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Año</label>
                      <input type="number" required value={newVehYear} onChange={(e) => setNewVehYear(parseInt(e.target.value) || 2020)} className="w-full p-2 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Placas</label>
                      <input type="text" required value={newVehPlate} onChange={(e) => setNewVehPlate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg uppercase" placeholder="931-WYZ" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">VIN / Número de Serie</label>
                      <input type="text" value={newVehVin} onChange={(e) => setNewVehVin(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg uppercase" placeholder="17 caracteres" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Kilometraje</label>
                      <input type="number" value={newVehMileage} onChange={(e) => setNewVehMileage(parseInt(e.target.value) || 0)} className="w-full p-2 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Color de Pintura</label>
                      <input type="text" value={newVehColor} onChange={(e) => setNewVehColor(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Rojo, Azul, Gris" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Engomado CDMX</label>
                      <select value={newVehEngomado} onChange={(e) => setNewVehEngomado(e.target.value as any)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                        <option value="pink">Rosa (Terminación 7 y 8)</option>
                        <option value="yellow">Amarillo (Terminación 5 y 6)</option>
                        <option value="red">Rojo (Terminación 3 y 4)</option>
                        <option value="green">Verde (Terminación 1 y 2)</option>
                        <option value="blue">Azul (Terminación 9 y 0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Último Dígito de Placa</label>
                      <select value={newVehPlateEnding} onChange={(e) => setNewVehPlateEnding(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <option key={i} value={i.toString()}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button type="button" onClick={() => setShowAddVehicle(false)} className="px-3 py-1.5 text-slate-600">Cancelar</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg shadow-sm">Registrar Auto</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ESTIMATES, QUOTES & BILLS TAB */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Orders List Sidebar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 font-display">
              Órdenes de Trabajo Activas
            </h4>
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {orders.map((o) => {
                const client = clients.find(c => c.id === o.clientId);
                const vehicle = vehicles.find(v => v.id === o.vehicleId);
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      setPaymentAmount(0);
                    }}
                    className={`w-full text-left p-3 border rounded-xl text-xs transition-all ${
                      selectedOrderId === o.id 
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm font-semibold' 
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{o.id}</span>
                      <span className="text-[10px] text-slate-400">{o.dateOpened.split(' ')[0]}</span>
                    </div>
                    <p className="text-slate-800 font-bold">{client?.name}</p>
                    <p className="text-slate-500">{vehicle?.brand} {vehicle?.model} • Placa: {vehicle?.plate}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Estatus: <strong className="text-slate-600">{o.status.replace('_', ' ')}</strong>
                      </span>
                      <span className="font-bold text-indigo-600">${Math.round(getOrderTotal(o)).toLocaleString()} MXN</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUOTE WORKSPACE / DETAILS */}
          {activeQuoteOrder ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Order Overview Header */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-display">
                      Detalle de Orden: {activeQuoteOrder.id}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cliente: <strong>{clients.find(c => c.id === activeQuoteOrder.clientId)?.name}</strong> • Auto: <strong>{vehicles.find(v => v.id === activeQuoteOrder.vehicleId)?.brand} {vehicles.find(v => v.id === activeQuoteOrder.vehicleId)?.model}</strong>
                    </p>
                  </div>
                  <div>
                    <select
                      value={activeQuoteOrder.status}
                      onChange={(e) => updateOrderStatus(activeQuoteOrder.id, e.target.value as any)}
                      className="p-2 border border-amber-300 rounded-lg bg-amber-50 font-bold text-xs text-amber-800 focus:outline-amber-500"
                    >
                      <option value="Diagnostico">Fase: En Diagnóstico</option>
                      <option value="Esperando_Refacciones">Fase: Esperando Refacciones</option>
                      <option value="En_Reparacion">Fase: En Reparación</option>
                      <option value="Control_Calidad">Fase: Control de Calidad</option>
                      <option value="Listo_Entrega">Fase: Listo para Entrega</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-600 block mb-1">Motivo de Ingreso:</strong>
                    {activeQuoteOrder.reportedFailure}
                  </p>
                  {activeQuoteOrder.diagnostics && (
                    <p className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-slate-800">
                      <strong className="text-amber-700 block mb-1">Diagnóstico Técnico:</strong>
                      {activeQuoteOrder.diagnostics}
                    </p>
                  )}
                </div>

                {/* Simulated Digital Link Send */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`[WhatsApp API Link] Enviando presupuesto digital de la orden ${activeQuoteOrder.id} al cliente via WhatsApp.\nMensaje: Hola, te enviamos la cotización de tu auto para aprobación digital.\nLink: https://ais-pre-.../portal?order=${activeQuoteOrder.id}`);
                    }}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <Send size={12} />
                    Compartir por WhatsApp
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      alert(`[Email Sender] Enviando presupuesto a ${clients.find(c => c.id === activeQuoteOrder.clientId)?.email}`);
                    }}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                  >
                    Enviar por Correo
                  </button>
                </div>
              </div>

              {/* BUDGET / ITEMS BUILDER */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 font-display">Desglose de Cotización</h4>

                {/* Add item to quote form */}
                <form onSubmit={handleAddItemToQuote} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Tipo</label>
                    <select
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value as any)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="refaccion">Refacción</option>
                      <option value="mano_de_obra">Mano Obra</option>
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Descripción de Partida</label>
                    <input
                      type="text"
                      required
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Ej. Cambio de Aceite Sintético..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1.5">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Cant.</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold mb-1">Precio Unitario ($)</label>
                    <input
                      type="number"
                      required
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                      placeholder="Ej. 1200"
                    />
                  </div>
                  <div className="sm:col-span-1.5 flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition-colors flex justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </form>

                {/* Items list */}
                <div className="overflow-x-auto text-xs pt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="p-2">Tipo</th>
                        <th className="p-2">Descripción</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">Unitario</th>
                        <th className="p-2 text-right">Subtotal</th>
                        <th className="p-2 text-center">Aprobación Cliente</th>
                        <th className="p-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeQuoteOrder.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-6 text-slate-500 italic">No hay partidas agregadas al presupuesto.</td>
                        </tr>
                      ) : (
                        activeQuoteOrder.items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="p-2">
                              <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                item.type === 'refaccion' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.type === 'refaccion' ? 'Part' : 'M.Obra'}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 font-medium">{item.description}</td>
                            <td className="p-2 text-center font-mono">{item.qty}</td>
                            <td className="p-2 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono font-bold">${(item.qty * item.unitPrice).toLocaleString()}</td>
                            <td className="p-2 text-center">
                              {item.approved === null && (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => approveBudgetLine(activeQuoteOrder.id, item.id, true)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Aprobar en nombre del cliente"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => approveBudgetLine(activeQuoteOrder.id, item.id, false)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Rechazar"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )}
                              {item.approved === true && (
                                <span className="inline-block px-1.5 py-0.5 font-bold text-[9px] bg-emerald-100 text-emerald-800 rounded">APROBADO</span>
                              )}
                              {item.approved === false && (
                                <span className="inline-block px-1.5 py-0.5 font-bold text-[9px] bg-red-100 text-red-800 rounded">RECHAZADO</span>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => deleteOrderItem(activeQuoteOrder.id, item.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                  {/* Payments Registration form */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 space-y-3">
                    <h5 className="font-bold text-slate-800">Registrar Cobro / Abono</h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Monto a pagar</label>
                        <input
                          type="number"
                          value={paymentAmount || ''}
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                          placeholder="Monto"
                          max={getOrderBalance(activeQuoteOrder)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-1">Forma de Pago</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta Bancaria</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Credito">Crédito Taller</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={paymentAmount <= 0}
                      onClick={() => {
                        registerOrderPayment(activeQuoteOrder.id, paymentAmount, paymentMethod);
                        setPaymentAmount(0);
                        alert(`¡Cobro registrado por $${paymentAmount} MXN vía ${paymentMethod}!`);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg disabled:opacity-40"
                    >
                      Confirmar Cobro
                    </button>
                  </div>

                  {/* Pricing Sheet totals */}
                  <div className="space-y-1.5 text-right font-mono self-end">
                    <p className="text-slate-500">Subtotal: <strong className="text-slate-700">${getOrderSubtotal(activeQuoteOrder).toLocaleString()}</strong></p>
                    <p className="text-slate-500">IVA (16%): <strong className="text-slate-700">${Math.round(getOrderTax(activeQuoteOrder)).toLocaleString()}</strong></p>
                    <p className="text-lg font-bold text-slate-800 border-t border-slate-100 pt-1">
                      Total: <span className="text-indigo-600">${Math.round(getOrderTotal(activeQuoteOrder)).toLocaleString()} MXN</span>
                    </p>
                    <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-xs mt-2 border border-emerald-100 space-y-1 text-left">
                      <p className="flex justify-between font-bold"><span>Total Pagado:</span> <span>${getOrderAmountPaid(activeQuoteOrder).toLocaleString()}</span></p>
                      <p className="flex justify-between font-bold text-red-700"><span>Saldo Restante:</span> <span>${Math.round(getOrderBalance(activeQuoteOrder)).toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col justify-center items-center">
              <FileText size={48} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-500">Selecciona una orden de la lista para ver su presupuesto.</p>
            </div>
          )}
        </div>
      )}

      {/* AGENDA & WORKSHOP BAYS TAB */}
      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling form */}
          <form onSubmit={handleAddBooking} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5 font-display">
              <Calendar size={18} className="text-amber-600" />
              Agendar Cita / Bahía
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Fecha</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Hora</label>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Placas del Auto</label>
                <input type="text" required value={bookingPlate} onChange={(e) => setBookingPlate(e.target.value.toUpperCase())} className="w-full p-2 border border-slate-200 rounded-lg font-mono uppercase" placeholder="Ej. 931-WYZ" />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Asignar Bahía de Trabajo</label>
                <select value={bookingBay} onChange={(e) => setBookingBay(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                  <option value="Bahía 1 - Rampa">Bahía 1 - Rampa Elevadora 1</option>
                  <option value="Bahía 2 - Eléctrico">Bahía 2 - Escaneo y Eléctrico</option>
                  <option value="Bahía 3 - Suspensión">Bahía 3 - Suspensión y Frenos</option>
                  <option value="Bahía 4 - Detallado">Bahía 4 - Estética y Lavado</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Mecánico Responsable</label>
                <select value={bookingMech} onChange={(e) => setBookingMech(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                  {employees.filter(e => e.role === 'Mecanico').map(mech => (
                    <option key={mech.id} value={mech.id}>{mech.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-500 font-medium mb-1">Servicio Solicitado</label>
                <input type="text" required value={bookingPurpose} onChange={(e) => setBookingPurpose(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg" placeholder="Ej. Afinación Mayor..." />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 text-xs rounded-lg shadow-sm transition-all"
            >
              Agendar Cita
            </button>
          </form>

          {/* Interactive timeline map */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800">Calendario de Bahías y Citas ({bookingDate})</h4>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">4 Bahías de Trabajo</span>
            </div>

            <div className="space-y-4">
              {['Bahía 1 - Rampa', 'Bahía 2 - Eléctrico', 'Bahía 3 - Suspensión', 'Bahía 4 - Detallado'].map((bay) => {
                const bayBookings = agenda.filter(b => b.bay === bay);
                return (
                  <div key={bay} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                    <h5 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5">
                      <MapPin size={12} className="text-amber-500" />
                      {bay}
                    </h5>
                    
                    {bayBookings.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No hay servicios programados en esta bahía.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {bayBookings.map((bk) => {
                          const mech = employees.find(e => e.id === bk.mechanicId);
                          return (
                            <div key={bk.id} className="bg-white p-2.5 border border-slate-200 rounded-lg text-[11px] shadow-sm flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-amber-600 font-mono">{bk.time} Hrs</span>
                                  <span className="bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded font-semibold">{bk.vehiclePlate}</span>
                                </div>
                                <p className="font-semibold text-slate-800">{bk.purpose}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1.5 border-t border-slate-50 pt-1">
                                Mecánico: <strong>{mech?.name || 'Asignando'}</strong>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CRM HISTORY TAB */}
      {activeTab === 'crm' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-800 font-display">Historial Clínico del Auto (CRM)</h4>
              <p className="text-xs text-slate-500">Expediente médico completo de reparaciones, notas de diagnóstico y piezas surtidas</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="Buscar por placa o marca..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-amber-500"
              />
              <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div className="space-y-6">
            {vehicles
              .filter(v => 
                v.plate.toLowerCase().includes(crmSearch.toLowerCase()) || 
                v.brand.toLowerCase().includes(crmSearch.toLowerCase()) ||
                v.model.toLowerCase().includes(crmSearch.toLowerCase())
              )
              .map((v) => {
                const owner = clients.find(c => c.id === v.ownerId);
                const vehicleHistory = orders.filter(o => o.vehicleId === v.id);

                return (
                  <div key={v.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-all space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <h5 className="font-bold text-sm text-slate-800">
                          {v.brand} {v.model} ({v.year}) - <span className="font-mono text-amber-600">{v.plate}</span>
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Propietario: <strong>{owner?.name}</strong> • Cel: {owner?.phone} • Email: {owner?.email}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-slate-500">Km Actual: <strong>{v.mileage.toLocaleString()} KM</strong></p>
                        <p className="text-slate-500">Engomado: <span className={`inline-block w-2.5 h-2.5 rounded-sm bg-${v.engomadoColor}-400 mr-1`}></span>{v.engomadoColor.toUpperCase()} (Dígito: {v.plateEnding})</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700">Historial Clínico ({vehicleHistory.length} Órdenes de Servicio)</p>
                      {vehicleHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No hay expedientes registrados previos.</p>
                      ) : (
                        <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                          {vehicleHistory.map((o) => (
                            <div key={o.id} className="relative text-xs space-y-1">
                              {/* circular node */}
                              <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                              <div className="flex justify-between items-center font-bold text-slate-800">
                                <span className="font-mono text-amber-600 bg-amber-50 px-1.5 rounded">{o.id}</span>
                                <span className="text-slate-400 font-normal">{o.dateOpened.split(' ')[0]}</span>
                              </div>
                              <p className="text-slate-700"><strong>Falla reportada:</strong> {o.reportedFailure}</p>
                              {o.diagnostics && <p className="text-slate-600 bg-slate-50/50 p-1.5 rounded border border-slate-100"><strong>Diagnóstico:</strong> {o.diagnostics}</p>}
                              <p className="text-[11px] text-slate-500">
                                Reparación: {o.items.filter(item => item.approved).map(item => item.description).join(', ') || 'Sin partidas aprobadas.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {/* Live Camera Modal Overlay */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm md:text-base font-display">Cámara de Auditoría en Vivo</h3>
              </div>
              <button 
                type="button" 
                onClick={stopCamera}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video / Error view */}
            <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center relative aspect-video min-h-[260px]">
              {cameraError ? (
                <div className="p-6 text-center text-rose-200 max-w-sm space-y-3">
                  <div className="w-12 h-12 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="text-xs font-bold font-display">Error de Inicialización</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{cameraError}</p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {/* Visual overlay reticle */}
                  <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-amber-500 absolute top-0 left-0"></div>
                    <div className="w-6 h-6 border-t-2 border-r-2 border-amber-500 absolute top-0 right-0"></div>
                    <div className="w-6 h-6 border-b-2 border-l-2 border-amber-500 absolute bottom-0 left-0"></div>
                    <div className="w-6 h-6 border-b-2 border-r-2 border-amber-500 absolute bottom-0 right-0"></div>
                  </div>
                </>
              )}
            </div>

            {/* Footer control bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              >
                Cancelar
              </button>

              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-amber-500/10"
                >
                  <Camera size={14} />
                  <span>Capturar Foto</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
