"use client"

import { useState } from "react"
import { CalendarCheck, CheckCircle } from "lucide-react"
import { DatePicker } from "./date-picker"
import { TimeSlots } from "./time-slots"
import { BookingForm } from "./booking-form"
import { AppointmentsList } from "./appointments-list"
import { useAppointments } from "@/hooks/use-appointments"

export function CommercialView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    appointments,
    addAppointment,
    removeAppointment,
    getTimeSlotsForDate,
    getAvailableSupportPersons,
    isLoaded,
  } = useAppointments()

  const dateStr = selectedDate.toISOString().split("T")[0]
  const timeSlots = getTimeSlotsForDate(dateStr)
  const availableSupportPersons = selectedTime
    ? getAvailableSupportPersons(dateStr, selectedTime)
    : []

  const todayAppointments = appointments.filter((apt) => apt.date === dateStr)

  const handleSubmit = (data: Parameters<typeof addAppointment>[0]) => {
    addAppointment(data)
    setSelectedTime(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Reserva realizada com sucesso! Aguardando confirmação do suporte.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <TimeSlots
            slots={timeSlots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            mode="booking"
          />
        </div>

        <div>
          {selectedTime ? (
            <BookingForm
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableSupportPersons={availableSupportPersons}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedTime(null)}
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  Agendamentos do Dia
                </h3>
              </div>
              <AppointmentsList
                appointments={todayAppointments}
                onRemove={removeAppointment}
                showRemove
                emptyMessage="Nenhum agendamento para esta data"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
