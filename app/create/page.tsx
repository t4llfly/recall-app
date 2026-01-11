"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save } from "lucide-react";
import {toast} from "sonner";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Состояние для названия колоды
  const [title, setTitle] = useState("");

  // Состояние для списка карточек (сразу даем одну пустую)
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
    if (!title) return alert("Введите название модуля!");
    setLoading(true);

    try {
      // 1. Создаем колоду (Deck)
      const { data: deckData, error: deckError } = await supabase
        .from("decks")
        .insert({ title })
        .select() // Важно: возвращаем созданный объект, чтобы взять ID
        .single();

      if (deckError) throw deckError;

      // 2. Подготавливаем карточки (добавляем deck_id)
      const cardsToInsert = cards
        .filter((c) => c.front && c.back) // Игнорируем пустые
        .map((c) => ({
          deck_id: deckData.id,
          front: c.front,
          back: c.back,
        }));

      if (cardsToInsert.length === 0) {
        alert("Заполните хотя бы одну карточку");
        setLoading(false);
        return;
      }

      // 3. Заливаем карточки пачкой
      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      // Успех! Переходим на главную
      toast.success("Модуль создан!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Ошибка при сохранении :(");
    } finally {
      setLoading(false);
    }
  };

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
