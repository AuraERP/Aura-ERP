"use client"

import { useState } from "react"
import { useLocalStorage, initialProducts, Product } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, AlertCircle, CheckCircle2, XCircle, Pencil, Trash2, BarChart3 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export default function InventoryPage() {
  const [products, setProducts] = useLocalStorage<Product[]>("orbit_products", initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    status: "active",
    category: "Materia Prima"
  })

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stockByCategory = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.stock
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(stockByCategory).map(([name, value]) => ({ name, value }))

  const handleSave = () => {
    if (!newProduct.name || !newProduct.sku) return

    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...newProduct } as Product : p))
      setEditingId(null)
    } else {
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProduct.name!,
        sku: newProduct.sku!,
        category: newProduct.category || "Materia Prima",
        stock: Number(newProduct.stock) || 0,
        minStock: Number(newProduct.minStock) || 0,
        price: Number(newProduct.price) || 0,
        unit: newProduct.unit || "u",
        supplier: newProduct.supplier || "",
        status: (Number(newProduct.stock) || 0) <= (Number(newProduct.minStock) || 0) ? "low_stock" : "active"
      }
      setProducts([...products, product])
    }
    
    setIsDialogOpen(false)
    setNewProduct({ status: "active", category: "Materia Prima" })
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleEdit = (product: Product) => {
    setNewProduct(product)
    setEditingId(product.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "low_stock": return <Badge variant="destructive">Stock Bajo</Badge>
      case "out_of_stock": return <Badge variant="outline" className="border-destructive text-destructive">Sin Stock</Badge>
      default: return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewProduct({ status: "active", category: "Materia Prima" })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" className="col-span-3" value={newProduct.name || ""} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input id="sku" className="col-span-3" value={newProduct.sku || ""} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Categoría</Label>
                <Select onValueChange={v => setNewProduct({...newProduct, category: v})} defaultValue={newProduct.category}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Materia Prima">Materia Prima</SelectItem>
                    <SelectItem value="Insumos">Insumos</SelectItem>
                    <SelectItem value="Producto Terminado">Producto Terminado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input id="stock" type="number" className="col-span-3" value={newProduct.stock || ""} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minStock" className="text-right">Min. Stock</Label>
                <Input id="minStock" type="number" className="col-span-3" value={newProduct.minStock || ""} onChange={e => setNewProduct({...newProduct, minStock: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Precio</Label>
                <Input id="price" type="number" className="col-span-3" value={newProduct.price || ""} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Stock por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Add more summary cards here if needed */}
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            <SelectItem value="Materia Prima">Materia Prima</SelectItem>
            <SelectItem value="Insumos">Insumos</SelectItem>
            <SelectItem value="Producto Terminado">Producto Terminado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="low_stock">Stock Bajo</SelectItem>
            <SelectItem value="out_of_stock">Sin Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(product.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
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
