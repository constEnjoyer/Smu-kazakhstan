import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

/**
 * Берём URL и ключ Supabase из переменных окружения.
 * Приоритет: публичные → приватные. Это позволяет
 * использовать один и тот же код на сервере и клиенте.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Логируем понятное сообщение – попадёт в консоль (локально)
  // или в логи Vercel (production).
  // Выбрасываем ошибку, чтобы сразу было видно причину.
  throw new Error(
    [
      "❌ Supabase не сконфигурирован.",
      "Проверьте переменные окружения:",
      "  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL",
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY",
    ].join("\n"),
  )
}

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          /* ignore – вызывается из Server Component */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {
          /* ignore */
        }
      },
    },
  })
}
