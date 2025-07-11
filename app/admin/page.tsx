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

  // Если сессии нет, перенаправляем на страницу входа
  if (!session) {
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
