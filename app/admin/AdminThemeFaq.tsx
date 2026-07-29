"use client";
import { useEffect,useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminFaqEditor from "./AdminFaqEditor";
import { loadThemeFaq,saveThemeFaq } from "../themeStore";

export default function AdminThemeFaq(){
  const [faq,setFaq]=useState(""),[notice,setNotice]=useState("");
  useEffect(()=>setFaq(loadThemeFaq()),[]);
  return <main className="admin-root"><AdminSidebar active="themes"/><section className="admin-workspace"><header className="admin-topbar"><label><span>⌕</span><input placeholder="Search ready themes..." /></label><div><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>
    <div className="admin-page-title"><div><span className="eyebrow">Ready theme content</span><h1>Ready Theme FAQ</h1><p>One shared FAQ for every Ready Theme Details page.</p></div><a className="admin-export" href="/admin">Back to dashboard →</a></div>
    {notice&&<p className="product-tool-notice">✓ {notice}</p>}
    <section className="admin-card product-tool-editor"><div className="tool-card-head"><div><h2>Global Ready Theme FAQ</h2><p>This content is completely separate from Product FAQ.</p></div><span className="theme-faq-badge">Ready Themes only</span></div>
      <AdminFaqEditor value={faq} onChange={setFaq} saveLabel="Save Ready Theme FAQ" onSave={()=>{saveThemeFaq(faq);setNotice("Ready Theme FAQ saved separately.")}}/>
    </section>
  </section></main>
}
