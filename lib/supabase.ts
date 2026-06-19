/**
 * Cliente Supabase
 *
 * Usa a service_role key porque os repositórios (lib/repository.ts e
 * lib/users-repository.ts) só são chamados a partir das rotas de API
 * (app/api/**), ou seja, sempre no servidor. Nunca importe este arquivo
 * em um componente "use client".
 *
 * Variáveis de ambiente necessárias (arquivo .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase não configuradas. " +
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local " +
      "(veja .env.local.example)."
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
