import { NextRequest, NextResponse } from "next/server"
import { getAllAppointments, getAppointmentsByDate, createAppointment, checkSlotAvailability } from "@/lib/repository"
import type { CreateAppointmentInput } from "@/lib/types"
import { SUPPORT_PERSONS, SELLERS } from "@/lib/types"

/**
 * GET /api/appointments
 * 
 * Query params:
 * - date: filtra por data específica (formato YYYY-MM-DD)
 * 
 * Retorna lista de agendamentos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    
    let appointments
    if (date) {
      appointments = await getAppointmentsByDate(date)
    } else {
      appointments = await getAllAppointments()
    }
    
    return NextResponse.json({ success: true, data: appointments })
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao buscar agendamentos" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointments
 * 
 * Body: CreateAppointmentInput
 * 
 * Cria um novo agendamento (reserva pendente)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateAppointmentInput
    
    // Validações
    if (!body.clientName || !body.clientName.trim()) {
      return NextResponse.json(
        { success: false, error: "Nome do cliente é obrigatório" },
        { status: 400 }
      )
    }
    
    if (!body.clientGroup || !body.clientGroup.trim()) {
      return NextResponse.json(
        { success: false, error: "Grupo do cliente é obrigatório" },
        { status: 400 }
      )
    }
    
    if (!body.clientPhone || !body.clientPhone.trim()) {
      return NextResponse.json(
        { success: false, error: "Telefone é obrigatório" },
        { status: 400 }
      )
    }
    
    if (!body.clientLogins || body.clientLogins < 1) {
      return NextResponse.json(
        { success: false, error: "Quantidade de logins deve ser pelo menos 1" },
        { status: 400 }
      )
    }
    
    if (!body.seller || !SELLERS.includes(body.seller as any)) {
      return NextResponse.json(
        { success: false, error: "Vendedor inválido" },
        { status: 400 }
      )
    }
    
    if (!body.date) {
      return NextResponse.json(
        { success: false, error: "Data é obrigatória" },
        { status: 400 }
      )
    }
    
    if (!body.time) {
      return NextResponse.json(
        { success: false, error: "Horário é obrigatório" },
        { status: 400 }
      )
    }
    
    if (!body.supportPerson || !SUPPORT_PERSONS.includes(body.supportPerson)) {
      return NextResponse.json(
        { success: false, error: "Pessoa de suporte inválida" },
        { status: 400 }
      )
    }
    
    if (!body.contractInfo || !body.contractInfo.planTypes || body.contractInfo.planTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Informações de contratação são obrigatórias" },
        { status: 400 }
      )
    }
    
    // Verifica disponibilidade do horário
    const availability = await checkSlotAvailability(body.date, body.time)
    
    if (!availability.available) {
      return NextResponse.json(
        { success: false, error: "Horário não disponível" },
        { status: 409 }
      )
    }
    
    // Verifica se o suporte escolhido já está ocupado nesse horário
    if (availability.takenBy.includes(body.supportPerson)) {
      return NextResponse.json(
        { success: false, error: `${body.supportPerson} já tem agendamento neste horário` },
        { status: 409 }
      )
    }
    
    // Cria o agendamento
    const appointment = await createAppointment(body)
    
    return NextResponse.json(
      { success: true, data: appointment, message: "Reserva criada com sucesso! Aguardando confirmação do suporte." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao criar agendamento" },
      { status: 500 }
    )
  }
}
