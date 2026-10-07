import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso dos responsáveis | Piggy Bank" },
      { name: "description", content: "Acesso seguro para responsáveis acompanharem tarefas, metas e planos de poupança no Piggy Bank." },
      { property: "og:title", content: "Acesso dos responsáveis | Piggy Bank" },
      { property: "og:description", content: "Entre na área segura dos responsáveis do Piggy Bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "forgot") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) setError("Não foi possível enviar o link. Confira o e-mail e tente novamente.");
      else setMessage("Enviamos um link seguro para redefinir sua senha.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signupError) setError("Não foi possível criar o acesso. Verifique os dados informados.");
      else if (!data.session) setMessage("Confira seu e-mail e confirme o cadastro para entrar.");
      else await navigate({ to: "/parent" });
      setLoading(false);
      return;
    }

    const { error: signinError } = await supabase.auth.signInWithPassword({ email, password });
    if (signinError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    await navigate({ to: "/parent" });
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setError("Não foi possível entrar com o Google.");
      setLoading(false);
      return;
    }
    if (!result.redirected) await navigate({ to: "/parent" });
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-block-green-soft px-5 py-8 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-block-green text-primary-foreground shadow-block">
            <LockKeyhole className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-5 font-display text-sm font-bold text-block-green">PIGGY BANK</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
            {mode === "forgot" ? "Recupere seu acesso" : "Área dos responsáveis"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {mode === "forgot"
              ? "Informe seu e-mail para receber um link seguro."
              : "Acompanhe as conquistas da Lia e cuide das metas em um espaço seguro."}
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8" aria-label="Acesso dos responsáveis">
          {mode !== "forgot" && (
            <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1" role="tablist" aria-label="Escolha como acessar">
              <Button type="button" variant={mode === "signin" ? "default" : "ghost"} onClick={() => switchMode("signin")} role="tab" aria-selected={mode === "signin"} className="h-10">
                Entrar
              </Button>
              <Button type="button" variant={mode === "signup" ? "default" : "ghost"} onClick={() => switchMode("signup")} role="tab" aria-selected={mode === "signup"} className="h-10">
                Criar acesso
              </Button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="parent-email">E-mail do responsável</Label>
              <Input id="parent-email" type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12" />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="parent-password">Senha</Label>
                  {mode === "signin" && (
                    <Button type="button" variant="link" onClick={() => switchMode("forgot")} className="h-auto p-0 text-xs">
                      Esqueci minha senha
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input id="parent-password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required className="h-12 pr-12" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword((value) => !value)} className="absolute right-1.5 top-1.5" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {mode === "signup" && <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>}
              </div>
            )}

            {error && <p role="alert" className="rounded-lg bg-block-red-soft px-3 py-2 text-sm font-bold text-block-red">{error}</p>}
            {message && <p role="status" className="rounded-lg bg-block-green-soft px-3 py-2 text-sm font-bold text-block-green">{message}</p>}

            <Button type="submit" disabled={loading} className="h-12 w-full text-base font-bold">
              {loading && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Entrar com segurança" : mode === "signup" ? "Criar acesso parental" : "Enviar link de recuperação"}
            </Button>
          </form>

          {mode === "forgot" ? (
            <Button type="button" variant="ghost" onClick={() => switchMode("signin")} className="mt-3 w-full">Voltar para entrar</Button>
          ) : (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
              <Button type="button" variant="outline" onClick={signInWithGoogle} disabled={loading} className="h-12 w-full font-bold">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-border font-sans text-xs font-extrabold text-foreground">G</span>
                Continuar com Google
              </Button>
            </>
          )}

          <div className="mt-6 flex items-start gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-block-green" aria-hidden="true" />
            <p>O acesso parental é separado da experiência da criança e protegido com segurança.</p>
          </div>
        </section>
      </div>
    </main>
  );
}