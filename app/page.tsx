"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Building2, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import { RegisterSMUModal } from "@/components/register-smu-modal"
import { NewsSection } from "@/components/news-section"
import Link from "next/link"

// Динамический импорт карты для избежания SSR проблем
const InteractiveMap = dynamic(() => import("@/components/interactive-map"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Загрузка карты...</div>,
})

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
}

export default function HomePage() {
  const [smuList, setSmuList] = useState<SMU[]>([])
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Статистика
  const approvedSMUs = smuList.filter((smu) => smu.status === "approved")
  const totalSMUs = approvedSMUs.length
  const totalScientists = approvedSMUs.reduce((sum, smu) => sum + smu.members_count, 0)

  useEffect(() => {
    fetchSMUs()
  }, [])

  const fetchSMUs = async () => {
    try {
      const response = await fetch("/api/smu")
      if (response.ok) {
        const data = await response.json()
        setSmuList(data)
      }
    } catch (error) {
      console.error("Ошибка загрузки СМУ:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSMURegistered = () => {
    fetchSMUs()
    setIsRegisterModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">СМУ Казахстан</h1>
                <p className="text-sm text-gray-600">Советы молодых ученых</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" passHref>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  Админ-панель
                </Button>
              </Link>
              <Button onClick={() => setIsRegisterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Зарегистрировать СМУ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего СМУ</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSMUs}</div>
              <p className="text-xs text-muted-foreground">Зарегистрированных советов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Молодых ученых</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalScientists}</div>
              <p className="text-xs text-muted-foreground">Участников СМУ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Области</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(approvedSMUs.map((smu) => smu.region)).size}
              </div>
              <p className="text-xs text-muted-foreground">Охваченных областей</p>
            </CardContent>
          </Card>
        </div>

        {/* Интерактивная карта */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Интерактивная карта СМУ Казахстана</span>
            </CardTitle>
            <CardDescription>Нажмите на маркер для просмотра подробной информации о СМУ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <InteractiveMap smuList={approvedSMUs} />
            </div>
          </CardContent>
        </Card>

        {/* Список СМУ и новости */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Список СМУ */}
          <Card>
            <CardHeader>
              <CardTitle>Зарегистрированные СМУ</CardTitle>
              <CardDescription>Список всех подтвержденных Советов молодых ученых</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Загрузка...</div>
                ) : approvedSMUs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Пока нет зарегистрированных СМУ</div>
                ) : (
                  approvedSMUs.map((smu) => (
                    <div key={smu.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{smu.name}</h3>
                        <Badge variant="secondary">{smu.region}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{smu.university_or_institute}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {smu.city}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {smu.members_count} чел.
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Председатель: {smu.chairman}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Новости */}
          <NewsSection />
        </div>
      </main>

      {/* Модальное окно регистрации */}
      <RegisterSMUModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleSMURegistered}
      />
    </div>
  )
}
