"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import { ShareButton } from "@/components/ShareButton";
import { Spinner } from "@/components/ui/spinner";
import { CardInterface } from "@/lib/interface";

export default function DeckPage() {
  const params = useParams();
  const deckId = params.id;

  const [cards, setCards] = useState<CardInterface[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [deckTitle, setDeckTitle] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!deckId) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      setUserId(currentUserId);

      const { data: deck } = await supabase
        .from("decks")
        .select("title, deck_likes(count), profiles(email)")
        .eq("id", deckId)
        .single();

      if (deck) {
        setDeckTitle(deck.title);
        setLikesCount(deck.deck_likes?.[0]?.count || 0);
      }

      if (currentUserId) {
        const { data: likeData } = await supabase
          .from("deck_likes")
          .select("*")
          .eq("user_id", currentUserId)
          .eq("deck_id", deckId)
          .single();

        if (likeData) setIsLiked(true);
      }

      const { data: cardsData } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId);

      setCards(cardsData || []);
      setLoading(false);
    }

    fetchData();
  }, [deckId]);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length),
      150,
    );
  };

  if (loading)
    return (
      <Spinner className="mx-auto size-8 items-center justify-center h-screen" />
    );

  if (cards.length === 0)
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4">
        <p>В этой колоде нет карточек или у вас к ней нет доступа :(</p>
        <Link href="/">
          <Button className="rounded-full">Вернуться назад</Button>
        </Link>
      </div>
    );

  const currentCard = cards[currentIndex];

  return (
    <main className="flex min-h-screen flex-col items-center p-4 overflow-x-clip bg-background">
      <div className="max-w-6xl w-full mt-15 space-y-3">
        <div className="flex justify-start">
          <Link href="/" className="text-sm text-slate-500 hover:underline">
            ← На главную
          </Link>
        </div>

        <h1 className="text-2xl font-bold max-w-full truncate">{deckTitle}</h1>

        <div className="w-fit gap-1 flex">
          <LikeButton
            deckId={Number(deckId)}
            initialCount={likesCount}
            isLikedInitially={isLiked}
            currentUserId={userId}
          />
          <ShareButton />
        </div>

        <div
          className="group h-96 w-full md:w-2xl mt-10 mx-auto perspective-[1000px] cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative h-full w-full transition-all duration-500 transform-3d ${isFlipped ? "transform-[rotateX(180deg)]" : ""}`}
          >
            <Card className="absolute inset-0 flex items-center justify-center p-6 text-center backface-hidden">
              <CardContent className="text-2xl select-none font-medium">
                {currentCard.front}
              </CardContent>
            </Card>

            <Card className="absolute inset-0 flex items-center justify-center p-6 text-center transform-[rotateX(180deg)] backface-hidden">
              <CardContent className="text-2xl select-none font-medium">
                {currentCard.back}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex w-full md:w-2xl justify-center items-center mx-auto">
          <Button
            variant="outline"
            className="mr-auto rounded-full"
            onClick={prevCard}
          >
            <ArrowLeft />
          </Button>
          <p className="text-slate-500 mt-2 text-sm">
            {currentIndex + 1} из {cards.length}
          </p>
          <Button
            variant="outline"
            className="ml-auto rounded-full"
            onClick={nextCard}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>
    </main>
  );
}
