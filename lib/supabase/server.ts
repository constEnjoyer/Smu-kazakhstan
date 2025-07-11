import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // ИСПОЛЬЗУЕМ NEXT_PUBLIC_SUPABASE_ANON_KEY ДЛЯ КЛИЕНТА, РАБОТАЮЩЕГО С СЕССИЯМИ
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method was called from a Server Component.
            // This can be ignored if you have middleware that will refresh the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // This can be ignored if you have middleware that will refresh the session.
          }
        },
      },
    },
  )
}
