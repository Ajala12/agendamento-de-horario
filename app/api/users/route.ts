import { NextResponse } from "next/server"
import { getAllUsers, createUser, usernameExists } from "@/lib/users-repository"
import type { UserRole } from "@/lib/types"

/**
 * GET /api/users
 * Lista todos os usuários
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as UserRole | null

    let users = await getAllUsers()

    if (role) {
      users = users.filter((u) => u.role === role)
    }

    // Remove senhas antes de retornar
    const sanitizedUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
    })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuários" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Cria um novo usuário
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validação
    if (!body.username || !body.password || !body.role || !body.name) {
      return NextResponse.json(
        { success: false, error: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Validar role
    if (!["comercial", "suporte", "admin"].includes(body.role)) {
      return NextResponse.json(
        { success: false, error: "Tipo de usuário inválido" },
        { status: 400 }
      )
    }

    // Verificar username único
    if (await usernameExists(body.username)) {
      return NextResponse.json(
        { success: false, error: "Nome de usuário já existe" },
        { status: 400 }
      )
    }

    const newUser = await createUser({
      username: body.username.toLowerCase().trim(),
      password: body.password,
      role: body.role,
      name: body.name.trim(),
    })

    // Remove senha antes de retornar
    const { password, ...sanitizedUser } = newUser

    return NextResponse.json({
      success: true,
      data: sanitizedUser,
    })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}
