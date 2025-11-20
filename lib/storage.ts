"use client"

import { useState, useEffect } from "react"

// Import JSON data files
import productsData from "@/data/products.json"
import financeData from "@/data/finance.json"
import salesData from "@/data/sales.json"
import purchasesData from "@/data/purchases.json"
import employeesData from "@/data/employees.json"
import analyticsJson from "@/data/analytics.json"
import historicalDataJson from "@/data/historical-data.json"

// Generic hook for localStorage management
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

// Updated types for all ERP entities
export interface Product {
  id: string
  name: string
  sku: string
  category: string
  stock: number
  minStock: number
  price: number
  unit: string
  supplier: string
  status: "active" | "low_stock" | "out_of_stock"
}

export interface ProductionOrder {
  id: string
  productName: string
  productId: string
  quantity: number
  startDate: string
  endDate: string
  status: "planned" | "in_progress" | "completed" | "delayed"
  batchId: string
  waste: number
  cost: number
  shift: string
  plant: string
}

export interface Sale {
  id: string
  customer: string
  customerEmail: string
  date: string
  dueDate: string
  total: number
  status: "pending" | "paid" | "shipped"
  items: { productId: string; productName: string; quantity: number; price: number }[]
}

export interface Purchase {
  id: string
  supplier: string
  supplierEmail: string
  date: string
  expectedDate: string
  total: number
  status: "ordered" | "pending" | "in_transit" | "received"
  items: { productId: string; productName: string; quantity: number; price: number }[]
}

export interface Shipment {
  id: string
  orderId: string
  customer: string
  destination: string
  carrier: string
  trackingNumber: string
  status: "pending" | "in_transit" | "delivered"
  shipDate: string
  deliveryDate: string
  cost: number
}

export interface Invoice {
  id: string
  type: "income" | "expense"
  relatedId: string
  customer: string
  date: string
  dueDate: string
  amount: number
  status: "pending" | "paid" | "overdue"
  paidDate: string | null
}

export interface Account {
  id: string
  name: string
  type: "asset" | "liability" | "equity"
  balance: number
}

export interface Employee {
  id: string
  name: string
  nationalId?: string // Added national ID
  position: string
  department: string
  email: string
  phone: string
  hireDate: string
  salary: number
  status: "active" | "inactive"
  vacationDays?: number // Added vacation days
  absences?: number // Added absences count
  performanceRating?: number // Added performance rating (1-5)
}

export interface AbsenceRecord {
  id: string
  employeeId: string
  type: "vacation" | "absence" | "incapacity"
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "approved" | "pending"
}

export interface ShiftAssignment {
  id: string
  employeeId: string
  shift: "Matutino" | "Tarde" | "Noche"
  schedule: string
  overtimeHours: number
  effectiveDate: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  date: string
  rating: number
  comments: string
  reviewer: string
}

function monthIndex(m: string) {
  const map: Record<string, number> = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11 }
  return map[m] ?? 0
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

function dateFromLabel(label: string, day: number) {
  const [mon, year] = label.split(" ")
  const y = Number(year)
  const m = monthIndex(mon) + 1
  return `${y}-${pad(m)}-${pad(day)}`
}

const finishedProducts = (productsData as Product[])

const customersRaw = (salesData as any[]).map(s => ({ name: s.customer, email: s.customerEmail }))
const seedCustomers = Array.from(new Map(customersRaw.filter(c => c && (c.email || c.name)).map(c => [c.email || c.name, c])).values())

const suppliersRaw = (purchasesData as any[]).map(p => ({ name: p.supplier, email: p.supplierEmail }))
const seedSuppliers = Array.from(new Map(suppliersRaw.filter(s => s && (s.email || s.name)).map(s => [s.email || s.name, s])).values())

let soCounter = 1
let puCounter = 1
let ordCounter = 1
let shCounter = 1
let invCounter = 1

