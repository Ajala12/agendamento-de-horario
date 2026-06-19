/**
 * Repositório de Usuários - Acesso a dados via Supabase
 */

import { supabase } from "./supabase"
import type { SystemUser, UserRole } from "./types"

type UserRow = {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  active: boolean
  created_at: string
}

function rowToUser(row: UserRow): SystemUser {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    role: row.role,
    name: row.name,
    active: row.active,
    createdAt: row.created_at,
  }
}

// ============================================
// FUNÇÕES DO REPOSITÓRIO
// ============================================

export async function getAllUsers(): Promise<SystemUser[]> {
  const { data, error } = await supabase.from("users").select("*").order("name", { ascending: true })

  if (error) throw error
  return (data as UserRow[]).map(rowToUser)
}

export async function getUsersByRole(role: UserRole): Promise<SystemUser[]> {
  const { data, error } = await supabase.from("users").select("*").eq("role", role).eq("active", true)

  if (error) throw error
  return (data as UserRow[]).map(rowToUser)
}

export async function getUserByUsername(username: string): Promise<SystemUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle()

  if (error) throw error
  return data ? rowToUser(data as UserRow) : null
}

export async function getUserById(id: string): Promise<SystemUser | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle()

  if (error) throw error
  return data ? rowToUser(data as UserRow) : null
}

export async function authenticateUser(username: string, password: string): Promise<SystemUser | null> {
  // TODO: Em produção, use bcrypt para comparar senhas hasheadas
  const user = await getUserByUsername(username)
  if (!user || !user.active) return null
  if (user.password !== password) return null

  return user
}

export async function createUser(input: {
  username: string
  password: string
  role: UserRole
  name: string
}): Promise<SystemUser> {
  // TODO: Em produção, use bcrypt para hashear a senha antes de gravar
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username,
      password: input.password,
      role: input.role,
      name: input.name,
      active: true,
    })
    .select()
    .single()

  if (error) throw error
  return rowToUser(data as UserRow)
}

export async function updateUser(
  id: string,
  input: Partial<Pick<SystemUser, "name" | "password" | "role" | "active">>
): Promise<SystemUser | null> {
  const { data, error } = await supabase.from("users").update(input).eq("id", id).select().maybeSingle()

  if (error) throw error
  return data ? rowToUser(data as UserRow) : null
}

export async function deactivateUser(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("users").update({ active: false }, { count: "exact" }).eq("id", id)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("users").delete({ count: "exact" }).eq("id", id)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function usernameExists(username: string, excludeId?: string): Promise<boolean> {
  const user = await getUserByUsername(username)
  if (!user) return false
  if (excludeId && user.id === excludeId) return false
  return true
}

export async function getActiveSupportNames(): Promise<string[]> {
  const supportUsers = await getUsersByRole("suporte")
  return supportUsers.map((u) => u.name)
}
