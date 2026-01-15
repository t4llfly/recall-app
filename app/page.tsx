"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen, Calendar, Heart, Lock, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { DeckInterface } from "@/lib/interface";

export default function Home() {
  const [decks, setDecks] = useState<DeckInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      const { data, error } = await supabase
        .from("decks")
        .select(
          `
            *, 
            cards(count), 
            deck_likes(count),
            profiles(email) 
        `,
        ) // <--- Магия: запрашиваем email из связанной таблицы profiles
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setDecks(data || []);

      setLoading(false);
    }

    fetchDecks();
  }, []);

  const formatAuthor = (email: string) => {
    if (!email) return "Неизвестный";
    return email.split("@")[0];
  };

  return (
    <main className="p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto h-max space-y-8">
        {loading ? (
          <Spinner className="mt-15 mx-auto size-8" />
        ) : (
          <div className="grid mt-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {decks.length === 0 && (
              <div className="col-span-full text-center text-slate-400">
                Сейчас здесь пусто. Скоро здесь появятся модули!
              </div>
            )}

            {decks.map((deck) => (
              <Link href={`/deck/${deck.id}`} key={deck.id}>
                <Card className="h-full hover:scale-102 hover:shadow-md transition-all cursor-pointer border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold truncate">
                      {deck.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="h-3 w-3" />
                      <span className="font-medium text-slate-700">
                        {formatAuthor(deck.profiles?.email)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardFooter className="pt-0 flex justify-between items-center text-slate-400 text-xs">
                    <span className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      {deck.cards?.[0]?.count || 0} шт.
                      <Calendar className="mx-2 h-4 w-4" />
                      {new Date(deck.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {!deck.is_public && (
                        <Lock className="h-4 w-4 text-orange-500 mr-1" />
                      )}
                      <Heart className="h-4 w-4" />
                      <span>{deck.deck_likes?.[0]?.count || 0}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <p className="mt-5 select-none text-center">
        made by{" "}
        <a
          suppressHydrationWarning
          href="https://tallfly.me"
          className="font-bold select-none cursor-pointer
            duration-200 hover:tracking-wider"
        >
          tallfly.
        </a>
      </p>
    </main>
  );
}
