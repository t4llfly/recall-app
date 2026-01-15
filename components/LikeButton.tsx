"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  deckId: number;
  initialCount: number;
  isLikedInitially: boolean;
  currentUserId: string | null;
}

export function LikeButton({
  deckId,
  initialCount,
  isLikedInitially,
  currentUserId,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(isLikedInitially);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      alert("Чтобы ставить лайки, нужно войти в аккаунт!");
      return;
    }

    if (isLoading) return;

    const previousIsLiked = isLiked;
    const previousCount = count;

    setIsLiked(!isLiked);
    setCount(isLiked ? count - 1 : count + 1);
    setIsLoading(true);

    try {
      if (previousIsLiked) {
        const { error } = await supabase
          .from("deck_likes")
          .delete()
          .match({ user_id: currentUserId, deck_id: deckId });

        if (error) {
          console.error(error);
          setIsLiked(previousIsLiked);
          setCount(previousCount);
        }
      } else {
        const { error } = await supabase
          .from("deck_likes")
          .insert({ user_id: currentUserId, deck_id: deckId });

        if (error) {
            console.error(error);
            setIsLiked(previousIsLiked);
            setCount(previousCount);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`rounded-full px-3 py-4 gap-1.5 ${isLiked ? "text-red-500 hover:text-red-600" : "text-slate-500 hover:text-slate-700"}`}
      onClick={handleToggleLike}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span className="text-sm font-medium">{count}</span>
    </Button>
  );
}
