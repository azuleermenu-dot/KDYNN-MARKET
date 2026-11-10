"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import DesignCustomizer from "./DesignCustomizer";
import MarketExplorer from "./MarketExplorer";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Store,
  X,
} from "lucide-react";

const categories = [
  { icon: "🥬", title: "Fresh Produce", text: "Vegetables, herbs and fruits for everyday cooking." },
  { icon: "🍗", title: "Meat & Poultry", text: "Fresh kitchen staples from trusted local sellers." },
  { icon: "🐟", title: "Seafood", text: "Fresh catches and dried fish favorites." },
  { icon: "🍚", title: "Rice & Groceries", text: "Rice, pantry essentials and household needs." },
  { icon: "☪", title: "Halal Goods", text: "Community-focused halal products and essentials." },
  { icon: "📱", title: "Phone Services", text: "Repairs, accessories, chargers and device help." },
];

const pages = [
  { label: "Welcome", hash: "#top" },
  { label: "Overview", hash: "#market" },
  { label: "Pwesto map", hash: "#pwesto" },
  { label: "Categories", hash: "#offerings" },
  { label: "Community", hash: "#community" },
  { label: "Visit", hash: "#visit" },
  { label: "Contact", hash: "#contact" },
];

const hashToPage: Record<string, number> = {
  "#top": 0,
  "#market": 1,
  "#pwesto": 2,
  "#offerings": 3,
  "#community": 4,
  "#visit": 5,
  "#contact": 6,
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const swipeStart = useRef<{ x: number; y: number; pointerId: number; pointerType: string } | null>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);

  const filtered = categories.filter((item) =>
    `${item.title} ${item.text}`.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = useCallback((requestedPage: number, hash?: string) => {
    const nextPage = Math.max(0, Math.min(pages.length - 1, requestedPage));
    setActivePage(nextPage);
    setOpen(false);

    if (typeof window !== "undefined") {
      const nextHash = hash ?? pages[nextPage].hash;
      if (window.location.hash !== nextHash) {
        window.history.pushState({ page: nextPage }, "", nextHash);
      }
    }
  }, []);

  useEffect(() => {
    const initialPage = hashToPage[window.location.hash];
    if (typeof initialPage === "number") setActivePage(initialPage);

    const syncFromHash = () => {
      const nextPage = hashToPage[window.location.hash];
      if (typeof nextPage === "number") setActivePage(nextPage);
    };

    window.addEventListener("popstate", syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("popstate", syncFromHash);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  useEffect(() => {
    const currentPage = pageRefs.current[activePage];
    if (currentPage) currentPage.scrollTop = 0;
  }, [activePage]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (open && event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        navigateTo(activePage + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        navigateTo(activePage - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        navigateTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        navigateTo(pages.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [activePage, navigateTo, open]);

  function beginSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType !== "touch" && event.pointerType !== "mouse")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button, input, textarea, select, label, canvas, [contenteditable='true'], [data-swipe-ignore]")) {
      swipeStart.current = null;
      return;
    }

    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };
  }

  function finishSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const threshold = start.pointerType === "mouse" ? 105 : 58;

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return;
    if (start.pointerType === "mouse" && window.getSelection()?.toString()) return;
    navigateTo(activePage + (deltaX < 0 ? 1 : -1));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`KDYNN Market inquiry — ${data.get("subject")}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:azuleermenu@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  const pageClass = (index: number) =>
    activePage === index ? "swipe-page is-active" : "swipe-page";

  return (
    <main className="site-experience">
      <header className="nav">
        <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigateTo(0); }}>
          KDYNN<span>MARKET</span>
        </a>

        <nav className={open ? "navlinks open" : "navlinks"} aria-label="Main navigation">
          {pages.slice(1).map((page, index) => (
            <a
              key={page.hash}
              href={page.hash}
              aria-current={activePage === index + 1 ? "page" : undefined}
              onClick={(event) => { event.preventDefault(); navigateTo(index + 1); }}
            >
              {page.label}
            </a>
          ))}
        </nav>

        <button
          className="menu"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>

        <a className="nav-cta" href="#contact" onClick={(event) => { event.preventDefault(); navigateTo(6); }}>
          Get in touch <ArrowRight size={16} />
        </a>
      </header>

      <div
        className="swipe-viewport"
        onPointerDown={beginSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={() => { swipeStart.current = null; }}
      >
        <div className="swipe-track" style={{ transform: `translate3d(-${activePage * 100}vw, 0, 0)` }}>
          <div
            className={pageClass(0)}
            ref={(node) => { pageRefs.current[0] = node; }}
            aria-hidden={activePage !== 0} inert={activePage !== 0}
            aria-label="Welcome"
            role="group"
          >
            <section className="hero" id="top">
              <div className="hero-bg" />
              <div className="hero-content">
                <p className="eyebrow"><span /> COMMUNITY MARKET · SJDM, BULACAN</p>
                <h1>Good food.<br /><em>Good people.</em><br />Good market.</h1>
                <p className="hero-copy">
                  Explore the market before you arrive. Find everyday essentials, discover local sellers
                  and check the stall map to plan your visit.
                </p>
                <div className="hero-actions">
                  <a className="button light" href="#pwesto" onClick={(event) => { event.preventDefault(); navigateTo(2); }}>
                    Explore the 3D market <ArrowRight size={18} />
                  </a>
                  <a className="text-link" href="#visit" onClick={(event) => { event.preventDefault(); navigateTo(5); }}>
                    Find us <MapPin size={16} />
                  </a>
                </div>
              </div>
              <div className="hero-note">
                <strong>227 Del Monte – Norzagaray Rd</strong>
                <span>San Jose del Monte, Bulacan</span>
              </div>
              <div className="hero-scroll-cue"><span /> Swipe to explore</div>
            </section>
          </div>

          <div
            className={pageClass(1)}
            ref={(node) => { pageRefs.current[1] = node; }}
            aria-hidden={activePage !== 1} inert={activePage !== 1}
            aria-label="Market overview"
            role="group"
          >
            <section className="intro" id="market">
              <div className="section-kicker">01 / THE MARKET</div>
              <div className="intro-grid">
                <h2>Your everyday<br /><span>market, reimagined.</span></h2>
                <div>
                  <p className="lead">
                    From the morning grocery run to a quick phone repair, KDYNN Market is built around
                    the things the community actually needs.
                  </p>
                  <p>Shop fresh, discover local sellers and get your essentials without making the trip complicated.</p>
                </div>
              </div>
              <div className="stats">
                <div><b>60*</b><span>Provisional stall spaces</span></div>
                <div><b>Daily</b><span>Fresh deliveries</span></div>
                <div><b>5AM–8PM</b><span>Open every day</span></div>
              </div>
              <div className="overview-footnote">
                <span className="overview-footnote-mark">*</span>
                Stall count and trading details are provisional concept information and should be confirmed with market management.
              </div>
              <button className="inline-next" type="button" onClick={() => navigateTo(2)}>
                Explore the market layout <ArrowRight size={16} />
              </button>
            </section>
          </div>

          <div
            className={pageClass(2)}
            ref={(node) => { pageRefs.current[2] = node; }}
            aria-hidden={activePage !== 2} inert={activePage !== 2}
            aria-label="Interactive pwesto map"
            role="group"
          >
            <MarketExplorer />
          </div>

          <div
            className={pageClass(3)}
            ref={(node) => { pageRefs.current[3] = node; }}
            aria-hidden={activePage !== 3} inert={activePage !== 3}
            aria-label="Market categories"
            role="group"
          >
            <section className="offerings" id="offerings">
              <div className="section-head">
                <div>
                  <div className="section-kicker">03 / WHAT'S HERE</div>
                  <h2>Shop by need.</h2>
                </div>
                <div className="search">
                  <Search size={18} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search offerings"
                    aria-label="Search market categories"
                  />
                </div>
              </div>
              <div className="category-grid">
                {filtered.map((item, index) => (
                  <article className="category" key={item.title}>
                    <span className="number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="category-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <span className="circle-arrow"><ArrowRight size={17} /></span>
                  </article>
                ))}
                {filtered.length === 0 && <p className="category-empty">No categories match your search. Try another word.</p>}
              </div>
              <div className="category-foot">
                <span>Browse the kinds of goods and services represented in this concept.</span>
                <button className="inline-next" type="button" onClick={() => navigateTo(4)}>
                  Meet the community <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </div>

          <div
            className={pageClass(4)}
            ref={(node) => { pageRefs.current[4] = node; }}
            aria-hidden={activePage !== 4} inert={activePage !== 4}
            aria-label="Market community"
            role="group"
          >
            <section className="feature" id="community">
              <div className="feature-image" />
              <div className="feature-copy">
                <div className="section-kicker">04 / COMMUNITY</div>
                <h2>More than a place to shop.</h2>
                <p>
                  KDYNN Market is a neighborhood stop where independent sellers, fresh food and
                  practical services meet. Come for what you need. Stay for what you discover.
                </p>
                <button className="button dark" type="button" onClick={() => navigateTo(6)}>
                  Ask about the market <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </div>

          <div
            className={pageClass(5)}
            ref={(node) => { pageRefs.current[5] = node; }}
            aria-hidden={activePage !== 5} inert={activePage !== 5}
            aria-label="Visit KDYNN Market"
            role="group"
          >
            <section className="visit" id="visit">
              <div className="section-kicker">05 / COME BY</div>
              <div className="visit-grid">
                <div>
                  <h2>See you<br /><em>at the market.</em></h2>
                  <div className="details">
                    <div>
                      <MapPin />
                      <span><b>Address</b>227 Del Monte – Norzagaray Rd<br />San Jose del Monte, Bulacan</span>
                    </div>
                    <div>
                      <Clock3 />
                      <span><b>Hours</b>Monday – Sunday · 5:00 AM – 8:00 PM</span>
                    </div>
                    <div>
                      <Phone />
                      <span><b>Phone</b>0974 344 62</span>
                    </div>
                  </div>
                  <a
                    className="button dark"
                    href="https://maps.app.goo.gl/zTDA1ME7iVNo7U3e9"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps <ArrowRight size={17} />
                  </a>
                </div>
                <div className="map-card">
                  <div className="map-overlay">
                    <MapPin size={24} />
                    <strong>KDYNN Market</strong>
                    <span>227 Del Monte – Norzagaray Rd</span>
                  </div>
                  <div className="map-grid" />
                </div>
              </div>
            </section>
          </div>

          <div
            className={pageClass(6)}
            ref={(node) => { pageRefs.current[6] = node; }}
            aria-hidden={activePage !== 6} inert={activePage !== 6}
            aria-label="Contact KDYNN Market"
            role="group"
          >
            <section className="contact" id="contact">
              <div className="section-kicker">06 / CONTACT</div>
              <div className="contact-grid">
                <div className="contact-intro">
                  <h2>Have a question?<br /><em>Let's talk.</em></h2>
                  <p>For vendor inquiries, bulk orders, phone services or general questions, send us a message.</p>
                  <div className="contact-email"><MessageCircle size={19} /><span>azuleermenu@gmail.com</span></div>
                </div>
                <form onSubmit={submit}>
                  <div className="form-row">
                    <label>Name<input name="name" required placeholder="Your name" /></label>
                    <label>Email<input name="email" type="email" required placeholder="you@email.com" /></label>
                  </div>
                  <div className="form-row">
                    <label>Phone<input name="phone" placeholder="Your phone number" /></label>
                    <label>
                      Subject
                      <select name="subject" defaultValue="General Question">
                        <option>General Question</option>
                        <option>Vendor Space</option>
                        <option>Wholesale / Bulk Order</option>
                        <option>Phone Repair / Tech Service</option>
                      </select>
                    </label>
                  </div>
                  <label>Message<textarea name="message" required rows={5} placeholder="How can we help?" /></label>
                  <button className="button dark submit" type="submit">Send inquiry <ArrowRight size={17} /></button>
                  {sent && <p className="sent">Your email app should open with the inquiry ready to send.</p>}
                </form>
              </div>
              <footer className="site-footer">
                <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); navigateTo(0); }}>
                  KDYNN<span>MARKET</span>
                </a>
                <p>Fresh goods · Local sellers · Community</p>
                <small>© {new Date().getFullYear()} KDYNN Market. All rights reserved.</small>
              </footer>
            </section>
          </div>
        </div>
      </div>

      <div className="page-navigation" aria-label="Swipe page navigation">
        <button
          className="page-nav-arrow"
          type="button"
          onClick={() => navigateTo(activePage - 1)}
          disabled={activePage === 0}
          aria-label="Previous page"
          title="Previous page"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="page-nav-center">
          <div className="page-nav-heading">
            <span>{String(activePage + 1).padStart(2, "0")} <i>/</i> {String(pages.length).padStart(2, "0")}</span>
            <strong>{pages[activePage].label}</strong>
          </div>
          <div className="page-nav-dots">
            {pages.map((page, index) => (
              <button
                key={page.hash}
                type="button"
                className={activePage === index ? "page-nav-dot active" : "page-nav-dot"}
                onClick={() => navigateTo(index)}
                aria-label={`Go to ${page.label} page`}
                aria-current={activePage === index ? "step" : undefined}
              />
            ))}
          </div>
        </div>
        <button
          className="page-nav-arrow"
          type="button"
          onClick={() => navigateTo(activePage + 1)}
          disabled={activePage === pages.length - 1}
          aria-label="Next page"
          title="Next page"
        >
          <ArrowRight size={17} />
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        Page {activePage + 1} of {pages.length}: {pages[activePage].label}
      </span>

      <DesignCustomizer />
    </main>
  );
}
