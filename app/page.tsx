"use client"

import { useState } from "react"
import { Briefcase, Headphones, BarChart3, LogOut, Shield, Users } from "lucide-react"
import { CommercialView } from "@/components/commercial-view"
import { SupportView } from "@/components/support-view"
import { ReportsView } from "@/components/reports-view"
import { AdminUsersView } from "@/components/admin-users-view"
import { LoginPage } from "@/components/login-page"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ViewMode = "comercial" | "suporte" | "reports" | "users"

function Dashboard() {
  const { user, logout, isLoading } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("comercial")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  const isComercial = user.role === "comercial"
  const isSuporte = user.role === "suporte"
  const isAdmin = user.role === "admin"

  // Define a view inicial baseado no role
  const getInitialView = () => {
    if (isComercial) return "comercial"
    if (isSuporte) return "suporte"
    return "comercial" // Admin pode ver tudo, começa no comercial
  }

  // Atualiza viewMode se necessário quando o usuário mudar
  if (!isAdmin) {
    if (isComercial && viewMode !== "comercial" && viewMode !== "reports") {
      setViewMode("comercial")
    }
    if (isSuporte && viewMode !== "suporte" && viewMode !== "reports") {
      setViewMode("suporte")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Sistema de Agendamento
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    isComercial ? "bg-blue-500/10 text-blue-600" : 
                    isSuporte ? "bg-green-500/10 text-green-600" : 
                    "bg-purple-500/10 text-purple-600"
                  )}>
                    {isComercial ? <Briefcase className="h-3 w-3" /> : 
                     isSuporte ? <Headphones className="h-3 w-3" /> :
                     <Shield className="h-3 w-3" />}
                    {isComercial ? "Comercial" : isSuporte ? "Suporte" : "Administrador"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Olá, {user.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <nav className="flex rounded-lg border border-border bg-secondary p-1 overflow-x-auto">
                {/* Comercial - visível para comercial e admin */}
                {(isComercial || isAdmin) && (
                  <button
                    onClick={() => setViewMode("comercial")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                      viewMode === "comercial"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Comercial</span>
                  </button>
                )}

                {/* Suporte - visível para suporte e admin */}
                {(isSuporte || isAdmin) && (
                  <button
                    onClick={() => setViewMode("suporte")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                      viewMode === "suporte"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Headphones className="h-4 w-4" />
                    <span>Suporte</span>
                  </button>
                )}

                {/* Relatórios - visível para todos */}
                <button
                  onClick={() => setViewMode("reports")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                    viewMode === "reports"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Relatórios</span>
                </button>

                {/* Usuários - visível apenas para admin */}
                {isAdmin && (
                  <button
                    onClick={() => setViewMode("users")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                      viewMode === "users"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span>Usuários</span>
                  </button>
                )}
              </nav>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === "comercial" && <CommercialView />}
        {viewMode === "suporte" && <SupportView />}
        {viewMode === "reports" && <ReportsView />}
        {viewMode === "users" && isAdmin && <AdminUsersView />}
      </div>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Logado como <strong>{user.name}</strong> ({user.role === "comercial" ? "Comercial" : user.role === "suporte" ? "Suporte" : "Administrador"})
          </p>
        </div>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}
