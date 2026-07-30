export type ContactChannel={icon:string;label:string;value:string;href:string;note:string};
export type ContactStep={title:string;description:string};
export type ContactPageSettings={
 heroVisible:boolean;contactVisible:boolean;heroEyebrow:string;heroLines:string[];heroDescription:string;
 primaryButtonLabel:string;primaryButtonLink:string;secondaryButtonLabel:string;secondaryButtonLink:string;
 cardEyebrow:string;cardLines:string[];responseTime:string;responseLabel:string;trustPoints:string[];
 contactEyebrow:string;contactHeading:string;contactDescription:string;channels:ContactChannel[];
 processVisible:boolean;processEyebrow:string;processHeading:string;processSteps:ContactStep[];processFooter:string[];
 formEyebrow:string;formHeading:string;formDescription:string;nameLabel:string;contactLabel?:string;
 emailLabel:string;emailPlaceholder:string;mobileLabel:string;mobilePlaceholder:string;
 serviceLabel:string;detailsLabel:string;submitLabel:string;successMessage:string;serviceOptions:string[];
};
export const seedContactPageSettings:ContactPageSettings={
 heroVisible:true,contactVisible:true,heroEyebrow:"START A CONVERSATION",
 heroLines:["Let’s turn your idea","into a practical","digital solution."],
 heroDescription:"Tell me what you want to build, improve or fix. You will receive a clear response focused on scope, practical next steps and a solution that fits your business.",
 primaryButtonLabel:"Send your requirement",primaryButtonLink:"#contact-form",
 secondaryButtonLabel:"Chat on WhatsApp",secondaryButtonLink:"https://wa.me/8801977024868",
 cardEyebrow:"DIRECT, PRACTICAL SUPPORT",cardLines:["One conversation.","Clear next steps."],
 responseTime:"Within 24 hours",responseLabel:"Typical response time",
 trustPoints:["Direct expert communication","Clear scope before work","Bangladesh-friendly support"],
 contactEyebrow:"CONTACT DETAILS",contactHeading:"Choose the easiest way to reach me.",
 contactDescription:"No sales team or unnecessary handoff. Your requirement stays clear from the first conversation.",
 channels:[
  {icon:"WA",label:"WhatsApp & Phone",value:"01977 02 48 68",href:"https://wa.me/8801977024868",note:"Fastest for a quick discussion"},
  {icon:"@",label:"Email",value:"contact@mehedirahat.com",href:"mailto:contact@mehedirahat.com",note:"Best for detailed requirements"},
  {icon:"⌖",label:"Location",value:"Bashundhara R/A, Dhaka",href:"https://www.google.com/maps/search/?api=1&query=Bashundhara+R%2FA%2C+Dhaka",note:"Serving clients worldwide"},
  {icon:"◷",label:"Support hours",value:"10:00 AM–11:59 PM",href:"#contact-form",note:"Available every day"}
 ],
 processVisible:true,processEyebrow:"WHAT HAPPENS NEXT",processHeading:"A clear path from enquiry to action.",
 processSteps:[
  {title:"Quick response",description:"I review your message and reply within 24 hours."},
  {title:"Requirement review",description:"We clarify the scope, timeline and the right solution."}
 ],
 processFooter:["Direct communication","No sales handoff"],
 formEyebrow:"PROJECT ENQUIRY",formHeading:"Share your requirement.",
 formDescription:"A short brief is enough to begin. Add your goal, important features, timeline and any useful link.",
 nameLabel:"Your name",contactLabel:"Email or mobile number",
 emailLabel:"Email address",emailPlaceholder:"you@example.com",
 mobileLabel:"Mobile number",mobilePlaceholder:"01XXXXXXXXX",
 serviceLabel:"What do you need?",
 detailsLabel:"Project details",submitLabel:"Send enquiry",successMessage:"Thank you. Your enquiry has been received successfully.",
 serviceOptions:["Website Development","Ready Theme","Premium Tool","WordPress Support","SEO & Speed","Other"]
};
const KEY="mr-contact-page-settings";
export function loadContactPageSettings(){if(typeof window==="undefined")return seedContactPageSettings;try{const saved=JSON.parse(localStorage.getItem(KEY)||"{}");const value={...seedContactPageSettings,...saved} as ContactPageSettings;value.processSteps=value.processSteps.filter(step=>step.title!=="Clear next step"&&step.description!=="You receive a practical recommendation before work begins.");value.processFooter=["Direct communication","No sales handoff"];return value}catch{return seedContactPageSettings}}
export function saveContactPageSettings(value:ContactPageSettings){localStorage.setItem(KEY,JSON.stringify(value));window.dispatchEvent(new Event("mr-contact-page-updated"))}
