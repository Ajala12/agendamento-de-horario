"use client"

import { useState } from "react"
import { Calendar, Filter, UserCircle, Settings } from "lucide-react"
import { DatePicker } from "./date-picker"
import { TimeSlots } from "./time-slots"
import { AppointmentsList } from "./appointments-list"
import { SupportSchedule } from "./support-schedule"
import { Button } from "@/components/ui/button"
import { useAppointments } from "@/hooks/use-appointments"
import { cn } from "@/lib/utils"
import type { AppointmentStatus } from "@/lib/types"

type FilterType = "all" | "Clinton" | "Letícia"
type StatusFilter = "all" | AppointmentStatus

export function SupportView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<FilterType>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [showScheduleConfig, setShowScheduleConfig] = useState(false)

  const { appointments, getTimeSlotsForDate, updateAppointmentStatus, updateAppointmentObservation, transferAppointment, isLoaded } = useAppointments()

  const dateStr = selectedDate.toISOString().split("T")[0]
  const timeSlots = getTimeSlotsForDate(dateStr)

  const filteredAppointments = appointments
    .filter((apt) => apt.date === dateStr)
    .filter((apt) => filter === "all" || apt.supportPerson === filter)
    .filter((apt) => statusFilter === "all" || apt.status === statusFilter)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  const dayAppointments = appointments.filter((apt) => apt.date === dateStr)
  const pendingCount = dayAppointments.filter((apt) => apt.status === "pendente").length

  return (
    <div className="space-y-6">
      {/* Botão de configuração de horários */}
      <div className="flex justify-end">
        <Button
          variant={showScheduleConfig ? "default" : "outline"}
          onClick={() => setShowScheduleConfig(!showScheduleConfig)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Configurar Horários de Atendimento
        </Button>
      </div>

      {/* Configuração de horários */}
      {showScheduleConfig && (
        <SupportSchedule onClose={() => setShowScheduleConfig(false)} />
      )}

      {/* Alerta de solicitações pendentes */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-medium">
            Você tem {pendingCount} solicitação(ões) pendente(s) aguardando confirmação!
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <TimeSlots
            slots={timeSlots}
            selectedTime={null}
            onSelectTime={() => {}}
            mode="viewing"
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  Agenda do Dia
                </h3>
              </div>
              <span className="text-sm text-muted-foreground capitalize">
                {formatDate(selectedDate)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Atendente:</span>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "Clinton", "Letícia"] as FilterType[]).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className={cn(
                        "text-xs",
                        filter === f && "bg-primary text-primary-foreground"
                      )}
                    >
                      {f === "all" ? "Todos" : f}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "pendente", "confirmado", "concluido", "nao_ocorreu", "rejeitado"] as StatusFilter[]).map((s) => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "text-xs",
                        statusFilter === s && "bg-primary text-primary-foreground"
                      )}
                    >
                      {s === "all" ? "Todos" : s === "pendente" ? "Pendente" : s === "confirmado" ? "Confirmado" : s === "concluido" ? "Concluído" : s === "nao_ocorreu" ? "Não Ocorreu" : "Rejeitado"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <AppointmentsList
              appointments={filteredAppointments}
              onUpdateStatus={updateAppointmentStatus}
              onUpdateObservation={updateAppointmentObservation}
              onTransfer={transferAppointment}
              showActions={true}
              showObservationEdit={true}
              showTransfer={true}
              emptyMessage={
                filter === "all"
                  ? "Nenhum agendamento para esta data"
                  : `Nenhum agendamento para ${filter}`
              }
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Resumo do Dia</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Clinton</p>
                <p className="text-2xl font-bold text-foreground">
                  {dayAppointments.filter((a) => a.supportPerson === "Clinton").length}
                </p>
                <p className="text-xs text-muted-foreground">atendimentos</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Letícia</p>
                <p className="text-2xl font-bold text-foreground">
                  {dayAppointments.filter((a) => a.supportPerson === "Letícia").length}
                </p>
                <p className="text-xs text-muted-foreground">atendimentos</p>
              </div>
            </div>
            
            {/* Status breakdown */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              <div className="text-center p-2 rounded bg-amber-500/10">
                <p className="text-lg font-bold text-amber-600">
                  {dayAppointments.filter((a) => a.status === "pendente").length}
                </p>
                <p className="text-xs text-amber-600">Pendentes</p>
              </div>
              <div className="text-center p-2 rounded bg-green-500/10">
                <p className="text-lg font-bold text-green-600">
                  {dayAppointments.filter((a) => a.status === "confirmado" || a.status === "concluido").length}
                </p>
                <p className="text-xs text-green-600">Confirmados</p>
              </div>
              <div className="text-center p-2 rounded bg-red-500/10">
                <p className="text-lg font-bold text-red-600">
                  {dayAppointments.filter((a) => a.status === "rejeitado").length}
                </p>
                <p className="text-xs text-red-600">Rejeitados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
