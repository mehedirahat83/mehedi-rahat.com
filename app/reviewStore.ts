export type StoreReview={
  id:string;name:string;role:string;company:string;quote:string;rating:number;
  status:"Published"|"Draft";order:number;photo?:string;photoName?:string;
};
export const REVIEW_STORAGE_KEY="mr-admin-reviews";
export const seedReviews:StoreReview[]=[
  {id:"arif-hossain",name:"Arif Hossain",role:"Business Owner",company:"",quote:"The whole process was simple and the final website feels much faster. Support was clear whenever we needed help.",rating:5,status:"Published",order:1,photo:"/client-arif-placeholder.webp"},
  {id:"nusrat-jahan",name:"Nusrat Jahan",role:"Digital Marketer",company:"",quote:"I received the product and activation support quickly. The instructions were easy to follow and everything worked.",rating:5,status:"Published",order:2,photo:"/client-nusrat-placeholder.webp"},
  {id:"tanvir-ahmed",name:"Tanvir Ahmed",role:"Agency Founder",company:"",quote:"A dependable person for WordPress and web work. He understands the requirement before suggesting a solution.",rating:5,status:"Published",order:3,photo:"/client-tanvir-placeholder.webp"},
];
export function loadReviews():StoreReview[]{if(typeof window==="undefined")return seedReviews;try{const saved=JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)||"null");return Array.isArray(saved)?saved:seedReviews}catch{return seedReviews}}
export function saveReviews(reviews:StoreReview[]){localStorage.setItem(REVIEW_STORAGE_KEY,JSON.stringify(reviews.map((item,index)=>({...item,order:index+1}))));window.dispatchEvent(new Event("mr-reviews-updated"))}
export function reviewSlug(value:string){return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
