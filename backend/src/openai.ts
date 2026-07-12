import { z } from 'zod'

const PlanSchema = z.object({
  summary: z.string(),
  tests: z.array(z.object({ title: z.string(), steps: z.array(z.string()), expected: z.string() })).max(50),
})
export type GeneratedPlan = z.infer<typeof PlanSchema>

export class OpenAICompatibleClient {
  constructor(private readonly options: { baseUrl: string; apiKey: string; model: string }) {}
  async generatePlan(input: string): Promise<GeneratedPlan> {
    const response = await fetch(`${this.options.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.options.apiKey}` },
      body: JSON.stringify({
        model: this.options.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return JSON with summary and tests. Each test has title, steps, and expected. Never emit executable code.' },
          { role: 'user', content: input },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`OpenAI-compatible endpoint returned ${response.status}`)
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error('Model returned no plan')
    return PlanSchema.parse(JSON.parse(content))
  }
}
