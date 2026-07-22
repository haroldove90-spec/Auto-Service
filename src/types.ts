/**
 * Types and interfaces for the Mechanic Workshop Management System (InterTaller)
 */

export type UserRole = 'admin' | 'advisor' | 'mechanic' | 'warehouse' | 'client';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: number;
  creditBalance: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
  color: string;
  engomadoColor: 'yellow' | 'pink' | 'red' | 'green' | 'blue'; // CDMX verification
  plateEnding: string; // CDMX verification
}

export type EmployeeRole = 'Cajero' | 'Asesor' | 'Mecanico';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  commissionRate: number; // e.g. 15 for 15%
  active: boolean;
  phone: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  compatibility: string; // Description of compatible vehicles
  stock: number;
  minStock: number;
  cost: number;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  date: string;
  status: 'Pendiente' | 'Recibido';
  items: {
    itemId: string;
    qty: number;
    cost: number;
  }[];
  total: number;
}

export interface PartRequisition {
  id: string;
  orderId: string; // Service Order ID
  itemId: string;
  qty: number;
  mechanicId: string;
  status: 'Pendiente' | 'Despachado' | 'Rechazado';
  date: string;
}

export interface Checklist {
  scratches: boolean;
  dents: boolean;
  fuelLevel: number; // 0, 25, 50, 75, 100
  tools: boolean;
  spareTire: boolean;
  jack: boolean;
  extinguisher: boolean;
  photos: string[]; // Mock data URI or text
}

export interface BudgetLineItem {
  id: string;
  type: 'refaccion' | 'mano_de_obra';
  description: string;
  qty: number;
  unitPrice: number;
  approved: boolean | null; // null = Pending, true = Approved, false = Rejected
}

export interface TimeLog {
  action: 'start' | 'pause' | 'resume' | 'stop';
  timestamp: string;
  reason?: string; // e.g. "Falta de refacción"
}

export type OrderStatus = 'Diagnostico' | 'Esperando_Refacciones' | 'En_Reparacion' | 'Control_Calidad' | 'Listo_Entrega';

export interface ServiceOrder {
  id: string; // OS-XXXX
  clientId: string;
  vehicleId: string;
  advisorId: string;
  mechanicId: string;
  reportedFailure: string; // Motivo de visita / Falla reportada
  checklist: Checklist;
  diagnostics: string; // Notas del mecánico
  diagnosticPhotos: string[]; // Evidence photos
  status: OrderStatus;
  items: BudgetLineItem[];
  timeLogs: TimeLog[];
  isClockedIn: boolean;
  isPaused: boolean;
  totalHoursWorked: number; // calculated hours
  dateOpened: string;
  dateClosed?: string;
  payments: {
    id: string;
    amount: number;
    date: string;
    method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Credito';
  }[];
}

export type TransactionType = 'Ingreso' | 'Egreso';
export type TransactionCategory = 'Pago_Cliente' | 'Proveedor' | 'Nomina' | 'Servicios' | 'Otros';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // ServiceOrder id or Supplier id
}

export interface WorkshopSettings {
  name: string;
  rfc: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  terms: string;
  taxRate: number; // e.g. 16 for 16% (IVA México)
  bankDetails: string;
}

export type MaintenanceServiceType = 'CORRECTIVO' | 'PREVENTIVO' | 'CAMBIO HTA SET-UP' | 'INSTALACION NUEVA' | 'MODIFICACION' | 'CFF' | 'OTROS ESPECIFIQUE';

export interface MaintenanceOrder {
  id: string; // mto-7050
  folio: number; // 7050
  status: 'Pendiente' | 'En_Proceso' | 'Completado' | 'Cancelado';
  documentCode: string; // MT0301F1
  revision: string; // Rev. 01
  createdBy: string; // A. Castellanos
  lastUpdate: string; // 24-Oct-2025
  
  // Section 1: PARA SER LLENADA POR EL AREA QUE REQUIERE EL SERVICIO
  solicitante: string;
  area: string;
  fechaSolicitud: string;
  nombreEquipo: string;
  proyecto: string;
  horaInicial: string;
  tipoServicio: MaintenanceServiceType;
  tipoServicioOtros?: string;
  tipoAjuste: string;
  descripcionFalla: string;

  // Section 2: PARA SER LLENADA POR MANTENIMIENTO
  ordenAtendidaPor: string;
  fechaMantenimiento: string;
  horaFinal: string;
  recibeProduccionFirmaHora: string;
  recibeCalidadFirmaHora: string;
  refaccionesUtilizadas: string;
  numeroNAV: string;
  descripcionServicioEfectuado: string;
  tipoFalla: string[]; // ['ELECTRICA', 'MECANICA', etc.]
}

