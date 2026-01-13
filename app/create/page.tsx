"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {Trash2, Plus, Save, Globe, Lock} from "lucide-react";
import {toast} from "sonner";
import {Switch} from "@/components/ui/switch";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [cards, setCards] = useState([{ front: "", back: "" }]);

  // Добавить пустую строку
  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  // Удалить строку по индексу
  const removeCard = (index: number) => {
    if (cards.length === 1) return; // Не даем удалить последнюю
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };

  // Обновить текст в карточке
  const updateCard = (
    index: number,
    field: "front" | "back",
    value: string,
  ) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  // Сохранение в базу
  const handleSave = async () => {
    if (!title) return toast.error("Введите название модуля!");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Нужно войти в систему!')
        setLoading(false)
        return
      }

      const { data: deckData, error: deckError } = await supabase
          .from('decks')
          .insert({
            title,
            is_public: isPublic,
            user_id: session.user.id
          })
          .select()
          .single()

      if (deckError) throw deckError

      const cardsToInsert = cards
          .filter(c => c.front && c.back)
          .map(c => ({
            deck_id: deckData.id,
            front: c.front,
            back: c.back
          }))

      if (cardsToInsert.length > 0) {
        const { error: cardsError } = await supabase.from('cards').insert(cardsToInsert)
        if (cardsError) throw cardsError
      }

      router.push('/')

    } catch (error: any) {
      console.error(error)
      toast.error('Ошибка: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mt-15 mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-3xl font-bold">Новый модуль</h1>
          <Button
            className="rounded-full"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Save className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Сохранить
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-2">
            <Label htmlFor="title" className="sm:text-lg">
              Название
            </Label>
            <Input
              id="title"
              className="mt-2 sm:text-lg"
              placeholder="Введите название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="flex items-center space-x-4 border p-4 rounded-lg bg-slate-50/50">
              {isPublic ? <Globe className="h-6 w-6 text-blue-500" /> : <Lock className="h-6 w-6 text-orange-500" />}
              <div className="flex-1">
                <Label htmlFor="public-mode" className="text-base font-medium cursor-pointer">
                  {isPublic ? "Публичный доступ" : "Приватный доступ"}
                </Label>
                <p className="text-sm text-slate-500">
                  {isPublic
                      ? "Колоду видят все студенты."
                      : "Колоду видишь только ты (и админы)."
                  }
                </p>
              </div>
              <Switch
                  id="public-mode"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {cards.map((card, index) => (
            <Card key={index} className="relative group">
              <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                <div className="absolute top-4 left-4 text-md select-none text-slate-400 font-bold">
                  {index + 1}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  onClick={() => removeCard(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="space-y-2">
                  <Input
                    placeholder="Термин"
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Определение"
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full py-8 text-lg border-dashed border-2"
          onClick={addCard}
        >
          <Plus className="mr-2 h-5 w-5" />
          Добавить карточку
        </Button>
      </div>
    </main>
  );
}
