import { NextResponse } from "next/server"
import { getAppointmentById, transferAppointment, checkSlotAvailability } from "@/lib/repository"

/**
 * POST /api/appointments/[id]/transfer
 * Transfere um agendamento para outro suporte
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.newSupportPerson) {
      return NextResponse.json(
        { success: false, error: "Novo suporte é obrigatório" },
        { status: 400 }
      )
    }

    if (!["Clinton", "Letícia"].includes(body.newSupportPerson)) {
      return NextResponse.json(
        { success: false, error: "Suporte inválido" },
        { status: 400 }
      )
    }

    const appointment = await getAppointmentById(id)
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já é o mesmo suporte
    if (appointment.supportPerson === body.newSupportPerson) {
      return NextResponse.json(
        { success: false, error: "O agendamento já está com este suporte" },
        { status: 400 }
      )
    }

    // Verificar disponibilidade do novo suporte
    const availability = await checkSlotAvailability(appointment.date, appointment.time)
    if (availability.takenBy.includes(body.newSupportPerson)) {
      return NextResponse.json(
        { success: false, error: `${body.newSupportPerson} já possui um agendamento neste horário` },
        { status: 400 }
      )
    }

    const updated = await transferAppointment(id, body.newSupportPerson)

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Erro ao transferir agendamento" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Agendamento transferido para ${body.newSupportPerson} com sucesso`,
    })
  } catch (error) {
    console.error("Erro ao transferir agendamento:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao transferir agendamento" },
      { status: 500 }
    )
  }
}
