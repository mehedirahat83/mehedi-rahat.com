export type ServicesPageSettings={
  heroVisible:boolean; servicesVisible:boolean; pricingVisible:boolean; fiverrVisible:boolean;
  heroEyebrow:string; heroLines:string[]; heroDescription:string;
  primaryLabel:string; primaryUrl:string; secondaryLabel:string; secondaryUrl:string;
  stats:{value:string;label:string}[];
  panelEyebrow:string; panelLines:string[]; panelBadgeValue:string; panelBadgeLabel:string;
  capabilities:{title:string;description:string;url:string}[]; panelProofs:string[];
  pricingEyebrow:string; pricingTitle:string; pricingHighlight:string; pricingDescription:string;
  packages:{name:string;price:string;note:string;popular:boolean;features:string[]}[];
  fiverrEyebrow:string; fiverrTitle:string; fiverrHighlight:string; fiverrDescription:string;
  fiverrLinkLabel:string; fiverrLinkUrl:string;
  gigs:{code:string;title:string;accent:string;url:string}[]; gigBenefits:string[];
};
export const seedServicesPageSettings:ServicesPageSettings={
  heroVisible:true,servicesVisible:true,pricingVisible:true,fiverrVisible:true,
  heroEyebrow:"Professional web services",heroLines:["Digital solutions","built to move your","business forward."],
  heroDescription:"From a high-performing website to search visibility and reliable digital products—get focused support shaped around your real business goals.",
  primaryLabel:"View Pricing",primaryUrl:"#service-pricing",secondaryLabel:"Discuss a Project",secondaryUrl:"/contact",
  stats:[{value:"15+",label:"Years experience"},{value:"24+",label:"Countries served"},{value:"4.9/5",label:"Client rating"}],
  panelEyebrow:"Complete digital support",panelLines:["One partner.","Four focused solutions."],panelBadgeValue:"15+",panelBadgeLabel:"years",
  capabilities:[{title:"Website",description:"Fast, responsive and conversion-focused builds.",url:"/services"},{title:"SEO",description:"Better structure, visibility and organic reach.",url:"/services"},{title:"Theme",description:"Ready designs customized for your business.",url:"/themes"},{title:"Plugin",description:"Trusted tools, activation and direct support.",url:"/products"}],
  panelProofs:["Clear pricing","Direct support","Practical results"],
  pricingEyebrow:"Service pricing",pricingTitle:"Choose the right starting point for",pricingHighlight:"your next website.",
  pricingDescription:"Clear starting prices for four popular website types. Final cost may change depending on your exact features and content.",
  packages:[
    {name:"Bangla Landing Page",price:"1,500",note:"One-time",popular:false,features:["Custom & modern design","Fully responsive layout","Lead collection form","Mobile-first experience","WhatsApp / Messenger chat","Fast loading setup"]},
    {name:"Newspaper Website",price:"10,000",note:"Starting from",popular:true,features:["Modern Bangla news design","Breaking news ticker","Category management","SEO-ready structure","Multi-author roles","Advertisement-ready sections"]},
    {name:"eCommerce Website",price:"15,000",note:"Starting from",popular:false,features:["Modern online storefront","Product catalog","Secure payment integration","Shopping cart & checkout","Order management","Courier-ready workflow"]},
    {name:"LMS Website",price:"20,000",note:"Starting from",popular:false,features:["Professional course website","Course management","Student dashboard","Secure payment integration","Progress tracking","Certificate-ready setup"]}
  ],
  fiverrEyebrow:"Find me on Fiverr",fiverrTitle:"Professional website gigs for",fiverrHighlight:"focused business needs.",
  fiverrDescription:"Choose a specialized Fiverr service for your business, eLearning, listing or eCommerce website.",
  fiverrLinkLabel:"Discuss your project",fiverrLinkUrl:"/contact?source=fiverr",
  gigs:[{code:"BUSINESS",title:"Business website with Elementor Pro",accent:"elementor",url:"/contact?source=fiverr"},{code:"EDUCATION",title:"eLearning LMS website with Tutor LMS",accent:"education",url:"/contact?source=fiverr"},{code:"LISTING",title:"Crocoblock listing, hotel or travel website",accent:"listing",url:"/contact?source=fiverr"},{code:"ECOMMERCE",title:"eCommerce website with WoodMart",accent:"commerce",url:"/contact?source=fiverr"}],
  gigBenefits:["Fresh & unique website","Fully mobile responsive","Search engine optimized","Fast loading experience","30 days free support"]
};
const key="mr-services-page-settings";
export function loadServicesPageSettings():ServicesPageSettings{
  if(typeof window==="undefined")return seedServicesPageSettings;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||"{}");
    const arrays=["heroLines","stats","panelLines","capabilities","panelProofs","packages","gigs","gigBenefits"] as const;
    const merged:any={...seedServicesPageSettings,...saved};
    arrays.forEach(name=>{if(!Array.isArray(saved[name]))merged[name]=seedServicesPageSettings[name]});
    return merged;
  }catch{return seedServicesPageSettings}
}
export function saveServicesPageSettings(settings:ServicesPageSettings){
  localStorage.setItem(key,JSON.stringify(settings));
  window.dispatchEvent(new Event("mr-services-page-updated"));
}
