'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, ShieldAlert } from "lucide-react"
import {Spinner} from "@/components/ui/spinner";

export default function AdminPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Состояние настроек
    const [enabled, setEnabled] = useState(false)
    const [message, setMessage] = useState('')

    // 1. Проверяем права и грузим данные
    useEffect(() => {
        async function init() {
            // Проверка админа
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (profile?.role !== 'admin') {
                alert('Доступ запрещен')
                router.push('/')
                return
            }

            // Загрузка текущих настроек
            const { data: settings } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'maintenance')
                .single()

            if (settings?.value) {
                setEnabled(settings.value.enabled)
                setMessage(settings.value.message)
            }
            setLoading(false)
        }

        init()
    }, [router])

    // 2. Сохранение
    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase
            .from('app_settings')
            .update({
                value: {
                    enabled,
                    message
                }
            })
            .eq('key', 'maintenance')

        setSaving(false)
        if (error) alert('Ошибка!')
        else alert('Настройки обновлены!')
    }

    if (loading) return <Spinner className="mx-auto size-8 items-center justify-center h-screen" />

    return (
        <main className="min-h-screen p-4 md:p-8 bg-background">
            <div className="max-w-6xl mx-auto mt-15 space-y-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-red-600" />
                    Панель Администратора
                </h1>

                <Card className="w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Режим технического обслуживания</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-accent">
                            <Label htmlFor="airplane-mode" className="flex flex-col items-start">
                                <span className="text-lg font-bold">Показать баннер</span>
                                <span className="font-normal text-sm text-slate-500">
                                    Все пользователи увидят предупреждение вверху экрана.
                                </span>
                            </Label>
                            <Switch
                                id="airplane-mode"
                                checked={enabled}
                                onCheckedChange={setEnabled}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Текст сообщения</Label>
                            <Textarea
                                placeholder="Например: Мы обновляем базу данных..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Сохранение...' : 'Сохранить настройки'}
                            <Save className="ml-2 h-4 w-4" />
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </main>
    )
}