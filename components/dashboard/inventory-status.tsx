"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useLocalStorage, initialProducts } from "@/lib/storage"

export function InventoryStatus() {
  const [products] = useLocalStorage("orbit_products", initialProducts)

  const data = [
    { name: "Activo", value: products.filter(p => p.status === "active").length, color: "#22c55e" },
    { name: "Stock Bajo", value: products.filter(p => p.status === "low_stock").length, color: "#eab308" },
    { name: "Sin Stock", value: products.filter(p => p.status === "out_of_stock").length, color: "#ef4444" },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
