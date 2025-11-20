"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ComposedChart } from "recharts"
import { analyticsData, historicalData } from "@/lib/storage"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, AlertTriangle, Filter, Printer, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(262, 83%, 58%)']

export default function ReportsPage() {
  const handleExport = (format: string) => {
    alert(`Generando reporte en formato ${format}... La descarga comenzará en breve.`)
  }

  // Calculate key metrics for the period
  const problemPeriod = historicalData.historicalSales.slice(0, 6) // Jan-Jun 2023
  const solutionPeriod = historicalData.historicalSales.slice(6) // Jul-Dec 2023
  
  const avgSalesProblem = problemPeriod.reduce((sum, month) => sum + month.sales, 0) / problemPeriod.length
  const avgSalesSolution = solutionPeriod.reduce((sum, month) => sum + month.sales, 0) / solutionPeriod.length
  const salesImprovement = ((avgSalesSolution - avgSalesProblem) / avgSalesProblem * 100).toFixed(1)

  const avgCostProblem = historicalData.historicalCosts.slice(0, 6).reduce((sum, month) => sum + month.total, 0) / 6
  const avgCostSolution = historicalData.historicalCosts.slice(6).reduce((sum, month) => sum + month.total, 0) / 6
  const costReduction = ((avgCostProblem - avgCostSolution) / avgCostProblem * 100).toFixed(1)

  const currentKPIs = historicalData.keyPerformanceIndicators

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes y Analítica Histórica</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avanzados
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button size="sm" onClick={() => handleExport('PDF')}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Key Performance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejora en Ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{salesImprovement}%</div>
            <p className="text-xs text-muted-foreground">Promedio mensual post-ERP</p>
            <div className="text-sm font-medium text-green-600 mt-1">
              ${avgSalesSolution.toLocaleString('es-CO', { minimumFractionDigits: 0 })} vs ${avgSalesProblem.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reducción de Costos</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">-{costReduction}%</div>
            <p className="text-xs text-muted-foreground">Costos operativos mensuales</p>
            <div className="text-sm font-medium text-blue-600 mt-1">
              Ahorro mensual: ${((avgCostProblem - avgCostSolution) / 1000000).toFixed(0)}M
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI de Implementación</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{currentKPIs.roi.current}%</div>
            <p className="text-xs text-muted-foreground">Retorno de inversión</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{currentKPIs.payback.current} meses</div>
            <p className="text-xs text-muted-foreground">Recuperación de inversión</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {/* <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Análisis Crítico: Transformación 2023</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Período Problema (Ene-Jun 2023)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Pérdida acumulada: $409M COP</li>
                <li>• Incremento costos: +44.8%</li>
                <li>• Reducción ventas: -21.6%</li>
                <li>• Eficiencia productiva: 65%</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Período Solución (Jul-Dic 2023)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ganancia acumulada: $479M COP</li>
                <li>• Reducción costos: -21.4%</li>
                <li>• Incremento ventas: +35.6%</li>
                <li>• Eficiencia productiva: 85%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen Ejecutivo</TabsTrigger>
          <TabsTrigger value="sales">Ventas Históricas</TabsTrigger>
          <TabsTrigger value="costs">Costos Operativos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="profitability">Rentabilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ventas vs Costos</CardTitle>
                <CardDescription>Comparación mensual 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={historicalData.historicalSales.map((sale, index) => ({
                    month: sale.month,
                    sales: sale.sales,
                    costs: historicalData.historicalCosts[index]?.total || 0,
                    profit: sale.sales - (historicalData.historicalCosts[index]?.total || 0)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, name === 'sales' ? 'Ventas' : 'Costos']}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(142, 76%, 36%)" name="Ventas" />
                    <Bar dataKey="costs" fill="hsl(0, 84%, 60%)" name="Costos" />
                    <Line type="monotone" dataKey="profit" stroke="hsl(262, 83%, 58%)" strokeWidth={3} name="Ganancia" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Procesos - Antes vs Después</CardTitle>
                <CardDescription>Reducción de costos por proceso</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={historicalData.costAnalysisByProcess}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="process" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`]}
                    />
                    <Legend />
                    <Bar dataKey="previousCost" fill="hsl(0, 84%, 60%)" name="Costo Anterior" />
                    <Bar dataKey="currentCost" fill="hsl(142, 76%, 36%)" name="Costo Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores Clave de Desempeño (KPIs)</CardTitle>
              <CardDescription>Resultados de la implementación ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(currentKPIs).map(([key, kpi]) => (
                  <div key={key} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge className="bg-blue-500">✓</Badge>
                    </div>
                    <div className="text-2xl font-bold">{kpi.current}{typeof kpi.current === 'number' && key !== 'payback' ? '%' : ''}</div>
                    <div className="text-xs text-muted-foreground">Valor actual</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Ventas 2023</CardTitle>
              <CardDescription>Evolución mensual con tendencia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={historicalData.historicalSales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value, name) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, 'Ventas']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stackId="1" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.6} name="Ventas Reales" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Ventas por Mes</CardTitle>
              <CardDescription>Análisis detallado de órdenes y valores promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Órdenes</TableHead>
                    <TableHead className="text-right">Valor Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.historicalSales.map((sale) => (
                    <TableRow key={sale.month}>
                      <TableCell className="font-medium">{sale.month}</TableCell>
                      <TableCell className="text-right">${sale.sales.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">{sale.orders}</TableCell>
                      <TableCell className="text-right">${sale.avgOrder.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolución de Costos Operativos</CardTitle>
                <CardDescription>Desglose mensual por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={historicalData.historicalCosts}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="operational" stackId="1" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" name="Operativos" />
                    <Area type="monotone" dataKey="materials" stackId="1" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" name="Materiales" />
                    <Area type="monotone" dataKey="labor" stackId="1" stroke="hsl(48, 96%, 53%)" fill="hsl(48, 96%, 53%)" name="Mano de Obra" />
                    <Area type="monotone" dataKey="overhead" stackId="1" stroke="hsl(25, 95%, 53%)" fill="hsl(25, 95%, 53%)" name="Gastos Generales" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Costos por Proceso</CardTitle>
                <CardDescription>Comparación antes vs después de optimización</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={historicalData.costAnalysisByProcess}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="process" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, name === 'previousCost' ? 'Costo Anterior' : 'Costo Actual']}
                    />
                    <Legend />
                    <Bar dataKey="previousCost" fill="hsl(0, 84%, 60%)" name="Costo Anterior" />
                    <Bar dataKey="currentCost" fill="hsl(142, 76%, 36%)" name="Costo Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado de Reducción de Costos</CardTitle>
              <CardDescription>Impacto y recomendaciones por proceso</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proceso</TableHead>
                    <TableHead className="text-right">Costo Anterior</TableHead>
                    <TableHead className="text-right">Costo Actual</TableHead>
                    <TableHead className="text-right">Reducción</TableHead>
                    <TableHead>Impacto</TableHead>
                    <TableHead>Recomendación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.costAnalysisByProcess.map((process) => (
                    <TableRow key={process.process}>
                      <TableCell className="font-medium">{process.process}</TableCell>
                      <TableCell className="text-right text-muted-foreground">${process.previousCost.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">${process.currentCost.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-500">
                          {process.variation}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          process.impact === 'ALTO' ? 'bg-red-500' :
                          process.impact === 'MEDIO' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }>
                          {process.impact}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {process.impact === 'ALTO' ? 'Priorizar optimización continua' :
                         process.impact === 'MEDIO' ? 'Monitorear mensualmente' :
                         'Mantener estándares actuales'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Valor de Inventario 2023</CardTitle>
                <CardDescription>Evolución por tipo de inventario</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={historicalData.historicalInventory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                      formatter={(value) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`]}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="rawMaterials" stackId="1" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" name="Materias Primas" />
                    <Area type="monotone" dataKey="workInProgress" stackId="1" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" name="En Proceso" />
                    <Area type="monotone" dataKey="finishedGoods" stackId="1" stroke="hsl(48, 96%, 53%)" fill="hsl(48, 96%, 53%)" name="Productos Terminados" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotación de Inventario</CardTitle>
                <CardDescription>Eficiencia en gestión de stocks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historicalData.historicalInventory.map((inv, index) => ({
                    month: inv.month,
                    total: inv.total,
                    daysSupply: Math.round(inv.total / (historicalData.historicalCosts[index]?.materials || 1) * 30)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(value) => `${value} días`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill="hsl(221, 83%, 53%)" name="Valor Inventario" />
                    <Line yAxisId="right" type="monotone" dataKey="daysSupply" stroke="hsl(142, 76%, 36%)" strokeWidth={3} name="Días de Suministro" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Inventario por Mes</CardTitle>
              <CardDescription>Detalle de valores y tendencias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Materias Primas</TableHead>
                    <TableHead className="text-right">En Proceso</TableHead>
                    <TableHead className="text-right">Productos Terminados</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Variación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.historicalInventory.map((inv, index) => {
                    const prevTotal = index > 0 ? historicalData.historicalInventory[index - 1].total : inv.total;
                    const variation = ((inv.total - prevTotal) / prevTotal * 100);
                    return (
                      <TableRow key={inv.month}>
                        <TableCell className="font-medium">{inv.month}</TableCell>
                        <TableCell className="text-right">${inv.rawMaterials.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">${inv.workInProgress.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">${inv.finishedGoods.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right font-medium">${inv.total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                        <TableCell className="text-right">
                          {index > 0 && (
                            <Badge className={variation >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                              {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rentabilidad</CardTitle>
                <CardDescription>Revenue vs Costs vs Profit 2023</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={historicalData.profitabilityAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${(value/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, name === 'revenue' ? 'Ingresos' : name === 'costs' ? 'Costos' : 'Ganancia']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" name="Ingresos" />
                    <Bar dataKey="costs" fill="hsl(0, 84%, 60%)" name="Costos" />
                    <Line type="monotone" dataKey="profit" stroke="hsl(262, 83%, 58%)" strokeWidth={3} name="Ganancia" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Margen de Ganancia</CardTitle>
                <CardDescription>Punto de equilibrio y tendencia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historicalData.profitabilityAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`${value}%`, name === 'margin' ? 'Margen' : 'Punto Equilibrio']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="margin" stroke="hsl(221, 83%, 53%)" strokeWidth={3} name="Margen de Ganancia" />
                    <Line type="monotone" dataKey={0} stroke="hsl(0, 84%, 60%)" strokeWidth={1} strokeDasharray="2 2" name="Línea de Cero" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis Detallado de Rentabilidad</CardTitle>
              <CardDescription>Resultados mensuales y tendencias</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">Costos</TableHead>
                    <TableHead className="text-right">Ganancia</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.profitabilityAnalysis.map((analysis) => (
                    <TableRow key={analysis.month}>
                      <TableCell className="font-medium">{analysis.month}</TableCell>
                      <TableCell className="text-right">${analysis.revenue.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">${analysis.costs.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</TableCell>
                      <TableCell className="text-right">
                        <span className={analysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${analysis.profit.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={analysis.margin >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {analysis.margin}%
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge className={analysis.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                          {analysis.profit >= 0 ? 'Rentable' : 'No Rentable'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
