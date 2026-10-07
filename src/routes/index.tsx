import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Lock, Home, Target, Store, User, Check, Crown, BookOpen, Gamepad2, PiggyBank, ShoppingBag, Star, Sparkles, BedDouble, Blocks } from "lucide-react";
import piggy from "@/assets/piggy.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Piggy Bank — Meu cofrinho" },
      { name: "description", content: "Dashboard infantil de educação financeira: tarefas, metas e lojinha." },
      { property: "og:title", content: "Piggy Bank — Meu cofrinho" },
      { property: "og:description", content: "Aprenda a poupar brincando, com tarefas, metas e uma lojinha divertida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Tab = "home" | "goals" | "shop" | "profile";

function Block({ letter, color, tilt = 0 }: { letter: string; color: "red" | "green"; tilt?: number }) {
  const c = color === "red" ? "bg-block-red" : "bg-block-green";
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className={`inline-grid h-9 w-9 place-items-center rounded-[6px] ${c} p-[3px] shadow-block`}>
      <span className={`grid h-full w-full place-items-center rounded-[3px] bg-wood font-display text-xl font-bold ${color === "red" ? "text-block-red" : "text-block-green"}`}>{letter}</span>
    </span>
  );
}

function Logo() {
  return (
    <div className="flex items-end font-display text-2xl font-bold text-foreground">
      <Block letter="P" color="red" /><span className="mb-0.5 ml-0.5">iggy</span>
      <span className="ml-1"><Block letter="B" color="green" tilt={-12} /></span><span className="mb-0.5 ml-0.5">ank</span>
    </div>
  );
}

const cats = [
  { name: "Poupança", icon: PiggyBank, val: 120, goal: 200, bar: "bg-block-green", soft: "bg-block-green-soft" },
  { name: "Jogos", icon: Gamepad2, val: 45, goal: 100, bar: "bg-block-red", soft: "bg-block-red-soft" },
  { name: "Gastos", icon: ShoppingBag, val: 30, goal: 50, bar: "bg-block-yellow", soft: "bg-block-yellow-soft" },
];

const tasks = [
  { name: "Ler 10 páginas de um livro", by: "mamãe", coins: 25, icon: BookOpen },
  { name: "Arrumar a cama", by: "papai", coins: 10, icon: BedDouble },
  { name: "Guardar os brinquedos", by: "mamãe", coins: 15, icon: Blocks },
];

const pastTasks = ["Lavar a louça", "Escovar os dentes", "Dar a ração do cachorrinho Snoopy", "Fazer a atividade da escola"];

