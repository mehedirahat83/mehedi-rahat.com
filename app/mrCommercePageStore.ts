import { mergeWithArrayDefaults } from "./storeUtils";

export type MrCommercePageSettings={
  heroEyebrow:string;heroTitle:string;heroHighlight:string;heroDescription:string;
  primaryLabel:string;primaryUrl:string;secondaryLabel:string;secondaryUrl:string;
  stats:{value:string;label:string}[];
  videoEyebrow:string;videoTitle:string;videoDescription:string;videoUrl:string;videoProofs:string[];
  overviewEyebrow:string;overviewTitle:string;overviewHighlight:string;overviewDescription:string;
  overviewCards:{number:string;title:string;description:string}[];
  featuresEyebrow:string;featuresTitle:string;featuresHighlight:string;
  featureGroups:{number:string;label:string;title:string;text:string;points:string[];image:string}[];
  capabilitiesEyebrow:string;capabilitiesTitle:string;capabilitiesHighlight:string;
  capabilityGroups:{title:string;items:string[]}[];
  workflowEyebrow:string;workflowTitle:string;workflowHighlight:string;
  workflowSteps:{number:string;title:string;description:string}[];
  pricingEyebrow:string;pricingTitle:string;pricingHighlight:string;
  freeTitle:string;freePrice:string;freePriceNote:string;freeDescription:string;freeFeatures:string[];
  freeValueTitle:string;freeValueDescription:string;freeBenefits:string[];freeButtonLabel:string;freeDownloadUrl:string;
  proTitle:string;proPrice:number;proRegularPrice:string;proDescription:string;proFeatures:string[];
  proButtonLabel:string;launchBadge:string;launchLimit:number;
};
export const seedMrCommercePageSettings:MrCommercePageSettings={
  heroEyebrow:"MR Exclusive · WooCommerce Plugin",heroTitle:"WooCommerce store with",heroHighlight:"one practical toolkit.",
  heroDescription:"MR Commerce Pro combines safer orders, Bangladesh payments and shipping, growth tools, inventory control and customer operations—without building your workflow from dozens of separate plugins.",
  primaryLabel:"View Plans",primaryUrl:"#pricing",secondaryLabel:"Explore Features",secondaryUrl:"#features",
  stats:[{value:"30+",label:"Commerce capabilities"},{value:"64",label:"District-ready shipping"},{value:"1",label:"Unified workflow"}],
  videoEyebrow:"Product walkthrough",videoTitle:"See MR Commerce Pro in action",videoDescription:"Your complete plugin video will appear here.",videoUrl:"",videoProofs:["Fraud protection","Payments","Growth"],
  overviewEyebrow:"Why MR Commerce Pro",overviewTitle:"One system for the work that",overviewHighlight:"happens after install.",overviewDescription:"Activate only the modules your store needs and keep everyday commerce work clear.",
  overviewCards:[{number:"01",title:"Protect revenue",description:"Spot risky orders and review local payment evidence before fulfilment."},{number:"02",title:"Sell more",description:"Use conversion tools that increase cart value without complicating the buying experience."},{number:"03",title:"Operate faster",description:"Keep fulfilment, stock, customers, support and reports connected."}],
  featuresEyebrow:"Core capabilities",featuresTitle:"Built around real",featuresHighlight:"store operations.",
  featureGroups:[
    {number:"01",label:"Safer orders",title:"Fraud checking built for Bangladesh.",text:"Validate phone details, detect repeat customer information and review a clear 0–100 risk score before fulfilling an order.",points:["Phone and email checks","Low to Critical risk levels","High-risk orders can be held","Repeat customer detection","Clear 0–100 risk score","Order evidence at a glance"],image:""},
    {number:"02",label:"Manual payments",title:"Verify local payments without a messy workflow.",text:"Collect the sender number and transaction ID for bKash, Nagad, Rocket, Upay or bank transfer, then verify every payment from one place.",points:["Unlimited Pro gateways","Cash-out charge support","Pending to Verified workflow","Sender number collection","Transaction ID records","Bank transfer support"],image:""},
    {number:"03",label:"Bangladesh delivery",title:"Shipping rules that match real local operations.",text:"Configure district, area, weight, quantity and cart-value rates, then manage delivery slots, courier assignment and fulfilment status.",points:["All 64 districts","Flexible delivery rules","Courier-ready order flow","Area-based shipping rates","Weight and quantity rules","Delivery slot management"],image:""},
    {number:"04",label:"Growth tools",title:"More ways to increase every order.",text:"Create quantity discounts, BOGO offers, product bundles, order bumps, frequently bought together offers and automatic coupons.",points:["Smart discounts and bundles","Side cart and progress bar","Wishlist, compare and quick view","BOGO and quantity offers","Frequently bought together","Order bumps and auto coupons"],image:""}
  ],
  capabilitiesEyebrow:"More inside the plugin",capabilitiesTitle:"A complete commerce",capabilitiesHighlight:"foundation.",
  capabilityGroups:[{title:"Store growth",items:["Quantity discounts","BOGO offers","Bundles","Order bumps","Auto coupons"]},{title:"Order operations",items:["Packing status","Shipping labels","Returns","Restock flow","Sequential order IDs"]},{title:"Customer experience",items:["Membership rewards","Side cart","Product swatches","Recently viewed","Customer dashboard"]},{title:"Business control",items:["Stock dashboard","Low-stock alerts","Supplier records","Cost and margin reports","Recovery campaigns"]}],
  workflowEyebrow:"A clearer workflow",workflowTitle:"From checkout to",workflowHighlight:"completed order.",
  workflowSteps:[{number:"01",title:"Customer orders",description:"Capture the right delivery and payment information."},{number:"02",title:"Review risk",description:"Check fraud signals and manual payment evidence."},{number:"03",title:"Process safely",description:"Pack, ship and update the order with clear statuses."},{number:"04",title:"Grow retention",description:"Use membership, review and recovery tools after purchase."}],
  pricingEyebrow:"Free and Pro",pricingTitle:"Start free, Upgrade",pricingHighlight:"when needs more.",
  freeTitle:"MR Commerce Free",freePrice:"৳0",freePriceNote:"Forever",freeDescription:"Essential tools for trying the MR Commerce workflow on a growing store.",
  freeFeatures:["Core store utility modules","Bangladesh-ready workflow","Simple admin controls","Community-level updates"],
  freeValueTitle:"Start without risk",freeValueDescription:"A practical way to experience the MR Commerce workflow.",freeBenefits:["Free forever","No card required","Upgrade anytime"],freeButtonLabel:"Download Free",freeDownloadUrl:"/downloads/MR-Commerce-Free-v2.14.15.zip",
  proTitle:"MR Commerce Pro",proPrice:3000,proRegularPrice:"৳5,000",proDescription:"Complete access to the advanced commerce, operations, payment and growth toolkit.",
  proFeatures:["All advanced modules","Unlimited manual payment gateways","Fraud, shipping and fulfilment tools","Growth, inventory and reporting suite","Direct priority support","Lifetime license and updates"],
  proButtonLabel:"Get Pro",launchBadge:"Launching offer · First 20 customers",launchLimit:20
};
const key="mr-commerce-page-settings";
export function loadMrCommercePageSettings():MrCommercePageSettings{
  if(typeof window==="undefined")return seedMrCommercePageSettings;
  try{
    const saved=JSON.parse(localStorage.getItem(key)||"{}") as Partial<MrCommercePageSettings>;
    const merged=mergeWithArrayDefaults(seedMrCommercePageSettings,saved,["stats","videoProofs","overviewCards","featureGroups","capabilityGroups","workflowSteps","freeFeatures","freeBenefits","proFeatures"] as const);
    if(!String(merged.freeDownloadUrl||"").trim())merged.freeDownloadUrl=seedMrCommercePageSettings.freeDownloadUrl;
    return merged;
  }catch{return seedMrCommercePageSettings}
}
export function saveMrCommercePageSettings(settings:MrCommercePageSettings){localStorage.setItem(key,JSON.stringify(settings));window.dispatchEvent(new Event("mr-commerce-page-updated"))}
