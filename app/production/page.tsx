"use client"

import { useState } from "react"
import { useLocalStorage, initialProduction, initialProducts, ProductionOrder, Product } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Factory, AlertTriangle, Pencil, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ProductionPage() {
  const [production, setProduction] = useLocalStorage<ProductionOrder[]>("orbit_production_v2", initialProduction)
  const [products] = useLocalStorage<Product[]>("orbit_products", initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [plantFilter, setPlantFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    status: "planned",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    waste: 0,
    cost: 0
  })

  const filteredProduction = production.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesPlant = plantFilter === "all" || p.plant === plantFilter
    return matchesSearch && matchesStatus && matchesPlant
  })

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setNewOrder({
        ...newOrder,
        productId: product.id,
        productName: product.name
      })
    }
  }

  const handleSave = () => {
    if (!newOrder.productId || !newOrder.quantity) return

    if (editingId) {
      setProduction(production.map(p => p.id === editingId ? { ...p, ...newOrder } as ProductionOrder : p))
      setEditingId(null)
    } else {
      const year = (newOrder.startDate || new Date().toISOString().split('T')[0]).split('-')[0]
      const order: ProductionOrder = {
        id: `ORD-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        productName: newOrder.productName || "",
        productId: newOrder.productId!,
        quantity: Number(newOrder.quantity),
        startDate: newOrder.startDate || "",
        endDate: newOrder.endDate || "",
        status: newOrder.status as "planned" | "in_progress" | "completed" | "delayed",
        batchId: newOrder.batchId || `B-${Math.floor(Math.random() * 1000)}`,
        waste: Number(newOrder.waste) || 0,
        cost: Number(newOrder.cost) || 0,
        shift: newOrder.shift || "Mañana",
        plant: newOrder.plant || "Planta A"
      }
      setProduction([order, ...production])
    }
    
    setIsDialogOpen(false)
    setNewOrder({
      status: "planned",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      waste: 0,
      cost: 0
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar orden de producción?")) {
      setProduction(production.filter(p => p.id !== id))
    }
  }

  const handleEdit = (order: ProductionOrder) => {
    setNewOrder(order)
    setEditingId(order.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500 hover:bg-green-600">Completado</Badge>
      case "in_progress": return <Badge className="bg-blue-500 hover:bg-blue-600">En Progreso</Badge>
      case "delayed": return <Badge variant="destructive">Retrasado</Badge>
      case "planned": return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25">Planificado</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Producción</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewOrder({ status: "planned", startDate: new Date().toISOString().split('T')[0] })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Orden" : "Crear Orden de Producción"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">Producto</Label>
                <Select onValueChange={handleProductSelect}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.category === 'Producto Terminado').map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Cantidad</Label>
                <Input id="quantity" type="number" className="col-span-3" value={newOrder.quantity || ""} onChange={e => setNewOrder({...newOrder, quantity: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="batch" className="text-right">Lote</Label>
                <Input id="batch" className="col-span-3" value={newOrder.batchId || ""} onChange={e => setNewOrder({...newOrder, batchId: e.target.value})} placeholder="Auto-generado si vacío" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plant" className="text-right">Planta</Label>
                <Select onValueChange={v => setNewOrder({...newOrder, plant: v})} defaultValue={newOrder.plant}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar planta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planta A">Planta A</SelectItem>
                    <SelectItem value="Planta B">Planta B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shift" className="text-right">Turno</Label>
                <Select onValueChange={v => setNewOrder({...newOrder, shift: v})} defaultValue={newOrder.shift}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mañana">Mañana</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noche">Noche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">Inicio</Label>
                <Input id="startDate" type="date" className="col-span-3" value={newOrder.startDate || ""} onChange={e => setNewOrder({...newOrder, startDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">Fin Est.</Label>
                <Input id="endDate" type="date" className="col-span-3" value={newOrder.endDate || ""} onChange={e => setNewOrder({...newOrder, endDate: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Global</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <Progress value={87} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desperdicio Promedio</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">2.4%</div>
            <p className="text-xs text-muted-foreground">Objetivo: &lt; 3%</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar orden..."
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
            <SelectItem value="planned">Planificado</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="delayed">Retrasado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={plantFilter} onValueChange={setPlantFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Planta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Plantas</SelectItem>
            <SelectItem value="Planta A">Planta A</SelectItem>
            <SelectItem value="Planta B">Planta B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Orden</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProduction.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.productName}</TableCell>
                <TableCell>{order.batchId}</TableCell>
                <TableCell className="text-right">{order.quantity}</TableCell>
                <TableCell className="text-xs">
                  <div>In: {order.startDate}</div>
                  <div>Fin: {order.endDate}</div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(order.id)}>
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
