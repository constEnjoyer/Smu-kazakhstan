import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // В браузерной консоли будет понятно, что не так.
  // Клиентский код не должен «падать», поэтому просто логируем.
  console.error(
    [
      "❌ Supabase не сконфигурирован для клиентской части.",
      "Проверьте переменные окружения:",
      "  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL",
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY",
    ].join("\n"),
  )
}

export function createClient() {
  return createBrowserClient(supabaseUrl ?? "", supabaseAnonKey ?? "")
}
