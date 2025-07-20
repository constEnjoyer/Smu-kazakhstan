"use client"

import type React from "react"

import { useState } from "react"
// import { useRouter } from "next/navigation" // Удаляем useRouter, так как используем window.location
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  // const router = useRouter() // Удаляем инициализацию useRouter

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const emailToAuth = `${login}@example.com`

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToAuth, password }),
      })

      if (response.ok) {
        toast({
          title: "Успешный вход!",
          description: "Вы успешно вошли в админ-панель.",
        })
        console.log("Login successful, attempting full page reload to /admin") // Лог перед перезагрузкой
        // Используем window.location.href для принудительной полной перезагрузки страницы
        window.location.href = "/admin"
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Неверный логин или пароль.")
      }
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message || "Произошла ошибка. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Вход в админ-панель</CardTitle>
          <CardDescription>Используйте свои учетные данные для доступа к управлению сайтом.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="admin"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Вход...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
