// @vitest-environment jsdom
import { afterEach,describe,expect,it,vi } from 'vitest';import { cleanup,render,screen } from '@testing-library/react';import { PricingSection } from './PricingSection'
afterEach(()=>{cleanup();vi.restoreAllMocks()})
describe('PricingSection',()=>{it('renders static prices and credits without loading plans',()=>{const fetch=vi.fn().mockResolvedValue({ok:false});vi.stubGlobal('fetch',fetch);render(<PricingSection/>);expect(screen.getByText((_,e)=>e?.textContent==='$149/month')).toBeTruthy();expect(screen.getByText((_,e)=>e?.textContent==='$499/month')).toBeTruthy();expect(screen.getByText((_,e)=>e?.textContent==='1,000 credits included')).toBeTruthy();expect(fetch).not.toHaveBeenCalledWith(expect.stringMatching(/\/v1\/billing\/plans$/))})})
