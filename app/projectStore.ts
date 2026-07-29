export type StoreProject={
  id:string;
  title:string;
  category:string;
  description:string;
  status:"Published"|"Draft";
  order:number;
  link:string;
  linkLabel:string;
  availability:"Live Now"|"Coming Soon";
  projectType:string;
  image?:string;
  imageName?:string;
};

export const PROJECT_STORAGE_KEY="mr-admin-projects";
export const seedProjects:StoreProject[]=[
  {id:"mr-commerce-pro",title:"MR Commerce Pro",category:"WooCommerce Solution",description:"An all-in-one commerce toolkit developed to improve product presentation, cart experience, checkout and practical store operations.",status:"Published",order:1,link:"#support",linkLabel:"Explore plugin",availability:"Live Now",projectType:"WordPress Plugin"},
  {id:"mr-news-pro",title:"MR News Pro",category:"News Management Solution",description:"A purpose-built solution for faster news publishing, media management and the day-to-day workflow of active news websites.",status:"Published",order:2,link:"#support",linkLabel:"Explore plugin",availability:"Coming Soon",projectType:"WordPress Plugin"},
];

export function loadProjects():StoreProject[]{
  if(typeof window==="undefined")return seedProjects;
  try{
    const stored=JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY)||"null");
    if(!Array.isArray(stored))return seedProjects;
    return stored.map((item:Partial<StoreProject>,index:number)=>({
      id:item.id||slugify(item.title||`project-${index+1}`),title:item.title||"Untitled Project",
      category:item.category||"Web Project",description:item.description||"",status:(item.status==="Draft"?"Draft":"Published") as StoreProject["status"],
      order:Number(item.order||index+1),link:item.link||"#support",linkLabel:item.linkLabel||"View project",
      availability:(item.availability==="Coming Soon"||(!item.availability&&item.id==="mr-news-pro")?"Coming Soon":"Live Now") as StoreProject["availability"],
      projectType:item.projectType||"WordPress Plugin",
      image:item.image||"",imageName:item.imageName||"",
    })).sort((a,b)=>a.order-b.order);
  }catch{return seedProjects}
}
export function saveProjects(projects:StoreProject[]){
  localStorage.setItem(PROJECT_STORAGE_KEY,JSON.stringify(projects.map((project,index)=>({...project,order:index+1}))));
  window.dispatchEvent(new Event("mr-projects-updated"));
}
export function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
