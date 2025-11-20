"use client"

import { useState } from "react"
import { useLocalStorage, initialShipments, initialSales, Shipment, Sale } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Truck, MapPin, Package, Pencil, Trash2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Imported Tabs

export default function LogisticsPage() {
  const [shipments, setShipments] = useLocalStorage<Shipment[]>("orbit_shipments_v2", initialShipments)
  const [sales] = useLocalStorage<Sale[]>("orbit_sales", initialSales)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [carrierFilter, setCarrierFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    status: "pending",
    shipDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    const matchesCarrier = carrierFilter === "all" || s.carrier === carrierFilter
    return matchesSearch && matchesStatus && matchesCarrier
  })

  const handleOrderSelect = (orderId: string) => {
    const order = sales.find(s => s.id === orderId)
    if (order) {
      setNewShipment({
        ...newShipment,
        orderId: order.id,
        customer: order.customer,
        destination: "" // In a real app, this would come from customer address
      })
    }
  }

  const handleSave = () => {
    if (!newShipment.orderId || !newShipment.carrier) return

    if (editingId) {
      setShipments(shipments.map(s => s.id === editingId ? { ...s, ...newShipment } as Shipment : s))
      setEditingId(null)
    } else {
      const year = (newShipment.shipDate || new Date().toISOString().split('T')[0]).split('-')[0]
      const shipment: Shipment = {
        id: `SH-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        orderId: newShipment.orderId!,
        customer: newShipment.customer || "",
        destination: newShipment.destination || "",
        carrier: newShipment.carrier!,
        trackingNumber: newShipment.trackingNumber || `TR-${Math.floor(Math.random() * 100000000)}`,
        status: newShipment.status as "pending" | "in_transit" | "delivered",
        shipDate: newShipment.shipDate || "",
        deliveryDate: newShipment.deliveryDate || "",
        cost: Number(newShipment.cost) || 0
      }
      setShipments([shipment, ...shipments])
    }
    
    setIsDialogOpen(false)
    setNewShipment({
      status: "pending",
      shipDate: new Date().toISOString().split('T')[0]
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar envío?")) {
      setShipments(shipments.filter(s => s.id !== id))
    }
  }

  const handleEdit = (shipment: Shipment) => {
    setNewShipment(shipment)
    setEditingId(shipment.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <Badge className="bg-green-500 hover:bg-green-600">Entregado</Badge>
      case "in_transit": return <Badge className="bg-blue-500 hover:bg-blue-600">En Tránsito</Badge>
      case "pending": return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25">Pendiente</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const statusData = shipments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const chartData = Object.entries(statusData).map(([name, value]) => ({ name, value }))

  const inTransitShipments = filteredShipments.filter(s => s.status === 'in_transit' || s.status === 'pending')
  const deliveredShipments = filteredShipments.filter(s => s.status === 'delivered')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Logística y Envíos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewShipment({ status: "pending", shipDate: new Date().toISOString().split('T')[0] })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Envío
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Envío" : "Programar Envío"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">Orden</Label>
                <Select onValueChange={handleOrderSelect}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar orden de venta" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.filter(s => s.status !== 'shipped').map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.id} - {s.customer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">Cliente</Label>
                <Input id="customer" className="col-span-3" value={newShipment.customer || ""} readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="destination" className="text-right">Destino</Label>
                <Input id="destination" className="col-span-3" value={newShipment.destination || ""} onChange={e => setNewShipment({...newShipment, destination: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="carrier" className="text-right">Transportista</Label>
                <Select onValueChange={v => setNewShipment({...newShipment, carrier: v})} defaultValue={newShipment.carrier}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar transportista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transportes Rápidos">Transportes Rápidos</SelectItem>
                    <SelectItem value="Logística Express">Logística Express</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tracking" className="text-right">Tracking #</Label>
                <Input id="tracking" className="col-span-3" value={newShipment.trackingNumber || ""} onChange={e => setNewShipment({...newShipment, trackingNumber: e.target.value})} placeholder="Auto-generado si está vacío" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Costo Envío</Label>
                <Input id="cost" type="number" className="col-span-3" value={newShipment.cost || ""} onChange={e => setNewShipment({...newShipment, cost: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select onValueChange={v => setNewShipment({...newShipment, status: v as any})} defaultValue={newShipment.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_transit">En Tránsito</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tracking, cliente..."
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
            <SelectItem value="in_transit">En Tránsito</SelectItem>
            <SelectItem value="delivered">Entregado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={carrierFilter} onValueChange={setCarrierFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transportista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Transportes Rápidos">Transportes Rápidos</SelectItem>
            <SelectItem value="Logística Express">Logística Express</SelectItem>
            <SelectItem value="DHL">DHL</SelectItem>
            <SelectItem value="FedEx">FedEx</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Envíos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="in_transit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in_transit">En Camino / Pendientes</TabsTrigger>
          <TabsTrigger value="delivered">Entregadas</TabsTrigger>
        </TabsList>

        <TabsContent value="in_transit">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead>Fecha Estimada</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inTransitShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {shipment.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{shipment.orderId}</span>
                        <span className="text-xs text-muted-foreground">{shipment.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{shipment.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        {shipment.carrier}
                      </div>
                    </TableCell>
                    <TableCell>{shipment.deliveryDate}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(shipment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shipment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(shipment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {inTransitShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay envíos en camino
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="delivered">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead>Fecha Entrega</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {shipment.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{shipment.orderId}</span>
                        <span className="text-xs text-muted-foreground">{shipment.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{shipment.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        {shipment.carrier}
                      </div>
                    </TableCell>
                    <TableCell>{shipment.deliveryDate}</TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(shipment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shipment)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(shipment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {deliveredShipments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay envíos entregados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
