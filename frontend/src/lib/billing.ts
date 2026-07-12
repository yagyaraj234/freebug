export interface PublicPlan{slug:'starter'|'scale';name:string;price:number;currency:'USD';interval:'month';includedCredits:number;features:string[]}
export const plans:PublicPlan[]=[
 {slug:'starter',name:'Starter',price:14900,currency:'USD',interval:'month',includedCredits:1000,features:['Automated test runs','Evidence reports']},
 {slug:'scale',name:'Scale',price:49900,currency:'USD',interval:'month',includedCredits:5000,features:['Everything in Starter','Higher usage allowance']},
]
const base=((import.meta as ImportMeta&{env?:{VITE_API_URL?:string}}).env?.VITE_API_URL??'http://localhost:3001').replace(/\/$/,'')
export async function createCheckout(plan:PublicPlan['slug'],email:string){const r=await fetch(`${base}/v1/billing/checkout`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan,email})});if(!r.ok)throw new Error('Checkout is unavailable.');return r.json() as Promise<{id:string;url:string}>}
