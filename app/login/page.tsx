"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {Spinner} from "@/components/ui/spinner";
import {toast} from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    let error = null;

    const STUDENT_DOMAIN = "@astanait.edu.kz";

    if (isSignUp) {
      if (!email.endsWith(STUDENT_DOMAIN)) {
        toast.error(`Регистрация доступна только для почт ${STUDENT_DOMAIN}`);
        setLoading(false);
        return;
      }
    }

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      error = signUpError;
      if (!error) {
        toast.success("Регистрация завершена! Подтвердите почту, чтобы войти.");
        toast.warning("Если письмо не пришло, проверьте папку Спам.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      error = signInError;
    }

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      if (!isSignUp) router.push("/");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Регистрация" : "Вход"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Пароль</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="cursor-pointer w-full rounded-full mt-4"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading
              ? <Spinner/>
              : isSignUp
                ? "Зарегистрироваться"
                : "Войти"}
          </Button>

          <p
            className="text-center text-sm text-slate-500 cursor-pointer hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Войти в аккаунт"
              : "Зарегистрироваться"}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
