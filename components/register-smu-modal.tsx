"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, X, CheckCircle } from "lucide-react"
import dynamic from "next/dynamic"

const InteractiveMap = dynamic(() => import("@/components/interactive-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">Загрузка карты...</div>,
})

interface RegisterSMUModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const kazakhstanRegionsWithCities = {
  "Алматинская область": [
    "Алматы",
    "Талдыкорган",
    "Капчагай",
    "Текели",
    "Сарканд",
    "Ушарал",
    "Есик",
    "Каскелен",
    "Талгар",
    "Жаркент",
    "Кербулак",
    "Панфилов",
  ],
  "Акмолинская область": [
    "Кокшетау",
    "Степногорск",
    "Щучинск",
    "Макинск",
    "Атбасар",
    "Есиль",
    "Державинск",
    "Сандыктау",
    "Балкашино",
    "Буландынск",
  ],
  "Актюбинская область": [
    "Актобе",
    "Алга",
    "Кандыагаш",
    "Хромтау",
    "Шалкар",
    "Темир",
    "Эмба",
    "Кобда",
    "Мартук",
    "Иргиз",
  ],
  "Атырауская область": [
    "Атырау",
    "Кульсары",
    "Индер",
    "Макат",
    "Доссор",
    "Ганюшкино",
    "Балыкши",
    "Сарайшык",
    "Махамбет",
  ],
  "Восточно-Казахстанская область": [
    "Усть-Каменогорск",
    "Семей",
    "Риддер",
    "Зыряновск",
    "Серебрянск",
    "Курчатов",
    "Шемонаиха",
    "Глубокое",
    "Аягоз",
    "Зайсан",
  ],
  "Жамбылская область": [
    "Тараз",
    "Каратау",
    "Жанатас",
    "Шу",
    "Сарысу",
    "Отрар",
    "Мерке",
    "Кордай",
    "Байконур",
    "Жуалы",
  ],
  "Западно-Казахстанская область": [
    "Уральск",
    "Аксай",
    "Казталовка",
    "Чингирлау",
    "Бурлин",
    "Жангала",
    "Сайхин",
    "Теректы",
    "Жанибек",
  ],
  "Карагандинская область": [
    "Караганда",
    "Темиртау",
    "Жезказган",
    "Балхаш",
    "Сатпаев",
    "Шахтинск",
    "Абай",
    "Каражал",
    "Приозерск",
    "Жанаарка",
  ],
  "Костанайская область": [
    "Костанай",
    "Рудный",
    "Лисаковск",
    "Житикара",
    "Аркалык",
    "Узункол",
    "Федоровка",
    "Тобол",
    "Алтынсарин",
  ],
  "Кызылординская область": [
    "Кызылорда",
    "Байконур",
    "Аральск",
    "Казалинск",
    "Жалагаш",
    "Шиели",
    "Жанакорган",
    "Форт-Шевченко",
    "Айтеке би",
  ],
  "Мангистауская область": [
    "Актау",
    "Жанаозен",
    "Форт-Шевченко",
    "Бейнеу",
    "Жетыбай",
    "Каламкас",
    "Сенек",
    "Тупкараган",
    "Каракия",
  ],
  "Павлодарская область": [
    "Павлодар",
    "Экибастуз",
    "Аксу",
    "Калтан",
    "Железинск",
    "Щербакты",
    "Майкаин",
    "Лебяжье",
    "Качиры",
  ],
  "Северо-Казахстанская область": [
    "Петропавловск",
    "Булаево",
    "Мамлютка",
    "Сергеевка",
    "Тайынша",
    "Явленка",
    "Пресновка",
    "Кызылжар",
    "Жамбыл",
  ],
  "Туркестанская область": [
    "Туркестан",
    "Шымкент",
    "Кентау",
    "Арысь",
    "Ленгер",
    "Сарыагаш",
    "Жетысай",
    "Макташ",
    "Бадам",
    "Отрар",
  ],
  "г. Алматы": ["Алматы"],
  "г. Нур-Султан": ["Нур-Султан", "Астана"],
  "г. Шымкент": ["Шымкент"],
}

