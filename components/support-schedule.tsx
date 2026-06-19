"use client"

import { useState, useEffect } from "react"
import { Clock, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALL_TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
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
  "18:00",
]

const STORAGE_KEY = "support_available_slots"

export function useSupportSchedule() {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setAvailableSlots(JSON.parse(stored))
    } else {
      // Horários padrão
      const defaultSlots = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
      ]
      setAvailableSlots(defaultSlots)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSlots))
    }
    setIsLoaded(true)
  }, [])

  const updateAvailableSlots = (slots: string[]) => {
    setAvailableSlots(slots)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
  }

  return { availableSlots, updateAvailableSlots, isLoaded }
}

interface SupportScheduleProps {
  onClose?: () => void
}

export function SupportSchedule({ onClose }: SupportScheduleProps) {
  const { availableSlots, updateAvailableSlots, isLoaded } = useSupportSchedule()
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setSelectedSlots(availableSlots)
    }
  }, [availableSlots, isLoaded])

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot].sort()
    )
    setSaved(false)
  }

  const selectAll = () => {
    setSelectedSlots([...ALL_TIME_SLOTS])
    setSaved(false)
  }

  const clearAll = () => {
    setSelectedSlots([])
    setSaved(false)
  }

  const handleSave = () => {
    updateAvailableSlots(selectedSlots)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Configurar Horários de Atendimento</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Selecione os horários em que o suporte estará disponível para atendimento:
      </p>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Selecionar Todos
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Limpar Todos
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 mb-4">
        {ALL_TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() => toggleSlot(slot)}
            className={cn(
              "flex items-center justify-center gap-1 p-2 rounded-lg border text-sm font-medium transition-all",
              selectedSlots.includes(slot)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            <Clock className="h-3 w-3" />
            {slot}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {selectedSlots.length} horários selecionados
        </span>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Salvo!" : "Salvar Configuração"}
        </Button>
      </div>
    </div>
  )
}
