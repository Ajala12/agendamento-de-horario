"use client"

import { Clock, User } from "lucide-react"
import type { TimeSlot } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
  mode: "booking" | "viewing"
}

export function TimeSlots({ slots, selectedTime, onSelectTime, mode }: TimeSlotsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Horários Disponíveis</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => mode === "booking" && slot.available && onSelectTime(slot.time)}
            disabled={mode === "booking" && !slot.available}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              mode === "booking" && slot.available && "hover:border-primary hover:bg-accent cursor-pointer",
              mode === "booking" && !slot.available && "opacity-50 cursor-not-allowed bg-muted",
              selectedTime === slot.time && "border-primary bg-primary/10",
              mode === "viewing" && "cursor-default"
            )}
          >
            <span className={cn(
              "text-sm font-semibold",
              selectedTime === slot.time ? "text-primary" : "text-foreground"
            )}>
              {slot.displayTime}
            </span>
            <span className={cn(
              "text-xs mt-1",
              slot.available ? "text-emerald-600" : "text-muted-foreground"
            )}>
              {slot.availableSlots === 0
                ? "Lotado"
                : `${slot.availableSlots} vaga${slot.availableSlots > 1 ? "s" : ""}`}
            </span>
            {slot.appointments.length > 0 && mode === "viewing" && (
              <div className="mt-2 w-full space-y-1">
                {slot.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary rounded px-2 py-1"
                  >
                    <User className="h-3 w-3" />
                    <span className="truncate">{apt.supportPerson}</span>
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