const seedSales: Sale[] = []
const seedPurchases: Purchase[] = []
const seedProduction: ProductionOrder[] = []
const seedShipments: Shipment[] = []
const seedInvoices: Invoice[] = []

historicalDataJson.historicalSales.forEach((h, mi) => {
  for (let i = 0; i < h.orders; i++) {
    const cust = seedCustomers[(mi + i) % seedCustomers.length]
    const day = 5 + (i % 20)
    const date = dateFromLabel(h.month, day)
    const due = dateFromLabel(h.month, Math.min(day + 10, 28))
    const prod = finishedProducts[(mi + i) % finishedProducts.length]
    seedSales.push({
      id: `SO-${date.split("-")[0]}-${String(soCounter).padStart(3, "0")}`,
      customer: cust.name,
      customerEmail: cust.email,
      date,
      dueDate: due,
      total: h.avgOrder,
      status: "paid",
      items: [{ productId: prod.id, productName: prod.name, quantity: 1, price: h.avgOrder }]
    })
    if (i % 3 === 1) {
      const delivery = dateFromLabel(h.month, Math.min(day + 3, 28))
      seedShipments.push({
        id: `SH-${date.split("-")[0]}-${String(shCounter).padStart(3, "0")}`,
        orderId: `SO-${date.split("-")[0]}-${String(soCounter).padStart(3, "0")}`,
        customer: cust.name,
        destination: "Bogotá, Colombia",
        carrier: "DHL",
        trackingNumber: `TR-${String(shCounter).padStart(8, "0")}`,
        status: "delivered",
        shipDate: date,
        deliveryDate: delivery,
        cost: 250000
      })
      shCounter++
    }
    soCounter++
  }
})

historicalDataJson.historicalCosts.forEach((h, mi) => {
  const sup = seedSuppliers[mi % seedSuppliers.length]
  const day = 4 + (mi % 20)
  const date = dateFromLabel(h.month, day)
  const expected = dateFromLabel(h.month, Math.min(day + 5, 28))
  const prod = finishedProducts[mi % finishedProducts.length]
  seedPurchases.push({
    id: `PU-${date.split("-")[0]}-${String(puCounter).padStart(3, "0")}`,
    supplier: sup.name,
    supplierEmail: sup.email,
    date,
    expectedDate: expected,
    total: h.materials,
    status: "received",
    items: [{ productId: prod.id, productName: "Materias Primas Teca", quantity: 1, price: h.materials }]
  })
  puCounter++
})

historicalDataJson.historicalProduction.forEach((h, mi) => {
  const monthUnits = h.units
  const perOrder = Math.max(1, Math.floor(monthUnits / 3))
  for (let k = 0; k < 3; k++) {
    const prod = finishedProducts[(mi + k) % finishedProducts.length]
    const day = 8 + k * 5
    const start = dateFromLabel(h.month, day)
    const end = dateFromLabel(h.month, Math.min(day + 4, 28))
    seedProduction.push({
      id: `ORD-${start.split("-")[0]}-${String(ordCounter).padStart(3, "0")}`,
      productName: prod.name,
      productId: prod.id,
      quantity: perOrder,
      startDate: start,
      endDate: end,
      status: k === 2 ? "completed" : "in_progress",
      batchId: `B-${String(ordCounter).padStart(4, "0")}`,
      waste: h.waste,
      cost: prod.price,
      shift: "Mañana",
      plant: "Planta A"
    })
    ordCounter++
  }
})

