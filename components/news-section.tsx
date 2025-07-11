"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react" // Убрал ExternalLink

interface NewsItem {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  category: string
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news")
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      }
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новости и события</CardTitle>
        <CardDescription>Последние новости из мира молодых ученых Казахстана</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Загрузка новостей...</div>
          ) : news.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Пока нет новостей</p>
              <div className="space-y-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Добро пожаловать!</h3>
                  <p className="text-sm text-gray-600">
                    Это платформа для регистрации и координации Советов молодых ученых Казахстана. Зарегистрируйте свой
                    СМУ и станьте частью научного сообщества страны.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-blue-800">Как зарегистрироваться?</h3>
                  <p className="text-sm text-blue-700">
                    Нажмите кнопку "Зарегистрировать СМУ" в верхней части страницы и заполните форму. После модерации
                    ваш СМУ появится на карте.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            news.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(item.created_at)}
                    </span>
                    <span>Автор: {item.author}</span>
                  </div>
                  {/* Убрана кнопка "Читать" */}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
