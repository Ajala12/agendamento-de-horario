import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/users-repository"

/**
 * POST /api/auth/login
 * Autentica um usuário
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.username || !body.password) {
      return NextResponse.json(
        { success: false, error: "Usuário e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const user = await authenticateUser(body.username, body.password)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário ou senha incorretos" },
        { status: 401 }
      )
    }

    // Remove senha antes de retornar
    const { password, ...sanitizedUser } = user

    return NextResponse.json({
      success: true,
      data: {
        id: sanitizedUser.id,
        username: sanitizedUser.username,
        role: sanitizedUser.role,
        name: sanitizedUser.name,
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao fazer login" },
      { status: 500 }
    )
  }
}
