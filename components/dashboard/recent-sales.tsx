"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLocalStorage, initialSales, initialPurchases, initialProduction, initialShipments } from "@/lib/storage"
import { ShoppingCart, CreditCard, Factory, Truck } from 'lucide-react'

export function RecentSales() {
  const [sales] = useLocalStorage("orbit_sales", initialSales)
  const [purchases] = useLocalStorage("orbit_purchases", initialPurchases)
  const [production] = useLocalStorage("orbit_production", initialProduction)
  const [shipments] = useLocalStorage("orbit_logistics", initialShipments)

  // Combine and normalize data
  const activities = [
    ...sales.map(s => ({
      id: s.id,
      type: "sale",
      title: "Nueva Venta",
      description: `Cliente: ${s.customer}`,
      amount: `+$${s.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      date: new Date(s.date),
      icon: CreditCard,
      color: "text-green-500"
    })),
    ...purchases.map(p => ({
      id: p.id,
      type: "purchase",
      title: "Nueva Compra",
      description: `Proveedor: ${p.supplier}`,
      amount: `-$${p.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      date: new Date(p.date),
      icon: ShoppingCart,
      color: "text-blue-500"
    })),
    ...production.map(p => ({
      id: p.id,
      type: "production",
      title: "Producción Iniciada",
      description: `Producto: ${p.productName} (${p.quantity} un.)`,
      amount: "En proceso",
      date: new Date(p.startDate),
      icon: Factory,
      color: "text-orange-500"
    })),
    ...shipments.map(s => ({
      id: s.id,
      type: "shipment",
      title: "Envío Despachado",
      description: `Destino: ${s.destination}`,
      amount: s.status,
      date: new Date(s.shipDate),
      icon: Truck,
      color: "text-purple-500"
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={`${activity.type}-${activity.id}`} className="flex items-center">
          <Avatar className="h-9 w-9 bg-muted flex items-center justify-center">
            <activity.icon className={`h-5 w-5 ${activity.color}`} />
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
          </div>
          <div className="ml-auto font-medium text-sm">
            {activity.amount}
            <div className="text-xs text-muted-foreground text-right">
              {activity.date.toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
