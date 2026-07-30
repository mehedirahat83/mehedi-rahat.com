"use client";
import { FormEvent,useEffect,useState } from "react";
import SiteFooter from "../SiteFooter";
import MainHeader from "../MainHeader";
import { decodePackageFeatures,loadCategoryPackageFeatures,loadThemeFaq,loadThemes,ReadyTheme } from "../themeStore";

function Arrow(){return <span aria-hidden="true">↗</span>}

type ThemeReview={name:string;text:string;rating:number};
type CartItem={id:string;name:string;category:string;variation:string;price:number;quantity:number};
const defaultThemeReviews:ThemeReview[]=[
  {name:"Rifat Arannya",text:"Clean design, responsive layout and a very smooth setup experience.",rating:5},
  {name:"Maruf Ahmed",text:"The theme was easy to customize and the support was genuinely helpful.",rating:5},
  {name:"Shafiul Islam",text:"Fast, professional and ready for real business use.",rating:5},
];

export default function ThemeDetailsPage(){
  const [theme,setTheme]=useState<ReadyTheme|null>(null),[themes,setThemes]=useState<ReadyTheme[]>([]),[pack,setPack]=useState(0),[added,setAdded]=useState(false);
  const [themeReviews,setThemeReviews]=useState<ThemeReview[]>(defaultThemeReviews),[reviewOpen,setReviewOpen]=useState(false),[reviewSaved,setReviewSaved]=useState(false);
  useEffect(()=>{
    const id=new URLSearchParams(location.search).get("id"),all=loadThemes().filter(item=>item.status==="Published");
    setThemes(all);setTheme(all.find(item=>item.id===id)||null);
    if(id)try{const saved=JSON.parse(localStorage.getItem(`mr-theme-reviews-${id}`)||"null");if(Array.isArray(saved))setThemeReviews(saved)}catch{}
  },[]);
  if(!theme)return <main><div className="success-page"><div className="success-card"><h1>Theme not found.</h1><p>This theme may be unpublished or removed.</p><a className="button primary" href="/themes">Browse ready themes</a></div></div></main>;
  const themeId=theme.id;
  const themeName=theme.name;
  const packageFeatures=theme.packageFeatureMode==="custom"&&theme.packageFeatures?decodePackageFeatures(theme.packageFeatures):loadCategoryPackageFeatures(theme.category);
  const packages=[
    {label:"Pack 01",name:"Theme Setup",price:theme.price,extras:packageFeatures.map(row=>({label:row[0],included:row[1]}))},
    {label:"Pack 02",name:"Theme + SEO + Speed",price:Math.ceil(theme.price*1.45/500)*500,extras:packageFeatures.map(row=>({label:row[0],included:row[2]}))},
    {label:"Pack 03",name:"Theme + Domain + Hosting",price:Math.ceil(theme.price*1.9/500)*500,extras:packageFeatures.map(row=>({label:row[0],included:row[3]}))},
  ];
  const selected=packages[pack],related=themes.filter(item=>item.id!==themeId).slice(0,5);
  const faqs=loadThemeFaq().split("\n").filter(Boolean).map(row=>{const at=row.indexOf("|");return at<0?[row,"Please contact support for details."]:[row.slice(0,at),row.slice(at+1)]});
  const themeInformation=(theme.information||`CMS|WordPress\nBuilder|Elementor\nReady pages|${theme.pages}\nResponsive|Included\nSpeed ready|Included\nSEO structure|Included`).split("\n").filter(Boolean).map(row=>{const at=row.indexOf("|");return at<0?[row,""]:[row.slice(0,at),row.slice(at+1)]});
  function add(){
    const cart=JSON.parse(localStorage.getItem("mr-cart")||"[]") as CartItem[],id=`theme-${themeId}-${selected.label}`;
    const exists=cart.find(item=>item.id===id);
    if(exists)exists.quantity++;else cart.push({id,name:themeName,category:"Ready Theme",variation:selected.label,price:selected.price,quantity:1});
    localStorage.setItem("mr-cart",JSON.stringify(cart));setAdded(true);
  }
  function submitReview(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget),next=[{name:String(form.get("name")||"Customer"),text:String(form.get("review")||""),rating:Number(form.get("rating")||5)},...themeReviews];
    setThemeReviews(next);localStorage.setItem(`mr-theme-reviews-${themeId}`,JSON.stringify(next));event.currentTarget.reset();setReviewOpen(false);setReviewSaved(true);setTimeout(()=>setReviewSaved(false),2200);
  }
  return <main>
    <MainHeader active="themes"/>
    <div className="product-breadcrumb"><div className="shell"><a href="/">Home</a><span>›</span><a href="/themes">Ready Themes</a><span>›</span><b>{theme.name}</b></div></div>

    <section className="section theme-detail-hero"><div className="shell theme-detail-top">
      <div className="theme-preview-card"><div className="theme-preview-art">{theme.detailImage?<img src={theme.detailImage} alt={theme.name}/>:<div className="theme-large-browser"><div/><span/><h2>{theme.name}</h2><p>{theme.category}</p><section><i/><i/><i/></section></div>}<div className="theme-preview-badges" aria-hidden="true"><span>Responsive preview</span><strong>{theme.pages} ready pages</strong></div></div><div className="theme-preview-actions"><a className="theme-live-demo" href={theme.demo||"#theme-content"} target={theme.demo?"_blank":undefined}>Live Demo <Arrow/></a><a href="#theme-faq">FAQ</a><a href="#packages">Pack Details</a></div></div>
      <aside className="theme-buy-card"><span className="product-category">{theme.category}</span><h1>{theme.name}</h1><div className="detail-rating"><span>★★★★★</span><strong>{theme.rating.toFixed(1)}</strong><small>{theme.reviewCount} verified customer reviews</small></div><div className="theme-buy-features">{theme.features.split("\n").filter(Boolean).slice(0,4).map((item,index)=><span key={item}><i>{index+1}</i><b>{item}</b></span>)}</div><div className="theme-pack-selector">{packages.map((item,index)=><button className={pack===index?"active":""} onClick={()=>{setPack(index);setAdded(false)}} key={item.label}>{item.label}</button>)}</div><div className="theme-purchase-row"><div><small>Selected package</small><strong>৳ {selected.price.toLocaleString("en-US")}</strong></div><span>{selected.label}</span></div><button className={`theme-add-cart ${added?"added":""}`} onClick={add}>{added?"Added to Cart ✓":"Add to Cart"}</button></aside>
    </div></section>

    <section className="section theme-detail-content" id="theme-content"><div className="shell theme-product-content-grid">
      <article className="product-description-card theme-product-description"><span className="eyebrow">Theme description</span><h2>{theme.name}</h2><div className="product-rich-description" dangerouslySetInnerHTML={{__html:theme.description}}/><div className="description-points">{theme.features.split("\n").filter(Boolean).map(item=><span key={item}>{item}</span>)}</div><div className="theme-description-note"><b>Built for real business use.</b><p>This theme gives your {theme.category.toLowerCase()} website a strong visual foundation while keeping content, colors and essential sections easy to customize.</p></div></article>
      <aside className="product-review-card theme-product-info" id="theme-info"><div className="theme-info-heading"><span className="eyebrow">Theme information</span><h2>What you receive.</h2></div><div className="theme-info-premium">{themeInformation.map((row,index)=><div key={`${row[0]}-${index}`}><span>{row[0]}</span><b>{row[1]}</b></div>)}</div><div className="theme-review-panel"><div className="theme-review-head"><div><span>Customer reviews</span><b>{theme.rating.toFixed(1)} / 5</b></div><button type="button" onClick={()=>setReviewOpen(value=>!value)}>Write a review</button></div><div className="theme-review-list">{themeReviews.slice(0,3).map((review,index)=><article key={`${review.name}-${index}`}><div><b>{review.name}</b><span>{"★".repeat(review.rating)}</span></div><p>{review.text}</p><small>Verified customer</small></article>)}</div>{reviewOpen&&<form className="theme-review-form" onSubmit={submitReview}><div><input name="name" required placeholder="Your name"/><select name="rating" defaultValue="5" aria-label="Rating"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></div><textarea name="review" required placeholder="Write your review"/><div className="theme-review-actions"><button type="submit">Submit review</button><button type="button" onClick={()=>setReviewOpen(false)}>Cancel</button></div></form>}{reviewSaved&&<small className="theme-review-success">✓ Your review has been added.</small>}</div><div className="theme-support-box"><span>Direct setup support</span><b>From selection to launch.</b><p>Choose your package and get clear guidance throughout the setup process.</p><a href="/#support">Discuss this theme <Arrow/></a></div></aside>
    </div></section>

    <section className="section theme-related-section"><div className="shell"><div className="theme-related-heading"><div><span className="eyebrow">Explore more designs</span><h2>You may also like.</h2></div><a href="/themes">View all themes <Arrow/></a></div><div className="theme-related-grid">{related.slice(0,4).map(item=><a href={`/theme?id=${item.id}`} key={item.id}><i>{item.name.charAt(0)}</i><span><b>{item.name}</b><small>{item.category} · {item.pages} pages</small></span><strong>৳ {item.price.toLocaleString("en-US")}</strong><Arrow/></a>)}</div></div></section>

    <section className="section theme-packages-section" id="packages"><div className="shell"><div className="theme-section-heading"><span className="eyebrow">Choose your package</span><h2>Start with the support level you need.</h2></div><div className="theme-package-grid">{packages.map((item,index)=><article className={index===1?"popular":""} key={item.label}>{index===1&&<em className="package-popular-badge">Most Popular</em>}<span>{item.label}</span><h3>{item.name}</h3><strong>৳ {item.price.toLocaleString("en-US")}</strong><ul>{item.extras.map(extra=><li className={extra.included?"included":"unavailable"} key={extra.label}>{extra.label}</li>)}</ul><button onClick={()=>{setPack(index);setAdded(false);window.scrollTo({top:0,behavior:"smooth"})}}>Choose {item.label}</button></article>)}</div></div></section>

    <section className="section product-faq-section" id="theme-faq"><div className="shell product-faq-grid"><div><span className="eyebrow">Ready Theme FAQ</span><h2>Everything before you choose.</h2><p>These answers are managed separately from Product FAQ.</p></div><div className="product-faq-list">{faqs.map((item,index)=><details open={index===0} key={item[0]}><summary>{item[0]}<span>+</span></summary><p>{item[1]}</p></details>)}</div></div></section>
    <SiteFooter/>
  </main>
}
