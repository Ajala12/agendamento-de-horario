"use client"

import { useCallback, useEffect, useState } from "react"
import type { Appointment, AppointmentStatus, TimeSlot } from "@/lib/types"
import { getAvailableTimeSlots } from "@/lib/types"

const STORAGE_KEY = "appointments"

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setAppointments(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
    }
  }, [appointments, isLoaded])

  const addAppointment = useCallback((appointment: Omit<Appointment, "id" | "createdAt" | "status">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      status: "pendente",
      createdAt: new Date().toISOString(),
    }
    setAppointments((prev) => [...prev, newAppointment])
    return newAppointment
  }, [])

  const removeAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id))
  }, [])

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    )
  }, [])

  const updateAppointmentObservation = useCallback((id: string, observation: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, supportObservation: observation } : apt))
    )
  }, [])

  const transferAppointment = useCallback((id: string, newSupportPerson: "Clinton" | "Letícia") => {
    setAppointments((prev) => {
      const apt = prev.find((a) => a.id === id)
      if (!apt) return prev
      
      // Verificar se o novo suporte já tem agendamento no mesmo horário
      const hasConflict = prev.some(
        (a) =>
          a.id !== id &&
          a.date === apt.date &&
          a.time === apt.time &&
          a.supportPerson === newSupportPerson &&
          a.status !== "rejeitado"
      )
      
      if (hasConflict) {
        console.log("[v0] Conflito: suporte já tem agendamento neste horário")
        return prev
      }
      
      return prev.map((a) => (a.id === id ? { ...a, supportPerson: newSupportPerson } : a))
    })
  }, [])

  const getAppointmentsByDate = useCallback(
    (date: string): Appointment[] => {
      return appointments.filter((apt) => apt.date === date)
    },
    [appointments]
  )

  const getTimeSlotsForDate = useCallback(
    (date: string): TimeSlot[] => {
      const dateAppointments = getAppointmentsByDate(date)
      const availableTimeSlots = getAvailableTimeSlots()

      return availableTimeSlots.map((time) => {
        const slotAppointments = dateAppointments.filter((apt) => apt.time === time && apt.status !== "rejeitado")
        const availableSlots = 2 - slotAppointments.length

        return {
          time,
          displayTime: time,
          appointments: slotAppointments,
          available: availableSlots > 0,
          availableSlots,
        }
      })
    },
    [getAppointmentsByDate]
  )

  const isSlotAvailable = useCallback(
    (date: string, time: string, supportPerson?: string): boolean => {
      const dateAppointments = getAppointmentsByDate(date)
      const slotAppointments = dateAppointments.filter((apt) => apt.time === time && apt.status !== "rejeitado")

      if (slotAppointments.length >= 2) return false

      if (supportPerson) {
        return !slotAppointments.some((apt) => apt.supportPerson === supportPerson)
      }

      return slotAppointments.length < 2
    },
    [getAppointmentsByDate]
  )

  const getAvailableSupportPersons = useCallback(
    (date: string, time: string): string[] => {
      const dateAppointments = getAppointmentsByDate(date)
      const slotAppointments = dateAppointments.filter((apt) => apt.time === time && apt.status !== "rejeitado")
      const takenPersons = slotAppointments.map((apt) => apt.supportPerson)

      return ["Clinton", "Letícia"].filter((person) => !takenPersons.includes(person as "Clinton" | "Letícia"))
    },
    [getAppointmentsByDate]
  )

  const getReportData = useCallback(() => {
    const total = appointments.length
    const concluidos = appointments.filter((apt) => apt.status === "concluido").length
    const naoOcorreram = appointments.filter((apt) => apt.status === "nao_ocorreu").length
    const pendentes = appointments.filter((apt) => apt.status === "pendente").length
    const confirmados = appointments.filter((apt) => apt.status === "confirmado").length
    const rejeitados = appointments.filter((apt) => apt.status === "rejeitado").length

    return {
      total,
      concluidos,
      naoOcorreram,
      pendentes,
      confirmados,
      rejeitados,
    }
  }, [appointments])

  return {
    appointments,
    isLoaded,
    addAppointment,
    removeAppointment,
    updateAppointmentStatus,
    updateAppointmentObservation,
    transferAppointment,
    getAppointmentsByDate,
    getTimeSlotsForDate,
    isSlotAvailable,
    getAvailableSupportPersons,
    getReportData,
  }
}
