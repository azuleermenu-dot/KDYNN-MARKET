"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette, X, RotateCcw, Send } from "lucide-react";

const palettes = {
  "Warm neutral": { bg: "#f3eee5", surface: "#fffaf2", ink: "#28231e", accent: "#b86b45", secondary: "#d8bd91" },
  "Modern minimal": { bg: "#f2f3f4", surface: "#ffffff", ink: "#20242a", accent: "#4776a8", secondary: "#a9c4df" },
  "Bold contrast": { bg: "#171717", surface: "#242424", ink: "#f8f5ef", accent: "#e0a526", secondary: "#765b2b" },
  "Fresh & natural": { bg: "#edf1e8", surface: "#fbfff7", ink: "#26352b", accent: "#64845b", secondary: "#b6c89b" },
  "Soft pastel": { bg: "#f5edf2", surface: "#fff9fc", ink: "#453541", accent: "#bd7f9f", secondary: "#dfb9cc" },
  "Ocean": { bg: "#e9f2f4", surface: "#f9feff", ink: "#17323c", accent: "#247f91", secondary: "#9acbd1" },
};

const fonts = {
  "Keep original": "",
  "Modern sans": "'DM Sans', Arial, sans-serif",
  "Editorial serif": "Georgia, 'Times New Roman', serif",
  "Clean geometric": "Arial, Helvetica, sans-serif",
};

