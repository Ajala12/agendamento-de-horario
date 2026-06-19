/**
 * Camada de Repositório - Acesso a dados via Supabase
 *
 * Mantém exatamente as mesmas funções/assinaturas que as rotas de API
 * (app/api/**) já utilizam, então nada mais no projeto precisa mudar.
 */

import { supabase } from "./supabase"
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from "./types"
import { DEFAULT_TIME_SLOTS } from "./types"

// ============================================
// Conversão entre snake_case (banco) e camelCase (app)
// ============================================

type AppointmentRow = {
  id: string
  date: string
  time: string
  client_name: string
  client_group: string
  client_phone: string
  client_logins: number
  contract_plan_types: string[]
  contract_single_sub_type: string | null
  commercial_observation: string | null
  seller: string
  support_person: "Clinton" | "Letícia"
  support_observation: string | null
  status: Appointment["status"]
  created_at: string
  created_by: string
}

function rowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    clientName: row.client_name,
    clientGroup: row.client_group,
    clientPhone: row.client_phone,
    clientLogins: row.client_logins,
    contractInfo: {
      planTypes: (row.contract_plan_types ?? []) as Appointment["contractInfo"]["planTypes"],
      singleSubType: (row.contract_single_sub_type ?? undefined) as Appointment["contractInfo"]["singleSubType"],
    },
    commercialObservation: row.commercial_observation ?? undefined,
    seller: row.seller,
    supportPerson: row.support_person,
    supportObservation: row.support_observation ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }
}

function appointmentInputToRow(input: CreateAppointmentInput) {
  return {
    date: input.date,
    time: input.time,
    client_name: input.clientName,
    client_group: input.clientGroup,
    client_phone: input.clientPhone,
    client_logins: input.clientLogins,
    contract_plan_types: input.contractInfo.planTypes,
    contract_single_sub_type: input.contractInfo.singleSubType ?? null,
    commercial_observation: input.commercialObservation ?? null,
    seller: input.seller,
    support_person: input.supportPerson,
    created_by: input.createdBy,
  }
}

// ============================================
// FUNÇÕES DO REPOSITÓRIO
// ============================================

export async function getAllAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) throw error
  return (data as AppointmentRow[]).map(rowToAppointment)
}

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  const { data, error } = await supabase.from("appointments").select("*").eq("date", date)

  if (error) throw error
  return (data as AppointmentRow[]).map(rowToAppointment)
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase.from("appointments").select("*").eq("id", id).maybeSingle()

  if (error) throw error
  return data ? rowToAppointment(data as AppointmentRow) : null
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({ ...appointmentInputToRow(input), status: "pendente" })
    .select()
    .single()

  if (error) throw error
  return rowToAppointment(data as AppointmentRow)
}

export async function updateAppointment(id: string, input: UpdateAppointmentInput): Promise<Appointment | null> {
  const updateData: Record<string, unknown> = {}
  if (input.status !== undefined) updateData.status = input.status
  if (input.supportObservation !== undefined) updateData.support_observation = input.supportObservation

  const { data, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data ? rowToAppointment(data as AppointmentRow) : null
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("appointments").delete({ count: "exact" }).eq("id", id)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function transferAppointment(
  id: string,
  newSupportPerson: "Clinton" | "Letícia"
): Promise<Appointment | null> {
  const appointment = await getAppointmentById(id)
  if (!appointment) return null

  // Verificar se o novo suporte está disponível no mesmo horário
  const dateAppointments = await getAppointmentsByDate(appointment.date)
  const conflictingAppointment = dateAppointments.find(
    (apt) =>
      apt.id !== id &&
      apt.time === appointment.time &&
      apt.supportPerson === newSupportPerson &&
      apt.status !== "rejeitado"
  )

  if (conflictingAppointment) {
    return null // Suporte já tem agendamento neste horário
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({ support_person: newSupportPerson })
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data ? rowToAppointment(data as AppointmentRow) : null
}

export async function checkSlotAvailability(
  date: string,
  time: string
): Promise<{ available: boolean; slots: number; takenBy: string[] }> {
  const dateAppointments = await getAppointmentsByDate(date)
  const slotAppointments = dateAppointments.filter((apt) => apt.time === time && apt.status !== "rejeitado")

  const takenBy = slotAppointments.map((apt) => apt.supportPerson)
  const availableSlots = 2 - slotAppointments.length

  return {
    available: availableSlots > 0,
    slots: availableSlots,
    takenBy,
  }
}

export async function getReportData(): Promise<{
  total: number
  pendentes: number
  confirmados: number
  rejeitados: number
  concluidos: number
  naoOcorreram: number
  porSuporte: Record<string, number>
  porVendedor: Record<string, number>
}> {
  const all = await getAllAppointments()

  const porSuporte: Record<string, number> = {}
  const porVendedor: Record<string, number> = {}

  all.forEach((apt) => {
    porSuporte[apt.supportPerson] = (porSuporte[apt.supportPerson] || 0) + 1
    if (apt.seller) {
      porVendedor[apt.seller] = (porVendedor[apt.seller] || 0) + 1
    }
  })

  return {
    total: all.length,
    pendentes: all.filter((a) => a.status === "pendente").length,
    confirmados: all.filter((a) => a.status === "confirmado").length,
    rejeitados: all.filter((a) => a.status === "rejeitado").length,
    concluidos: all.filter((a) => a.status === "concluido").length,
    naoOcorreram: all.filter((a) => a.status === "nao_ocorreu").length,
    porSuporte,
    porVendedor,
  }
}

// ============================================
// CONFIGURAÇÕES DE HORÁRIOS
// ============================================

export async function getAvailableTimeSlots(): Promise<string[]> {
  const { data, error } = await supabase
    .from("time_slots")
    .select("time")
    .eq("active", true)
    .order("time", { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return DEFAULT_TIME_SLOTS
  return data.map((row) => row.time as string)
}

export async function setAvailableTimeSlots(slots: string[]): Promise<string[]> {
  // Desativa todos os horários e reativa/insere apenas os recebidos
  const { error: deactivateError } = await supabase
    .from("time_slots")
    .update({ active: false })
    .neq("time", "")

  if (deactivateError) throw deactivateError

  if (slots.length > 0) {
    const { error: upsertError } = await supabase
      .from("time_slots")
      .upsert(
        slots.map((time) => ({ time, active: true })),
        { onConflict: "time" }
      )

    if (upsertError) throw upsertError
  }

  return getAvailableTimeSlots()
}
