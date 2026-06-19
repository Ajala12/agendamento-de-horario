"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, User, Users, Headphones, Shield, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SystemUser {
  id: string
  username: string
  role: UserRole
  name: string
  active: boolean
  createdAt: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  comercial: "Comercial",
  suporte: "Suporte",
  admin: "Administrador",
}

const ROLE_COLORS: Record<UserRole, string> = {
  comercial: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  suporte: "bg-green-500/10 text-green-600 border-green-500/30",
  admin: "bg-purple-500/10 text-purple-600 border-purple-500/30",
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  comercial: <Users className="h-4 w-4" />,
  suporte: <Headphones className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4" />,
}

export function AdminUsersView() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  
  // Form state
  const [formName, setFormName] = useState("")
  const [formUsername, setFormUsername] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState<UserRole>("comercial")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormName("")
    setFormUsername("")
    setFormPassword("")
    setFormRole("comercial")
    setFormError("")
    setShowPassword(false)
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: SystemUser) => {
    setEditingUser(user)
    setFormName(user.name)
    setFormUsername(user.username)
    setFormPassword("")
    setFormRole(user.role)
    setFormError("")
    setShowPassword(false)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formUsername.trim()) {
      setFormError("Nome e usuário são obrigatórios")
      return
    }

    if (!editingUser && !formPassword) {
      setFormError("Senha é obrigatória para novos usuários")
      return
    }

    setIsSubmitting(true)
    setFormError("")

    try {
      if (editingUser) {
        // Atualizar usuário
        const updateData: Record<string, unknown> = {
          name: formName.trim(),
          role: formRole,
        }
        if (formPassword) {
          updateData.password = formPassword
        }

        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        const data = await response.json()
        if (!data.success) {
          setFormError(data.error || "Erro ao atualizar usuário")
          return
        }
      } else {
        // Criar usuário
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            username: formUsername.trim().toLowerCase(),
            password: formPassword,
            role: formRole,
          }),
        })

        const data = await response.json()
        if (!data.success) {
          setFormError(data.error || "Erro ao criar usuário")
          return
        }
      }

      setIsDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      setFormError("Erro de conexão")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleToggleActive = async (user: SystemUser) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const comercialUsers = users.filter((u) => u.role === "comercial")
  const suporteUsers = users.filter((u) => u.role === "suporte")
  const adminUsers = users.filter((u) => u.role === "admin")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">Crie e gerencie usuários do sistema</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{comercialUsers.length}</p>
                <p className="text-sm text-muted-foreground">Comercial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Headphones className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{suporteUsers.length}</p>
                <p className="text-sm text-muted-foreground">Suporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de usuários por categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comercial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Comercial
            </CardTitle>
            <CardDescription>{comercialUsers.length} usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {comercialUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => openEditDialog(user)}
                onDelete={() => setDeleteConfirm(user.id)}
                onToggleActive={() => handleToggleActive(user)}
                deleteConfirm={deleteConfirm}
                onCancelDelete={() => setDeleteConfirm(null)}
                onConfirmDelete={() => handleDelete(user.id)}
              />
            ))}
            {comercialUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum usuário comercial
              </p>
            )}
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-green-600" />
              Suporte
            </CardTitle>
            <CardDescription>{suporteUsers.length} usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {suporteUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => openEditDialog(user)}
                onDelete={() => setDeleteConfirm(user.id)}
                onToggleActive={() => handleToggleActive(user)}
                deleteConfirm={deleteConfirm}
                onCancelDelete={() => setDeleteConfirm(null)}
                onConfirmDelete={() => handleDelete(user.id)}
              />
            ))}
            {suporteUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum usuário de suporte
              </p>
            )}
          </CardContent>
        </Card>

        {/* Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Administradores
            </CardTitle>
            <CardDescription>{adminUsers.length} usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {adminUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => openEditDialog(user)}
                onDelete={() => setDeleteConfirm(user.id)}
                onToggleActive={() => handleToggleActive(user)}
                deleteConfirm={deleteConfirm}
                onCancelDelete={() => setDeleteConfirm(null)}
                onConfirmDelete={() => handleDelete(user.id)}
                isProtected={user.username === "admin"}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Atualize as informações do usuário"
                : "Preencha os dados para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome do usuário"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário (login)</Label>
              <Input
                id="username"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="Nome de usuário para login"
                disabled={!!editingUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Senha {editingUser && "(deixe em branco para manter a atual)"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? "Nova senha" : "Senha"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Usuário</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="suporte">Suporte</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente de card de usuário
function UserCard({
  user,
  onEdit,
  onDelete,
  onToggleActive,
  deleteConfirm,
  onCancelDelete,
  onConfirmDelete,
  isProtected = false,
}: {
  user: SystemUser
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  deleteConfirm: string | null
  onCancelDelete: () => void
  onConfirmDelete: () => void
  isProtected?: boolean
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        user.active
          ? "border-border bg-card"
          : "border-border/50 bg-muted/50 opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-secondary">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {deleteConfirm === user.id ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onCancelDelete}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirmDelete}>
              Excluir
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            {!isProtected && (
              <>
                <Button variant="ghost" size="icon" onClick={onToggleActive} title={user.active ? "Desativar" : "Ativar"}>
                  {user.active ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
            {isProtected && (
              <span className="text-xs text-muted-foreground px-2">Protegido</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
