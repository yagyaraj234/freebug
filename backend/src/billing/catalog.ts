export type PlanSlug='starter'|'scale'
export interface BillingPlan { slug:PlanSlug; name:string; price:number; currency:'USD'; interval:'month'; includedCredits:number; productId:string; features:string[] }
export type PublicPlan=Omit<BillingPlan,'productId'>
export function createCatalog(input:{starterProductId:string;scaleProductId:string;starterCredits:number;scaleCredits:number}) {
 const plans:BillingPlan[]=[
  {slug:'starter',name:'Starter',price:14900,currency:'USD',interval:'month',includedCredits:input.starterCredits,productId:input.starterProductId,features:['Automated test runs','Evidence reports']},
  {slug:'scale',name:'Scale',price:49900,currency:'USD',interval:'month',includedCredits:input.scaleCredits,productId:input.scaleProductId,features:['Everything in Starter','Higher usage allowance']},
 ]
 return { plans, public:plans.map(({productId:_,...plan})=>plan), get:(slug:PlanSlug)=>plans.find(p=>p.slug===slug)! }
}
export type BillingCatalog=ReturnType<typeof createCatalog>
