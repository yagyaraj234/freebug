import { describe, expect, it } from 'vitest'
import { loadConfig } from '../config.js'
import { createCatalog } from './catalog.js'

describe('billing catalog', () => {
  it('publishes fixed monthly prices without product ids', () => {
    const c = createCatalog({ starterProductId:'p1', scaleProductId:'p2', starterCredits:1000, scaleCredits:5000 })
    expect(c.public).toEqual([
      expect.objectContaining({slug:'starter',price:14900,currency:'USD',interval:'month',includedCredits:1000}),
      expect.objectContaining({slug:'scale',price:49900,currency:'USD',interval:'month',includedCredits:5000}),
    ])
    expect(JSON.stringify(c.public)).not.toContain('p1')
  })
  it('fails fast when enabled configuration is incomplete', () => {
    expect(() => loadConfig({ BILLING_ENABLED:'true' } as NodeJS.ProcessEnv)).toThrow()
    expect(loadConfig({ BILLING_ENABLED:'false' } as NodeJS.ProcessEnv).BILLING_ENABLED).toBe(false)
  })
})
