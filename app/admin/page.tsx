// ЭТОТ ФАЙЛ ДОЛЖЕН БЫТЬ СЕРВЕРНЫМ КОМПОНЕНТОМ (без "use client")
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminPanelContent from "@/components/admin-panel-content" // Это Client Component

interface SMU {
  id: string
  name: string
  address: string
  city: string
  region: string
  chairman: string
  contact_email: string
  contact_phone: string
  university_or_institute: string
  members_count: number
  latitude: number
  longitude: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  description?: string
}

interface NewsItem {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  category: string
}

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

<<<<<<< HEAD
  console.log("AdminPage: Session status:", session ? "Active" : "Inactive") // Лог статуса сессии
  if (session) {
    console.log("AdminPage: User email:", session.user?.email) // Лог email пользователя, если сессия активна
  }

  // Если сессии нет, перенаправляем на страницу входа
  if (!session) {
    console.log("AdminPage: No session found, redirecting to /login") // Лог перенаправления
=======
  // Если сессии нет, перенаправляем на страницу входа
  if (!session) {
>>>>>>> a40e5298817193180d81ad739962ef13c7e97ad8
    redirect("/login")
  }

  // Если сессия есть, отображаем клиентский компонент админ-панели
  // Вся логика загрузки данных и управления состоянием находится в AdminPanelContent
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanelContent />
    </div>
  )
}
