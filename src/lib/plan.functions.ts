import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const generateSavingsPlan = createServerFn({ method: "POST" })
  .inputValidator(z.object({ goal: z.string().min(3).max(500), age: z.number().int().min(5).max(14) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Planejador indisponível no momento." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "Você é um educador financeiro infantil. Crie um plano de poupança curto e divertido em português do Brasil para uma criança, usando 'moedas' do app (1 moeda = R$ 1). Formato: uma linha de resumo com o prazo, depois 'Tarefas:' com 4 a 6 tarefas domésticas/escolares adequadas à idade e quantas moedas cada uma vale por semana, depois 'Contribuições:' com o valor semanal a guardar e uma dica motivacional. Use listas com '-'. Máximo de 150 palavras. Sem markdown com asteriscos.",
        messages: [{ role: "user", content: `Idade: ${data.age} anos. Meta descrita pelos pais: ${data.goal}` }],
        providerOptions: {
          openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
        },
      });
      const text = await result.text;
      if (!text.trim()) return { ok: false as const, error: "Não foi possível gerar o plano." };
      return { ok: true as const, plan: text };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "Muitos pedidos agora. Tente de novo em instantes." };
      if (status === 402) return { ok: false as const, error: "Os créditos de IA acabaram. Adicione créditos no workspace." };
      console.error(e);
      return { ok: false as const, error: "Não foi possível gerar o plano agora." };
    }
  });
