export type HomepageSettings = {
  heroEyebrow:string;
  heroLine1:string;
  heroLine2:string;
  heroLine2Highlight:string;
  heroLine3Highlight:string;
  heroDescription:string;
  primaryLabel:string;
  primaryUrl:string;
  secondaryLabel:string;
  secondaryUrl:string;
  stats:{value:string;label:string}[];
  heroCardEyebrow:string;
  heroCardTitle:string;
  heroCardHighlight:string;
  heroCardItems:{title:string;description:string;url:string}[];
  heroProofs:{value:string;label:string}[];
  servicesVisible:boolean;
  servicesEyebrow:string;
  servicesTitle:string;
  servicesHighlight:string;
  servicesLinkLabel:string;
  servicesLinkUrl:string;
  projectsVisible:boolean;
  projectsEyebrow:string;
  projectsTitle:string;
  projectsHighlight:string;
  projectsLinkLabel:string;
  projectsLinkUrl:string;
  reviewsVisible:boolean;
  reviewsEyebrow:string;
  reviewsTitle:string;
  reviewsHighlight:string;
};

export const seedHomepageSettings:HomepageSettings={
  heroEyebrow:"15+ years of practical experience",
  heroLine1:"Modern websites",
  heroLine2:"and tools that",
  heroLine2Highlight:"grow",
  heroLine3Highlight:"your business.",
  heroDescription:"is the passionate full stack developer & product designer having 15 years of experiences over 24+ country worldwide. Expert for LMS website, listing site, eCommerce, elementor business website, landing page & many more.",
  primaryLabel:"Explore Products",primaryUrl:"#products",
  secondaryLabel:"View Services",secondaryUrl:"#services",
  stats:[{value:"3K+",label:"Projects"},{value:"2.8K+",label:"Clients"},{value:"4.9/5",label:"Rating"}],
  heroCardEyebrow:"Complete digital growth partner",heroCardTitle:"One expert.",heroCardHighlight:"Three ways to grow.",
  heroCardItems:[{title:"Custom Websites",description:"Built around your exact business goals",url:"/services"},{title:"Ready Websites",description:"Professional websites with a faster launch",url:"/themes"},{title:"Premium Tools",description:"Reliable products, licensing and support",url:"/products"}],
  heroProofs:[{value:"15 years",label:"Experience"},{value:"24+ countries",label:"Worldwide reach"}],
  servicesVisible:true,servicesEyebrow:"What I do",servicesTitle:"Solutions built around",servicesHighlight:"real business needs.",servicesLinkLabel:"Discuss a project",servicesLinkUrl:"#support",
  projectsVisible:true,projectsEyebrow:"My Projects",projectsTitle:"Exclusive products, designed and",projectsHighlight:"developed by Mehedi Rahat.",projectsLinkLabel:"Ask about these projects",projectsLinkUrl:"#support",
  reviewsVisible:true,reviewsEyebrow:"Client feedback",reviewsTitle:"Trusted for helpful service and",reviewsHighlight:"dependable delivery."
};

const key="mr-homepage-settings";
export function loadHomepageSettings():HomepageSettings{
  if(typeof window==="undefined")return seedHomepageSettings;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||"{}");
    return {...seedHomepageSettings,...saved,stats:Array.isArray(saved.stats)?saved.stats:seedHomepageSettings.stats,heroCardItems:Array.isArray(saved.heroCardItems)?saved.heroCardItems:seedHomepageSettings.heroCardItems,heroProofs:Array.isArray(saved.heroProofs)?saved.heroProofs:seedHomepageSettings.heroProofs};
  }catch{return seedHomepageSettings}
}
export function saveHomepageSettings(settings:HomepageSettings){
  localStorage.setItem(key,JSON.stringify(settings));
  window.dispatchEvent(new Event("mr-homepage-updated"));
}
