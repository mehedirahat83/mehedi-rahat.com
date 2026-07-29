"use client";
import {FormEvent,useEffect,useState} from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";
import {loadContactPageSettings,seedContactPageSettings} from "../contactPageStore";

export default function ContactPage(){
 const[data,setData]=useState(seedContactPageSettings),[submitState,setSubmitState]=useState<"idle"|"submitting"|"success"|"error">("idle");
 useEffect(()=>{const sync=()=>setData(loadContactPageSettings());sync();window.addEventListener("mr-contact-page-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-contact-page-updated",sync);window.removeEventListener("storage",sync)}},[]);
 const submit=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setSubmitState("submitting");const form=event.currentTarget;const payload=Object.fromEntries(new FormData(form).entries());try{const response=await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});if(!response.ok)throw new Error("Submission failed");form.reset();setSubmitState("success")}catch{setSubmitState("error")}};
 return <main><MainHeader active="contact"/>
  {data.heroVisible&&<section className="contact-premium-hero"><div className="shell contact-premium-hero-grid">
   <div className="contact-premium-copy"><span className="eyebrow">{data.heroEyebrow}</span><h1>{data.heroLines.map((line,i)=><span className={i===2?"highlight":""} key={i}>{line}</span>)}</h1><p>{data.heroDescription}</p><div className="contact-hero-actions"><a className="button primary" href={data.primaryButtonLink}>{data.primaryButtonLabel} ↗</a><a className="button secondary" href={data.secondaryButtonLink}>{data.secondaryButtonLabel}</a></div></div>
   <aside className="contact-response-card"><div className="contact-response-head"><div><small>{data.cardEyebrow}</small><h2>{data.cardLines.map((x,i)=><span key={i}>{x}</span>)}</h2></div><i>MR</i></div><div className="contact-response-time"><b>{data.responseTime}</b><span>{data.responseLabel}</span></div><div className="contact-response-points">{data.trustPoints.map((x,i)=><span key={i}><i>✓</i>{x}</span>)}</div><footer><span>15+ years experience</span><span>24+ countries served</span></footer></aside>
  </div></section>}
  {data.contactVisible&&<section className="contact-premium-body" id="contact-form"><div className="shell"><div className="contact-section-heading"><div><span className="eyebrow">{data.contactEyebrow}</span><h2>{data.contactHeading}</h2></div><p>{data.contactDescription}</p></div><div className="contact-premium-grid">
   <div className="contact-left-stack"><div className="contact-channel-grid">{data.channels.map((x,i)=><a href={x.href} key={i}><i>{x.icon}</i><span><small>{x.label}</small><b>{x.value}</b><em>{x.note}</em></span><strong>↗</strong></a>)}</div>
   {data.processVisible&&<aside className="contact-process-card"><div className="contact-process-steps">{data.processSteps.map((step,i)=><article key={i}><i>{String(i+1).padStart(2,"0")}</i><div><b>{step.title}</b><p>{step.description}</p></div></article>)}</div>{data.processFooter.length>0&&<footer>{data.processFooter.map((item,i)=><span key={i}>✓ {item}</span>)}</footer>}</aside>}</div>
   <form className="contact-premium-form" onSubmit={submit}>
    <input className="contact-honeypot" name="companyWebsite" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <header className="contact-form-heading"><span className="eyebrow">{data.formEyebrow}</span><h2>{data.formHeading}</h2><p>{data.formDescription}</p></header>
    <div className="contact-form-fields"><label><span>{data.nameLabel}</span><input name="name" required placeholder="Full name"/></label><label><span>{data.emailLabel}</span><input name="email" type="email" required placeholder={data.emailPlaceholder}/></label><label><span>{data.mobileLabel}</span><input name="mobile" type="tel" required inputMode="tel" placeholder={data.mobilePlaceholder}/></label><label><span>{data.serviceLabel}</span><select name="service">{data.serviceOptions.map(x=><option key={x}>{x}</option>)}</select></label><label className="wide"><span>{data.detailsLabel}</span><textarea name="details" required rows={5} placeholder="Briefly describe your goal, required features and timeline..."/></label></div>
    <div className="contact-form-footer"><button className="button primary" type="submit" disabled={submitState==="submitting"}>{submitState==="submitting"?"Sending...":`${data.submitLabel} ↗`}</button><span>Private & secure · Direct response</span></div>
    <div aria-live="polite">{submitState==="success"&&<p className="contact-success">{data.successMessage}</p>}{submitState==="error"&&<p className="contact-form-error">Sorry, your enquiry could not be sent. Please try again or contact me on WhatsApp.</p>}</div>
   </form>
  </div></div></section>}<SiteFooter/></main>
}
