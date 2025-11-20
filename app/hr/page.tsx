"use client"

import { useState } from "react"
import { useLocalStorage, initialEmployees, Employee, initialAbsences, AbsenceRecord, initialShifts, ShiftAssignment, initialReviews, PerformanceReview } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, User, Mail, Phone, Briefcase, Pencil, Trash2, Calendar, Clock, Star, FileText } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HRPage() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>("orbit_employees_v2", initialEmployees)
  const [absences, setAbsences] = useLocalStorage<AbsenceRecord[]>("orbit_absences_v2", initialAbsences)
  const [shifts, setShifts] = useLocalStorage<ShiftAssignment[]>("orbit_shifts_v2", initialShifts)
  const [reviews, setReviews] = useLocalStorage<PerformanceReview[]>("orbit_reviews_v2", initialReviews)
  const [searchTerm, setSearchTerm] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [absenceDialogOpen, setAbsenceDialogOpen] = useState(false)
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [targetEmployeeId, setTargetEmployeeId] = useState<string | null>(null)
  
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    status: "active",
    hireDate: new Date().toISOString().split('T')[0],
    vacationDays: 15,
    absences: 0,
    performanceRating: 5
  })

  const [newAbsence, setNewAbsence] = useState<Partial<AbsenceRecord>>({ type: "absence", status: "approved", days: 1 })
  const [newShift, setNewShift] = useState<Partial<ShiftAssignment>>({ shift: "Matutino", schedule: "08:00-17:00", overtimeHours: 0 })
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({ rating: 5 })

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = deptFilter === "all" || e.department === deptFilter
    const matchesStatus = statusFilter === "all" || e.status === statusFilter
    return matchesSearch && matchesDept && matchesStatus
  })

  const deptData = employees.reduce((acc, curr) => {
    acc[curr.department] = (acc[curr.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const chartData = Object.entries(deptData).map(([name, value]) => ({ name, value }))
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const getVacationAvailable = (emp: Employee) => {
    const used = absences.filter(a => a.employeeId === emp.id && a.type === 'vacation' && a.status === 'approved').reduce((s, a) => s + (a.days || 0), 0)
    return (emp.vacationDays || 0) - used
  }
  const getAbsencesCount = (emp: Employee) => absences.filter(a => a.employeeId === emp.id && a.type === 'absence').length
  const getIncapacitiesCount = (emp: Employee) => absences.filter(a => a.employeeId === emp.id && a.type === 'incapacity').length
  const getCurrentShift = (emp: Employee) => {
    const latest = [...shifts.filter(s => s.employeeId === emp.id)].sort((a,b)=> (a.effectiveDate > b.effectiveDate ? -1 : 1))[0]
    return latest ? { shift: latest.shift, schedule: latest.schedule, overtimeHours: latest.overtimeHours } : { shift: 'Matutino', schedule: '08:00-17:00', overtimeHours: 0 }
  }
  const getLastReview = (emp: Employee) => {
    const latest = [...reviews.filter(r => r.employeeId === emp.id)].sort((a,b)=> (a.date > b.date ? -1 : 1))[0]
    return latest || null
  }

  const handleSave = () => {
    if (!newEmployee.name || !newEmployee.email) return

    if (editingId) {
      setEmployees(employees.map(e => e.id === editingId ? { ...e, ...newEmployee } as Employee : e))
      setEditingId(null)
    } else {
      const employee: Employee = {
        id: `EMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: newEmployee.name!,
        nationalId: newEmployee.nationalId || "",
        position: newEmployee.position || "",
        department: newEmployee.department || "",
        email: newEmployee.email!,
        phone: newEmployee.phone || "",
        hireDate: newEmployee.hireDate || "",
        salary: Number(newEmployee.salary) || 0,
        status: newEmployee.status as "active" | "inactive",
        vacationDays: Number(newEmployee.vacationDays) || 15,
        absences: Number(newEmployee.absences) || 0,
        performanceRating: Number(newEmployee.performanceRating) || 5
      }
      setEmployees([...employees, employee])
    }

    setIsDialogOpen(false)
    setNewEmployee({
      status: "active",
      hireDate: new Date().toISOString().split('T')[0],
      vacationDays: 15,
      absences: 0,
      performanceRating: 5
    })
  }

  const openAbsenceDialog = (empId: string, type: AbsenceRecord["type"]) => {
    setTargetEmployeeId(empId)
    setNewAbsence({ type, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], days: 1, reason: '' , status: 'approved' })
    setAbsenceDialogOpen(true)
  }
  const saveAbsence = () => {
    if (!targetEmployeeId || !newAbsence.type || !newAbsence.startDate || !newAbsence.endDate || !newAbsence.days) return
    const rec: AbsenceRecord = {
      id: `ABS-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
      employeeId: targetEmployeeId,
      type: newAbsence.type,
      startDate: newAbsence.startDate,
      endDate: newAbsence.endDate,
      days: Number(newAbsence.days),
      reason: newAbsence.reason || '',
      status: newAbsence.status as any
    }
    setAbsences([rec, ...absences])
    if (rec.type === 'vacation') {
      setEmployees(employees.map(e => e.id === rec.employeeId ? { ...e, vacationDays: Math.max(0, (e.vacationDays || 0) - rec.days) } : e))
    }
    setAbsenceDialogOpen(false)
  }

  const openShiftDialog = (empId: string) => {
    setTargetEmployeeId(empId)
    const cur = getCurrentShift(employees.find(e => e.id === empId)!)
    setNewShift({ shift: cur.shift as any, schedule: cur.schedule, overtimeHours: cur.overtimeHours, effectiveDate: new Date().toISOString().split('T')[0] })
    setShiftDialogOpen(true)
  }
  const saveShift = () => {
    if (!targetEmployeeId || !newShift.shift || !newShift.schedule || newShift.overtimeHours === undefined) return
    const rec: ShiftAssignment = {
      id: `SHF-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
      employeeId: targetEmployeeId,
      shift: newShift.shift as any,
      schedule: newShift.schedule!,
      overtimeHours: Number(newShift.overtimeHours),
      effectiveDate: newShift.effectiveDate || new Date().toISOString().split('T')[0]
    }
    setShifts([rec, ...shifts])
    setShiftDialogOpen(false)
  }

  const openReviewDialog = (empId: string) => {
    setTargetEmployeeId(empId)
    setNewReview({ date: new Date().toISOString().split('T')[0], rating: 5, comments: '', reviewer: '' })
    setReviewDialogOpen(true)
  }
  const saveReview = () => {
    if (!targetEmployeeId || !newReview.date || !newReview.rating) return
    const rec: PerformanceReview = {
      id: `REV-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
      employeeId: targetEmployeeId,
      date: newReview.date!,
      rating: Number(newReview.rating),
      comments: newReview.comments || '',
      reviewer: newReview.reviewer || 'Supervisor'
    }
    setReviews([rec, ...reviews])
    const empReviews = reviews.filter(r => r.employeeId === targetEmployeeId)
    const avg = (empReviews.reduce((s, r) => s + r.rating, 0) + rec.rating) / (empReviews.length + 1)
    setEmployees(employees.map(e => e.id === targetEmployeeId ? { ...e, performanceRating: Number(avg.toFixed(1)) } : e))
    setReviewDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar empleado?")) {
      setEmployees(employees.filter(e => e.id !== id))
    }
  }

  const handleEdit = (employee: Employee) => {
    setNewEmployee(employee)
    setEditingId(employee.id)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "inactive": return <Badge variant="secondary">Inactivo</Badge>
      default: return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.status === 'active').length
  const totalPayroll = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recursos Humanos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setNewEmployee({ status: "active", hireDate: new Date().toISOString().split('T')[0], vacationDays: 15, absences: 0, performanceRating: 5 })
            setEditingId(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Empleado" : "Registrar Empleado"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" className="col-span-3" value={newEmployee.name || ""} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nationalId" className="text-right">Cédula</Label>
                <Input id="nationalId" className="col-span-3" value={newEmployee.nationalId || ""} onChange={e => setNewEmployee({...newEmployee, nationalId: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">Cargo</Label>
                <Select onValueChange={v => setNewEmployee({...newEmployee, position: v})} defaultValue={newEmployee.position}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carpintero">Carpintero</SelectItem>
                    <SelectItem value="Ebanista">Ebanista</SelectItem>
                    <SelectItem value="Maestro de Carpintería">Maestro de Carpintería</SelectItem>
                    <SelectItem value="Operario de Corte">Operario de Corte</SelectItem>
                    <SelectItem value="Operario CNC">Operario CNC</SelectItem>
                    <SelectItem value="Barnizador / Acabados">Barnizador / Acabados</SelectItem>
                    <SelectItem value="Inspector de Calidad">Inspector de Calidad</SelectItem>
                    <SelectItem value="Encargado de Secado">Encargado de Secado</SelectItem>
                    <SelectItem value="Auxiliar de Carpintería">Auxiliar de Carpintería</SelectItem>
                    <SelectItem value="Supervisor de Producción">Supervisor de Producción</SelectItem>
                    <SelectItem value="Jefe de Planta">Jefe de Planta</SelectItem>
                    <SelectItem value="Coordinador de Logística">Coordinador de Logística</SelectItem>
                    <SelectItem value="Analista de Compras">Analista de Compras</SelectItem>
                    <SelectItem value="Auxiliar Contable">Auxiliar Contable</SelectItem>
                    <SelectItem value="Jefe de Ventas">Jefe de Ventas</SelectItem>
                    <SelectItem value="Gerente General">Gerente General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Depto.</Label>
                <Select onValueChange={v => setNewEmployee({...newEmployee, department: v})} defaultValue={newEmployee.department}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Producción">Producción</SelectItem>
                    <SelectItem value="Carpintería">Carpintería</SelectItem>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                    <SelectItem value="Logística">Logística</SelectItem>
                    <SelectItem value="Finanzas">Finanzas</SelectItem>
                    <SelectItem value="Calidad">Calidad</SelectItem>
                    <SelectItem value="RRHH">RRHH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" className="col-span-3" value={newEmployee.email || ""} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Teléfono</Label>
                <Input id="phone" className="col-span-3" value={newEmployee.phone || ""} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary" className="text-right">Salario</Label>
                <Input id="salary" type="number" className="col-span-3" value={newEmployee.salary || ""} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hireDate" className="text-right">Fecha Ingreso</Label>
                <Input id="hireDate" type="date" className="col-span-3" value={newEmployee.hireDate || ""} onChange={e => setNewEmployee({...newEmployee, hireDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vacationDays" className="text-right">Días Vacaciones</Label>
                <Input id="vacationDays" type="number" className="col-span-3" value={newEmployee.vacationDays || ""} onChange={e => setNewEmployee({...newEmployee, vacationDays: Number(e.target.value)})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Directorio</TabsTrigger>
          <TabsTrigger value="absences">Ausencias e Incapacidades</TabsTrigger>
          <TabsTrigger value="shifts">Turnos y Jornadas</TabsTrigger>
          <TabsTrigger value="performance">Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Nómina Mensual</CardTitle>
                <span className="text-xs text-muted-foreground">Estimado</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalPayroll.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center py-4 gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Producción">Producción</SelectItem>
                <SelectItem value="Ventas">Ventas</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
                <SelectItem value="Finanzas">Finanzas</SelectItem>
                <SelectItem value="Calidad">Calidad</SelectItem>
                <SelectItem value="RRHH">RRHH</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{employee.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{employee.position}</p>
                  </div>
                  {getStatusBadge(employee.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-mono bg-muted px-1 rounded">ID: {employee.nationalId || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
                    <Pencil className="mr-2 h-3 w-3" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(employee.id)}>
                    <Trash2 className="mr-2 h-3 w-3" /> Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="absences">
          <Card>
            <CardHeader>
              <CardTitle>Control de Ausencias, Incapacidades y Vacaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Días Vacaciones Disp.</TableHead>
                    <TableHead>Ausencias (Año)</TableHead>
                    <TableHead>Incapacidades</TableHead>
                    <TableHead>Estado Actual</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{getVacationAvailable(employee)} días</TableCell>
                      <TableCell>{getAbsencesCount(employee)}</TableCell>
                      <TableCell>{getIncapacitiesCount(employee)}</TableCell>
                      <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Presente</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAbsenceDialog(employee.id, 'absence')}>Registrar Ausencia</Button>
                          <Button variant="outline" size="sm" onClick={() => openAbsenceDialog(employee.id, 'incapacity')}>Incapacidad</Button>
                          <Button variant="outline" size="sm" onClick={() => openAbsenceDialog(employee.id, 'vacation')}>Vacaciones</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Dialog open={absenceDialogOpen} onOpenChange={setAbsenceDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar {newAbsence.type === 'vacation' ? 'Vacaciones' : newAbsence.type === 'incapacity' ? 'Incapacidad' : 'Ausencia'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Inicio</Label>
                  <Input type="date" className="col-span-3" value={newAbsence.startDate || ''} onChange={e => setNewAbsence({ ...newAbsence, startDate: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Fin</Label>
                  <Input type="date" className="col-span-3" value={newAbsence.endDate || ''} onChange={e => setNewAbsence({ ...newAbsence, endDate: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Días</Label>
                  <Input type="number" className="col-span-3" value={newAbsence.days || 1} onChange={e => setNewAbsence({ ...newAbsence, days: Number(e.target.value) })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Motivo</Label>
                  <Input className="col-span-3" value={newAbsence.reason || ''} onChange={e => setNewAbsence({ ...newAbsence, reason: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveAbsence}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Turnos y Jornada Laboral</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Turno Actual</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Horas Extras (Mes)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const cur = getCurrentShift(employee)
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{cur.shift}</TableCell>
                        <TableCell>{cur.schedule}</TableCell>
                        <TableCell>{cur.overtimeHours} hrs</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openShiftDialog(employee.id)}><Clock className="h-4 w-4 mr-2" /> Cambiar Turno</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Asignar Turno</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Turno</Label>
                  <Select defaultValue={newShift.shift as any} onValueChange={v => setNewShift({ ...newShift, shift: v as any })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matutino">Matutino</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noche">Noche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Horario</Label>
                  <Input className="col-span-3" value={newShift.schedule || ''} onChange={e => setNewShift({ ...newShift, schedule: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Horas Extras</Label>
                  <Input type="number" className="col-span-3" value={newShift.overtimeHours || 0} onChange={e => setNewShift({ ...newShift, overtimeHours: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveShift}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones de Desempeño</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{employee.name}</CardTitle>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < (employee.performanceRating || 0) ? "fill-current" : "text-muted"}`} />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">{employee.performanceRating || "N/A"}/5</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Última evaluación: {getLastReview(employee)?.date || 'N/A'}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => openReviewDialog(employee.id)}>Registrar Evaluación</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Evaluación</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Fecha</Label>
                  <Input type="date" className="col-span-3" value={newReview.date || ''} onChange={e => setNewReview({ ...newReview, date: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Calificación</Label>
                  <Select defaultValue={(newReview.rating || 5).toString()} onValueChange={v => setNewReview({ ...newReview, rating: Number(v) })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Comentarios</Label>
                  <Input className="col-span-3" value={newReview.comments || ''} onChange={e => setNewReview({ ...newReview, comments: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Evaluador</Label>
                  <Input className="col-span-3" value={newReview.reviewer || ''} onChange={e => setNewReview({ ...newReview, reviewer: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveReview}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
