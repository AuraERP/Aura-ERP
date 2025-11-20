"use client"

import { useState } from "react"
import { useLocalStorage, initialSales, initialProducts, Sale, Product } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function SalesPage() {
  const [sales, setSales] = useLocalStorage<Sale[]>("orbit_sales_v2", initialSales)
  const [products] = useLocalStorage<Product[]>("orbit_products", initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    status: "pending",
    items: [],
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  
  // Item adding state
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(1)

  const salesByStatus = [
    { name: 'Pagado', value: sales.filter(s => s.status === 'paid').length, color: '#22c55e' },
    { name: 'Enviado', value: sales.filter(s => s.status === 'shipped').length, color: '#3b82f6' },
    { name: 'Pendiente', value: sales.filter(s => s.status === 'pending').length, color: '#eab308' },
  ]

  const salesByMonth = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleString('default', { month: 'short' })
    const existing = acc.find(item => item.name === month)
    if (existing) {
      existing.total += sale.total
    } else {
      acc.push({ name: month, total: sale.total })
    }
    return acc
  }, [] as { name: string, total: number }[]).sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.indexOf(a.name) - months.indexOf(b.name)
  })

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) return
    
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      price: product.price
    }

    const currentItems = newSale.items || []
    const updatedItems = [...currentItems, newItem]
    
    // Recalculate total
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    setNewSale({
      ...newSale,
      items: updatedItems,
      total
    })
    
    setSelectedProductId("")
    setQuantity(1)
  }

  const handleRemoveItem = (index: number) => {
    const currentItems = newSale.items || []
    const updatedItems = currentItems.filter((_, i) => i !== index)
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    setNewSale({
      ...newSale,
      items: updatedItems,
      total
    })
  }

  const handleSave = () => {
    if (!newSale.customer || !newSale.items?.length) return

    if (editingId) {
      setSales(sales.map(s => s.id === editingId ? { ...s, ...newSale } as Sale : s))
      setEditingId(null)
    } else {
      const year = (newSale.date || new Date().toISOString().split('T')[0]).split('-')[0]
      const sale: Sale = {
        id: `SO-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customer: newSale.customer,
        customerEmail: newSale.customerEmail || "",
        date: newSale.date || new Date().toISOString().split('T')[0],
        dueDate: newSale.dueDate || "",
        total: newSale.total || 0,
        status: newSale.status as "pending" | "paid" | "shipped",
        items: newSale.items || []
      }
      setSales([sale, ...sales])
    }

    setIsDialogOpen(false)
    setNewSale({
      status: "pending",
      items: [],
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta venta?")) {
      setSales(sales.filter(s => s.id !== id))
    }
  }

  const handleEdit = (sale: Sale) => {
    setNewSale(sale)
    setEditingId(sale.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
      case "shipped": return <Badge className="bg-blue-500 hover:bg-blue-600">Enviado</Badge>
      case "pending": return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25">Pendiente</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewSale({
              status: "pending",
              items: [],
              date: new Date().toISOString().split('T')[0],
              dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venta" : "Crear Orden de Venta"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Input id="customer" value={newSale.customer || ""} onChange={e => setNewSale({...newSale, customer: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={newSale.customerEmail || ""} onChange={e => setNewSale({...newSale, customerEmail: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" value={newSale.date || ""} onChange={e => setNewSale({...newSale, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Vencimiento</Label>
                  <Input id="dueDate" type="date" value={newSale.dueDate || ""} onChange={e => setNewSale({...newSale, dueDate: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Agregar Productos</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} - ${p.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(Number(e.target.value))} 
                    className="w-20" 
                    min="1"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddItem}>Agregar</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                <div className="rounded-md border p-2 min-h-[100px]">
                  {newSale.items && newSale.items.length > 0 ? (
                    <div className="space-y-2">
                      {newSale.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                          <span>{item.productName} (x{item.quantity})</span>
                          <div className="flex items-center gap-2">
                            <span>${(item.price * item.quantity).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveItem(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2 border-t font-bold">
                        Total: ${newSale.total?.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      No hay productos agregados
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select onValueChange={v => setNewSale({...newSale, status: v as any})} defaultValue={newSale.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar Venta"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`$${value}`, 'Total']}
                />
                <Bar dataKey="total" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado de Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={salesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{sale.customer}</span>
                    <span className="text-xs text-muted-foreground">{sale.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{sale.date}</TableCell>
                <TableCell className="text-right font-bold">${sale.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(sale.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(sale.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
