export type AppointmentStatus = "pendente" | "confirmado" | "rejeitado" | "concluido" | "nao_ocorreu"

export type ContractPlanType = "single" | "multi" | "ura" | "discadora"
export type SinglePlanSubType = "INSS" | "CLT" | "GOV" | "PREFEITURA" | "B2B"

export interface ContractInfo {
  planTypes: ContractPlanType[] // Múltipla escolha
  singleSubType?: SinglePlanSubType // Seleção única
}

// Tipos de usuário
export type UserRole = "comercial" | "suporte" | "admin"

export interface SystemUser {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  active: boolean
  createdAt: string
}

export interface Appointment {
  id: string
  date: string // formato YYYY-MM-DD
  time: string // formato HH:mm
  clientName: string
  clientGroup: string
  clientPhone: string
  clientLogins: number
  contractInfo: ContractInfo
  commercialObservation?: string // Observação do comercial para o suporte
  seller: string
  supportPerson: "Clinton" | "Letícia"
  supportObservation?: string
  status: AppointmentStatus
  createdAt: string
  createdBy: string
}

// Tipo para criar um novo agendamento (sem id, createdAt e status)
export type CreateAppointmentInput = Omit<Appointment, "id" | "createdAt" | "status" | "supportObservation">

// Tipo para atualizar um agendamento
export type UpdateAppointmentInput = Partial<Pick<Appointment, "status" | "supportObservation">>

export interface TimeSlot {
  time: string
  displayTime: string
  appointments: Appointment[]
  available: boolean
  availableSlots: number
}

export const SUPPORT_PERSONS = ["Clinton", "Letícia"] as const

export const SELLERS = ["Pedro", "Marcus", "Gabrielli", "Josue", "Livia", "Emily"] as const
export type Seller = (typeof SELLERS)[number]

export const PLAN_TYPES: { value: ContractPlanType; label: string }[] = [
  { value: "single", label: "Plano Single" },
  { value: "multi", label: "Plano Multi" },
  { value: "ura", label: "URA" },
  { value: "discadora", label: "Discadora" },
]

export const SINGLE_SUB_TYPES: { value: SinglePlanSubType; label: string }[] = [
  { value: "INSS", label: "INSS" },
  { value: "CLT", label: "CLT" },
  { value: "GOV", label: "GOV" },
  { value: "PREFEITURA", label: "PREFEITURA" },
  { value: "B2B", label: "B2B" },
]

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  rejeitado: "Rejeitado",
  concluido: "Concluído",
  nao_ocorreu: "Não Ocorreu",
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pendente: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  confirmado: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  rejeitado: "bg-red-500/20 text-red-600 border-red-500/30",
  concluido: "bg-green-500/20 text-green-600 border-green-500/30",
  nao_ocorreu: "bg-gray-500/20 text-gray-600 border-gray-500/30",
}

export const DEFAULT_TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

// Função para obter os horários disponíveis do localStorage
export function getAvailableTimeSlots(): string[] {
  if (typeof window === "undefined") return DEFAULT_TIME_SLOTS
  const stored = localStorage.getItem("support_available_slots")
  if (stored) {
    return JSON.parse(stored)
  }
  return DEFAULT_TIME_SLOTS
}
