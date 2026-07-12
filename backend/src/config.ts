import { z } from 'zod'

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:3001'),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  GITHUB_WEBHOOK_SECRET: z.string().default(''),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ARTIFACT_BASE_URL: z.string().url().default('http://localhost:9000/freebug'),
  SMTP_URL: z.string().default(''),
})

export type Config = z.infer<typeof ConfigSchema>
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => ConfigSchema.parse(env)
