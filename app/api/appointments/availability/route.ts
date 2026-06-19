import { NextRequest, NextResponse } from "next/server"
import { checkSlotAvailability } from "@/lib/repository"
import { SUPPORT_PERSONS } from "@/lib/types"

/**
 * GET /api/appointments/availability
 * 
 * Query params:
 * - date: data para verificar (obrigatório, formato YYYY-MM-DD)
 * - time: horário para verificar (obrigatório, formato HH:mm)
 * 
 * Retorna disponibilidade do horário e quais atendentes estão disponíveis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const time = searchParams.get("time")
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: "Data é obrigatória" },
        { status: 400 }
      )
    }
    
    if (!time) {
      return NextResponse.json(
        { success: false, error: "Horário é obrigatório" },
        { status: 400 }
      )
    }
    
    const availability = await checkSlotAvailability(date, time)
    
    // Calcula quais atendentes estão disponíveis
    const availableSupportPersons = SUPPORT_PERSONS.filter(
      (person) => !availability.takenBy.includes(person)
    )
    
    return NextResponse.json({
      success: true,
      data: {
        date,
        time,
        available: availability.available,
        availableSlots: availability.slots,
        takenBy: availability.takenBy,
        availableSupportPersons,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao verificar disponibilidade" },
      { status: 500 }
    )
  }
}
