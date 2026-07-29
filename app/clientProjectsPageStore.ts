export type ClientProjectItem={title:string;category:string;description:string;url:string;linkLabel:string};
export type ClientProjectsPageSettings={
 heroVisible:boolean;projectsVisible:boolean;heroEyebrow:string;heroLines:string[];heroDescription:string;
 cardEyebrow:string;cardLines:string[];stats:{value:string;label:string;description:string}[];
 countriesLabel:string;countries:string[];proofPoints:string[];projects:ClientProjectItem[];
};
export const seedClientProjectsPageSettings:ClientProjectsPageSettings={
 heroVisible:true,projectsVisible:true,heroEyebrow:"Client projects",
 heroLines:["Selected solutions","built for real","business goals."],
 heroDescription:"A closer look at the websites, platforms and customer experiences I design and develop for real businesses. Each project combines clear strategy, reliable performance and a user-focused experience shaped around the client's goals.",
 cardEyebrow:"Global delivery record",cardLines:["Trusted work,","across borders."],
 stats:[{value:"3,000+",label:"Websites completed",description:"Design, development and delivery"},{value:"25+",label:"Countries served",description:"Worldwide client experience"}],
 countriesLabel:"Highlighted client locations",countries:["USA","UK","Italy","France","Germany","Switzerland"],
 proofPoints:["Practical solutions","Cross-border experience"],
 projects:[
  {title:"Business Commerce Platform",category:"eCommerce",description:"Storefront, member pricing and streamlined checkout designed for Bangladesh-based customers.",url:"/contact",linkLabel:"Discuss a similar project"},
  {title:"Online Learning Website",category:"LMS",description:"A structured learning experience with courses, student accounts and clear content navigation.",url:"/contact",linkLabel:"Discuss a similar project"},
  {title:"News & Publishing Portal",category:"News Website",description:"A fast, content-rich publishing system prepared for daily editorial work and high traffic.",url:"/contact",linkLabel:"Discuss a similar project"},
  {title:"Service Business Website",category:"Corporate",description:"A polished lead-generation website with services, portfolio, trust signals and contact flow.",url:"/contact",linkLabel:"Discuss a similar project"},
  {title:"Directory & Listing Platform",category:"Listing",description:"Searchable listings, member submissions and organized category-based discovery.",url:"/contact",linkLabel:"Discuss a similar project"},
  {title:"Conversion Landing Page",category:"Marketing",description:"A focused campaign page designed around one offer, clear proof and a strong call to action.",url:"/contact",linkLabel:"Discuss a similar project"}
 ]
};
const key="mr-client-projects-page-settings";
export function loadClientProjectsPageSettings():ClientProjectsPageSettings{
 if(typeof window==="undefined")return seedClientProjectsPageSettings;
 try{
  const saved=JSON.parse(localStorage.getItem(key)||"{}"),merged:any={...seedClientProjectsPageSettings,...saved};
  ["heroLines","cardLines","stats","countries","proofPoints","projects"].forEach(name=>{if(!Array.isArray(saved[name]))merged[name]=(seedClientProjectsPageSettings as any)[name]});
  return merged;
 }catch{return seedClientProjectsPageSettings}
}
export function saveClientProjectsPageSettings(settings:ClientProjectsPageSettings){
 localStorage.setItem(key,JSON.stringify(settings));window.dispatchEvent(new Event("mr-client-projects-page-updated"));
}
