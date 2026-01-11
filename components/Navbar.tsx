"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, User, Plus } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (data?.role === "admin") {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    // 1. Проверяем текущую сессию при загрузке
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
    };

    getUser();

    // 2. Подписываемся на изменения (вход/выход), чтобы шапка обновлялась сама
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="fixed pointer-events-none z-10 w-screen">
      <div className="flex items-center p-2 justify-between mx-auto">
        <Link
          href="/"
          className="pointer-events-auto flex items-center font-bold text-sm"
        >
          <Button className="cursor-pointer rounded-full" variant="outline">
            Главная
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <Link href="/create">
              <Button
                className="pointer-events-auto cursor-pointer rounded-full"
                variant="default"
              >
                <Plus className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Создать</span>
              </Button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="bg-background pointer-events-auto border border-border py-2 px-4 rounded-full text-sm hidden sm:inline-block">
                {user.email}
              </span>
              <Button
                className="cursor-pointer pointer-events-auto h-full py-2.5 rounded-full"
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                className="cursor-pointer pointer-events-auto h-full py-2 rounded-full"
                variant="outline"
              >
                <User className="h-4 w-4" /> Войти
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
