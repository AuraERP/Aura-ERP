"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { analyticsData } from "@/lib/storage"

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={analyticsData.monthlySales}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Total']}
        />
        <Bar dataKey="total" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
