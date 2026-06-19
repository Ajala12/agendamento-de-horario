"use client"

import { useState } from "react"
import { CalendarPlus, FileText, Phone, User, Users, Briefcase, Hash, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Appointment, ContractPlanType, SinglePlanSubType } from "@/lib/types"
import { PLAN_TYPES, SINGLE_SUB_TYPES, SELLERS } from "@/lib/types"

interface BookingFormProps {
  selectedDate: Date
  selectedTime: string
  availableSupportPersons: string[]
  onSubmit: (data: Omit<Appointment, "id" | "createdAt" | "status">) => void
  onCancel: () => void
}

export function BookingForm({
  selectedDate,
  selectedTime,
  availableSupportPersons,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [clientName, setClientName] = useState("")
  const [clientGroup, setClientGroup] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientLogins, setClientLogins] = useState<number>(1)
  const [seller, setSeller] = useState<string>("")
  const [planTypes, setPlanTypes] = useState<ContractPlanType[]>([])
  const [singleSubType, setSingleSubType] = useState<SinglePlanSubType | "">("")
  const [commercialObservation, setCommercialObservation] = useState("")
  const [supportPerson, setSupportPerson] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const handlePlanTypeToggle = (value: ContractPlanType) => {
    // Single e Multi são mutuamente exclusivos
    if (value === "single" && planTypes.includes("multi")) {
      setPlanTypes((prev) => [...prev.filter((p) => p !== "multi"), value])
    } else if (value === "multi" && planTypes.includes("single")) {
      setSingleSubType("") // Limpar subtipo ao remover single
      setPlanTypes((prev) => [...prev.filter((p) => p !== "single"), value])
    } else {
      setPlanTypes((prev) =>
        prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
      )
    }
    
    // Se remover "single", limpar o subtipo
    if (planTypes.includes(value) && value === "single") {
      setSingleSubType("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientGroup || !clientPhone || !seller || !supportPerson || planTypes.length === 0) return
    if (planTypes.includes("single") && !singleSubType) return

    setIsSubmitting(true)

    const dateStr = selectedDate.toISOString().split("T")[0]

    onSubmit({
      date: dateStr,
      time: selectedTime,
      clientName,
      clientGroup,
      clientPhone,
      clientLogins,
      seller,
      commercialObservation: commercialObservation || undefined,
      contractInfo: {
        planTypes,
        singleSubType: planTypes.includes("single") ? (singleSubType as SinglePlanSubType) : undefined,
      },
      supportPerson: supportPerson as "Clinton" | "Letícia",
      createdBy: "Comercial",
    })

    setIsSubmitting(false)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarPlus className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Nova Reserva</h3>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-secondary">
        <p className="text-sm text-muted-foreground">Data selecionada</p>
        <p className="font-semibold text-foreground capitalize">{formatDate(selectedDate)}</p>
        <p className="text-sm text-muted-foreground mt-1">Horário: <span className="font-medium text-foreground">{selectedTime}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome do Cliente
          </Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Digite o nome do cliente"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientGroup" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Grupo do Cliente
          </Label>
          <Input
            id="clientGroup"
            value={clientGroup}
            onChange={(e) => setClientGroup(e.target.value)}
            placeholder="Digite o grupo do cliente"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone
          </Label>
          <Input
            id="clientPhone"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientLogins" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Quantidade de Logins
          </Label>
          <Input
            id="clientLogins"
            type="number"
            min={1}
            value={clientLogins}
            onChange={(e) => setClientLogins(parseInt(e.target.value) || 1)}
            placeholder="Quantidade de logins necessários"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Vendedor(a)
          </Label>
          <Select value={seller} onValueChange={setSeller} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o vendedor" />
            </SelectTrigger>
            <SelectContent>
              {SELLERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informações do Cliente - Contratação do Sistema
          </Label>
          <p className="text-xs text-muted-foreground">Selecione um ou mais sistemas que o cliente vai testar (Single e Multi não podem ser selecionados juntos)</p>
          <div className="grid grid-cols-2 gap-3">
            {PLAN_TYPES.map((plan) => {
              const isDisabled = 
                (plan.value === "single" && planTypes.includes("multi")) ||
                (plan.value === "multi" && planTypes.includes("single"))
              
              return (
                <div key={plan.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={plan.value}
                    checked={planTypes.includes(plan.value)}
                    onCheckedChange={() => handlePlanTypeToggle(plan.value)}
                    disabled={isDisabled}
                  />
                  <label
                    htmlFor={plan.value}
                    className={`text-sm font-medium leading-none cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {plan.label}
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        {planTypes.includes("single") && (
          <div className="space-y-3 ml-4 border-l-2 border-primary/30 pl-4">
            <Label>Tipo do Plano Single</Label>
            <p className="text-xs text-muted-foreground">Selecione o tipo do plano</p>
            <Select value={singleSubType} onValueChange={(v) => setSingleSubType(v as SinglePlanSubType)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {SINGLE_SUB_TYPES.map((subType) => (
                  <SelectItem key={subType.value} value={subType.value}>
                    {subType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Observação do Comercial
          </Label>
          <Textarea
            value={commercialObservation}
            onChange={(e) => setCommercialObservation(e.target.value)}
            placeholder="Informações adicionais sobre o cliente para o suporte..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">Esta observação será visível para o suporte</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportPerson">Atendente do Suporte</Label>
          <Select value={supportPerson} onValueChange={setSupportPerson} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o atendente" />
            </SelectTrigger>
            <SelectContent>
              {availableSupportPersons.map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {availableSupportPersons.length === 1 && (
            <p className="text-xs text-amber-600">
              Apenas 1 vaga disponível neste horário
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !seller || !supportPerson || planTypes.length === 0 || (planTypes.includes("single") && !singleSubType)} 
            className="flex-1"
          >
            {isSubmitting ? "Reservando..." : "Confirmar Reserva"}
          </Button>
        </div>
      </form>
    </div>
  )
}
