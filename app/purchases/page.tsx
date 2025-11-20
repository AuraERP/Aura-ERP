"use client"

import { useState } from "react"
import { useLocalStorage, initialPurchases, initialProducts, Purchase, Product } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>("orbit_purchases_v2", initialPurchases)
  const [products] = useLocalStorage<Product[]>("orbit_products", initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [newPurchase, setNewPurchase] = useState<Partial<Purchase>>({
    status: "ordered",
    items: [],
    date: new Date().toISOString().split('T')[0],
    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  
  // Item adding state
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [cost, setCost] = useState(0)

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find(p => p.id === productId)
    if (product) {
      setCost(product.price) // Default to current price, but editable
    }
  }

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) return
    
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      price: cost
    }

    const currentItems = newPurchase.items || []
    const updatedItems = [...currentItems, newItem]
    
    // Recalculate total
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    setNewPurchase({
      ...newPurchase,
      items: updatedItems,
      total
    })
    
    setSelectedProductId("")
    setQuantity(1)
    setCost(0)
  }

  const handleRemoveItem = (index: number) => {
    const currentItems = newPurchase.items || []
    const updatedItems = currentItems.filter((_, i) => i !== index)
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    setNewPurchase({
      ...newPurchase,
      items: updatedItems,
      total
    })
  }

  const handleSave = () => {
    if (!newPurchase.supplier || !newPurchase.items?.length) return

    if (editingId) {
      setPurchases(purchases.map(p => p.id === editingId ? { ...p, ...newPurchase } as Purchase : p))
      setEditingId(null)
    } else {
      const year = (newPurchase.date || new Date().toISOString().split('T')[0]).split('-')[0]
      const purchase: Purchase = {
        id: `PU-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        supplier: newPurchase.supplier,
        supplierEmail: newPurchase.supplierEmail || "",
        date: newPurchase.date || new Date().toISOString().split('T')[0],
        expectedDate: newPurchase.expectedDate || "",
        total: newPurchase.total || 0,
        status: newPurchase.status as "ordered" | "pending" | "in_transit" | "received",
        items: newPurchase.items || []
      }
      setPurchases([purchase, ...purchases])
    }

    setIsDialogOpen(false)
    setNewPurchase({
      status: "ordered",
      items: [],
      date: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta compra?")) {
      setPurchases(purchases.filter(p => p.id !== id))
    }
  }

  const handleEdit = (purchase: Purchase) => {
    setNewPurchase(purchase)
    setEditingId(purchase.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received": return <Badge className="bg-green-500 hover:bg-green-600">Recibido</Badge>
      case "in_transit": return <Badge className="bg-blue-500 hover:bg-blue-600">En Tránsito</Badge>
      case "ordered": return <Badge className="bg-purple-500 hover:bg-purple-600">Ordenado</Badge>
      case "pending": return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25">Pendiente</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Compras</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewPurchase({
              status: "ordered",
              items: [],
              date: new Date().toISOString().split('T')[0],
              expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Compra" : "Crear Orden de Compra"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor</Label>
                  <Input id="supplier" value={newPurchase.supplier || ""} onChange={e => setNewPurchase({...newPurchase, supplier: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={newPurchase.supplierEmail || ""} onChange={e => setNewPurchase({...newPurchase, supplierEmail: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha Orden</Label>
                  <Input id="date" type="date" value={newPurchase.date || ""} onChange={e => setNewPurchase({...newPurchase, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Fecha Esperada</Label>
                  <Input id="expectedDate" type="date" value={newPurchase.expectedDate || ""} onChange={e => setNewPurchase({...newPurchase, expectedDate: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Agregar Productos</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={handleProductSelect}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Cant."
                    value={quantity} 
                    onChange={e => setQuantity(Number(e.target.value))} 
                    className="w-20" 
                    min="1"
                  />
                  <Input 
                    type="number" 
                    placeholder="Costo"
                    value={cost} 
                    onChange={e => setCost(Number(e.target.value))} 
                    className="w-24" 
                    min="0"
                  />
                  <Button type="button" variant="secondary" onClick={handleAddItem}>Agregar</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Items</Label>
                <div className="rounded-md border p-2 min-h-[100px]">
                  {newPurchase.items && newPurchase.items.length > 0 ? (
                    <div className="space-y-2">
                      {newPurchase.items.map((item, index) => (
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
                        Total: ${newPurchase.total?.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                <Select onValueChange={v => setNewPurchase({...newPurchase, status: v as any})} defaultValue={newPurchase.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordered">Ordenado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_transit">En Tránsito</SelectItem>
                    <SelectItem value="received">Recibido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar Compra"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por proveedor o ID..."
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
            <SelectItem value="ordered">Ordenado</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_transit">En Tránsito</SelectItem>
            <SelectItem value="received">Recibido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Orden</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{purchase.supplier}</span>
                    <span className="text-xs text-muted-foreground">{purchase.supplierEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{purchase.date}</TableCell>
                <TableCell className="text-right font-bold">${purchase.total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(purchase.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(purchase)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(purchase.id)}>
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
