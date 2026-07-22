import { useState, useEffect } from 'react';
import { Client, Vehicle, Employee, InventoryItem, Supplier, ServiceOrder, Transaction, WorkshopSettings, PartRequisition, PurchaseOrder, OrderStatus, BudgetLineItem, TimeLog, MaintenanceOrder, EquipmentCalendarRow, PredictiveMaintenanceRecord, MaintenanceReminder, HistoricalMaintenanceOrder, PlannedFrequencyCode, ExecutionStatusCode } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_VEHICLES, 
  INITIAL_EMPLOYEES, 
  INITIAL_INVENTORY, 
  INITIAL_SUPPLIERS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_REQUISITIONS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SETTINGS,
  INITIAL_MAINTENANCE_ORDERS,
  INITIAL_CALENDAR_EQUIPMENT,
  INITIAL_PREDICTIVE_RECORDS,
  INITIAL_MAINTENANCE_REMINDERS,
  INITIAL_HISTORICAL_ORDERS
} from './mockData';

export function useWorkshopState() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [requisitions, setRequisitions] = useState<PartRequisition[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
  const [calendarEquipment, setCalendarEquipment] = useState<EquipmentCalendarRow[]>([]);
  const [predictiveRecords, setPredictiveRecords] = useState<PredictiveMaintenanceRecord[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<HistoricalMaintenanceOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<WorkshopSettings>(INITIAL_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Initialize data from LocalStorage or mock data
  useEffect(() => {
    const localClients = localStorage.getItem('wt_clients');
    const localVehicles = localStorage.getItem('wt_vehicles');
    const localEmployees = localStorage.getItem('wt_employees');
    const localInventory = localStorage.getItem('wt_inventory');
    const localSuppliers = localStorage.getItem('wt_suppliers');
    const localPurchaseOrders = localStorage.getItem('wt_purchase_orders');
    const localRequisitions = localStorage.getItem('wt_requisitions');
    const localOrders = localStorage.getItem('wt_orders');
    const localMaintenanceOrders = localStorage.getItem('wt_mto_orders');
    const localCalendarEquipment = localStorage.getItem('wt_calendar_equipment');
    const localPredictiveRecords = localStorage.getItem('wt_predictive_records');
    const localReminders = localStorage.getItem('wt_reminders');
    const localHistoricalOrders = localStorage.getItem('wt_historical_orders');
    const localTransactions = localStorage.getItem('wt_transactions');
    const localSettings = localStorage.getItem('wt_settings');

    setClients(localClients ? JSON.parse(localClients) : INITIAL_CLIENTS);
    setVehicles(localVehicles ? JSON.parse(localVehicles) : INITIAL_VEHICLES);
    setEmployees(localEmployees ? JSON.parse(localEmployees) : INITIAL_EMPLOYEES);
    setInventory(localInventory ? JSON.parse(localInventory) : INITIAL_INVENTORY);
    setSuppliers(localSuppliers ? JSON.parse(localSuppliers) : INITIAL_SUPPLIERS);
    setPurchaseOrders(localPurchaseOrders ? JSON.parse(localPurchaseOrders) : INITIAL_PURCHASE_ORDERS);
    setRequisitions(localRequisitions ? JSON.parse(localRequisitions) : INITIAL_REQUISITIONS);
    setOrders(localOrders ? JSON.parse(localOrders) : INITIAL_ORDERS);
    setMaintenanceOrders(localMaintenanceOrders ? JSON.parse(localMaintenanceOrders) : INITIAL_MAINTENANCE_ORDERS);
    setCalendarEquipment(localCalendarEquipment ? JSON.parse(localCalendarEquipment) : INITIAL_CALENDAR_EQUIPMENT);
    setPredictiveRecords(localPredictiveRecords ? JSON.parse(localPredictiveRecords) : INITIAL_PREDICTIVE_RECORDS);
    setReminders(localReminders ? JSON.parse(localReminders) : INITIAL_MAINTENANCE_REMINDERS);
    setHistoricalOrders(localHistoricalOrders ? JSON.parse(localHistoricalOrders) : INITIAL_HISTORICAL_ORDERS);
    setTransactions(localTransactions ? JSON.parse(localTransactions) : INITIAL_TRANSACTIONS);
    let parsedSettings = localSettings ? JSON.parse(localSettings) : INITIAL_SETTINGS;
    if (parsedSettings && parsedSettings.address && (parsedSettings.address.includes('Palmas') || parsedSettings.address.includes('palmas'))) {
      parsedSettings.address = INITIAL_SETTINGS.address;
      parsedSettings.phone = INITIAL_SETTINGS.phone;
    }
    setSettings(parsedSettings);
    setLoaded(true);
  }, []);


  // Sync to LocalStorage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_clients', JSON.stringify(clients));
  }, [clients, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_vehicles', JSON.stringify(vehicles));
  }, [vehicles, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_employees', JSON.stringify(employees));
  }, [employees, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_inventory', JSON.stringify(inventory));
  }, [inventory, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_suppliers', JSON.stringify(suppliers));
  }, [suppliers, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_requisitions', JSON.stringify(requisitions));
  }, [requisitions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_orders', JSON.stringify(orders));
  }, [orders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_mto_orders', JSON.stringify(maintenanceOrders));
  }, [maintenanceOrders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_calendar_equipment', JSON.stringify(calendarEquipment));
  }, [calendarEquipment, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_predictive_records', JSON.stringify(predictiveRecords));
  }, [predictiveRecords, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_reminders', JSON.stringify(reminders));
  }, [reminders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_historical_orders', JSON.stringify(historicalOrders));
  }, [historicalOrders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_transactions', JSON.stringify(transactions));
  }, [transactions, loaded]);


  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('wt_settings', JSON.stringify(settings));
  }, [settings, loaded]);

  // Actions

  // 1. Clients
  const addClient = (client: Omit<Client, 'id' | 'creditBalance'>) => {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      creditBalance: 0
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  // 2. Vehicles
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`
    };
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  };

  // 3. Employees & Commissions
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  // 4. Inventory
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `part-${Date.now()}`
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  // 5. Purchase Orders
  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'status'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: `OC-${1000 + purchaseOrders.length + 1}`,
      status: 'Pendiente'
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
  };

  const receivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po || po.status === 'Recibido') return;

    // Update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Recibido' } : p));

    // Update stock & cost average in Inventory
    setInventory(prev => prev.map(invItem => {
      const poLine = po.items.find(pi => pi.itemId === invItem.id);
      if (poLine) {
        const newStock = invItem.stock + poLine.qty;
        // Calculate new weighted cost average:
        const totalPreviousCost = invItem.stock * invItem.cost;
        const totalNewCost = poLine.qty * poLine.cost;
        const newAvgCost = Math.round((totalPreviousCost + totalNewCost) / newStock);
        return {
          ...invItem,
          stock: newStock,
          cost: newAvgCost
        };
      }
      return invItem;
    }));

    // Register Expense Transaction
    const supplier = suppliers.find(s => s.id === po.supplierId);
    addTransaction({
      type: 'Egreso',
      category: 'Proveedor',
      amount: po.total,
      description: `Pago de Orden de Compra ${po.id} a ${supplier?.name || 'Proveedor'}`
    });
  };

  // 6. Service Orders & Workflows
  const createServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'items' | 'timeLogs' | 'isClockedIn' | 'isPaused' | 'totalHoursWorked' | 'payments'>) => {
    const newId = `OS-${1000 + orders.length + 1}`;
    const newOrder: ServiceOrder = {
      ...orderData,
      id: newId,
      items: [],
      timeLogs: [],
      isClockedIn: false,
      isPaused: false,
      totalHoursWorked: 0,
      payments: []
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder: ServiceOrder = { ...o, status };
        if (status === 'Listo_Entrega' && !o.dateClosed) {
          updatedOrder.dateClosed = new Date().toISOString().split('T')[0];
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  const updateOrderDiagnostics = (orderId: string, diagnostics: string, photos: string[] = []) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          diagnostics,
          diagnosticPhotos: [...o.diagnosticPhotos, ...photos]
        };
      }
      return o;
    }));
  };

  // Edit / Add Items to Order Quote (items)
  const addOrderItem = (orderId: string, item: Omit<BudgetLineItem, 'id' | 'approved'>) => {
    const newItem: BudgetLineItem = {
      ...item,
      id: `item-${Date.now()}`,
      approved: null // Starts as pending approval
    };
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: [...o.items, newItem]
        };
      }
      return o;
    }));
  };

  const deleteOrderItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.filter(i => i.id !== itemId)
        };
      }
      return o;
    }));
  };

  const approveBudgetLine = (orderId: string, itemId: string, approved: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedItems = o.items.map(item => {
          if (item.id === itemId) {
            return { ...item, approved };
          }
          return item;
        });
        
        // If an item requires parts and gets approved, we might automatically suggest waiting for parts,
        // or let the staff handle that transition.
        return {
          ...o,
          items: updatedItems
        };
      }
      return o;
    }));
  };

  // Clock-in / Clock-out mechanics logic
  const clockInOrder = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: o.isPaused ? 'resume' : 'start', timestamp: now };
        return {
          ...o,
          isClockedIn: true,
          isPaused: false,
          timeLogs: [...o.timeLogs, newLog]
        };
      }
      return o;
    }));
  };

  const pauseOrder = (orderId: string, reason: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: 'pause', timestamp: now, reason };
        
        // Calculate accrued hours from previous start/resume
        let calculatedHours = o.totalHoursWorked;
        const lastLog = o.timeLogs[o.timeLogs.length - 1];
        if (lastLog && (lastLog.action === 'start' || lastLog.action === 'resume')) {
          const diffMs = new Date(now).getTime() - new Date(lastLog.timestamp).getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          calculatedHours += parseFloat(diffHours.toFixed(2));
        }

        return {
          ...o,
          isClockedIn: false,
          isPaused: true,
          totalHoursWorked: calculatedHours,
          timeLogs: [...o.timeLogs, newLog],
          status: reason === 'Falta de refacción' ? 'Esperando_Refacciones' : o.status
        };
      }
      return o;
    }));
  };

  const clockOutOrder = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newLog: TimeLog = { action: 'stop', timestamp: now };
        
        // Calculate final hours
        let calculatedHours = o.totalHoursWorked;
        const lastLog = o.timeLogs[o.timeLogs.length - 1];
        if (lastLog && (lastLog.action === 'start' || lastLog.action === 'resume')) {
          const diffMs = new Date(now).getTime() - new Date(lastLog.timestamp).getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          calculatedHours += parseFloat(diffHours.toFixed(2));
        }

        return {
          ...o,
          isClockedIn: false,
          isPaused: false,
          totalHoursWorked: calculatedHours,
          timeLogs: [...o.timeLogs, newLog]
        };
      }
      return o;
    }));
  };

  // 7. Part Requisitions (Mechanic -> Warehouse)
  const submitPartRequisition = (orderId: string, itemId: string, qty: number, mechanicId: string) => {
    const newReq: PartRequisition = {
      id: `req-${Date.now()}`,
      orderId,
      itemId,
      qty,
      mechanicId,
      status: 'Pendiente',
      date: new Date().toISOString().split('T')[0]
    };
    setRequisitions(prev => [...prev, newReq]);
  };

  const handleRequisitionStatus = (reqId: string, status: 'Despachado' | 'Rechazado') => {
    const req = requisitions.find(r => r.id === reqId);
    if (!req || req.status !== 'Pendiente') return;

    // Update req status
    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));

    if (status === 'Despachado') {
      // Deduct stock
      setInventory(prev => prev.map(item => {
        if (item.id === req.itemId) {
          return {
            ...item,
            stock: Math.max(0, item.stock - req.qty)
          };
        }
        return item;
      }));

      // Add to Service Order parts (approved automatically since dispatched by stock room)
      const inventoryPart = inventory.find(i => i.id === req.itemId);
      if (inventoryPart) {
        const orderPartItem: Omit<BudgetLineItem, 'id' | 'approved'> = {
          type: 'refaccion',
          description: `${inventoryPart.name} (Código: ${inventoryPart.code})`,
          qty: req.qty,
          unitPrice: inventoryPart.price
        };
        // Add to order items
        setOrders(prev => prev.map(o => {
          if (o.id === req.orderId) {
            // Check if parts is already in items: if yes, increase qty. If not, add new line.
            const existingIndex = o.items.findIndex(it => it.description.includes(inventoryPart.code));
            if (existingIndex !== -1) {
              const updatedItems = [...o.items];
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                qty: updatedItems[existingIndex].qty + req.qty,
                approved: true
              };
              return { ...o, items: updatedItems };
            } else {
              const newItem: BudgetLineItem = {
                id: `item-${Date.now()}`,
                ...orderPartItem,
                approved: true
              };
              return { ...o, items: [...o.items, newItem] };
            }
          }
          return o;
        }));
      }
    }
  };

  // 8. Financial Transactions (Payments / Invoicing)
  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const registerOrderPayment = (orderId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Credito') => {
    const paymentId = `pay-${Date.now()}`;
    const paymentDate = new Date().toISOString();
    
    // Add payment to service order
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          payments: [...o.payments, { id: paymentId, amount, date: paymentDate, method }]
        };
      }
      return o;
    }));

    // If method is Credit, increase Client's credit balance
    const order = orders.find(o => o.id === orderId);
    if (order && method === 'Credito') {
      setClients(prev => prev.map(c => {
        if (c.id === order.clientId) {
          return {
            ...c,
            creditBalance: c.creditBalance + amount
          };
        }
        return c;
      }));
    }

    // Register income transaction
    const client = clients.find(c => c.id === order?.clientId);
    addTransaction({
      type: 'Ingreso',
      category: 'Pago_Cliente',
      amount,
      description: `Pago ${method} por Orden ${orderId} - Cliente: ${client?.name || 'Cliente'}`,
      referenceId: orderId
    });
  };

  const handleClientCreditPayment = (clientId: string, amount: number, method: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          creditBalance: Math.max(0, c.creditBalance - amount)
        };
      }
      return c;
    }));

    const client = clients.find(c => c.id === clientId);
    addTransaction({
      type: 'Ingreso',
      category: 'Pago_Cliente',
      amount,
      description: `Abono a cuenta de crédito - Cliente: ${client?.name || 'Cliente'}`
    });
  };

  // 9. Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  // 10. Maintenance Orders (MTO) CRUD
  const addMaintenanceOrder = (newOrderData: Omit<MaintenanceOrder, 'id' | 'folio'>) => {
    const maxFolio = maintenanceOrders.reduce((max, o) => (o.folio > max ? o.folio : max), 7049);
    const nextFolio = maxFolio + 1;
    const newMtoOrder: MaintenanceOrder = {
      ...newOrderData,
      id: `mto-${nextFolio}`,
      folio: nextFolio
    };
    setMaintenanceOrders(prev => [newMtoOrder, ...prev]);
    return newMtoOrder;
  };

  const updateMaintenanceOrder = (id: string, updatedData: Partial<MaintenanceOrder>) => {
    setMaintenanceOrders(prev => prev.map(o => o.id === id ? { ...o, ...updatedData } : o));
  };

  const deleteMaintenanceOrder = (id: string) => {
    setMaintenanceOrders(prev => prev.filter(o => o.id !== id));
  };

  // 11. Predictive Maintenance & Calendar CRUD
  const addEquipmentToCalendar = (eq: Omit<EquipmentCalendarRow, 'id'>) => {
    const newEq: EquipmentCalendarRow = {
      ...eq,
      id: `eq-${Date.now()}`
    };
    setCalendarEquipment(prev => [...prev, newEq]);
    return newEq;
  };

  const updateCalendarCell = (
    equipmentId: string, 
    weekNumber: number, 
    cellType: 'planned' | 'realized', 
    value: PlannedFrequencyCode | ExecutionStatusCode | ''
  ) => {
    setCalendarEquipment(prev => prev.map(eq => {
      if (eq.id !== equipmentId) return eq;
      const updatedObj = { ...eq[cellType] };
      if (!value) {
        delete updatedObj[weekNumber];
      } else {
        updatedObj[weekNumber] = value as any;
      }
      return {
        ...eq,
        [cellType]: updatedObj
      };
    }));
  };

  const updateEquipmentDetails = (id: string, partial: Partial<EquipmentCalendarRow>) => {
    setCalendarEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, ...partial } : eq));
  };

  const deleteEquipmentFromCalendar = (id: string) => {
    setCalendarEquipment(prev => prev.filter(eq => eq.id !== id));
  };

  // 12. Predictive Records CRUD
  const addPredictiveRecord = (rec: Omit<PredictiveMaintenanceRecord, 'id'>) => {
    const newRec: PredictiveMaintenanceRecord = {
      ...rec,
      id: `rec-${Date.now()}`
    };
    setPredictiveRecords(prev => [newRec, ...prev]);

    // Automatically check if reminder should be created
    if (rec.executionStatus === 'X') {
      addReminder({
        title: `Mantenimiento Reprogramado (S${rec.weekNumber})`,
        equipmentName: rec.equipmentName,
        weekNumber: rec.weekNumber,
        type: 'VENCIDO',
        dueDate: rec.scheduledDate,
        urgency: 'CRITICA',
        message: `El mantenimiento para ${rec.equipmentName} registrado en la semana ${rec.weekNumber} ha sido pospuesto/reprogramado. Razón: ${rec.observations}`,
        read: false,
        attended: false,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    } else if (rec.executionStatus === 'EC') {
      addReminder({
        title: `🚨 Alerta de Equipo Caído (S${rec.weekNumber})`,
        equipmentName: rec.equipmentName,
        weekNumber: rec.weekNumber,
        type: 'EQUIPO_CAIDO',
        dueDate: rec.scheduledDate,
        urgency: 'CRITICA',
        message: `EQUIPO CAÍDO: ${rec.equipmentName}. Requiere intervención técnica urgente.`,
        read: false,
        attended: false,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      });
    }

    return newRec;
  };

  const updatePredictiveRecord = (id: string, partial: Partial<PredictiveMaintenanceRecord>) => {
    setPredictiveRecords(prev => prev.map(r => r.id === id ? { ...r, ...partial } : r));
  };

  const deletePredictiveRecord = (id: string) => {
    setPredictiveRecords(prev => prev.filter(r => r.id !== id));
  };

  // 13. Reminders & Notifications CRUD
  const addReminder = (rem: Omit<MaintenanceReminder, 'id'>) => {
    const newRem: MaintenanceReminder = {
      ...rem,
      id: `rem-${Date.now()}`
    };
    setReminders(prev => [newRem, ...prev]);

    // Send browser desktop notification if supported & permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newRem.title, {
          body: `${newRem.equipmentName}: ${newRem.message}`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.log('Notification API error:', e);
      }
    }

    return newRem;
  };

  const markReminderAttended = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, attended: true, read: true } : r));
  };

  const markReminderRead = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, read: true } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Reset database to initial values
  const resetDatabase = () => {
    setClients(INITIAL_CLIENTS);
    setVehicles(INITIAL_VEHICLES);
    setEmployees(INITIAL_EMPLOYEES);
    setInventory(INITIAL_INVENTORY);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setRequisitions(INITIAL_REQUISITIONS);
    setOrders(INITIAL_ORDERS);
    setMaintenanceOrders(INITIAL_MAINTENANCE_ORDERS);
    setCalendarEquipment(INITIAL_CALENDAR_EQUIPMENT);
    setPredictiveRecords(INITIAL_PREDICTIVE_RECORDS);
    setReminders(INITIAL_MAINTENANCE_REMINDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    
    localStorage.setItem('wt_clients', JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem('wt_vehicles', JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem('wt_employees', JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem('wt_inventory', JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem('wt_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem('wt_purchase_orders', JSON.stringify(INITIAL_PURCHASE_ORDERS));
    localStorage.setItem('wt_requisitions', JSON.stringify(INITIAL_REQUISITIONS));
    localStorage.setItem('wt_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('wt_mto_orders', JSON.stringify(INITIAL_MAINTENANCE_ORDERS));
    localStorage.setItem('wt_calendar_equipment', JSON.stringify(INITIAL_CALENDAR_EQUIPMENT));
    localStorage.setItem('wt_predictive_records', JSON.stringify(INITIAL_PREDICTIVE_RECORDS));
    localStorage.setItem('wt_reminders', JSON.stringify(INITIAL_MAINTENANCE_REMINDERS));
    localStorage.setItem('wt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem('wt_settings', JSON.stringify(INITIAL_SETTINGS));
  };


  // Historical Maintenance Orders Actions
  const addHistoricalOrder = (order: Omit<HistoricalMaintenanceOrder, 'id'>) => {
    const newRecord: HistoricalMaintenanceOrder = {
      ...order,
      id: `hist-${Date.now()}`
    };
    setHistoricalOrders(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updateHistoricalOrder = (id: string, updated: Partial<HistoricalMaintenanceOrder>) => {
    setHistoricalOrders(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
  };

  const deleteHistoricalOrder = (id: string) => {
    setHistoricalOrders(prev => prev.filter(item => item.id !== id));
  };

  return {
    clients,
    vehicles,
    employees,
    inventory,
    suppliers,
    purchaseOrders,
    requisitions,
    orders,
    maintenanceOrders,
    calendarEquipment,
    predictiveRecords,
    reminders,
    historicalOrders,
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
    addMaintenanceOrder,
    updateMaintenanceOrder,
    deleteMaintenanceOrder,
    addEquipmentToCalendar,
    updateCalendarCell,
    updateEquipmentDetails,
    deleteEquipmentFromCalendar,
    addPredictiveRecord,
    updatePredictiveRecord,
    deletePredictiveRecord,
    addReminder,
    markReminderAttended,
    markReminderRead,
    deleteReminder,
    addHistoricalOrder,
    updateHistoricalOrder,
    deleteHistoricalOrder,
    resetDatabase

  };

}
