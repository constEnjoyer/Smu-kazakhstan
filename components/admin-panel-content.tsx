"use client" // ЭТОТ ФАЙЛ ДОЛЖЕН БЫТЬ КЛИЕНТСКИМ КОМПОНЕНТОМ

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Eye, Building2, FileText, Plus, LogOut, Trash2 } from "lucide-react" // Добавил Trash2
import { useToast } from "@/hooks/use-toast"
import { CreateNewsModal } from "@/components/create-news-modal"
import { useRouter } from "next/navigation"

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

export default function AdminPanelContent() {
  const { toast } = useToast()
  const router = useRouter()
  const [smuList, setSmuList] = useState<SMU[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [smuResponse, newsResponse] = await Promise.all([fetch("/api/smu?includeAll=true"), fetch("/api/news")])

      if (smuResponse.ok) {
        const smuData = await smuResponse.json()
        setSmuList(smuData)
      } else {
        console.error("Failed to fetch SMU data:", smuResponse.status, smuResponse.statusText)
        toast({
          title: "Ошибка загрузки СМУ",
          description: "Не удалось загрузить данные СМУ.",
          variant: "destructive",
        })
      }

      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        setNews(newsData)
      } else {
        console.error("Failed to fetch news data:", newsResponse.status, newsResponse.statusText)
        toast({
          title: "Ошибка загрузки новостей",
          description: "Не удалось загрузить данные новостей.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error)
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные для админ-панели.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSMUStatusChange = async (smuId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/smu/${smuId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setSmuList((prev) => prev.map((smu) => (smu.id === smuId ? { ...smu, status } : smu)))
        toast({
          title: "Статус обновлен",
          description: `СМУ ${status === "approved" ? "одобрен" : "отклонен"}`,
        })
      } else {
        throw new Error("Failed to update SMU status")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSMU = async (smuId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот СМУ? Это действие необратимо.")) {
      return
    }
    try {
      const response = await fetch(`/api/smu/${smuId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSmuList((prev) => prev.filter((smu) => smu.id !== smuId))
        toast({
          title: "СМУ удален",
          description: "СМУ успешно удален из системы.",
        })
      } else {
        throw new Error("Failed to delete SMU")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить СМУ",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) {
      return
    }
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNews((prev) => prev.filter((item) => item.id !== newsId))
        toast({
          title: "Новость удалена",
          description: "Новость успешно удалена",
        })
      } else {
        throw new Error("Failed to delete news")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить новость",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        router.push("/login")
      } else {
        throw new Error("Failed to logout")
      }
    } catch (error) {
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы.",
        variant: "destructive",
      })
    }
  }

  const pendingSMUs = smuList.filter((smu) => smu.status === "pending")
  const approvedSMUs = smuList.filter((smu) => smu.status === "approved")
  const rejectedSMUs = smuList.filter((smu) => smu.status === "rejected")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка панели администратора...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
              <p className="text-gray-600">Управление СМУ и новостями</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreateNewsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Добавить новость
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">На модерации</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingSMUs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedSMUs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Отклонено</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedSMUs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Новостей</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{news.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">На модерации ({pendingSMUs.length})</TabsTrigger>
            <TabsTrigger value="approved">Одобренные ({approvedSMUs.length})</TabsTrigger>
            <TabsTrigger value="rejected">Отклоненные ({rejectedSMUs.length})</TabsTrigger>
            <TabsTrigger value="news">Новости ({news.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>СМУ на модерации</CardTitle>
                <CardDescription>Заявки, ожидающие рассмотрения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingSMUs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Нет заявок на модерации</p>
                  ) : (
                    pendingSMUs.map((smu) => (
                      <div key={smu.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{smu.name}</h3>
                            <p className="text-sm text-gray-600">{smu.university_or_institute}</p>
                            <p className="text-sm text-gray-500">
                              {smu.city}, {smu.region}
                            </p>
                          </div>
                          <Badge variant="outline">Ожидает</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p>
                              <strong>Председатель:</strong> {smu.chairman}
                            </p>
                            <p>
                              <strong>Email:</strong> {smu.contact_email}
                            </p>
                            <p>
                              <strong>Телефон:</strong> {smu.contact_phone}
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>Участников:</strong> {smu.members_count} чел.
                            </p>
                            <p>
                              <strong>Адрес:</strong> {smu.address}
                            </p>
                            <p>
                              <strong>Подано:</strong> {formatDate(smu.created_at)}
                            </p>
                          </div>
                        </div>

                        {smu.description && (
                          <div className="mb-4">
                            <p className="text-sm">
                              <strong>Описание:</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{smu.description}</p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleSMUStatusChange(smu.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Одобрить
                          </Button>
                          <Button
                            onClick={() => handleSMUStatusChange(smu.id, "rejected")}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Отклонить
                          </Button>
                          <Button
                            onClick={() => handleDeleteSMU(smu.id)} // Добавлена кнопка удаления
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Одобренные СМУ</CardTitle>
                <CardDescription>СМУ, отображающиеся на карте</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedSMUs.map((smu) => (
                    <div key={smu.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{smu.name}</h3>
                          <p className="text-sm text-gray-600">{smu.university_or_institute}</p>
                          <p className="text-sm text-gray-500">
                            {smu.city}, {smu.region} • {smu.members_count} участников
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Одобрено</Badge>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => handleDeleteSMU(smu.id)} // Добавлена кнопка удаления
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Отклоненные СМУ</CardTitle>
                <CardDescription>СМУ, которые были отклонены</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectedSMUs.map((smu) => (
                    <div key={smu.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{smu.name}</h3>
                          <p className="text-sm text-gray-600">{smu.university_or_institute}</p>
                          <p className="text-sm text-gray-500">
                            {smu.city}, {smu.region}
                          </p>
                        </div>
                        <Badge variant="destructive">Отклонено</Badge>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => handleDeleteSMU(smu.id)} // Добавлена кнопка удаления
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card>
              <CardHeader>
                <CardTitle>Управление новостями</CardTitle>
                <CardDescription>Все опубликованные новости</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Нет опубликованных новостей</p>
                  ) : (
                    news.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <span>Автор: {item.author}</span>
                            <span className="ml-4">{formatDate(item.created_at)}</span>
                          </div>
                          <Button onClick={() => handleDeleteNews(item.id)} variant="destructive" size="sm">
                            <X className="w-4 h-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <CreateNewsModal
        isOpen={isCreateNewsModalOpen}
        onClose={() => setIsCreateNewsModalOpen(false)}
        onSuccess={() => {
          fetchData() // Перезагружаем данные после создания новости
          setIsCreateNewsModalOpen(false)
        }}
      />
    </div>
  )
}