export default function DesignCustomizer() {
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState("Original website");
  const [font, setFont] = useState("Keep original");
  const [radius, setRadius] = useState(18);
  const [shape, setShape] = useState("Rounded");
  const [density, setDensity] = useState("Comfortable");
  const [hasApplied, setHasApplied] = useState(false);
  const colors = useMemo(() => palettes[palette as keyof typeof palettes] ?? { bg: "#f3eee5", surface: "#fffaf2", ink: "#28231e", accent: "#b86b45", secondary: "#d8bd91" }, [palette]);

  useEffect(() => {
    const root = document.documentElement;
    if (!hasApplied || palette === "Original website") {
      ["--bg","--cream","--surface","--paper","--ink","--black","--accent","--orange","--brown","--gold","--tan","--line","--r","--custom-density","--custom-font"].forEach(key => root.style.removeProperty(key));
      return;
    }
    root.style.setProperty("--bg", colors.bg);
    root.style.setProperty("--cream", colors.bg);
    root.style.setProperty("--surface", colors.surface);
    root.style.setProperty("--paper", colors.surface);
    root.style.setProperty("--ink", colors.ink);
    root.style.setProperty("--black", colors.ink);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--orange", colors.accent);
    root.style.setProperty("--brown", colors.ink);
    root.style.setProperty("--gold", colors.secondary);
    root.style.setProperty("--tan", colors.secondary);
    root.style.setProperty("--line", colors.ink + "22");
    root.style.setProperty("--r", shape === "Sharp" ? "2px" : shape === "Pill" ? "28px" : radius + "px");
    root.style.setProperty("--custom-density", density === "Compact" ? ".78" : density === "Spacious" ? "1.18" : "1");
    root.style.setProperty("--custom-font", fonts[font as keyof typeof fonts]);
  }, [colors, radius, shape, density, font, hasApplied, palette]);

  function reset() {
    setPalette("Original website"); setFont("Keep original"); setRadius(18); setShape("Rounded"); setDensity("Comfortable"); setHasApplied(false);
  }

  function sendBrief() {
    const body = [
      "Hello! I would like to discuss a website design using this live preview.",
      "",
      "Design preferences:",
      "Color palette: " + palette,
      "Typography: " + font,
      "Corner style: " + shape + (shape === "Rounded" ? " (" + radius + "px)" : ""),
      "Spacing: " + density,
      "",
      "Please contact me to discuss this design."
    ].join("\n");
    window.location.href = "mailto:asnorali.dev@gmail.com?subject=" + encodeURIComponent("Website design preferences") + "&body=" + encodeURIComponent(body);
  }

  return <>
    <button className="design-launcher" onClick={() => setOpen(true)} aria-label="Customize this website"><Palette size={17}/> Customize design</button>
    {open && <div className="design-backdrop" onClick={() => setOpen(false)}>
      <aside className="design-panel" onClick={e => e.stopPropagation()} aria-label="Live website design customizer">
        <div className="design-head"><div><span className="design-kicker">LIVE PREVIEW</span><h2>Make it yours.</h2><p>Try a look and tell us what you prefer.</p></div><button className="design-close" onClick={() => setOpen(false)} aria-label="Close customizer"><X/></button></div>
        <label className="design-field">Color direction<select value={palette} onChange={e => setPalette(e.target.value)}>{Object.keys(palettes).map(x => <option key={x}>{x}</option>)}</select><span className="design-swatches">{Object.values(colors).map((c,i)=><i key={i} style={{background:c}} />)}</span></label>
        <label className="design-field">Typography<select value={font} onChange={e => { setFont(e.target.value); setHasApplied(true); }}>{Object.keys(fonts).map(x => <option key={x}>{x}</option>)}</select></label>
        <div className="design-field"><span>Corner style</span><div className="design-options">{["Rounded","Sharp","Pill"].map(x=><button className={shape===x?"selected":""} key={x} onClick={()=>{setShape(x);setHasApplied(true)}}>{x}</button>)}</div></div>
        {shape === "Rounded" && <label className="design-field">Corner roundness <b>{radius}px</b><input type="range" min="4" max="32" value={radius} onChange={e=>{setRadius(Number(e.target.value));setHasApplied(true)}}/></label>}
        <div className="design-field"><span>Section spacing</span><div className="design-options">{["Compact","Comfortable","Spacious"].map(x=><button className={density===x?"selected":""} key={x} onClick={()=>{setDensity(x);setHasApplied(true)}}>{x}</button>)}</div></div>
        <div className="design-preview-note"><span className="design-dot"/> Changes are previewed on this page only. Your choices are not saved or published.</div>
        <div className="design-actions"><button className="design-reset" onClick={reset}><RotateCcw size={15}/> Reset</button><button className="design-send" onClick={sendBrief}><Send size={15}/> Send my preferences</button></div>
      </aside>
    </div>}
    <style jsx global>{`
      html{font-family:var(--custom-font,inherit)}
      body{font-family:var(--custom-font,inherit)}
      .design-launcher{position:fixed!important;z-index:80!important;right:22px!important;bottom:22px!important;display:flex!important;align-items:center!important;gap:9px!important;padding:13px 18px!important;border:1px solid rgba(255,255,255,.24)!important;border-radius:999px!important;background:#171717!important;color:#fff!important;box-shadow:0 10px 35px #0003!important;font:600 12px/1 Arial,sans-serif!important;cursor:pointer!important}
      .design-backdrop{position:fixed;z-index:1000;inset:0;background:#0008;display:flex;justify-content:flex-end;backdrop-filter:blur(4px)}
      .design-panel{width:min(430px,100%);height:100%;overflow:auto;background:#fbfaf7;color:#20201e;padding:30px;box-shadow:-15px 0 50px #0002;font:14px/1.5 Arial,sans-serif}
      .design-head{display:flex;justify-content:space-between;gap:20px;margin-bottom:28px}.design-kicker{font-size:10px;letter-spacing:.18em;font-weight:700;color:#987052}.design-head h2{font:600 32px/1.1 Georgia,serif;margin:8px 0}.design-head p{font-size:13px;color:#777;margin:0}.design-close{width:38px;height:38px;border:1px solid #ddd;border-radius:50%;background:transparent;display:grid;place-items:center;cursor:pointer}
      .design-field{display:block;margin:23px 0;color:#343434;font-size:12px;font-weight:700}.design-field select{display:block;width:100%;margin-top:9px;padding:12px;border:1px solid #ddd;border-radius:9px;background:white;color:#222;font:13px Arial,sans-serif}.design-swatches{display:flex;gap:7px;margin-top:10px}.design-swatches i{width:25px;height:25px;border-radius:50%;border:1px solid #0001}.design-options{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}.design-options button{padding:9px 12px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#333;font:12px Arial,sans-serif;cursor:pointer}.design-options button.selected{background:#222;color:#fff;border-color:#222}.design-field input[type=range]{width:100%;margin-top:12px;accent-color:#222}.design-field b{float:right}.design-preview-note{padding:13px;background:#f0eee9;border-radius:10px;color:#68645e;font-size:11px;line-height:1.6}.design-dot{display:inline-block;width:7px;height:7px;background:#6a9b68;border-radius:50%;margin-right:7px}.design-actions{display:flex;gap:10px;margin-top:22px}.design-reset,.design-send{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:9px;font:600 12px Arial,sans-serif;cursor:pointer}.design-reset{background:#fff;border:1px solid #ddd;color:#333}.design-send{flex:1;background:#222;color:#fff;border:1px solid #222}
      @media(max-width:520px){.design-launcher{right:12px!important;bottom:12px!important;padding:12px 14px!important}.design-panel{padding:23px 20px}}
      @media(prefers-reduced-motion:reduce){.design-backdrop *{scroll-behavior:auto!important}}
    `}</style>
  </>;
}
