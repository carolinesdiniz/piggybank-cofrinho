import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha | Piggy Bank" },
      { name: "description", content: "Crie uma nova senha para seu acesso parental ao Piggy Bank." },
      { property: "og:title", content: "Redefinir senha | Piggy Bank" },
      { property: "og:description", content: "Redefina com segurança a senha do acesso parental." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setRecovery(params.get("type") === "recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError("O link expirou ou não é válido. Solicite um novo link.");
    else setComplete(true);
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-block-green-soft px-5 py-8">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-lg" aria-labelledby="reset-title">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-block-green text-primary-foreground shadow-block">
          {complete ? <CheckCircle2 /> : <KeyRound />}
        </div>
        <h1 id="reset-title" className="mt-5 text-center font-display text-2xl font-bold">{complete ? "Senha atualizada" : "Crie uma nova senha"}</h1>
        {complete ? (
          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">Seu acesso parental está protegido com a nova senha.</p>
            <Button onClick={() => navigate({ to: "/parent" })} className="mt-6 h-12 w-full font-bold">Ir para a área dos responsáveis</Button>
          </div>
        ) : !recovery ? (
          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">Este link não é válido ou já expirou.</p>
            <Button onClick={() => navigate({ to: "/auth" })} variant="outline" className="mt-6 h-12 w-full">Solicitar um novo link</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12" /></div>
            <div className="space-y-2"><Label htmlFor="confirm-password">Confirme a nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} required className="h-12" /></div>
            {error && <p role="alert" className="rounded-lg bg-block-red-soft px-3 py-2 text-sm font-bold text-block-red">{error}</p>}
            <Button type="submit" disabled={loading} className="h-12 w-full font-bold">{loading && <Loader2 className="animate-spin" />}Salvar nova senha</Button>
          </form>
        )}
      </section>
    </main>
  );
}