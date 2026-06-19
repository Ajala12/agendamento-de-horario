import { NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/lib/users-repository"

/**
 * GET /api/users/[id]
 * Busca um usuário específico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Remove senha antes de retornar
    const { password, ...sanitizedUser } = user

    return NextResponse.json({
      success: true,
      data: sanitizedUser,
    })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao buscar usuário" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/[id]
 * Atualiza um usuário
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Não permitir desativar o admin mestre
    if (user.username === "admin" && body.active === false) {
      return NextResponse.json(
        { success: false, error: "Não é possível desativar o administrador mestre" },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.password !== undefined) updateData.password = body.password
    if (body.role !== undefined) updateData.role = body.role
    if (body.active !== undefined) updateData.active = body.active

    const updatedUser = await updateUser(id, updateData)

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar usuário" },
        { status: 500 }
      )
    }

    // Remove senha antes de retornar
    const { password, ...sanitizedUser } = updatedUser

    return NextResponse.json({
      success: true,
      data: sanitizedUser,
    })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Remove um usuário
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Não permitir excluir o admin mestre
    if (user.username === "admin") {
      return NextResponse.json(
        { success: false, error: "Não é possível excluir o administrador mestre" },
        { status: 400 }
      )
    }

    const success = await deleteUser(id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Erro ao excluir usuário" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Usuário excluído com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json(
      { success: false, error: "Erro ao excluir usuário" },
      { status: 500 }
    )
  }
}
