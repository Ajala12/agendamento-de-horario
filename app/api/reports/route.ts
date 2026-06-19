import { NextResponse } from "next/server"
import { getReportData, getAllAppointments } from "@/lib/repository"

/**
 * GET /api/reports
 * 
 * Retorna dados agregados para relatórios
 */
export async function GET() {
  try {
    const reportData = await getReportData()
    const appointments = await getAllAppointments()
    
    // Dados adicionais para gráficos
    const byMonth: Record<string, { concluido: number; nao_ocorreu: number }> = {}
    const byPlanType: Record<string, number> = {}
    
    appointments.forEach((apt) => {
      // Agrupa por mês
      const month = apt.date.substring(0, 7) // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = { concluido: 0, nao_ocorreu: 0 }
      }
      if (apt.status === "concluido") {
        byMonth[month].concluido++
      } else if (apt.status === "nao_ocorreu") {
        byMonth[month].nao_ocorreu++
      }
      
      // Agrupa por tipo de plano
      if (apt.contractInfo?.planTypes) {
        apt.contractInfo.planTypes.forEach((planType) => {
          byPlanType[planType] = (byPlanType[planType] || 0) + 1
        })
      }
    })
    
    // Converte byMonth para array ordenado
    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
      }))
    
    // Converte byPlanType para array
    const planTypeData = Object.entries(byPlanType).map(([type, count]) => ({
      type,
      count,
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        ...reportData,
        monthlyData,
        planTypeData,
        taxaConclusao: reportData.total > 0 
          ? ((reportData.concluidos / (reportData.concluidos + reportData.naoOcorreram)) * 100).toFixed(1)
          : "0",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao gerar relatório" },
      { status: 500 }
    )
  }
}
