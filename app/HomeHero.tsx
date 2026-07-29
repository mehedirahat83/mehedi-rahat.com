"use client";
import {useEffect,useState} from "react";
import {loadHomepageSettings,seedHomepageSettings} from "./homepageStore";

function Arrow(){return <span aria-hidden="true">↗</span>}
export default function HomeHero(){
  const[settings,setSettings]=useState(seedHomepageSettings);
  useEffect(()=>{const sync=()=>setSettings(loadHomepageSettings());sync();window.addEventListener("mr-homepage-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-homepage-updated",sync);window.removeEventListener("storage",sync)}},[]);
  return <section className="hero"><div className="shell hero-grid">
    <div className="hero-copy">
      <span className="eyebrow">{settings.heroEyebrow}</span>
      <h1><span className="hero-line">{settings.heroLine1}</span><span className="hero-line">{settings.heroLine2} <em>{settings.heroLine2Highlight}</em></span><span className="hero-line"><em>{settings.heroLine3Highlight}</em></span></h1>
      <p><strong>Mehedi Rahat</strong> {settings.heroDescription}</p>
      <div className="hero-actions"><a className="button primary" href={settings.primaryUrl}>{settings.primaryLabel} <Arrow/></a><a className="button secondary" href={settings.secondaryUrl}>{settings.secondaryLabel}</a></div>
      <div className="trust-row">{settings.stats.slice(0,3).map((item,index)=><span key={index}><b>{item.value}</b> {item.label}</span>)}</div>
    </div>
    <div className="hero-visual" aria-label="Mehedi Rahat digital solutions">
      <div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/>
      <div className="hero-message-card"><span className="message-kicker">{settings.heroCardEyebrow}</span><h2>{settings.heroCardTitle}<br/><em>{settings.heroCardHighlight}</em></h2><div className="solution-list">
        {settings.heroCardItems.slice(0,3).map((item,index)=><a href={item.url} key={index}><span>{String(index+1).padStart(2,"0")}</span><div><b>{item.title}</b><small>{item.description}</small></div><i>↗</i></a>)}
      </div><div className="message-proof">{settings.heroProofs.slice(0,2).map((item,index)=><span key={index}><b>{item.value}</b><small>{item.label}</small></span>)}</div></div>
      <div className="float-card float-member"><span>MR</span><p><small>Built personally by</small><b>Full-stack developer</b></p></div><div className="float-card float-speed"><b>4.9/5</b><small>Client rating</small></div>
    </div>
  </div></section>
}
