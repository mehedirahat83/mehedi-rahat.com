export type ProductVariation = { label: string; price: number };
export type ProductInformation = { label: string; value: string };
export type StoreProduct = {
  id: string;
  name: string;
  category: string;
  license: "One Year" | "Lifetime";
  status: "Published" | "Draft";
  price: number;
  variations: ProductVariation[];
  description: string;
  features: string;
  faq: string;
  demo: string;
  activationType: string;
  rating: number;
  reviewCount: number;
  information: ProductInformation[];
  image?: string;
  imageName?: string;
  download?: string;
  downloadName?: string;
};

export const PRODUCT_STORAGE_KEY = "mr-admin-products";
export const CATEGORY_STORAGE_KEY = "mr-product-categories";
export const PRODUCT_FAQ_STORAGE_KEY = "mr-global-product-faq";
export const defaultProductFaq="Will I receive a license key?|No. Products use the activation or delivery method shown on the Product Details page.\nHow quickly will my order be processed?|Most orders are processed within 30 minutes during regular support hours.\nWill I receive updates?|Update coverage follows the license duration shown for the product.\nCan I get help after purchase?|Yes. You can submit a Support Ticket or Activation Request from your Customer Dashboard.";

const seedRows = [
  ["elementor-pro","Elementor Pro","Page Builder","One Year",300],
  ["crocoblock","Crocoblock","Dynamic Toolkit","Lifetime",600],
  ["astra-pro-essential","Astra Pro Essential","Theme Bundle","Lifetime",600],
  ["rank-math-pro","Rank Math Pro","SEO Toolkit","One Year",500],
  ["tutor-lms-pro","Tutor LMS Pro","Learning Platform","Lifetime",500],
  ["wp-rocket","WP Rocket","Speed Toolkit","One Year",400],
  ["fluent-forms-pro","Fluent Forms Pro","Form Builder","Lifetime",450],
  ["essential-addons","Essential Addons","Elementor Addons","Lifetime",350],
  ["cartflows-pro","CartFlows Pro","Sales Funnel","One Year",500],
  ["wp-social-ninja-pro","WP Social Ninja Pro","Social Toolkit","Lifetime",450],
  ["divi-theme","Divi Theme","Theme Bundle","One Year",550],
  ["learndash-lms","LearnDash LMS","Learning Platform","One Year",700],
  ["wpforms-pro","WPForms Pro","Form Builder","One Year",450],
  ["perfmatters","Perfmatters","Speed Toolkit","One Year",400],
  ["yoast-seo-premium","Yoast SEO Premium","SEO Toolkit","One Year",450],
] as const;

export const seedProducts: StoreProduct[] = seedRows.map(([id,name,category,license,price]) => ({
  id,name,category,license,status:"Published",price,
  variations:[{label:"01 Site",price},{label:"05 Sites",price:Math.ceil(price*1.5/50)*50},{label:"10 Sites",price:price*2}],
  description:`${name} provides dependable premium features, assisted activation and direct support for your WordPress website.`,
  features:"Official premium product\nFast assisted activation\nReliable product updates\nDirect expert support",
  faq:"Will I receive a license key?|No. This product includes assisted activation using our licensed access.\nHow quickly will it be activated?|Most activations are completed within 30 minutes during support hours.",
  demo:"",activationType:"Assisted activation",rating:4.9,reviewCount:5,
  information:[{label:"Official Tool",value:"Yes"},{label:"Activation Process",value:"Assisted activation"},{label:"Auto Update",value:license},{label:"Delivery",value:"30 Minutes Max"},{label:"Download file",value:"After order approval"}],
}));

export function loadProducts(): StoreProduct[] {
  if (typeof window === "undefined") return seedProducts;
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || "null");
    if (!Array.isArray(stored)) return seedProducts;
    return stored.map((item: Partial<StoreProduct>) => ({
      description:"",features:"",faq:"",demo:"",activationType:"Assisted activation",rating:4.9,reviewCount:5,
      ...item,
      id:item.id || slugify(item.name || "product"),
      variations:item.variations?.length ? item.variations : [{label:"01 Site",price:Number(item.price || 0)}],
      price:Number(item.variations?.[0]?.price ?? item.price ?? 0),
      information:item.information?.length?item.information:[
        {label:"Official Tool",value:"Yes"},
        {label:"Activation Process",value:item.activationType||"Assisted activation"},
        {label:"Auto Update",value:item.license||"One Year"},
        {label:"Delivery",value:"30 Minutes Max"},
        {label:"Download file",value:item.downloadName||"After order approval"},
      ],
    })) as StoreProduct[];
  } catch { return seedProducts; }
}

export function saveProducts(products: StoreProduct[]) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("mr-products-updated"));
}

export function loadCategories(products: StoreProduct[] = loadProducts()) {
  const used=products.map(x=>x.category);
  if(typeof window==="undefined")return Array.from(new Set(used));
  try {
    const stored=JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)||"[]");
    return Array.from(new Set([...(Array.isArray(stored)?stored:[]),...used])).filter(Boolean) as string[];
  } catch{return Array.from(new Set(used))}
}

export function saveCategories(categories:string[]){
  localStorage.setItem(CATEGORY_STORAGE_KEY,JSON.stringify(Array.from(new Set(categories.filter(Boolean)))));
}

export function loadProductFaq(){
  if(typeof window==="undefined")return defaultProductFaq;
  return localStorage.getItem(PRODUCT_FAQ_STORAGE_KEY)||defaultProductFaq;
}

export function saveProductFaq(faq:string){
  localStorage.setItem(PRODUCT_FAQ_STORAGE_KEY,faq);
  window.dispatchEvent(new Event("mr-product-faq-updated"));
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
