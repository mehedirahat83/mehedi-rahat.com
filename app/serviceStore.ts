export type StoreService = {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: "Published" | "Draft";
  order: number;
  link: string;
  image?: string;
  imageName?: string;
};

export const SERVICE_STORAGE_KEY = "mr-admin-services";

export const seedServices: StoreService[] = [
  {id:"website-development",title:"Website Development",description:"Craft modern, responsive websites that look great and work flawlessly. From stunning designs to smooth functionality.",icon:"code",status:"Published",order:1,link:"#support"},
  {id:"search-engine-optimization",title:"Search Engine Optimization",description:"Help your website rank higher on Google with proven SEO strategies—boosting visibility, traffic, and conversions.",icon:"seo",status:"Published",order:2,link:"#support"},
  {id:"web-speed-optimization",title:"Web Speed Optimization",description:"Optimize your website for faster load times, better performance, and higher user satisfaction—because speed matters.",icon:"speed",status:"Published",order:3,link:"#support"},
  {id:"wordpress-bug-fixing",title:"WordPress Bug Fixing",description:"Quickly fix WordPress bugs, errors, and glitches—so your site runs smoothly and securely without downtime. Safe Process.",icon:"wordpress",status:"Published",order:4,link:"#support"},
  {id:"website-maintenance",title:"Website Maintenance",description:"Ensures your site stays secure, updated, fast, and fully optimized. Security monitoring, bug fixes, and performance.",icon:"support",status:"Published",order:5,link:"#support"},
  {id:"news-site-maintenance",title:"News Site Maintenance",description:"We publish regular daily news, images and live videos. Visitors will get all latest updates to your site as soon as possible.",icon:"news",status:"Published",order:6,link:"#support"},
  {id:"social-media-management",title:"Social Media Management",description:"Our social media management service helps your brand stay active, engaging, and impactful across all major platforms.",icon:"social",status:"Published",order:7,link:"#support"},
  {id:"premium-tools-activation",title:"Premium Tools Activation",description:"We provide WordPress pro tools activation. All original themes, plugins, addons, page builders, form builders and more.",icon:"tools",status:"Published",order:8,link:"#support"},
];

export function loadServices(): StoreService[] {
  if (typeof window === "undefined") return seedServices;
  try {
    const stored=JSON.parse(localStorage.getItem(SERVICE_STORAGE_KEY)||"null");
    if(!Array.isArray(stored))return seedServices;
    return stored.map((item:Partial<StoreService>,index:number)=>({
      id:item.id||slugify(item.title||`service-${index+1}`),
      title:item.title||"Untitled Service",description:item.description||"",icon:item.icon||"code",
      status:(item.status==="Draft"?"Draft":"Published") as StoreService["status"],order:Number(item.order||index+1),
      link:item.link||"#support",image:item.image||"",imageName:item.imageName||"",
    })).sort((a,b)=>a.order-b.order);
  } catch{return seedServices}
}

export function saveServices(services:StoreService[]){
  const normalized=services.map((service,index)=>({...service,order:index+1}));
  localStorage.setItem(SERVICE_STORAGE_KEY,JSON.stringify(normalized));
  window.dispatchEvent(new Event("mr-services-updated"));
}

export function slugify(value:string){
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
