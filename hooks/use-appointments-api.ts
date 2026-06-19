"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import type { Appointment, AppointmentStatus, TimeSlot, CreateAppointmentInput, UpdateAppointmentInput } from "@/lib/types"

// Fetcher para SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error || "Erro na requisição")
  }
  return data.data
}

/**
 * Hook para gerenciar agendamentos via API
 * 
 * Este hook usa SWR para cache e revalidação automática,
 * e se comunica com as API Routes do backend.
 */
export function useAppointmentsAPI() {
  // Busca todos os agendamentos
  const { data: appointments = [], error, isLoading } = useSWR<Appointment[]>(
    "/api/appointments",
    fetcher,
    {
      refreshInterval: 30000, // Revalida a cada 30 segundos
      revalidateOnFocus: true,
    }
  )

  const isLoaded = !isLoading

  /**
   * Adiciona um novo agendamento (reserva)
   */
  const addAppointment = useCallback(async (input: Omit<Appointment, "id" | "createdAt" | "status" | "supportObservation">) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || "Erro ao criar agendamento")
      }
      
      // Revalida o cache
      mutate("/api/appointments")
      
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error("Erro ao adicionar agendamento:", error)
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }, [])

  /**
   * Remove um agendamento
   */
  const removeAppointment = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || "Erro ao excluir agendamento")
      }
      
      // Revalida o cache
      mutate("/api/appointments")
      
      return { success: true, message: data.message }
    } catch (error) {
      console.error("Erro ao remover agendamento:", error)
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }, [])

  /**
   * Atualiza o status de um agendamento
   */
  const updateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || "Erro ao atualizar status")
      }
      
      // Revalida o cache
      mutate("/api/appointments")
      
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }, [])

  /**
   * Atualiza a observação do suporte
   */
  const updateAppointmentObservation = useCallback(async (id: string, supportObservation: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supportObservation }),
      })
      
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || "Erro ao atualizar observação")
      }
      
      // Revalida o cache
      mutate("/api/appointments")
      
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error("Erro ao atualizar observação:", error)
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }, [])

  /**
   * Busca agendamentos por data
   */
  const getAppointmentsByDate = useCallback(
    (date: string): Appointment[] => {
      return appointments.filter((apt) => apt.date === date)
    },
    [appointments]
  )

  /**
   * Busca slots de horário para uma data
   */
  const getTimeSlotsForDate = useCallback(
    async (date: string): Promise<TimeSlot[]> => {
      try {
        const res = await fetch(`/api/time-slots?date=${date}`)
        const data = await res.json()
        
        if (!data.success) {
          throw new Error(data.error)
        }
        
        return data.data
      } catch (error) {
        console.error("Erro ao buscar slots:", error)
        return []
      }
    },
    []
  )

  /**
   * Verifica disponibilidade de um horário
   */
  const checkAvailability = useCallback(
    async (date: string, time: string) => {
      try {
        const res = await fetch(`/api/appointments/availability?date=${date}&time=${time}`)
        const data = await res.json()
        
        if (!data.success) {
          throw new Error(data.error)
        }
        
        return data.data
      } catch (error) {
        console.error("Erro ao verificar disponibilidade:", error)
        return null
      }
    },
    []
  )

  /**
   * Busca atendentes disponíveis para um horário
   */
  const getAvailableSupportPersons = useCallback(
    (date: string, time: string): string[] => {
      const dateAppointments = getAppointmentsByDate(date)
      const slotAppointments = dateAppointments.filter((apt) => apt.time === time && apt.status !== "rejeitado")
      const takenPersons = slotAppointments.map((apt) => apt.supportPerson)
      
      return ["Clinton", "Letícia"].filter((person) => !takenPersons.includes(person as "Clinton" | "Letícia"))
    },
    [getAppointmentsByDate]
  )

  /**
   * Busca dados para relatórios
   */
  const getReportData = useCallback(async () => {
    try {
      const res = await fetch("/api/reports")
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }
      
      return data.data
    } catch (error) {
      console.error("Erro ao buscar relatório:", error)
      return null
    }
  }, [])

  /**
   * Busca dados de relatório do cache local (para uso síncrono)
   */
  const getReportDataSync = useCallback(() => {
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
    error,
    addAppointment,
    removeAppointment,
    updateAppointmentStatus,
    updateAppointmentObservation,
    getAppointmentsByDate,
    getTimeSlotsForDate,
    checkAvailability,
    getAvailableSupportPersons,
    getReportData,
    getReportDataSync,
  }
}