historicalDataJson.profitabilityAnalysis.forEach((h) => {
  const day = 25
  const date = dateFromLabel(h.month, day)
  seedInvoices.push({
    id: `INV-${date.split("-")[0]}-${String(invCounter).padStart(3, "0")}`,
    type: "income",
    relatedId: `SO-${date.split("-")[0]}-001`,
    customer: "Ingresos por Ventas",
    date,
    dueDate: date,
    amount: h.revenue,
    status: "paid",
    paidDate: date
  })
  invCounter++
  const opAmount = historicalDataJson.historicalCosts.find(x => x.month === h.month)?.operational || 0
  const labAmount = historicalDataJson.historicalCosts.find(x => x.month === h.month)?.labor || 0
  const ohAmount = historicalDataJson.historicalCosts.find(x => x.month === h.month)?.overhead || 0
  seedInvoices.push({ id: `INV-${date.split("-")[0]}-${String(invCounter).padStart(3, "0")}`, type: "expense", relatedId: `OP-${String(invCounter).padStart(3, "0")}`, customer: "Costos Operativos", date, dueDate: date, amount: opAmount, status: "paid", paidDate: date })
  invCounter++
  seedInvoices.push({ id: `INV-${date.split("-")[0]}-${String(invCounter).padStart(3, "0")}`, type: "expense", relatedId: `LAB-${String(invCounter).padStart(3, "0")}`, customer: "Mano de Obra", date, dueDate: date, amount: labAmount, status: "paid", paidDate: date })
  invCounter++
  seedInvoices.push({ id: `INV-${date.split("-")[0]}-${String(invCounter).padStart(3, "0")}`, type: "expense", relatedId: `OH-${String(invCounter).padStart(3, "0")}`, customer: "Gastos Generales", date, dueDate: date, amount: ohAmount, status: "paid", paidDate: date })
  invCounter++
})

// Export JSON data as initial values
export const initialProducts: Product[] = productsData as Product[]
export const initialProduction: ProductionOrder[] = seedProduction as ProductionOrder[]
export const initialSales: Sale[] = seedSales as Sale[]
export const initialPurchases: Purchase[] = seedPurchases as Purchase[]
export const initialShipments: Shipment[] = seedShipments as Shipment[]
export const initialInvoices: Invoice[] = seedInvoices as Invoice[]
export const initialAccounts: Account[] = financeData.accounts as Account[]
export const initialEmployees: Employee[] = employeesData as Employee[]
export const initialAbsences: AbsenceRecord[] = [
  { id: "ABS-2023-001", employeeId: "EMP-009", type: "vacation", startDate: "2023-07-10", endDate: "2023-07-14", days: 5, reason: "Vacaciones mitad de año", status: "approved" },
  { id: "ABS-2023-002", employeeId: "EMP-011", type: "incapacity", startDate: "2023-05-03", endDate: "2023-05-05", days: 3, reason: "Incapacidad médica", status: "approved" },
  { id: "ABS-2023-003", employeeId: "EMP-010", type: "absence", startDate: "2023-03-21", endDate: "2023-03-21", days: 1, reason: "Asunto personal", status: "approved" }
]
export const initialShifts: ShiftAssignment[] = [
  { id: "SHF-2023-001", employeeId: "EMP-009", shift: "Matutino", schedule: "08:00-17:00", overtimeHours: 2, effectiveDate: "2023-07-01" },
  { id: "SHF-2023-002", employeeId: "EMP-011", shift: "Tarde", schedule: "14:00-22:00", overtimeHours: 0, effectiveDate: "2023-06-15" },
  { id: "SHF-2023-003", employeeId: "EMP-010", shift: "Noche", schedule: "22:00-06:00", overtimeHours: 1, effectiveDate: "2023-08-10" }
]
export const initialReviews: PerformanceReview[] = [
  { id: "REV-2023-001", employeeId: "EMP-009", date: "2023-09-15", rating: 4, comments: "Buena precisión en acabados", reviewer: "Jefe de Planta" },
  { id: "REV-2023-002", employeeId: "EMP-010", date: "2023-10-20", rating: 5, comments: "Excelente desempeño en ebanistería", reviewer: "Supervisor de Producción" },
  { id: "REV-2023-003", employeeId: "EMP-011", date: "2023-11-05", rating: 4, comments: "Cumplimiento de tiempos de corte", reviewer: "Jefe de Producción" }
]
export const analyticsData = analyticsJson
export const historicalData = historicalDataJson
