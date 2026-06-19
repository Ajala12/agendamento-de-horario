import { NextRequest, NextResponse } from "next/server"
import { getAppointmentById, updateAppointment, deleteAppointment } from "@/lib/repository"
import type { UpdateAppointmentInput, AppointmentStatus } from "@/lib/types"

const VALID_STATUSES: AppointmentStatus[] = ["pendente", "confirmado", "rejeitado", "concluido", "nao_ocorreu"]

/**
 * GET /api/appointments/[id]
 * 
 * Retorna um agendamento específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const appointment = await getAppointmentById(id)
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: appointment })
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao buscar agendamento" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/appointments/[id]
 * 
 * Atualiza um agendamento (status e/ou observação do suporte)
 * 
 * Body: { status?: AppointmentStatus, supportObservation?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json() as UpdateAppointmentInput
    
    // Verifica se o agendamento existe
    const existing = await getAppointmentById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }
    
    // Valida o status se fornecido
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Status inválido" },
        { status: 400 }
      )
    }
    
    // Atualiza o agendamento
    const updated = await updateAppointment(id, body)
    
    // Gera mensagem de feedback baseada na ação
    let message = "Agendamento atualizado com sucesso"
    if (body.status === "confirmado") {
      message = `Treinamento de ${existing.clientName} foi CONFIRMADO! O treinamento será realizado.`
    } else if (body.status === "rejeitado") {
      message = `Solicitação de ${existing.clientName} foi REJEITADA. A solicitação não foi aceita.`
    } else if (body.status === "concluido") {
      message = `Treinamento de ${existing.clientName} foi marcado como CONCLUÍDO.`
    } else if (body.status === "nao_ocorreu") {
      message = `Treinamento de ${existing.clientName} foi marcado como NÃO OCORREU.`
    } else if (body.supportObservation !== undefined) {
      message = "Observação do suporte atualizada com sucesso."
    }
    
    return NextResponse.json({ success: true, data: updated, message })
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar agendamento" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/appointments/[id]
 * 
 * Remove um agendamento
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verifica se o agendamento existe
    const existing = await getAppointmentById(id)
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Agendamento não encontrado" },
        { status: 404 }
      )
    }
    
    const deleted = await deleteAppointment(id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Erro ao excluir agendamento" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Agendamento de ${existing.clientName} excluído com sucesso` 
    })
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao excluir agendamento" },
      { status: 500 }
    )
  }
}
