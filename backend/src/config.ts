import { z } from 'zod'
const optionalUrl = z.preprocess((value) => value === '' ? undefined : value, z.string().url().optional())
const booleanValue = z.preprocess((value) => value === true || value === 'true', z.boolean().default(false))
const positiveInteger = z.coerce.number().int().positive().optional()
const ConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001), PUBLIC_BASE_URL: z.string().url().default('http://localhost:3001'),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'), OPENAI_API_KEY: z.string().default(''), OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  GITHUB_WEBHOOK_SECRET: z.string().default(''), GITHUB_TARGET_URL: optionalUrl, CONVEX_URL: z.string().url().or(z.literal('')).default(''), REDIS_URL: z.string().default('redis://localhost:6379'),
  ARTIFACT_DIR: z.string().default('./data/artifacts'), SMTP_URL: z.string().default(''), SMTP_FROM: z.string().default('Freebug <noreply@freebug.local>'),
  BILLING_ENABLED: booleanValue, DODO_API_KEY: z.string().default(''), DODO_WEBHOOK_KEY: z.string().default(''), DODO_ENVIRONMENT: z.enum(['test_mode','live_mode']).default('test_mode'),
  DODO_STARTER_PRODUCT_ID: z.string().default(''), DODO_SCALE_PRODUCT_ID: z.string().default(''), DODO_STARTER_CREDITS: positiveInteger, DODO_SCALE_CREDITS: positiveInteger,
  RUN_CREDIT_COST: positiveInteger, DODO_RETURN_URL: optionalUrl,
}).superRefine((config, context) => { if (!config.BILLING_ENABLED) return; for (const key of ['DODO_API_KEY','DODO_WEBHOOK_KEY','DODO_STARTER_PRODUCT_ID','DODO_SCALE_PRODUCT_ID','DODO_STARTER_CREDITS','DODO_SCALE_CREDITS','RUN_CREDIT_COST','DODO_RETURN_URL'] as const) if (!config[key]) context.addIssue({ code: 'custom', path: [key], message: 'required when billing is enabled' }) })
export type Config = z.infer<typeof ConfigSchema>
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => ConfigSchema.parse(env)