export function RegisterSMUModal({ isOpen, onClose, onSuccess }: RegisterSMUModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showCoordinateMap, setShowCoordinateMap] = useState(false)
  const [coordinatesSelected, setCoordinatesSelected] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    region: "",
    chairman: "",
    contact_email: "",
    contact_phone: "",
    university_or_institute: "",
    members_count: "",
    description: "",
    latitude: "",
    longitude: "",
  })

  const availableCities = formData.region
    ? kazakhstanRegionsWithCities[formData.region as keyof typeof kazakhstanRegionsWithCities] || []
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/smu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          members_count: Number.parseInt(formData.members_count) || 0,
          latitude: Number.parseFloat(formData.latitude) || 0,
          longitude: Number.parseFloat(formData.longitude) || 0,
        }),
      })

      if (response.ok) {
        toast({
          title: "Заявка отправлена!",
          description: "Ваша заявка на регистрацию СМУ отправлена на модерацию.",
        })
        setFormData({
          name: "",
          address: "",
          city: "",
          region: "",
          chairman: "",
          contact_email: "",
          contact_phone: "",
          university_or_institute: "",
          members_count: "",
          description: "",
          latitude: "",
          longitude: "",
        })
        setCoordinatesSelected(false)
        onSuccess()
      } else {
        throw new Error("Ошибка при отправке заявки")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке заявки. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      // Сбрасываем город при изменении области
      if (field === "region") {
        newData.city = ""
      }
      return newData
    })
  }

  const handleCoordinateSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }))
    setCoordinatesSelected(true)
    toast({
      title: "✅ Координаты выбраны!",
      description: `Широта: ${lat.toFixed(6)}, Долгота: ${lng.toFixed(6)}`,
    })
  }

  const handleCloseCoordinateMap = () => {
    setShowCoordinateMap(false)
    if (coordinatesSelected) {
      toast({
        title: "Координаты сохранены",
        description: "Вы можете продолжить заполнение формы",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <DialogTitle>Регистрация СМУ</DialogTitle>
          <DialogDescription>
            Заполните форму для регистрации Совета молодых ученых. Заявка будет рассмотрена администратором.
          </DialogDescription>
        </DialogHeader>

        {showCoordinateMap ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Выберите местоположение на карте</h3>
              <Button type="button" variant="outline" onClick={handleCloseCoordinateMap}>
                <X className="w-4 h-4 mr-2" />
                Закрыть карту
              </Button>
            </div>

            {coordinatesSelected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Координаты выбраны!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Широта: {formData.latitude}, Долгота: {formData.longitude}
                </p>
              </div>
            )}

            <div className="h-96 rounded-lg overflow-hidden border">
              <InteractiveMap
                smuList={[]}
                isCoordinateSelectionMode={true}
                onCoordinateSelect={handleCoordinateSelect}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Инструкция:</strong> Кликните по карте в том месте, где находится ваш СМУ. После клика появится
                красный маркер и уведомление о том, что координаты выбраны.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название СМУ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Совет молодых ученых..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="region">Область *</Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Выберите область</option>
                  {Object.keys(kazakhstanRegionsWithCities).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="city">Город *</Label>
                <select
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!formData.region}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">{formData.region ? "Выберите город" : "Сначала выберите область"}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="chairman">Председатель *</Label>
                <Input
                  id="chairman"
                  value={formData.chairman}
                  onChange={(e) => handleInputChange("chairman", e.target.value)}
                  placeholder="ФИО председателя"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_email">Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Телефон *</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  placeholder="+7 (xxx) xxx-xx-xx"
                  required
                />
              </div>

              <div>
                <Label htmlFor="members_count">Количество участников *</Label>
                <Input
                  id="members_count"
                  type="number"
                  value={formData.members_count}
                  onChange={(e) => handleInputChange("members_count", e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="university_or_institute">Университет/НИИ *</Label>
                <Input
                  id="university_or_institute"
                  value={formData.university_or_institute}
                  onChange={(e) => handleInputChange("university_or_institute", e.target.value)}
                  placeholder="Название организации"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Полный адрес организации"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание деятельности</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Краткое описание деятельности СМУ..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Координаты местоположения</Label>
                <Button
                  type="button"
                  variant={coordinatesSelected ? "default" : "outline"}
                  onClick={() => setShowCoordinateMap(true)}
                  className={coordinatesSelected ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {coordinatesSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Координаты выбраны
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Выбрать на карте
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Широта</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="43.2220"
                    className={coordinatesSelected ? "border-green-300 bg-green-50" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Долгота</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="76.8512"
                    className={coordinatesSelected ? "border-green-300 bg-green-50" : ""}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Координаты помогут точно отобразить ваш СМУ на карте. Используйте кнопку "Выбрать на карте" для
                удобства.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Отправка..." : "Отправить заявку"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
