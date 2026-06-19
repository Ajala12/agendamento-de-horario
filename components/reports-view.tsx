"use client"

import { BarChart3, CheckCircle, Clock, XCircle, AlertCircle, Ban, FileBarChart } from "lucide-react"
import { useAppointments } from "@/hooks/use-appointments"
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function ReportsView() {
  const { appointments, getReportData, isLoaded } = useAppointments()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  const reportData = getReportData()

  const trainingData = [
    {
      name: "Treinamentos",
      concluidos: reportData.concluidos,
      naoOcorreram: reportData.naoOcorreram,
    },
  ]

  const pieData = [
    { name: "Concluídos", value: reportData.concluidos, color: "#22c55e" },
    { name: "Não Ocorreram", value: reportData.naoOcorreram, color: "#6b7280" },
    { name: "Confirmados", value: reportData.confirmados, color: "#3b82f6" },
    { name: "Pendentes", value: reportData.pendentes, color: "#f59e0b" },
    { name: "Rejeitados", value: reportData.rejeitados, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  const totalTreinamentos = reportData.concluidos + reportData.naoOcorreram
  const taxaConclusao = totalTreinamentos > 0 ? Math.round((reportData.concluidos / totalTreinamentos) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileBarChart className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Relatório de Treinamentos</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{reportData.pendentes}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Confirmados</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{reportData.confirmados}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Concluídos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{reportData.concluidos}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-muted-foreground">Não Ocorreram</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{reportData.naoOcorreram}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Rejeitados</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{reportData.rejeitados}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Treinamentos: Concluídos vs Não Ocorreram</h3>
          </div>
          
          {totalTreinamentos === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum treinamento finalizado ainda
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trainingData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="concluidos" name="Concluídos" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="naoOcorreram" name="Não Ocorreram" fill="#6b7280" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-foreground">{taxaConclusao}%</p>
              <p className="text-sm text-muted-foreground mb-1">
                ({reportData.concluidos} de {totalTreinamentos} finalizados)
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Status Geral dos Agendamentos</h3>
          </div>
          
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum agendamento registrado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
            <p className="text-3xl font-bold text-foreground">{reportData.total}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
