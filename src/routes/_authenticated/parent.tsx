import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Crown, Loader2, LogOut, ShieldCheck, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { generateSavingsPlan } from "@/lib/plan.functions";

export const Route = createFileRoute("/_authenticated/parent")({
  head: () => ({
    meta: [
      { title: "Área dos responsáveis | Piggy Bank" },
      { name: "description", content: "Área segura para responsáveis acompanharem e planejarem a educação financeira infantil." },
      { property: "og:title", content: "Área dos responsáveis | Piggy Bank" },
      { property: "og:description", content: "Acompanhe tarefas e crie planos de poupança personalizados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParentArea,
});

function ParentArea() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const queryClient = Route.useRouteContext().queryClient;
  const generate = useServerFn(generateSavingsPlan);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createPlan = async () => {
    if (goal.trim().length < 3 || loading) return;
    setLoading(true);
    setError("");
    setPlan("");
    try {
      const result = await generate({ data: { goal, age: 8 } });
      if (result.ok) setPlan(result.plan);
      else setError(result.error);
    } catch {
      setError("Não foi possível gerar o plano agora.");
    }
    setLoading(false);
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="min-h-screen bg-muted/40 px-5 py-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })} aria-label="Voltar ao aplicativo"><ArrowLeft /></Button>
          <div className="flex items-center gap-2 text-sm font-bold text-block-green"><ShieldCheck className="h-5 w-5" />Área segura</div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair"><LogOut /></Button>
        </header>

        <section className="mt-6">
          <p className="text-sm font-bold text-block-green">PIGGY BANK PARA FAMÍLIAS</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Olá, responsável</h1>
          <p className="mt-2 text-sm text-muted-foreground">Você entrou com {user.email}.</p>
        </section>

        <section className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-7">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Wand2 className="text-block-green" />Plano de poupança com IA</h2>
          <p className="mt-2 text-sm text-muted-foreground">Descreva a meta da Lia e receba sugestões de tarefas e contribuições adequadas para 8 anos.</p>
          <Textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={4} placeholder="Ex.: Lia quer juntar R$ 150 para uma bicicleta até o Natal" className="mt-5 resize-none" />
          <Button onClick={createPlan} disabled={loading || goal.trim().length < 3} className="mt-3 h-11 w-full font-bold">
            {loading ? <><Loader2 className="animate-spin" />Criando plano...</> : "Criar plano personalizado"}
          </Button>
          {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
          {plan && <div className="mt-5 whitespace-pre-wrap rounded-xl bg-block-green-soft p-4 text-sm leading-relaxed">{plan}</div>}
        </section>

        <section className="mt-5 flex items-start gap-3 rounded-2xl bg-block-yellow-soft p-5">
          <Crown className="mt-0.5 h-5 w-5 shrink-0" />
          <div><h2 className="font-bold">Piggy Premium</h2><p className="text-sm text-muted-foreground">Itens exclusivos e metas ilimitadas · R$ 14,90/mês</p></div>
        </section>
      </div>
    </main>
  );
}