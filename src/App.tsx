/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, User, Wrench, Package, Car, Laptop, Clock, 
  Settings, CheckCircle2, ChevronRight, Menu, HelpCircle, AlertTriangle,
  Smartphone, Download, X, Home, LogOut
} from 'lucide-react';
import { useWorkshopState } from './useWorkshopState';
import { UserRole } from './types';

// Dashboard Components
import AdminDashboard from './components/AdminDashboard';
import AdvisorDashboard from './components/AdvisorDashboard';
import MechanicDashboard from './components/MechanicDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import CustomerPortal from './components/CustomerPortal';

export default function App() {
  const {
    clients,
    vehicles,
    employees,
    inventory,
    suppliers,
    purchaseOrders,
    requisitions,
    orders,
    transactions,
    settings,
    setSettings,
    
    // Actions
    addClient,
    updateClient,
    addVehicle,
    addEmployee,
    updateEmployee,
    addInventoryItem,
    updateInventoryItem,
    addPurchaseOrder,
    receivePurchaseOrder,
    createServiceOrder,
    updateOrderStatus,
    updateOrderDiagnostics,
    addOrderItem,
    deleteOrderItem,
    approveBudgetLine,
    clockInOrder,
    pauseOrder,
    clockOutOrder,
    submitPartRequisition,
    handleRequisitionStatus,
    addTransaction,
    registerOrderPayment,
    handleClientCreditPayment,
    addSupplier,
    resetDatabase
  } = useWorkshopState();

  // Active view role
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  
  // Landing page active state
  const [showLanding, setShowLanding] = useState(true);
  
  // Mobile responsive menu toggle
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  // Clock state (Simulating real-world CDMX Local Time)
  const [timeStr, setTimeStr] = useState('15:52:24');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-amber-600 selection:text-white ${!showLanding ? 'pb-24' : ''}`}>
      
      {/* WORKSHOP MAIN LOGO HEADER - Shown only when a role dashboard is active */}
      {!showLanding && (
        <header className="bg-white border-b border-slate-200 py-3 px-4 lg:py-4 lg:px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo & Workshop Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img 
                  src="https://appdesignproyectos.com/autoservice.png" 
                  alt="Auto Service" 
                  className="h-10 w-auto sm:h-14 object-contain bg-black/40 p-1 rounded-xl border border-white/10 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-lg md:text-xl font-bold font-display text-slate-800 tracking-tight flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="truncate">AUTO SERVICE</span>
                  <span className="text-[8px] sm:text-[10px] bg-[#FA5210] text-white px-1.5 sm:px-2 py-0.5 rounded-full font-sans font-semibold uppercase border border-[#FA5210]/20 shrink-0 w-fit">
                    Auto Service PWA
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5 hidden lg:flex items-center gap-1.5">
                  <span>RFC: <strong>{settings.rfc}</strong></span>
                  <span>•</span>
                  <span className="truncate">{settings.address}</span>
                </p>
              </div>
            </div>

            {/* Quick Logout button for mobile & tablet (shows up in the header) */}
            <div className="flex lg:hidden items-center shrink-0">
              <button
                onClick={() => setShowLanding(true)}
                className="flex items-center gap-1 bg-red-600/15 text-red-400 hover:bg-red-600 hover:text-white px-2.5 py-1.5 rounded-xl border border-red-500/20 text-xs font-bold cursor-pointer transition-all shadow-sm"
                title="Cerrar Sesión / Cambiar de Rol"
              >
                <LogOut size={14} className="text-red-500" />
                <span>Salir</span>
              </button>
            </div>

            {/* Time & Quick Stats Dashboard */}
            <div className="hidden lg:flex items-center flex-wrap gap-4 text-xs font-semibold justify-end">
              {/* Back to Home Button */}
              <button
                onClick={() => setShowLanding(true)}
                className="flex items-center gap-2 bg-white/5 text-slate-300 px-4 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition-all text-xs cursor-pointer shadow-sm"
                title="Volver a la selección de roles"
              >
                <Home size={15} className="text-[#FA5210]" />
                <span>Volver a Inicio</span>
              </button>

              {/* PWA Install Button */}
              <button
                onClick={handleInstallClick}
                id="pwa-install-nav-btn"
                className="flex items-center gap-2 bg-[#FA5210] text-white px-4 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-[#ff6c30] transition-all text-xs cursor-pointer shadow-md hover:shadow-[#FA5210]/20"
                title="Instalar Aplicación Auto Service en tu dispositivo"
              >
                <Smartphone size={15} className="animate-pulse text-amber-300" />
                <span>Instalar App Auto Service</span>
              </button>

              {/* CDMX Time Tracker */}
              <div className="text-right hidden md:block">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Simulación Local CDMX</p>
                <div className="flex items-center gap-1.5 justify-end mt-0.5 text-slate-700 font-mono">
                  <Clock size={12} className="text-slate-400" />
                  <span>15 de Julio de 2026, {timeStr}</span>
                </div>
              </div>

              {/* Quick counters */}
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex gap-4 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Órdenes</p>
                  <p className="font-mono font-bold text-slate-800">{orders.length}</p>
                </div>
                <div className="border-l border-slate-200 h-6 self-center"></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Stock Ref.</p>
                  <p className="font-mono font-bold text-slate-800">
                    {inventory.reduce((sum, item) => sum + item.stock, 0)}
                  </p>
                </div>
                <div className="border-l border-slate-200 h-6 self-center"></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Ingresos</p>
                  <p className="font-mono font-bold text-emerald-600">
                    ${transactions.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </header>
      )}

      {/* MASTER CONTAINER FOR WORKFLOW */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {showLanding ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 min-h-[70vh]">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl flex flex-col items-center text-center"
            >
              {/* Majestic Auto Service Logo */}
              <img 
                src="https://appdesignproyectos.com/autoservice.png" 
                alt="Auto Service" 
                className="h-28 sm:h-36 w-auto object-contain bg-black/40 p-3 rounded-2xl border border-white/10 shadow-2xl mb-12"
                referrerPolicy="no-referrer"
              />

              {/* Grid of access icons with name (No description, strictly requested) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 w-full max-w-5xl">
                {[
                  { id: 'admin', name: 'Gerente: Alejandro Castellanos', icon: Shield },
                  { id: 'advisor', name: 'Asesor / Recepción', icon: User },
                  { id: 'mechanic', name: 'Técnico de Mantenimiento (7 Operarios)', icon: Wrench },
                  { id: 'warehouse', name: 'Almacenista / Auxiliar de Control', icon: Package },
                  { id: 'client', name: 'Portal del Cliente', icon: Car }
                ].map((roleItem) => {
                  const IconComponent = roleItem.icon;
                  return (
                    <motion.button
                      key={roleItem.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentRole(roleItem.id as UserRole);
                        setShowLanding(false);
                      }}
                      className="role-card flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 cursor-pointer transition-all aspect-square text-center shadow-sm hover:shadow-md"
                    >
                      <div className="p-3 sm:p-4 bg-[#FA5210]/10 text-[#FA5210] rounded-full mb-2 sm:mb-4 border border-[#FA5210]/20 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.8]" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-800">{roleItem.name}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Install PWA Button on Landing */}
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-2 bg-[#FA5210] text-white px-6 py-3 rounded-xl font-bold border border-white/10 hover:bg-[#ff6c30] transition-all text-xs cursor-pointer shadow-lg hover:shadow-[#FA5210]/20"
                >
                  <Smartphone size={16} className="animate-pulse text-amber-300" />
                  <span>Instalar Aplicación Auto Service</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Dynamic Warning Header explaining the active simulation mode */}
            <div className={`p-4 rounded-xl border flex gap-3 text-xs items-start ${
              currentRole === 'admin' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              currentRole === 'advisor' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              currentRole === 'mechanic' ? 'bg-orange-50 border-orange-200 text-orange-900' :
              currentRole === 'warehouse' ? 'bg-purple-50 border-purple-200 text-purple-900' :
              'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="p-1.5 rounded-lg bg-white shadow-sm shrink-0 font-bold text-base flex justify-center items-center">
                {currentRole === 'admin' && '👑'}
                {currentRole === 'advisor' && '📋'}
                {currentRole === 'mechanic' && '🔧'}
                {currentRole === 'warehouse' && '📦'}
                {currentRole === 'client' && '🚗'}
              </div>
              <div>
                <h5 className="font-bold flex items-center gap-1">
                  <span>Vista de Rol: </span>
                  <strong className="underline decoration-2">
                    {currentRole === 'admin' && 'Gerente de Mantenimiento (Alejandro Castellanos)'}
                    {currentRole === 'advisor' && 'Asesor de Servicio / Recepcionista'}
                    {currentRole === 'mechanic' && 'Técnico de Mantenimiento (7 Operarios)'}
                    {currentRole === 'warehouse' && 'Almacenista / Auxiliar de Control (Soporte)'}
                    {currentRole === 'client' && 'Portal / Monitor del Cliente'}
                  </strong>
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {currentRole === 'admin' && 'Mando central ejecutivo. Gestiona indicadores OEE, MTBF/MTTR, gráficos Pareto de fallas, aprobación de órdenes correctivas y costos totales del taller.'}
                  {currentRole === 'advisor' && 'Estás simulando la recepción del auto. Puedes registrar clientes/autos, realizar el checklist visual de entrada, cotizar mano de obra y refacciones, registrar abonos y agendar citas en bahías.'}
                  {currentRole === 'mechanic' && 'Terminal del Técnico en bahía. Gestiona bandeja de tareas personalizada por prioridad, cronómetro de trabajo con play/pausa, checklist de procedimientos, evidencias fotográficas digitales e historial clínico del vehículo.'}
                  {currentRole === 'warehouse' && 'Estás controlando el almacén. Aquí despachas las refacciones requeridas por mecánicos en tiempo real, registras proveedores, emites órdenes de compra y controlas stocks mínimos.'}
                  {currentRole === 'client' && 'Estás simulando la perspectiva del cliente. Puedes dar seguimiento en tiempo real (tracking) de las fases de tu auto, autorizar/declinar presupuestos digitales y consultar alertas de verificación CDMX.'}
                </p>
              </div>
            </div>

            {/* CONTROLLER SWITCH ANIMATED FRAME */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRole}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="focus:outline-none"
              >
                {currentRole === 'admin' && (
                  <AdminDashboard
                    clients={clients}
                    vehicles={vehicles}
                    employees={employees}
                    inventory={inventory}
                    suppliers={suppliers}
                    orders={orders}
                    transactions={transactions}
                    purchaseOrders={purchaseOrders}
                    settings={settings}
                    setSettings={setSettings}
                    addEmployee={addEmployee}
                    updateEmployee={updateEmployee}
                    addTransaction={addTransaction}
                    handleClientCreditPayment={handleClientCreditPayment}
                    resetDatabase={resetDatabase}
                  />
                )}

                {currentRole === 'advisor' && (
                  <AdvisorDashboard
                    clients={clients}
                    vehicles={vehicles}
                    employees={employees}
                    inventory={inventory}
                    orders={orders}
                    addClient={addClient}
                    addVehicle={addVehicle}
                    createServiceOrder={createServiceOrder}
                    addOrderItem={addOrderItem}
                    deleteOrderItem={deleteOrderItem}
                    approveBudgetLine={approveBudgetLine}
                    registerOrderPayment={registerOrderPayment}
                    updateOrderStatus={updateOrderStatus}
                  />
                )}

                {currentRole === 'mechanic' && (
                  <MechanicDashboard
                    employees={employees}
                    inventory={inventory}
                    orders={orders}
                    clients={clients}
                    vehicles={vehicles}
                    clockInOrder={clockInOrder}
                    pauseOrder={pauseOrder}
                    clockOutOrder={clockOutOrder}
                    updateOrderDiagnostics={updateOrderDiagnostics}
                    submitPartRequisition={submitPartRequisition}
                    updateOrderStatus={updateOrderStatus}
                  />
                )}

                {currentRole === 'warehouse' && (
                  <WarehouseDashboard
                    inventory={inventory}
                    suppliers={suppliers}
                    purchaseOrders={purchaseOrders}
                    requisitions={requisitions}
                    employees={employees}
                    orders={orders}
                    addInventoryItem={addInventoryItem}
                    updateInventoryItem={updateInventoryItem}
                    addPurchaseOrder={addPurchaseOrder}
                    receivePurchaseOrder={receivePurchaseOrder}
                    handleRequisitionStatus={handleRequisitionStatus}
                    addSupplier={addSupplier}
                  />
                )}

                {currentRole === 'client' && (
                  <CustomerPortal
                    clients={clients}
                    vehicles={vehicles}
                    orders={orders}
                    approveBudgetLine={approveBudgetLine}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}

      </main>

      {/* COMPLIANT FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-6 text-xs text-center text-slate-400 space-y-2">
        <p className="max-w-2xl mx-auto">
          <strong>Auto Service Dashboard</strong> • Desarrollado con los más altos estándares de fidelidad y usabilidad interactiva. Sincronización local persistente en tiempo real.
        </p>
        <p className="text-[11px] font-semibold text-slate-500">
          Programa desarrollado por <span className="text-[#FA5210]">App Design</span> - D.G. Harold Anguiano
        </p>
        <p className="font-mono text-[10px]">
          Simulación de Operación Mecánica • Port 3000 • CDMX Verificación Vehicular Integrada • Licencia Comercial Auto Service
        </p>
      </footer>

      {/* MANUAL PWA INSTALLATION GUIDE MODAL */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0D0D0D] border-2 border-[#FA5210]/50 max-w-md w-full rounded-2xl p-6 shadow-2xl shadow-[#FA5210]/10 text-white relative"
            >
              <button 
                onClick={() => setShowInstallGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <img 
                  src="https://appdesignproyectos.com/autoserviceicono.png" 
                  alt="Auto Service Icono" 
                  className="w-16 h-16 rounded-2xl shadow-lg border border-[#FA5210]/30 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-xl font-bold font-display tracking-tight text-white">Instalar App Auto Service</h3>
                  <p className="text-xs text-slate-400 mt-1">Lleva el Auto Service directamente en tu pantalla de inicio móvil o tablet.</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-[#FA5210] flex items-center gap-1.5">
                    <Smartphone size={16} />
                    <span>En iPhone y iPad (Safari):</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 mt-2 space-y-1 pl-1">
                    <li>Toca el botón <strong className="text-white">Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de navegación.</li>
                    <li>Desplázate hacia abajo y selecciona <strong className="text-white">"Agregar a Inicio"</strong>.</li>
                    <li>Confirma el nombre <strong className="text-white">Auto Service</strong> para tener acceso inmediato.</li>
                  </ol>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-semibold text-[#FA5210] flex items-center gap-1.5">
                    <Smartphone size={16} />
                    <span>En Android (Chrome / Edge / Opera):</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 mt-2 space-y-1 pl-1">
                    <li>Toca el menú de <strong className="text-white">3 puntos</strong> en la esquina superior derecha del navegador.</li>
                    <li>Selecciona <strong className="text-white">"Instalar aplicación"</strong> o <strong className="text-white">"Agregar a la pantalla principal"</strong>.</li>
                    <li>¡Listo! La app se ejecutará de forma independiente sin barras de navegador.</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-full mt-6 py-2.5 bg-[#FA5210] text-white rounded-xl font-bold border border-[#FA5210]/40 hover:bg-[#ff6c30] transition-all text-sm cursor-pointer shadow-md"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERSISTENT BOTTOM NAVIGATION BAR (for Mobile, Tablet & Fullscreen) */}
      {!showLanding && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/95 backdrop-blur-md border-t-2 border-[#FA5210]/50 py-1.5 px-2 sm:px-4 shadow-2xl z-40 block">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-6 gap-1 w-full text-center">
              
              {/* Logout / Salir Button */}
              <button
                onClick={() => setShowLanding(true)}
                className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 px-1.5 rounded-xl transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                title="Cerrar Sesión y Cambiar de Rol"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                <span className="text-[9px] sm:text-xs font-bold">Salir / Rol</span>
              </button>

              {/* Roles Buttons */}
              {[
                { id: 'admin', label: 'Admin', icon: Shield },
                { id: 'advisor', label: 'Asesor', icon: User },
                { id: 'mechanic', label: 'Mecánico', icon: Wrench },
                { id: 'warehouse', label: 'Almacén', icon: Package },
                { id: 'client', label: 'Cliente', icon: Car }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = currentRole === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentRole(item.id as UserRole)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#FA5210] text-white border border-white/10 shadow-lg shadow-[#FA5210]/10' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="text-[9px] sm:text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
