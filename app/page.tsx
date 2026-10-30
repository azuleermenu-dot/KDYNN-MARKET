"use client";

import DesignCustomizer from "./DesignCustomizer";

import { useState } from "react";
import { ArrowRight, Clock3, MapPin, Menu, MessageCircle, Phone, Search, ShoppingBasket, Store, X } from "lucide-react";

const categories = [
  { icon: "🥬", title: "Fresh Produce", text: "Vegetables, herbs and fruits for everyday cooking." },
  { icon: "🍗", title: "Meat & Poultry", text: "Fresh kitchen staples from trusted local sellers." },
  { icon: "🐟", title: "Seafood", text: "Fresh catches and dried fish favorites." },
  { icon: "🍚", title: "Rice & Groceries", text: "Rice, pantry essentials and household needs." },
  { icon: "☪", title: "Halal Goods", text: "Community-focused halal products and essentials." },
  { icon: "📱", title: "Phone Services", text: "Repairs, accessories, chargers and device help." },
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);
  const filtered = categories.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(query.toLowerCase()));

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`KDYNN Market inquiry — ${data.get("subject")}`);
    const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\n\n${data.get("message")}`);
    window.location.href = `mailto:azuleermenu@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <main>
      <header className="nav"><a className="brand" href="#top">KDYNN<span>MARKET</span></a><nav className={open ? "navlinks open" : "navlinks"}><a href="#market" onClick={() => setOpen(false)}>Market</a><a href="#offerings" onClick={() => setOpen(false)}>Offerings</a><a href="#visit" onClick={() => setOpen(false)}>Visit</a><a href="#contact" onClick={() => setOpen(false)}>Contact</a></nav><button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button><a className="nav-cta" href="#contact">Get in touch <ArrowRight size={16}/></a></header>

      <section className="hero" id="top">
        <div className="hero-bg" />
        <div className="hero-content"><p className="eyebrow"><span /> COMMUNITY MARKET · SJDM, BULACAN</p><h1>Good food.<br/><em>Good people.</em><br/>Good market.</h1><p className="hero-copy">KDYNN Market brings fresh produce, daily essentials, halal goods and neighborhood services together in one convenient stop.</p><div className="hero-actions"><a className="button light" href="#offerings">Explore the market <ArrowRight size={18}/></a><a className="text-link" href="#visit">Find us <MapPin size={16}/></a></div></div>
        <div className="hero-note"><strong>227 Del Monte – Norzagaray Rd</strong><span>San Jose del Monte, Bulacan</span></div>
      </section>

      <section className="intro" id="market"><div className="section-kicker">01 / THE MARKET</div><div className="intro-grid"><h2>Your everyday<br/><span>market, reimagined.</span></h2><div><p className="lead">From the morning grocery run to a quick phone repair, KDYNN Market is built around the things the community actually needs.</p><p>Shop fresh, discover local sellers and get your essentials without making the trip complicated.</p></div></div><div className="stats"><div><b>50+</b><span>Active vendors</span></div><div><b>Daily</b><span>Fresh deliveries</span></div><div><b>5AM–8PM</b><span>Open every day</span></div></div></section>

      <section className="offerings" id="offerings"><div className="section-head"><div><div className="section-kicker">02 / WHAT'S HERE</div><h2>Shop by need.</h2></div><div className="search"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search offerings" /></div></div><div className="category-grid">{filtered.map((item, i) => <article className="category" key={item.title}><span className="number">0{i + 1}</span><div className="category-icon">{item.icon}</div><h3>{item.title}</h3><p>{item.text}</p><span className="circle-arrow"><ArrowRight size={17}/></span></article>)}</div></section>

      <section className="feature"><div className="feature-image"/><div className="feature-copy"><div className="section-kicker">03 / COMMUNITY</div><h2>More than a place to shop.</h2><p>KDYNN Market is a neighborhood stop where independent sellers, fresh food and practical services meet. Come for what you need. Stay for what you discover.</p><a className="button dark" href="#contact">Ask about the market <ArrowRight size={17}/></a></div></section>

      <section className="visit" id="visit"><div className="section-kicker">04 / COME BY</div><div className="visit-grid"><div><h2>See you<br/><em>at the market.</em></h2><div className="details"><div><MapPin/><span><b>Address</b>227 Del Monte – Norzagaray Rd<br/>San Jose del Monte, Bulacan</span></div><div><Clock3/><span><b>Hours</b>Monday – Sunday · 5:00 AM – 8:00 PM</span></div><div><Phone/><span><b>Phone</b>0974 344 62</span></div></div><a className="button dark" href="https://maps.app.goo.gl/zTDA1ME7iVNo7U3e9" target="_blank" rel="noreferrer">Open in Google Maps <ArrowRight size={17}/></a></div><div className="map-card"><div className="map-overlay"><MapPin size={24}/><strong>KDYNN Market</strong><span>227 Del Monte – Norzagaray Rd</span></div><div className="map-grid"/></div></div></section>

      <section className="contact" id="contact"><div className="section-kicker">05 / CONTACT</div><div className="contact-grid"><div><h2>Have a question?<br/><em>Let's talk.</em></h2><p>For vendor inquiries, bulk orders, phone services or general questions, send us a message.</p><div className="contact-email"><MessageCircle size={19}/><span>azuleermenu@gmail.com</span></div></div><form onSubmit={submit}><div className="form-row"><label>Name<input name="name" required placeholder="Your name"/></label><label>Email<input name="email" type="email" required placeholder="you@email.com"/></label></div><div className="form-row"><label>Phone<input name="phone" placeholder="Your phone number"/></label><label>Subject<select name="subject" defaultValue="General Question"><option>General Question</option><option>Vendor Space</option><option>Wholesale / Bulk Order</option><option>Phone Repair / Tech Service</option></select></label></div><label>Message<textarea name="message" required rows={5} placeholder="How can we help?"/></label><button className="button dark submit" type="submit">Send inquiry <ArrowRight size={17}/></button>{sent && <p className="sent">Your email app should open with the inquiry ready to send.</p>}</form></div></section>

      <footer><a className="brand" href="#top">KDYNN<span>MARKET</span></a><p>Fresh goods · Local sellers · Community</p><small>© {new Date().getFullYear()} KDYNN Market. All rights reserved.</small></footer>
    <DesignCustomizer />
    </main>
  );
}