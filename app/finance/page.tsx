"use client"

import { useState } from "react"
import { useLocalStorage, initialInvoices, initialAccounts, Invoice, Account } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, ArrowUpRight, ArrowDownLeft, Wallet, Building2, TrendingUp, DollarSign } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FinancePage() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>("orbit_invoices_v2", initialInvoices)
  const [accounts, setAccounts] = useLocalStorage<Account[]>("orbit_accounts_v2", initialAccounts)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    type: "income",
    status: "pending",
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || i.type === typeFilter
    const matchesStatus = statusFilter === "all" || i.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSave = () => {
    if (!newInvoice.customer || !newInvoice.amount) return

    const year = (newInvoice.date || new Date().toISOString().split('T')[0]).split('-')[0]
    const invoice: Invoice = {
      id: `INV-${year}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      type: newInvoice.type as "income" | "expense",
      relatedId: newInvoice.relatedId || "",
      customer: newInvoice.customer,
      date: newInvoice.date || "",
      dueDate: newInvoice.dueDate || "",
      amount: Number(newInvoice.amount),
      status: newInvoice.status as "pending" | "paid" | "overdue",
      paidDate: newInvoice.status === 'paid' ? (newInvoice.date || new Date().toISOString().split('T')[0]) : null
    }

    setInvoices([invoice, ...invoices])
    
    // Update account balance if paid
    if (invoice.status === 'paid') {
      const accountId = invoice.type === 'income' ? 'ACC-002' : 'ACC-002' // Simplified: everything goes to main bank
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            balance: invoice.type === 'income' ? acc.balance + invoice.amount : acc.balance - invoice.amount
          }
        }
        return acc
      })
      setAccounts(updatedAccounts)
    }

    setIsDialogOpen(false)
    setNewInvoice({
      type: "income",
      status: "pending",
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
      case "overdue": return <Badge variant="destructive">Vencido</Badge>
      case "pending": return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25">Pendiente</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0)

  const totalIncome = invoices.filter(i => i.type === 'income' && i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = invoices.filter(i => i.type === 'expense' && i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const netIncome = totalIncome - totalExpenses

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Finanzas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tipo</Label>
                <Select onValueChange={v => setNewInvoice({...newInvoice, type: v as any})} defaultValue={newInvoice.type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso (Venta)</SelectItem>
                    <SelectItem value="expense">Egreso (Gasto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">Cliente/Prov.</Label>
                <Input id="customer" className="col-span-3" value={newInvoice.customer || ""} onChange={e => setNewInvoice({...newInvoice, customer: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">Monto</Label>
                <Input id="amount" type="number" className="col-span-3" value={newInvoice.amount || ""} onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Fecha</Label>
                <Input id="date" type="date" className="col-span-3" value={newInvoice.date || ""} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">Vencimiento</Label>
                <Input id="dueDate" type="date" className="col-span-3" value={newInvoice.dueDate || ""} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select onValueChange={v => setNewInvoice({...newInvoice, status: v as any})} defaultValue={newInvoice.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos Totales</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalAssets.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Caja + Bancos + CxC</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasivos Totales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Cuentas por Pagar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netIncome.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos - Gastos (Pagados)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujo de Caja</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${(totalAssets - totalLiabilities).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Patrimonio Neto</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Facturas y Movimientos</TabsTrigger>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center py-4 gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Egreso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente/Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.type === 'income' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize">{invoice.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className={`text-right font-bold ${invoice.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {invoice.type === 'income' ? '+' : '-'}${invoice.amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="capitalize">{account.type === 'asset' ? 'Activo' : 'Pasivo'}</TableCell>
                    <TableCell className="text-right font-bold">${account.balance.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
