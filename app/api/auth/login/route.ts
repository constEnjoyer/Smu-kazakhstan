import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithPassword({
    // Добавил data для логирования
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message) // Логируем ошибку
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.log("Login successful, session data:", data.session?.user?.email) // Логируем email пользователя
  return NextResponse.json({ message: "Login successful" }, { status: 200 })
}
