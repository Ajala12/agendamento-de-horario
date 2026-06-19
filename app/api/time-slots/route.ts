import { NextRequest, NextResponse } from "next/server"
import { getAvailableTimeSlots, setAvailableTimeSlots, checkSlotAvailability, getAppointmentsByDate } from "@/lib/repository"
import { DEFAULT_TIME_SLOTS } from "@/lib/types"

/**
 * GET /api/time-slots
 * 
 * Query params:
 * - date: opcional - se fornecido, retorna disponibilidade para cada horário
 * 
 * Retorna horários configurados ou disponibilidade por data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    
    const availableSlots = await getAvailableTimeSlots()
    
    if (date) {
      // Retorna disponibilidade para cada horário na data específica
      const appointments = await getAppointmentsByDate(date)
      
      const slotsWithAvailability = await Promise.all(
        availableSlots.map(async (time) => {
          const availability = await checkSlotAvailability(date, time)
          const slotAppointments = appointments.filter(
            (apt) => apt.time === time && apt.status !== "rejeitado"
          )
          
          return {
            time,
            displayTime: time,
            available: availability.available,
            availableSlots: availability.slots,
            takenBy: availability.takenBy,
            appointments: slotAppointments,
          }
        })
      )
      
      return NextResponse.json({ success: true, data: slotsWithAvailability })
    }
    
    // Retorna apenas os horários configurados
    return NextResponse.json({ success: true, data: availableSlots })
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao buscar horários" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/time-slots
 * 
 * Body: { slots: string[] }
 * 
 * Atualiza os horários disponíveis para agendamento
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.slots || !Array.isArray(body.slots)) {
      return NextResponse.json(
        { success: false, error: "Lista de horários inválida" },
        { status: 400 }
      )
    }
    
    // Valida se os horários são válidos (formato HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    const invalidSlots = body.slots.filter((slot: string) => !timeRegex.test(slot))
    
    if (invalidSlots.length > 0) {
      return NextResponse.json(
        { success: false, error: `Horários inválidos: ${invalidSlots.join(", ")}` },
        { status: 400 }
      )
    }
    
    // Valida se todos os horários estão na lista padrão
    const invalidTimes = body.slots.filter((slot: string) => !DEFAULT_TIME_SLOTS.includes(slot))
    if (invalidTimes.length > 0) {
      return NextResponse.json(
        { success: false, error: `Horários fora do permitido: ${invalidTimes.join(", ")}` },
        { status: 400 }
      )
    }
    
    const updatedSlots = await setAvailableTimeSlots(body.slots)
    
    return NextResponse.json({ 
      success: true, 
      data: updatedSlots,
      message: "Horários atualizados com sucesso" 
    })
  } catch (error) {
    console.error("Erro ao atualizar horários:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar horários" },
      { status: 500 }
    )
  }
}