const items = [
  { name: "Chapéu de Pirata", price: 30, emoji: "🏴‍☠️", premium: false },
  { name: "Óculos Legais", price: 20, emoji: "🕶️", premium: false },
  { name: "Coroa Dourada", price: 80, emoji: "👑", premium: true },
  { name: "Capa de Herói", price: 60, emoji: "🦸", premium: true },
  { name: "Laço Fofo", price: 15, emoji: "🎀", premium: false },
  { name: "Foguete", price: 120, emoji: "🚀", premium: true },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [coins, setCoins] = useState(195);
  const [pop, setPop] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const xp = 65;

  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const finished = [...doneTasks, ...pastTasks];
  const complete = (name: string, amt: number) => { if (doneTasks.includes(name)) return; setDoneTasks((d) => [name, ...d]); setCoins((c) => c + amt); setPop((p) => p + 1); };
  const buy = (n: string, p: number) => { if (coins < p || owned.includes(n)) return; setCoins((c) => c - p); setOwned((o) => [...o, n]); setPop((x) => x + 1); };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="relative mx-auto min-h-screen max-w-md bg-background pb-32">
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-background/90 px-5 py-4 backdrop-blur">
          <Logo />
          <div className="flex items-center gap-2">
            <div key={pop} className="flex animate-pop items-center gap-1.5 rounded-full bg-block-yellow-soft px-3 py-1.5 font-display font-bold">
              <Coins className="h-5 w-5 text-block-yellow" strokeWidth={2.5} />{coins}
            </div>
            <Link to="/parent" aria-label="Acesso Parental" className="grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground press">
              <Lock className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="space-y-5 px-5">
          {tab === "home" && (
            <>
              <section className="rounded-3xl bg-block-green-soft p-5 text-center shadow-lg">
                <img src={piggy.url} alt="Mascote Piggy" className="mx-auto h-36 w-36 animate-bob rounded-3xl object-cover" />
                <h1 className="mt-3 text-2xl font-bold">Oi, Lia!</h1>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm font-bold text-block-green"><Star className="h-4 w-4 fill-current" />Nível 4 · Poupadora</div>
                <div className="mt-4 h-4 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-block-green transition-all" style={{ width: `${xp}%` }} />
                </div>
                <p className="mt-1 text-xs font-bold text-muted-foreground">{xp}/100 moedas até o nível 5</p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-bold">Atividades de hoje</h2>
                <div className="space-y-3">
                  {tasks.map((t, i) => {
                    const isDone = doneTasks.includes(t.name);
                    const red = i === 0;
                    return (
                      <div key={t.name} className={`rounded-3xl border-4 p-4 shadow-lg transition-colors ${isDone ? "border-block-green bg-block-green-soft" : red ? "border-block-red bg-card" : "border-block-yellow bg-card"}`}>
                        {red && <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-block-red">Destaque do dia</p>}
                        <div className="flex items-center gap-3">
                          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${red ? "bg-block-red-soft text-block-red" : "bg-block-yellow-soft"}`}><t.icon /></div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold">{t.name}</h3>
                            <p className="text-sm text-muted-foreground">Enviada por {t.by} · +{t.coins} moedas</p>
                          </div>
                        </div>
                        <button onClick={() => complete(t.name, t.coins)} disabled={isDone} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-display text-lg font-bold shadow-block press ${isDone ? "bg-block-green text-primary-foreground" : red ? "bg-block-red text-primary-foreground" : "bg-block-yellow"}`}>
                          {isDone ? <><Check /> Moedas resgatadas!</> : <><Sparkles className="h-5 w-5" /> Concluir Tarefa</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-bold">Meus cofrinhos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {cats.map((c) => (
                    <div key={c.name} className={`rounded-2xl ${c.soft} p-3 shadow-lg`}>
                      <c.icon className="h-6 w-6" />
                      <p className="mt-2 text-sm font-bold">{c.name}</p>
                      <p className="font-display text-lg font-bold">{c.val}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className={`h-full ${c.bar}`} style={{ width: `${(c.val / c.goal) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === "goals" && (
            <section className="space-y-3">
              <h1 className="text-2xl font-bold">Minhas metas</h1>
              {[{ n: "Bicicleta nova 🚲", v: 120, g: 400, b: "bg-block-green" }, { n: "Jogo de tabuleiro 🎲", v: 45, g: 90, b: "bg-block-red" }, { n: "Presente pro vovô 🎁", v: 30, g: 40, b: "bg-block-yellow" }].map((m) => (
                <div key={m.n} className="rounded-3xl bg-card p-5 shadow-lg">
                  <div className="flex justify-between font-bold"><span>{m.n}</span><span className="text-muted-foreground">{m.v}/{m.g}</span></div>
                  <div className="mt-3 h-4 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${m.b}`} style={{ width: `${(m.v / m.g) * 100}%` }} /></div>
                </div>
              ))}
            </section>
          )}

          {tab === "shop" && (
            <section>
              <h1 className="mb-3 text-2xl font-bold">Lojinha</h1>
              <div className="grid grid-cols-2 gap-3">
                {items.map((it) => {
                  const has = owned.includes(it.name);
                  return (
                    <div key={it.name} className="relative rounded-3xl bg-card p-4 text-center shadow-lg">
                      {it.premium && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-block-yellow px-2 py-0.5 text-[10px] font-extrabold uppercase"><Crown className="h-3 w-3" />Premium</span>}
                      <div className={`text-5xl ${it.premium ? "opacity-40 grayscale" : ""}`}>{it.emoji}</div>
                      <p className="mt-2 text-sm font-bold">{it.name}</p>
                      <button onClick={() => !it.premium && buy(it.name, it.price)} className={`mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-bold shadow-block press ${it.premium ? "bg-muted text-muted-foreground" : has ? "bg-block-green text-primary-foreground" : "bg-block-yellow-soft"}`}>
                        {it.premium ? <><Lock className="h-4 w-4" />Bloqueado</> : has ? <><Check className="h-4 w-4" />Seu!</> : <><Coins className="h-4 w-4" />{it.price}</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "profile" && (
            <>
              <section className="rounded-3xl bg-block-yellow-soft p-6 text-center shadow-lg">
                <img src={piggy.url} alt="" className="mx-auto h-28 w-28 rounded-3xl object-cover" />
                <h1 className="mt-3 text-2xl font-bold">Lia, 8 anos</h1>
                <p className="text-muted-foreground">{finished.length} tarefas concluídas · {owned.length} itens</p>
              </section>
              <section>
                <h2 className="mb-3 text-xl font-bold">Tarefas concluídas</h2>
                <ul className="space-y-2">
                  {finished.map((t) => (
                    <li key={t} className="flex items-center gap-3 rounded-2xl bg-card p-3 font-bold shadow-lg">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-block-green text-primary-foreground"><Check className="h-4 w-4" /></span>{t}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </main>

        <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[24rem] -translate-x-1/2 justify-around rounded-3xl bg-card p-2 shadow-lg ring-1 ring-border">
          {([["home", Home, "Início"], ["goals", Target, "Metas"], ["shop", Store, "Lojinha"], ["profile", User, "Perfil"]] as const).map(([k, I, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-bold transition-colors ${tab === k ? "bg-block-green text-primary-foreground" : "text-muted-foreground"}`}>
              <I className="h-5 w-5" />{l}
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}

