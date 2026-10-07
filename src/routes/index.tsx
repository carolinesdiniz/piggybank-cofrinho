import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BedDouble,
  Blocks,
  BookOpen,
  Check,
  Coins,
  Crown,
  Gamepad2,
  Home,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Target,
  User,
} from "lucide-react";

import piggy from "@/assets/piggy.jpg.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
type Wallet = { name: string; val: number; goal: number; bar: string; soft: string; icon: typeof PiggyBank };
type Goal = { name: string; val: number; goal: number; bar: string };

function Block({ letter, color, tilt = 0 }: { letter: string; color: "red" | "green"; tilt?: number }) {
  const colorClass = color === "red" ? "bg-block-red" : "bg-block-green";
  return (
    <span style={{ transform: `rotate(${tilt}deg)` }} className={`inline-grid h-9 w-9 place-items-center rounded-[6px] ${colorClass} p-[3px] shadow-block`}>
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

const tasks = [
  { name: "Ler 10 páginas de um livro", by: "mamãe", coins: 25, icon: BookOpen, color: "red" },
  { name: "Arrumar a cama", by: "papai", coins: 10, icon: BedDouble, color: "yellow" },
  { name: "Guardar os brinquedos", by: "mamãe", coins: 15, icon: Blocks, color: "green" },
] as const;

const pastTasks = ["Lavar a louça", "Escovar os dentes", "Dar a ração do cachorrinho Snoopy", "Fazer a atividade da escola"];

const items = [
  { name: "Chapéu de Pirata", price: 30, emoji: "🏴‍☠️", premium: false, accessory: "🏴‍☠️" },
  { name: "Óculos Legais", price: 20, emoji: "🕶️", premium: false, accessory: "🕶️" },
  { name: "Coroa Dourada", price: 80, emoji: "👑", premium: true, accessory: "👑" },
  { name: "Capa de Herói", price: 60, emoji: "🦸", premium: true, accessory: "🦸" },
  { name: "Laço Fofo", price: 15, emoji: "🎀", premium: false, accessory: "🎀" },
  { name: "Foguete", price: 120, emoji: "🚀", premium: true, accessory: "🚀" },
];

const initialWallets: Wallet[] = [
  { name: "Poupança", icon: PiggyBank, val: 120, goal: 200, bar: "bg-block-green", soft: "bg-block-green-soft" },
  { name: "Jogos", icon: Gamepad2, val: 45, goal: 100, bar: "bg-block-red", soft: "bg-block-red-soft" },
  { name: "Gastos", icon: ShoppingBag, val: 30, goal: 50, bar: "bg-block-yellow", soft: "bg-block-yellow-soft" },
];

const initialGoals: Goal[] = [
  { name: "Bicicleta nova 🚲", val: 120, goal: 400, bar: "bg-block-green" },
  { name: "Jogo de tabuleiro 🎲", val: 45, goal: 90, bar: "bg-block-red" },
  { name: "Presente pro vovô 🎁", val: 30, goal: 40, bar: "bg-block-yellow" },
];

function Mascot({ compact = false, accessory }: { compact?: boolean; accessory?: string | undefined }) {
  return (
    <div className={`relative mx-auto ${compact ? "h-28 w-28" : "h-36 w-36 animate-bob"}`}>
      <img src={piggy.url} alt="Mascote Piggy" className="h-full w-full rounded-3xl object-cover" />
      {accessory && <span aria-label={`Acessório equipado: ${accessory}`} className={`pointer-events-none absolute left-1/2 -translate-x-1/2 drop-shadow-md ${accessory === "🕶️" ? "top-[43%] text-5xl" : accessory === "🎀" ? "right-0 top-0 translate-x-0 text-4xl" : "-top-5 text-5xl"}`}>{accessory}</span>}
    </div>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [coins, setCoins] = useState(195);
  const [pop, setPop] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string>();
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [wallets, setWallets] = useState(initialWallets);
  const [goals, setGoals] = useState(initialGoals);
  const [celebrating, setCelebrating] = useState<string>();
  const [premiumOpen, setPremiumOpen] = useState(false);
  const xp = 65;
  const equippedItem = items.find((item) => item.name === equipped);
  const finished = [...doneTasks, ...pastTasks];

  const playCoinSound = () => {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(960, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
  };

  const complete = (name: string, amount: number) => {
    if (doneTasks.includes(name)) return;
    const saving = Math.round(amount * 0.5);
    const games = Math.round(amount * 0.3);
    const spending = amount - saving - games;
    setDoneTasks((current) => [name, ...current]);
    const shares = [saving, games, spending];
    setWallets((current) => current.map((wallet, index) => ({ ...wallet, val: wallet.val + (shares[index] ?? 0) })));
    setCoins((current) => current + amount);
    setCelebrating(name);
    setPop((current) => current + 1);
    playCoinSound();
    window.setTimeout(() => setCelebrating(undefined), 1200);
  };

  const buyOrEquip = (name: string, price: number) => {
    if (owned.includes(name)) {
      setEquipped(name);
      return;
    }
    if (coins < price) return;
    setCoins((current) => current - price);
    setOwned((current) => [...current, name]);
    setPop((current) => current + 1);
  };

  const addToGoal = (index: number) => {
    const amount = Math.min(10, coins, goals[index]?.goal ? goals[index].goal - goals[index].val : 0);
    if (amount <= 0) return;
    setCoins((current) => current - amount);
    setGoals((current) => current.map((goal, goalIndex) => goalIndex === index ? { ...goal, val: goal.val + amount } : goal));
    setPop((current) => current + 1);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/40">
        <div className="relative mx-auto min-h-screen max-w-md bg-background pb-32">
          <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-background/90 px-5 py-4 backdrop-blur">
            <Logo />
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div key={pop} className="animate-pop rounded-2xl bg-block-yellow-soft px-3 py-1.5 text-center font-display font-bold" aria-label={`${coins} Moedas Piggy, equivalente a R$ ${(coins / 10).toFixed(2).replace(".", ",")}`}>
                    <div className="flex items-center justify-center gap-1.5"><Coins className="h-5 w-5 text-block-yellow" strokeWidth={2.5} />{coins}</div>
                    <p className="text-[10px] font-bold text-muted-foreground">equivale a R$ {(coins / 10).toFixed(2).replace(".", ",")}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Moedas Piggy</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <main className="space-y-5 px-5">
            {tab === "home" && (
              <>
                <section className="rounded-3xl bg-block-green-soft p-5 text-center shadow-lg">
                  <Mascot accessory={equippedItem?.accessory} />
                  <h1 className="mt-3 text-2xl font-bold">Oi, Lia!</h1>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm font-bold text-block-green"><Star className="h-4 w-4 fill-current" />Nível 4 · Poupadora</div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-block-green transition-all" style={{ width: `${xp}%` }} /></div>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">{xp}/100 moedas até o nível 5</p>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-bold">Atividades de hoje</h2>
                  <div className="space-y-3">
                    {tasks.map((task, index) => {
                      const isDone = doneTasks.includes(task.name);
                      const iconStyle = task.color === "red" ? "bg-block-red-soft text-block-red" : task.color === "green" ? "bg-block-green-soft text-block-green" : "bg-block-yellow-soft";
                      return (
                        <div key={task.name} className={`relative overflow-hidden rounded-3xl border-4 p-4 shadow-lg transition-colors ${isDone ? "border-block-green bg-block-green-soft" : index === 0 ? "border-block-red bg-card" : "border-block-yellow bg-card"}`}>
                          {celebrating === task.name && <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">{[...Array(12)].map((_, confettiIndex) => <i key={confettiIndex} className={`confetti confetti-${(confettiIndex % 6) + 1}`} />)}<Coins className="coin-flight text-block-yellow" /></div>}
                          {index === 0 && <p className="mb-2 text-xs font-extrabold uppercase text-block-red">Destaque do dia</p>}
                          <div className="flex items-center gap-3">
                            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconStyle}`}><task.icon /></div>
                            <div className="min-w-0"><h3 className="text-lg font-bold">{task.name}</h3><p className="text-sm text-muted-foreground">Enviada por {task.by} · +{task.coins} moedas</p></div>
                          </div>
                          <Button onClick={() => complete(task.name, task.coins)} disabled={isDone} className={`mt-3 h-auto min-h-12 w-full rounded-3xl py-3 font-display text-base font-bold shadow-block press ${isDone ? "bg-block-green" : index === 0 ? "bg-block-red" : "bg-block-yellow text-foreground"}`}>
                            {isDone ? <><Check />Concluída! ✨</> : <><Sparkles />Concluir Tarefa</>}
                          </Button>
                          {isDone && <p className="mt-3 rounded-2xl bg-background/80 p-3 text-center text-xs font-bold text-muted-foreground">Moedas divididas entre seus cofrinhos: 50% Poupança, 30% Jogos, 20% Gastos Livres!</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-bold">Meus cofrinhos</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {wallets.map((wallet) => (
                      <div key={wallet.name} className={`rounded-3xl ${wallet.soft} p-3 shadow-lg`}>
                        <wallet.icon className="h-6 w-6" /><p className="mt-2 text-sm font-bold">{wallet.name}</p><p className="font-display text-lg font-bold">{wallet.val}</p>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background"><div className={`h-full transition-all duration-700 ${wallet.bar}`} style={{ width: `${Math.min(100, (wallet.val / wallet.goal) * 100)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {tab === "goals" && (
              <section className="space-y-3">
                <h1 className="text-2xl font-bold">Minhas metas</h1>
                {goals.map((goal, index) => (
                  <div key={goal.name} className="rounded-3xl bg-card p-5 shadow-lg">
                    <div className="flex justify-between gap-3 font-bold"><span>{goal.name}</span><span className="shrink-0 text-muted-foreground">{goal.val}/{goal.goal}</span></div>
                    <div className="mt-3 h-4 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all duration-700 ${goal.bar}`} style={{ width: `${Math.min(100, (goal.val / goal.goal) * 100)}%` }} /></div>
                    <Button variant="secondary" onClick={() => addToGoal(index)} disabled={coins < 1 || goal.val >= goal.goal} className="mt-4 w-full rounded-3xl font-bold"><Coins />+ Guardar moedinhas</Button>
                  </div>
                ))}
              </section>
            )}

            {tab === "shop" && (
              <section>
                <h1 className="mb-3 text-2xl font-bold">Lojinha</h1>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => {
                    const hasItem = owned.includes(item.name);
                    const isEquipped = equipped === item.name;
                    return (
                      <div key={item.name} className="relative rounded-3xl bg-card p-4 text-center shadow-lg">
                        {item.premium && <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-block-yellow px-2 py-0.5 text-[10px] font-extrabold uppercase"><Crown className="h-3 w-3" />Premium</span>}
                        <div className={`text-5xl ${item.premium ? "opacity-40 grayscale" : ""}`}>{item.emoji}</div>
                        <p className="mt-2 text-sm font-bold">{item.name}</p>
                        <Button onClick={() => item.premium ? setPremiumOpen(true) : buyOrEquip(item.name, item.price)} disabled={isEquipped} className={`mt-3 h-auto min-h-10 w-full rounded-3xl text-xs font-bold shadow-block press ${item.premium ? "bg-muted text-muted-foreground" : hasItem ? "bg-block-green" : "bg-block-yellow-soft text-foreground"}`}>
                          {item.premium ? <><Lock />Bloqueado</> : isEquipped ? <><Check />Equipado</> : hasItem ? <><Sparkles />Equipar</> : <><Coins />Comprar · {item.price}</>}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {tab === "profile" && (
              <>
                <section className="rounded-3xl bg-block-yellow-soft p-6 text-center shadow-lg"><Mascot compact accessory={equippedItem?.accessory} /><h1 className="mt-3 text-2xl font-bold">Lia, 8 anos</h1><p className="text-muted-foreground">{finished.length} tarefas concluídas · {owned.length} itens</p></section>
                <section><h2 className="mb-3 text-xl font-bold">Tarefas concluídas</h2><ul className="space-y-2">{finished.map((task) => <li key={task} className="flex items-center gap-3 rounded-3xl bg-card p-3 font-bold shadow-lg"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-block-green text-primary-foreground"><Check className="h-4 w-4" /></span>{task}</li>)}</ul></section>
              </>
            )}
          </main>

          <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-[24rem] -translate-x-1/2 justify-around rounded-3xl bg-card p-2 shadow-lg ring-1 ring-border" aria-label="Navegação principal">
            {([["home", Home, "Início"], ["goals", Target, "Metas"], ["shop", Store, "Lojinha"], ["profile", User, "Perfil"]] as const).map(([key, Icon, label]) => (
              <Button key={key} variant="ghost" onClick={() => setTab(key)} className={`h-auto flex-1 flex-col gap-0.5 rounded-2xl py-2 text-xs font-bold ${tab === key ? "bg-block-green text-primary-foreground hover:bg-block-green hover:text-primary-foreground" : "text-muted-foreground"}`}><Icon />{label}</Button>
            ))}
          </nav>

          <Dialog open={premiumOpen} onOpenChange={setPremiumOpen}>
            <DialogContent className="w-[calc(100%-2rem)] rounded-3xl border-0 bg-block-yellow-soft text-center shadow-lg">
              <div className="mx-auto text-6xl">🌟</div><DialogHeader className="text-center"><DialogTitle className="font-display text-2xl">Item exclusivo do Piggy Club!</DialogTitle><DialogDescription className="text-base">Este item Premium estará disponível em breve.</DialogDescription></DialogHeader>
              <Button onClick={() => setPremiumOpen(false)} className="rounded-3xl font-bold">Voltar para a lojinha</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}