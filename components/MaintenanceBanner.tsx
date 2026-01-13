'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, X } from "lucide-react"

export function MaintenanceBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [message, setMessage] = useState('')
    const [isClosed, setIsClosed] = useState(false) // Возможность временно закрыть (крестик)

    useEffect(() => {
        const fetchStatus = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'maintenance')
                .single()

            if (data?.value) {
                setIsVisible(data.value.enabled)
                setMessage(data.value.message || "Технические работы")
            }
        }

        fetchStatus()

        const channel = supabase
            .channel('maintenance-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'app_settings',
                    filter: 'key=eq.maintenance'
                },
                (payload) => {
                    const newValue = payload.new.value as any
                    setIsVisible(newValue.enabled)
                    setMessage(newValue.message)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (!isVisible || isClosed) return null

    return (
        <div className="fixed w-full bottom-0 bg-yellow-400 text-yellow-900 px-4 py-3 shadow-md z-50">
            <div className="mx-auto flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="font-medium text-sm md:text-base">
                    {message}
                </p>
                <button
                    onClick={() => setIsClosed(true)}
                    className="p-1 hover:bg-yellow-500 rounded transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}