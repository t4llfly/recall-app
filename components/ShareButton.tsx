"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

export function ShareButton() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    // Копируем текущий URL страницы
    navigator.clipboard.writeText(window.location.href);

    // Включаем состояние "Скопировано"
    setIsCopied(true);

    // Через 2 секунды возвращаем иконку обратно
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="outline"
      size="icon" // Круглая/квадратная кнопка под иконку
      className={`rounded-full text-slate-500 hover:text-slate-700 transition-all ease-in-out duration-300 ${isCopied ? "bg-green-50 text-green-600 border-green-200" : ""}`}
      onClick={handleCopy}
      title="Скопировать ссылку"
    >
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}
