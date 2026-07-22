import { Client, Vehicle, Employee, InventoryItem, Supplier, ServiceOrder, Transaction, WorkshopSettings, PartRequisition, PurchaseOrder, MaintenanceOrder } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Alejandro González Pérez',
    phone: '55-1234-5678',
    email: 'alejandro.glez@gmail.com',
    address: 'Av. Insurgentes Sur 432, Del. Cuauhtémoc, CDMX',
    creditLimit: 15000,
    creditBalance: 4500
  },
  {
    id: 'cli-2',
    name: 'María Elena Fuentes Luna',
    phone: '55-8765-4321',
    email: 'maria.fuentes@outlook.com',
    address: 'Calle Juárez 45, Coyoacán, CDMX',
    creditLimit: 5000,
    creditBalance: 0
  },
  {
    id: 'cli-3',
    name: 'Carlos Mendoza Ruiz',
    phone: '55-2468-1357',
    email: 'carlos.mendoza@mendozaconsultores.mx',
    address: 'Paseo de la Reforma 115, Lomas de Chapultepec, CDMX',
    creditLimit: 30000,
    creditBalance: 12500
  },
  {
    id: 'cli-4',
    name: 'Sofía Rodríguez Vega',
    phone: '55-9876-1234',
    email: 'sofia.vega@hotmail.com',
    address: 'Av. Revolución 1024, Mixcoac, CDMX',
    creditLimit: 0,
    creditBalance: 0
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    ownerId: 'cli-1',
    brand: 'Volkswagen',
    model: 'Jetta',
    year: 2019,
    plate: '931-WYZ',
    vin: '3VW2K7AJ0KM123456',
    mileage: 65400,
    color: 'Rojo Metálico',
    engomadoColor: 'pink', // Plate ending 7,8 -> Pink (Rosa)
    plateEnding: '8'
  },
  {
    id: 'veh-2',
    ownerId: 'cli-2',
    brand: 'Nissan',
    model: 'Versa',
    year: 2021,
    plate: '582-ABC',
    vin: '1N4AL3APXMC456789',
    mileage: 34200,
    color: 'Gris Platino',
    engomadoColor: 'yellow', // Plate ending 5,6 -> Yellow (Amarillo)
    plateEnding: '5'
  },
  {
    id: 'veh-3',
    ownerId: 'cli-3',
    brand: 'Honda',
    model: 'CR-V',
    year: 2017,
    plate: '123-XYZ',
    vin: '5J8YH1H57HL987654',
    mileage: 112000,
    color: 'Blanco Perlado',
    engomadoColor: 'green', // Plate ending 1,2 -> Green (Verde)
    plateEnding: '2'
  },
  {
    id: 'veh-4',
    ownerId: 'cli-3',
    brand: 'Toyota',
    model: 'Prius',
    year: 2020,
    plate: '456-LMN',
    vin: 'JTDKN3DU0L3456789',
    mileage: 48000,
    color: 'Azul Eléctrico',
    engomadoColor: 'blue', // Plate ending 9,0 -> Blue (Azul)
    plateEnding: '0'
  },
  {
    id: 'veh-5',
    ownerId: 'cli-4',
    brand: 'Chevrolet',
    model: 'Aveo',
    year: 2018,
    plate: '789-DEF',
    vin: 'KL1TA5SB2JC123987',
    mileage: 89300,
    color: 'Negro Brillante',
    engomadoColor: 'red', // Plate ending 3,4 -> Red (Rojo)
    plateEnding: '3'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Ing. Fernando Pérez',
    role: 'Asesor',
    commissionRate: 5, // 5% of total sales serviced
    active: true,
    phone: '55-1111-2222'
  },
  {
    id: 'emp-2',
    name: 'Juan Carlos "El Charly" Ramos',
    role: 'Mecanico',
    commissionRate: 15, // 15% of labor billed
    active: true,
    phone: '55-3333-4444'
  },
  {
    id: 'emp-3',
    name: 'Martín "El Tuercas" Domínguez',
    role: 'Mecanico',
    commissionRate: 18, // Senior mechanic: 18% of labor billed
    active: true,
    phone: '55-5555-6666'
  },
  {
    id: 'emp-5',
    name: 'Carlos "El Chispa" Gómez',
    role: 'Mecanico',
    commissionRate: 15,
    active: true,
    phone: '55-2222-3333'
  },
  {
    id: 'emp-6',
    name: 'Luis "El Afinaciones" Rodríguez',
    role: 'Mecanico',
    commissionRate: 15,
    active: true,
    phone: '55-4444-5555'
  },
  {
    id: 'emp-7',
    name: 'Mario "El Pistón" Sánchez',
    role: 'Mecanico',
    commissionRate: 15,
    active: true,
    phone: '55-6666-7777'
  },
  {
    id: 'emp-8',
    name: 'Jorge "El Muelles" López',
    role: 'Mecanico',
    commissionRate: 15,
    active: true,
    phone: '55-8888-9999'
  },
  {
    id: 'emp-9',
    name: 'Roberto "El Escáner" Díaz',
    role: 'Mecanico',
    commissionRate: 16,
    active: true,
    phone: '55-9999-0000'
  },
  {
    id: 'emp-4',
    name: 'Ana María Torres',
    role: 'Cajero',
    commissionRate: 0,
    active: true,
    phone: '55-7777-8888'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'part-1',
    code: 'ACE-5W30-SYN',
    name: 'Aceite Sintético 5W30 Mobil 1 (1L)',
    brand: 'Mobil 1',
    compatibility: 'Universal (Motores a gasolina modernos)',
    stock: 24,
    minStock: 8,
    cost: 180,
    price: 290
  },
  {
    id: 'part-2',
    code: 'FIL-ACE-PH6607',
    name: 'Filtro de Aceite Fram Extra Guard',
    brand: 'Fram',
    compatibility: 'Nissan Versa, March, Sentra, Honda Civic',
    stock: 12,
    minStock: 5,
    cost: 75,
    price: 140
  },
  {
    id: 'part-3',
    code: 'BAL-DEL-JETTA',
    name: 'Balatas Delanteras de Cerámica Wagner',
    brand: 'Wagner',
    compatibility: 'VW Jetta A6 (2015-2019), Golf VII',
    stock: 3,
    minStock: 4, // Trigger stock alert
    cost: 450,
    price: 890
  },
  {
    id: 'part-4',
    code: 'FIL-AIRE-CA1001',
    name: 'Filtro de Aire Motor Interfil',
    brand: 'Interfil',
    compatibility: 'VW Jetta, Beetle, Bora',
    stock: 2,
    minStock: 4, // Trigger stock alert
    cost: 95,
    price: 195
  },
  {
    id: 'part-5',
    code: 'BUJ-NGK-IRID',
    name: 'Bujía de Iridio NGK Láser (1 pza)',
    brand: 'NGK',
    compatibility: 'Universal - Motores de Alta Eficiencia',
    stock: 48,
    minStock: 16,
    cost: 110,
    price: 215
  },
  {
    id: 'part-6',
    code: 'KIT-DIST-VERSA',
    name: 'Kit de Distribución (Banda y Poleas) Gates',
    brand: 'Gates',
    compatibility: 'Nissan Versa (2012-2020), Tiida 1.6L',
    stock: 1,
    minStock: 2, // Trigger stock alert
    cost: 1200,
    price: 2100
  },
  {
    id: 'part-7',
    code: 'AMORT-TRAS-CRV',
    name: 'Amortiguador Trasero de Gas Monroe',
    brand: 'Monroe',
    compatibility: 'Honda CR-V (2015-2019)',
    stock: 6,
    minStock: 2,
    cost: 780,
    price: 1450
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Refaccionaria California S.A. de C.V.',
    contact: 'Lic. Gerardo Martínez',
    phone: '55-8000-1234',
    email: 'pedidos@refaccionariacalifornia.com.mx',
    address: 'Av. Ceylan 590, Industrial Vallejo, Azcapotzalco, CDMX'
  },
  {
    id: 'sup-2',
    name: 'AutoZone México - Sucursal Coyoacán',
    contact: 'Ing. Rodrigo Silva',
    phone: '55-9000-5678',
    email: 'ventascoyoacan@autozone.com',
    address: 'Av. División del Norte 2400, Coyoacán, CDMX'
  },
  {
    id: 'sup-3',
    name: 'Distribuidora Gates y NGK del Centro',
    contact: 'Sra. Carmen Ortiz',
    phone: '55-4000-9876',
    email: 'contacto@distribuidora-centro.mx',
    address: 'Calle Artículo 123 No. 45, Centro Histórico, CDMX'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'OC-1001',
    supplierId: 'sup-1',
    date: '2026-07-01',
    status: 'Recibido',
    items: [
      { itemId: 'part-1', qty: 12, cost: 180 },
      { itemId: 'part-2', qty: 10, cost: 75 }
    ],
    total: 2910
  },
  {
    id: 'OC-1002',
    supplierId: 'sup-2',
    date: '2026-07-10',
    status: 'Pendiente',
    items: [
      { itemId: 'part-3', qty: 5, cost: 450 },
      { itemId: 'part-4', qty: 5, cost: 95 }
    ],
    total: 2725
  }
];

