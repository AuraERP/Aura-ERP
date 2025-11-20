export interface Product {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  minStock: number
  price: number
  cost: number
  unit: string
  location: string
  status: "active" | "low_stock" | "out_of_stock"
}

export interface ProductionOrder {
  id: string
  productName: string
  quantity: number
  startDate: string
  endDate: string
  status: "planned" | "in_progress" | "completed" | "delayed"
  batchId: string
  waste: number // percentage
  cost: number
  plant: string
}

export interface Sale {
  id: string
  customer: string
  date: string
  total: number
  status: "pending" | "paid" | "shipped" | "cancelled"
  paymentMethod: string
  items: { productId: string; quantity: number; price: number; productName: string }[]
}

export interface Purchase {
  id: string
  supplier: string
  date: string
  total: number
  status: "ordered" | "received" | "pending"
  expectedDelivery: string
  items: { productId: string; quantity: number; cost: number; productName: string }[]
}

export interface Shipment {
  id: string
  orderId: string
  destination: string
  carrier: string
  trackingNumber: string
  status: "preparing" | "in_transit" | "delivered" | "exception"
  estimatedArrival: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  reference: string
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  department: string
  email: string
  phone: string
  status: "active" | "on_leave" | "terminated"
  salary: number
  hireDate: string
}
