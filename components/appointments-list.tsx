"use client"

import { useState } from "react"
import { Briefcase, Calendar, Check, Clock, FileText, Phone, Trash2, User, UserCircle, Users, X, CheckCircle, XCircle, MessageSquare, Hash, Pencil, Save, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { STATUS_COLORS, STATUS_LABELS, PLAN_TYPES, SINGLE_SUB_TYPES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AppointmentsListProps {
  appointments: Appointment[]
  onRemove?: (id: string) => void
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void
  onUpdateObservation?: (id: string, observation: string) => void
  onTransfer?: (id: string, newSupportPerson: "Clinton" | "Letícia") => void
  showRemove?: boolean
  showActions?: boolean
  showObservationEdit?: boolean
  showTransfer?: boolean
  currentSupportPerson?: string
  emptyMessage?: string
}

export function AppointmentsList({
  appointments,
  onRemove,
  onUpdateStatus,
  onUpdateObservation,
  onTransfer,
  showRemove = false,
  showActions = false,
  showObservationEdit = false,
  showTransfer = false,
  currentSupportPerson,
  emptyMessage = "Nenhum agendamento encontrado",
}: AppointmentsListProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<{ id: string; message: string; type: "success" | "error" } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingObservation, setEditingObservation] = useState<string | null>(null)
  const [observationText, setObservationText] = useState<string>("")
  const [transferConfirm, setTransferConfirm] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const getContractLabel = (apt: Appointment) => {
    if (!apt.contractInfo?.planTypes || apt.contractInfo.planTypes.length === 0) return "N/A"
    
    const labels = apt.contractInfo.planTypes.map((planType) => {
      const plan = PLAN_TYPES.find((p) => p.value === planType)
      if (!plan) return planType
      
      if (planType === "single" && apt.contractInfo.singleSubType) {
        const sub = SINGLE_SUB_TYPES.find((s) => s.value === apt.contractInfo.singleSubType)
        return `${plan.label} (${sub?.label || apt.contractInfo.singleSubType})`
      }
      return plan.label
    })
    
    return labels.join(" | ")
  }

  const handleStatusChange = (id: string, status: AppointmentStatus, clientName: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, status)
      
      let message = ""
      let type: "success" | "error" = "success"
      
      if (status === "confirmado") {
        message = `Treinamento de ${clientName} foi CONFIRMADO! O treinamento será realizado.`
        type = "success"
      } else if (status === "rejeitado") {
        message = `Solicitação de ${clientName} foi REJEITADA. A solicitação não foi aceita.`
        type = "error"
      } else if (status === "concluido") {
        message = `Treinamento de ${clientName} foi marcado como CONCLUÍDO!`
        type = "success"
      } else if (status === "nao_ocorreu") {
        message = `Treinamento de ${clientName} foi marcado como NÃO OCORREU.`
        type = "error"
      }
      
      setFeedbackMessage({ id, message, type })
      setTimeout(() => setFeedbackMessage(null), 5000)
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id)
  }

  const handleConfirmDelete = (id: string) => {
    if (onRemove) {
      onRemove(id)
    }
    setDeleteConfirm(null)
  }

  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleEditObservation = (apt: Appointment) => {
    setEditingObservation(apt.id)
    setObservationText(apt.supportObservation || "")
  }

  const handleSaveObservation = (id: string) => {
    if (onUpdateObservation) {
      onUpdateObservation(id, observationText)
    }
    setEditingObservation(null)
    setObservationText("")
  }

  const handleCancelObservation = () => {
    setEditingObservation(null)
    setObservationText("")
  }

  const handleTransfer = (apt: Appointment) => {
    if (!onTransfer) return
    const otherSupport = apt.supportPerson === "Clinton" ? "Letícia" : "Clinton"
    onTransfer(apt.id, otherSupport)
    setTransferConfirm(null)
    setFeedbackMessage({
      id: apt.id,
      message: `Agendamento de ${apt.clientName} foi transferido para ${otherSupport}`,
      type: "success",
    })
    setTimeout(() => setFeedbackMessage(null), 5000)
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.time.localeCompare(b.time)
  })

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feedbackMessage && (
        <div
          className={cn(
            "flex items-center gap-2 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2",
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
              : "bg-red-500/10 border-red-500/20 text-red-600"
          )}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="font-medium">{feedbackMessage.message}</span>
        </div>
      )}

      {sortedAppointments.map((apt) => (
        <div
          key={apt.id}
          className={cn(
            "flex items-start justify-between p-4 rounded-lg border border-border bg-card",
            "hover:border-primary/50 transition-colors"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-secondary">
              <span className="text-xs text-muted-foreground uppercase">
                {formatDate(apt.date).split(",")[0]}
              </span>
              <span className="text-lg font-bold text-foreground">
                {new Date(apt.date + "T00:00:00").getDate()}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{apt.clientName}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUS_COLORS[apt.status])}>
                  {STATUS_LABELS[apt.status]}
                </span>
              </div>
              {apt.clientGroup && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{apt.clientGroup}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>{getContractLabel(apt)}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {apt.time}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {apt.clientPhone}
                </span>
              </div>
              {apt.clientLogins && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>Logins: {apt.clientLogins}</span>
                </div>
              )}
              {apt.seller && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  <span>Vendedor: {apt.seller}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm">
                <UserCircle className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">{apt.supportPerson}</span>
              </div>

              {/* Botão de transferir para outro suporte */}
              {showTransfer && onTransfer && apt.status !== "rejeitado" && apt.status !== "concluido" && apt.status !== "nao_ocorreu" && (
                <div className="mt-2">
                  {transferConfirm === apt.id ? (
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-amber-500/50 bg-amber-500/5">
                      <p className="text-sm text-amber-600 font-medium">
                        Transferir para {apt.supportPerson === "Clinton" ? "Letícia" : "Clinton"}?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTransferConfirm(null)}
                          className="text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTransfer(apt)}
                          className="text-xs bg-amber-600 hover:bg-amber-700"
                        >
                          Confirmar Transferência
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransferConfirm(apt.id)}
                      className="text-amber-600 border-amber-600 hover:bg-amber-600/10"
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      Transferir para {apt.supportPerson === "Clinton" ? "Letícia" : "Clinton"}
                    </Button>
                  )}
                </div>
              )}

              {/* Observação do Comercial - visível para o suporte */}
              {apt.commercialObservation && (
                <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-600 font-medium mb-1">Observação do Comercial:</p>
                  <p className="text-sm text-foreground">{apt.commercialObservation}</p>
                </div>
              )}

              {/* Observação do Suporte - visível para todos */}
              {apt.supportObservation && !showObservationEdit && (
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 font-medium mb-1">Observação do Suporte:</p>
                  <p className="text-sm text-foreground">{apt.supportObservation}</p>
                </div>
              )}

              {/* Campo de edição de observação para o Suporte */}
              {showObservationEdit && (
                <div className="mt-3 pt-3 border-t border-border">
                  {editingObservation === apt.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        placeholder="Digite uma observação para o comercial..."
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelObservation}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveObservation(apt.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {apt.supportObservation && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-600 font-medium mb-1">Observação:</p>
                          <p className="text-sm text-foreground">{apt.supportObservation}</p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditObservation(apt)}
                        className="text-amber-600 border-amber-600 hover:bg-amber-600/10"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        {apt.supportObservation ? "Editar Observação" : "Adicionar Observação"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {showActions && onUpdateStatus && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {apt.status === "pendente" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(apt.id, "confirmado", apt.clientName)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-600/10"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Confirmar Treinamento
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(apt.id, "rejeitado", apt.clientName)}
                        className="text-red-600 border-red-600 hover:bg-red-600/10"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Rejeitar Solicitação
                      </Button>
                    </>
                  )}
                  {apt.status === "confirmado" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(apt.id, "concluido", apt.clientName)}
                        className="text-green-600 border-green-600 hover:bg-green-600/10"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Treinamento Concluído
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(apt.id, "nao_ocorreu", apt.clientName)}
                        className="text-gray-600 border-gray-600 hover:bg-gray-600/10"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Não Ocorreu
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {showRemove && onRemove && (
            <div className="flex flex-col items-end gap-2">
              {deleteConfirm === apt.id ? (
                <div className="flex flex-col gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
                  <p className="text-sm text-destructive font-medium">Confirmar exclusao?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDelete}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleConfirmDelete(apt.id)}
                      className="text-xs"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(apt.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
