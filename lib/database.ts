/**
 * Configuração do Banco de Dados
 *
 * Este projeto está configurado para usar Supabase (PostgreSQL).
 * Veja sql/schema.sql para o script de criação das tabelas e
 * .env.local.example para as variáveis de ambiente necessárias.
 */

export const DATABASE_TYPE = "supabase" as const

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}
