import { Product, ProductionOrder, Sale, Purchase, Shipment, Transaction, Employee } from "./types"

export const initialProducts: Product[] = [
  { id: "1", name: "Madera Pino 2x4", sku: "WD-PIN-001", category: "Materia Prima", stock: 500, minStock: 100, price: 18.50, cost: 12.00, unit: "Pieza", location: "Almacén A", status: "active" },
  { id: "2", name: "Barniz Roble", sku: "CH-BAR-002", category: "Insumos", stock: 45, minStock: 50, price: 35.00, cost: 22.00, unit: "Galón", location: "Almacén B", status: "low_stock" },
  { id: "3", name: "Silla Comedor", sku: "FUR-CHR-003", category: "Producto Terminado", stock: 120, minStock: 20, price: 85.00, cost: 45.00, unit: "Unidad", location: "Showroom", status: "active" },
  { id: "4", name: "Mesa Centro", sku: "FUR-TBL-004", category: "Producto Terminado", stock: 0, minStock: 10, price: 150.00, cost: 80.00, unit: "Unidad", location: "Showroom", status: "out_of_stock" },
  { id: "5", name: "Tela Tapiz Gris", sku: "TX-GRY-005", category: "Materia Prima", stock: 200, minStock: 50, price: 12.00, cost: 8.00, unit: "Metro", location: "Almacén A", status: "active" },
  { id: "6", name: "Pegamento Industrial", sku: "CH-GLU-006", category: "Insumos", stock: 30, minStock: 15, price: 25.00, cost: 15.00, unit: "Litro", location: "Almacén B", status: "active" },
]

export const initialProduction: ProductionOrder[] = [
  { id: "PO-2024-001", productName: "Silla Comedor", quantity: 50, startDate: "2024-03-10", endDate: "2024-03-15", status: "completed", batchId: "B-101", waste: 2.5, cost: 1200, plant: "Planta Principal" },
  { id: "PO-2024-002", productName: "Mesa Centro", quantity: 20, startDate: "2024-03-16", endDate: "2024-03-20", status: "in_progress", batchId: "B-102", waste: 0, cost: 800, plant: "Planta Principal" },
  { id: "PO-2024-003", productName: "Estante Libros", quantity: 30, startDate: "2024-03-21", endDate: "2024-03-25", status: "planned", batchId: "B-103", waste: 0, cost: 0, plant: "Planta Auxiliar" },
  { id: "PO-2024-004", productName: "Silla Comedor", quantity: 100, startDate: "2024-03-01", endDate: "2024-03-08", status: "completed", batchId: "B-099", waste: 3.1, cost: 2300, plant: "Planta Principal" },
]

export const initialSales: Sale[] = [
  { id: "SO-001", customer: "Muebles del Norte", date: "2024-03-18", total: 4250.00, status: "shipped", paymentMethod: "Transferencia", items: [{ productId: "3", quantity: 50, price: 85.00, productName: "Silla Comedor" }] },
  { id: "SO-002", customer: "Decoración Interior", date: "2024-03-19", total: 1500.00, status: "paid", paymentMethod: "Tarjeta", items: [{ productId: "4", quantity: 10, price: 150.00, productName: "Mesa Centro" }] },
  { id: "SO-003", customer: "Cliente Particular", date: "2024-03-20", total: 170.00, status: "pending", paymentMethod: "Efectivo", items: [{ productId: "3", quantity: 2, price: 85.00, productName: "Silla Comedor" }] },
]

export const initialPurchases: Purchase[] = [
  { id: "PO-001", supplier: "Maderas Finas SA", date: "2024-03-10", total: 2500.00, status: "received", expectedDelivery: "2024-03-12", items: [{ productId: "1", quantity: 200, cost: 12.50, productName: "Madera Pino 2x4" }] },
  { id: "PO-002", supplier: "Químicos Industriales", date: "2024-03-15", total: 800.00, status: "pending", expectedDelivery: "2024-03-22", items: [{ productId: "2", quantity: 20, cost: 40.00, productName: "Barniz Roble" }] },
]

export const initialShipments: Shipment[] = [
  { id: "SH-001", orderId: "SO-001", destination: "Monterrey, NL", carrier: "DHL", trackingNumber: "MX8839202", status: "in_transit", estimatedArrival: "2024-03-22" },
  { id: "SH-002", orderId: "SO-002", destination: "CDMX", carrier: "FedEx", trackingNumber: "MX9928371", status: "delivered", estimatedArrival: "2024-03-20" },
]

export const initialTransactions: Transaction[] = [
  { id: "TR-001", date: "2024-03-18", description: "Venta SO-001", amount: 4250.00, type: "income", category: "Ventas", reference: "SO-001" },
  { id: "TR-002", date: "2024-03-10", description: "Compra Material PO-001", amount: 2500.00, type: "expense", category: "Materia Prima", reference: "PO-001" },
  { id: "TR-003", date: "2024-03-15", description: "Pago Nómina Quincena 1", amount: 15000.00, type: "expense", category: "Nómina", reference: "NOM-001" },
]

export const initialEmployees: Employee[] = [
  { id: "EMP-001", firstName: "Juan", lastName: "Pérez", position: "Gerente de Planta", department: "Producción", email: "juan.perez@orbit.com", phone: "555-0101", status: "active", salary: 35000, hireDate: "2022-01-15" },
  { id: "EMP-002", firstName: "Ana", lastName: "García", position: "Contadora", department: "Finanzas", email: "ana.garcia@orbit.com", phone: "555-0102", status: "active", salary: 28000, hireDate: "2022-03-10" },
  { id: "EMP-003", firstName: "Carlos", lastName: "López", position: "Operador de Maquinaria", department: "Producción", email: "carlos.lopez@orbit.com", phone: "555-0103", status: "active", salary: 18000, hireDate: "2023-06-20" },
]