export const INITIAL_REQUISITIONS: PartRequisition[] = [
  {
    id: 'req-1',
    orderId: 'OS-1001',
    itemId: 'part-3',
    qty: 1,
    mechanicId: 'emp-2',
    status: 'Despachado',
    date: '2026-07-14'
  },
  {
    id: 'req-2',
    orderId: 'OS-1002',
    itemId: 'part-1',
    qty: 4,
    mechanicId: 'emp-3',
    status: 'Pendiente',
    date: '2026-07-15'
  }
];

export const INITIAL_ORDERS: ServiceOrder[] = [
  {
    id: 'OS-1001',
    clientId: 'cli-1',
    vehicleId: 'veh-1',
    advisorId: 'emp-1',
    mechanicId: 'emp-2',
    reportedFailure: 'El pedal de freno se siente esponjoso y rechina al frenar a alta velocidad.',
    checklist: {
      scratches: true,
      dents: false,
      fuelLevel: 50,
      tools: true,
      spareTire: true,
      jack: true,
      extinguisher: false,
      photos: ['https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=400&auto=format&fit=crop&q=60']
    },
    diagnostics: 'Desgaste severo en balatas delanteras (menos de 2mm de vida). Los discos delanteros requieren rectificación por ligera cristalización. El líquido de frenos tiene humedad y requiere purga del sistema.',
    diagnosticPhotos: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=60'],
    status: 'En_Reparacion',
    items: [
      {
        id: 'item-1',
        type: 'refaccion',
        description: 'Balatas Delanteras de Cerámica Wagner (Código: BAL-DEL-JETTA)',
        qty: 1,
        unitPrice: 890,
        approved: true
      },
      {
        id: 'item-2',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Instalación de Balatas y Rectificado de Discos',
        qty: 1,
        unitPrice: 650,
        approved: true
      },
      {
        id: 'item-3',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Purga completa y cambio de líquido de frenos',
        qty: 1,
        unitPrice: 400,
        approved: true
      },
      {
        id: 'item-4',
        type: 'refaccion',
        description: 'Líquido de frenos Synthetic DOT 4 (Insumo)',
        qty: 1,
        unitPrice: 180,
        approved: true
      }
    ],
    timeLogs: [
      { action: 'start', timestamp: '2026-07-14T09:00:00' },
      { action: 'pause', timestamp: '2026-07-14T11:30:00', reason: 'Falta de refacción' },
      { action: 'resume', timestamp: '2026-07-14T14:00:00' },
      { action: 'stop', timestamp: '2026-07-14T18:00:00' },
      { action: 'start', timestamp: '2026-07-15T09:00:00' }
    ],
    isClockedIn: true,
    isPaused: false,
    totalHoursWorked: 11.5,
    dateOpened: '2026-07-14T08:30:00',
    payments: []
  },
  {
    id: 'OS-1002',
    clientId: 'cli-2',
    vehicleId: 'veh-2',
    advisorId: 'emp-1',
    mechanicId: 'emp-3',
    reportedFailure: 'Servicio de afinación mayor de los 30,000 kilómetros. Reporta leve vibración en el motor al estar en semáforos.',
    checklist: {
      scratches: false,
      dents: true,
      fuelLevel: 25,
      tools: true,
      spareTire: true,
      jack: true,
      extinguisher: true,
      photos: []
    },
    diagnostics: 'Se requiere afinación mayor (cambio de bujías, filtros de aire, gasolina y aceite). La vibración se debe a un soporte de motor derecho ligeramente agrietado, se sugiere reemplazo en este servicio.',
    diagnosticPhotos: [],
    status: 'Esperando_Refacciones',
    items: [
      {
        id: 'item-2-1',
        type: 'refaccion',
        description: 'Filtro de Aceite Fram Extra Guard (Código: FIL-ACE-PH6607)',
        qty: 1,
        unitPrice: 140,
        approved: true
      },
      {
        id: 'item-2-2',
        type: 'refaccion',
        description: 'Aceite Sintético 5W30 Mobil 1 (4 Litros)',
        qty: 4,
        unitPrice: 290,
        approved: true
      },
      {
        id: 'item-2-3',
        type: 'refaccion',
        description: 'Bujía de Iridio NGK Láser (4 piezas)',
        qty: 4,
        unitPrice: 215,
        approved: true
      },
      {
        id: 'item-2-4',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Afinación Mayor Nissan Versa',
        qty: 1,
        unitPrice: 1200,
        approved: true
      },
      {
        id: 'item-2-5',
        type: 'refaccion',
        description: 'Soporte de Motor Derecho Genuino Nissan (Sugerido)',
        qty: 1,
        unitPrice: 1850,
        approved: null // Waiting for customer digital approval!
      },
      {
        id: 'item-2-6',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Reemplazo de Soporte de Motor',
        qty: 1,
        unitPrice: 600,
        approved: null // Waiting for customer digital approval!
      }
    ],
    timeLogs: [],
    isClockedIn: false,
    isPaused: false,
    totalHoursWorked: 0,
    dateOpened: '2026-07-15T10:15:00',
    payments: []
  },
  {
    id: 'OS-1003',
    clientId: 'cli-3',
    vehicleId: 'veh-3',
    advisorId: 'emp-1',
    mechanicId: 'emp-2',
    reportedFailure: 'Tironeo en subidas e indicador de "Check Engine" encendido.',
    checklist: {
      scratches: true,
      dents: true,
      fuelLevel: 75,
      tools: false,
      spareTire: true,
      jack: false,
      extinguisher: false,
      photos: []
    },
    diagnostics: 'Escaneo OBD-II arroja código P0302 (Fallo de encendido en Cilindro 2). Se revisó bobina de encendido y presenta resistencia fuera de rango. Se sugiere reemplazo de bobina e inspección de cables.',
    diagnosticPhotos: [],
    status: 'Diagnostico',
    items: [
      {
        id: 'item-3-1',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Diagnóstico Computarizado por Escaneo OBD-II',
        qty: 1,
        unitPrice: 450,
        approved: true
      },
      {
        id: 'item-3-2',
        type: 'refaccion',
        description: 'Bobina de Encendido Genuina Honda Denso',
        qty: 1,
        unitPrice: 2450,
        approved: null
      }
    ],
    timeLogs: [],
    isClockedIn: false,
    isPaused: false,
    totalHoursWorked: 0.5,
    dateOpened: '2026-07-15T12:00:00',
    payments: []
  },
  {
    id: 'OS-1004',
    clientId: 'cli-3',
    vehicleId: 'veh-4',
    advisorId: 'emp-1',
    mechanicId: 'emp-3',
    reportedFailure: 'Ruido metálico en suspensión trasera al pasar baches (sonido como matraca).',
    checklist: {
      scratches: false,
      dents: false,
      fuelLevel: 100,
      tools: true,
      spareTire: true,
      jack: true,
      extinguisher: true,
      photos: []
    },
    diagnostics: 'Los bujes de los brazos oscilantes traseros se encuentran completamente destruidos, permitiendo rozamiento de metal con metal. El amortiguador trasero izquierdo presenta fuga de aceite.',
    diagnosticPhotos: [],
    status: 'Listo_Entrega',
    items: [
      {
        id: 'item-4-1',
        type: 'refaccion',
        description: 'Kit de bujes de suspensión trasera de poliuretano',
        qty: 1,
        unitPrice: 1100,
        approved: true
      },
      {
        id: 'item-4-2',
        type: 'refaccion',
        description: 'Amortiguador Trasero de Gas Monroe (Código: AMORT-TRAS-CRV)',
        qty: 2,
        unitPrice: 1450,
        approved: true
      },
      {
        id: 'item-4-3',
        type: 'mano_de_obra',
        description: 'Mano de Obra - Instalación de amortiguadores y kit de bujes traseros',
        qty: 1,
        unitPrice: 1500,
        approved: true
      }
    ],
    timeLogs: [
      { action: 'start', timestamp: '2026-07-13T10:00:00' },
      { action: 'stop', timestamp: '2026-07-13T15:30:00' }
    ],
    isClockedIn: false,
    isPaused: false,
    totalHoursWorked: 5.5,
    dateOpened: '2026-07-13T09:00:00',
    dateClosed: '2026-07-15T11:00:00',
    payments: [
      {
        id: 'pay-1',
        amount: 5500, // Partial paid
        date: '2026-07-15T11:15:00',
        method: 'Tarjeta'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'Ingreso',
    category: 'Pago_Cliente',
    amount: 5500,
    date: '2026-07-15',
    description: 'Abono / Pago de la Orden OS-1004 - Honda CR-V (Cliente: Carlos Mendoza)',
    referenceId: 'OS-1004'
  },
  {
    id: 'tx-2',
    type: 'Egreso',
    category: 'Proveedor',
    amount: 2910,
    date: '2026-07-02',
    description: 'Pago de Orden de Compra OC-1001 a Refaccionaria California S.A. de C.V.',
    referenceId: 'sup-1'
  },
  {
    id: 'tx-3',
    type: 'Egreso',
    category: 'Nomina',
    amount: 12500,
    date: '2026-07-14',
    description: 'Nómina quincenal personal operativo y administrativo',
    referenceId: 'emp-4'
  },
  {
    id: 'tx-4',
    type: 'Egreso',
    category: 'Servicios',
    amount: 3200,
    date: '2026-07-05',
    description: 'Pago de energía eléctrica CFE y agua potable del taller'
  },
  {
    id: 'tx-5',
    type: 'Ingreso',
    category: 'Pago_Cliente',
    amount: 3500,
    date: '2026-07-12',
    description: 'Pago total por servicio de afinación previa del Chevrolet Aveo (Cliente: Sofía Rodríguez)',
    referenceId: 'OS-0999'
  }
];

export const INITIAL_SETTINGS: WorkshopSettings = {
  name: 'T+H Automotive',
  rfc: 'AUT150820MX7',
  address: 'Mixtecas 288, Ajusco, Coyoacán, 04300 Ciudad de México, CDMX',
  phone: '55 1384 6680',
  email: 'contacto@thautomotive.com.mx',
  logoUrl: 'https://appdesignproyectos.com/tha.png', // Logo provided by user
  terms: '1. Toda cotización tiene una vigencia de 15 días naturales.\n2. No nos hacemos responsables por objetos de valor no registrados en el inventario/checklist de entrada.\n3. Los vehículos con más de 48 horas de listos sin ser retirados causarán un costo de resguardo de $150 MXN por día.',
  taxRate: 16, // IVA 16% México
  bankDetails: 'Banco BBVA Bancomer • Beneficiario: T+H Automotive S.A. de C.V. • Cuenta: 0123 4567 8901 • CLABE: 0121 8000 1234 5678 90'
};

export const INITIAL_MAINTENANCE_ORDERS: MaintenanceOrder[] = [
  {
    id: 'mto-7050',
    folio: 7050,
    status: 'En_Proceso',
    documentCode: 'MT0301F1',
    revision: 'Rev. 01',
    createdBy: 'A. Castellanos',
    lastUpdate: '24-Oct-2025',
    solicitante: 'Juan Pérez / Ing. Producción',
    area: 'Área de Prensas / Ensamble',
    fechaSolicitud: '2026-07-22',
    nombreEquipo: 'Prensa Hidráulica H-500',
    proyecto: 'Proyecto Chasis T+H',
    horaInicial: '08:30',
    tipoServicio: 'CORRECTIVO',
    tipoAjuste: 'Ajuste de válvulas de presión y rectificación de fuga',
    descripcionFalla: 'Fuga de fluido hidráulico en electroválvula principal YV-02 y sobrecalentamiento del bloque manifold.',
    ordenAtendidaPor: 'A. Castellanos / T. Mantenimiento',
    fechaMantenimiento: '2026-07-22',
    horaFinal: '11:45',
    recibeProduccionFirmaHora: 'Ing. R. Gómez (11:50 hrs)',
    recibeCalidadFirmaHora: 'Lic. M. Torres (12:00 hrs)',
    refaccionesUtilizadas: '1x Empaque O-Ring NBR 90, 2 Lts Aceite Hidráulico ISO VG 68',
    numeroNAV: 'NAV-88402',
    descripcionServicioEfectuado: 'Se reemplazó empaque O-Ring dañado, se reapretaron conectores y se rellenó fluido hidráulico a nivel de trabajo.',
    tipoFalla: ['HIDRAULICA', 'MECANICA']
  },
  {
    id: 'mto-7051',
    folio: 7051,
    status: 'Completado',
    documentCode: 'MT0301F1',
    revision: 'Rev. 01',
    createdBy: 'A. Castellanos',
    lastUpdate: '24-Oct-2025',
    solicitante: 'Miguel Ángel Vázquez',
    area: 'Línea de Ensamble B',
    fechaSolicitud: '2026-07-20',
    nombreEquipo: 'Torno CNC Haas ST-20',
    proyecto: 'Ejes Automotrices',
    horaInicial: '07:00',
    tipoServicio: 'PREVENTIVO',
    tipoAjuste: 'Limpieza de filtros y calibración de torreta',
    descripcionFalla: 'Mantenimiento preventivo programado de 500 horas de operación.',
    ordenAtendidaPor: 'A. Castellanos',
    fechaMantenimiento: '2026-07-20',
    horaFinal: '10:00',
    recibeProduccionFirmaHora: 'M. Vázquez (10:05 hrs)',
    recibeCalidadFirmaHora: 'Ing. C. Ruiz (10:15 hrs)',
    refaccionesUtilizadas: 'Filtro de refrigerante sintético, Grasa sintética Mobil EP2',
    numeroNAV: 'NAV-91023',
    descripcionServicioEfectuado: 'Se realizó cambio de filtros de refrigerante, engrase general de guías y alineación del chuck.',
    tipoFalla: ['MECANICA', 'TERMINÓ EL PLAN DE PRODUCCIÓN']
  }
];

