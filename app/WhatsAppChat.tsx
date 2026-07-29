"use client";

import { useEffect, useState } from "react";

const topics = [
  ["Product purchase", "I need help choosing or purchasing a product."],
  ["Website service", "I would like to discuss a website service."],
  ["Activation help", "I need help with product activation."],
  ["Order / payment", "I need help with an order or payment."],
];

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(topics[0][1]);
  const [path, setPath] = useState("");

  useEffect(() => setPath(window.location.pathname), []);
  if (!path || path.startsWith("/admin") || path.startsWith("/account")) return null;

  const pageContext = path.includes("/products/") ? " I am viewing the product details page." : path === "/products" ? " I am viewing the products page." : "";
  const url = `https://wa.me/8801977024868?text=${encodeURIComponent(`Hello Mehedi Rahat, ${topic}${pageContext}`)}`;

  return <div className={`whatsapp-chat ${open ? "open" : ""}`}>
    {open && <section className="whatsapp-panel" aria-label="WhatsApp support">
      <header><span>MR</span><div><b>WhatsApp Support</b><small><i /> Usually replies quickly</small></div><button onClick={() => setOpen(false)} aria-label="Close WhatsApp chat">×</button></header>
      <div className="whatsapp-copy"><span>Hi there 👋</span><strong>How can we help you today?</strong><p>Select a topic and start a direct WhatsApp conversation.</p></div>
      <div className="whatsapp-topics">{topics.map(([label, message]) => <button className={topic === message ? "active" : ""} onClick={() => setTopic(message)} key={label}><i>›</i>{label}</button>)}</div>
      <a href={url} target="_blank" rel="noreferrer">Start WhatsApp Chat <span>↗</span></a>
      <small className="whatsapp-hours">Available daily · 10:00 AM–11:59 PM</small>
    </section>}
    <button className="whatsapp-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close WhatsApp support" : "Chat on WhatsApp"}>
      {open ? "×" : <><b>☎</b><span>Need help?</span></>}
    </button>
  </div>;
}
