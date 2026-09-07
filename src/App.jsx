import { useState, useEffect, useRef } from "react";
import {
  Home, MessageCircle, User, Plus, Heart, MessageSquare, Gem,
  Trash2, ArrowLeft, Image as ImageIcon, X, Shuffle,
  Bell, Bookmark, Send, Star, Banknote, Crown, Menu, Users, Pencil,
  Search, Mail, Flame, MoreHorizontal, Info, Smile, SlidersHorizontal, Coins, Sparkles,
  Clapperboard, Lock, Radio, SwitchCamera
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLXP1MmfzMwT5rJURqfQdAbhLxv8U93Ro",
  authDomain: "onlyprivacy-mockup.firebaseapp.com",
  projectId: "onlyprivacy-mockup",
  storageBucket: "onlyprivacy-mockup.firebasestorage.app",
  messagingSenderId: "991940306833",
  appId: "1:991940306833:web:1c80f5c89c8911898c5c30",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const DOC_REF = doc(db, "onlyprivacy", "shared-data");

// ---------- constants / helpers ----------

const FIRST_NAMES = ["Isabela","Camila","Julia","Larissa","Beatriz","Fernanda","Manuela","Sophia","Valentina","Helena","Laura","Marina","Rafaela","Bianca","Amanda"];
const LAST_NAMES = ["Alves","Ferreira","Souza","Lima","Costa","Ribeiro","Carvalho","Gomes","Martins","Araujo","Barbosa","Rocha","Dias","Nunes","Teixeira"];
const BIOS = [
  "Compartilhando meu dia a dia por aqui.",
  "Conteúdo exclusivo toda semana.",
  "Vem de perto comigo.",
  "Bastidores e momentos só aqui.",
  "Novidades toda sexta-feira.",
  "Meu espaço, minhas regras.",
];
const AVATAR_COLORS = ["#F97316","#EF4444","#EC4899","#8B5CF6","#3B82F6","#10B981","#F59E0B","#14B8A6","#F43F5E","#6366F1"];
const CAPTIONS = ["Bom dia ☀️","Novo post no ar","Hoje o clima tava perfeito","Gravando algo novo pra vocês","Feliz com o resultado de hoje"];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function initials(name) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function colorFor(name) {
  return AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
}
function usernameFrom(name) {
  const base = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  return base + Math.floor(10 + Math.random() * 89);
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 10); }

// engagement numbers shown on each post — random, cosmetic only
function randomPostStats() {
  return {
    likes: Math.floor(120 + Math.random() * 1500),
    comments: Math.floor(20 + Math.random() * 400),
    tips: Math.floor(5 + Math.random() * 95),
  };
}
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + "k";
  return String(n);
}

function randomCreator() {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  return {
    id: uid(),
    name,
    username: usernameFrom(name),
    bio: pick(BIOS),
    price: [19, 29, 39, 49][Math.floor(Math.random() * 4)],
    color: colorFor(name),
    initials: initials(name),
  };
}

function resizeImageFile(file, maxW = 700) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- small UI atoms ----------

function Avatar({ name, color, initials: ini, src, size = 44, ring = false }) {
  const style = { width: size, height: size, minWidth: size };
  if (src) {
    return <img src={src} alt={name} style={style} className={`rounded-full object-cover ${ring ? "ring-2 ring-white" : ""}`} />;
  }
  return (
    <div
      style={{ ...style, backgroundColor: color, fontSize: size * 0.38 }}
      className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${ring ? "ring-2 ring-white" : ""}`}
    >
      {ini}
    </div>
  );
}

function Logo({ size = "lg" }) {
  const text = size === "lg" ? "text-xl" : "text-lg";
  const icon = size === "lg" ? 22 : 20;
  return (
    <div className={`font-extrabold ${text} flex items-center gap-1.5 tracking-tight`}>
      <Flame size={icon} className="text-orange-500 fill-orange-400" />
      <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
        OnlyPrivacy
      </span>
    </div>
  );
}

function MimoAnimation({ amount }) {
  const bits = Array.from({ length: 8 });
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center overflow-hidden">
      <div className="absolute animate-mimo-ring w-32 h-32 rounded-full border-4 border-amber-300" />
      <div className="animate-mimo-pop flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 flex items-center justify-center shadow-2xl">
          <Gem size={44} className="text-white" />
        </div>
        <div className="bg-white/95 rounded-full px-4 py-1.5 font-extrabold text-orange-600 text-lg shadow-lg">
          + R$ {amount}
        </div>
      </div>
      {bits.map((_, i) => (
        <div
          key={i}
          className="absolute bottom-[30%] animate-mimo-float"
          style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 80}ms` }}
        >
          {i % 3 === 0
            ? <Sparkles size={i % 2 ? 18 : 24} className="text-amber-300" />
            : <Coins size={i % 2 ? 20 : 28} className="text-amber-400" />}
        </div>
      ))}
    </div>
  );
}

// press-and-hold to unlock a locked full-screen surface (SET / Live).
function useHoldUnlock(holdMs = 4000, relockMs = 12000) {
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 while pressing
  const holdRef = useRef(null);
  const relockRef = useRef(null);

  const scheduleRelock = () => {
    clearTimeout(relockRef.current);
    relockRef.current = setTimeout(() => setUnlocked(false), relockMs);
  };
  const start = () => {
    if (unlocked) { scheduleRelock(); return; }
    const t0 = Date.now();
    clearInterval(holdRef.current);
    holdRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / holdMs);
      setProgress(p);
      if (p >= 1) {
        clearInterval(holdRef.current); holdRef.current = null;
        setProgress(0); setUnlocked(true); scheduleRelock();
      }
    }, 40);
  };
  const end = () => { clearInterval(holdRef.current); holdRef.current = null; setProgress(0); };

  useEffect(() => () => { clearInterval(holdRef.current); clearTimeout(relockRef.current); }, []);

  return {
    unlocked,
    progress,
    holdMs,
    keepUnlocked: scheduleRelock,
    bind: { onPointerDown: start, onPointerUp: end, onPointerLeave: end, onPointerCancel: end },
  };
}

function HoldProgress({ progress, holdMs }) {
  if (progress <= 0) return null;
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
      <div className="w-40 h-1.5 rounded-full bg-white/25 overflow-hidden">
        <div className="h-full bg-white/80" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="text-white/70 text-xs">destravando… {Math.ceil(holdMs / 1000 - progress * holdMs / 1000)}s</div>
    </div>
  );
}

// ---------- SET mode: full-screen chroma-key screens with tracking marks ----------
const CHROMA_COLORS = [
  { key: "Verde", css: "#00E23C" },
  { key: "Azul", css: "#0A12F0" },
  { key: "Cinza", css: "#C4C4C4" },
];

function useWakeLock() {
  useEffect(() => {
    let cancelled = false, sentinel = null;
    async function lock() {
      try { if ("wakeLock" in navigator) sentinel = await navigator.wakeLock.request("screen"); } catch {}
    }
    lock();
    const onVis = () => { if (document.visibilityState === "visible" && !cancelled) lock(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      try { sentinel && sentinel.release(); } catch {}
    };
  }, []);
}

// paint html/body/status-bar a solid colour while a full-screen surface is up
function usePaintChrome(css) {
  useEffect(() => {
    if (!css) return;
    const html = document.documentElement;
    const prev = { html: html.style.backgroundColor, body: document.body.style.backgroundColor };
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevMeta = meta && meta.getAttribute("content");
    html.style.backgroundColor = css;
    document.body.style.backgroundColor = css;
    if (meta) meta.setAttribute("content", css);
    return () => {
      html.style.backgroundColor = prev.html;
      document.body.style.backgroundColor = prev.body;
      if (meta && prevMeta != null) meta.setAttribute("content", prevMeta);
    };
  }, [css]);
}

function ChromaSet({ onExit, isDesktop }) {
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const color = CHROMA_COLORS[idx];
  const { unlocked, progress, holdMs, keepUnlocked, bind } = useHoldUnlock(4000, 12000);

  useWakeLock();
  usePaintChrome(color.css);
  useEffect(() => { const t = setTimeout(() => setShowHint(false), 3500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (unlocked) setShowHint(false); }, [unlocked]);

  // tracking marks (percent positions). Desktop gets a few extra on the horizontal centreline.
  const marks = [
    [9, 7], [50, 7], [91, 7],
    [9, 50], [50, 50], [91, 50],
    [9, 93], [50, 93], [91, 93],
    [50, 28], [50, 72],
    ...(isDesktop ? [[30, 50], [70, 50], [30, 7], [70, 7], [30, 93], [70, 93]] : []),
  ];
  const crossSize = isDesktop ? 56 : 64;

  return (
    <div
      className="fixed inset-0 z-[80] select-none overflow-hidden"
      style={{ backgroundColor: color.css, touchAction: "none", width: "100vw", height: "100dvh" }}
      {...bind}
    >
      {marks.map(([x, y], i) => (
        <svg
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%` }}
          width={crossSize}
          height={crossSize}
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <line x1="32" y1="6" x2="32" y2="58" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" />
          <line x1="6" y1="32" x2="58" y2="32" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" />
        </svg>
      ))}

      {!unlocked && <HoldProgress progress={progress} holdMs={holdMs} />}

      {!unlocked && showHint && progress === 0 && (
        <div className="absolute left-1/2 bottom-24 -translate-x-1/2 text-xs bg-black/30 rounded-full px-3 py-1.5" style={{ color: "rgba(255,255,255,0.9)" }}>
          <span className="inline-flex items-center gap-1.5"><Lock size={12} /> segure 4s para destravar</span>
        </div>
      )}

      {unlocked && (
        <div
          className="absolute left-1/2 bottom-10 -translate-x-1/2 flex items-center gap-3 bg-black/65 rounded-full px-4 py-3"
          onPointerDown={e => { e.stopPropagation(); keepUnlocked(); }}
        >
          {CHROMA_COLORS.map((c, i) => (
            <button
              key={c.key}
              onClick={() => { setIdx(i); keepUnlocked(); }}
              aria-label={c.key}
              className={`w-9 h-9 shrink-0 aspect-square rounded-full border-2 ${i === idx ? "border-white" : "border-white/30"}`}
              style={{ backgroundColor: c.css }}
            />
          ))}
          <button onClick={onExit} className="text-white text-sm font-semibold px-3 py-1 whitespace-nowrap">Sair do SET</button>
        </div>
      )}
    </div>
  );
}

// ---------- Live mode: phone camera + simulated live chat & tips ----------
const LIVE_NAMES = [
  "Lucas", "Bruno", "Thiago", "Rafael", "Gabriel", "Matheus", "Felipe", "Pedro", "Gustavo",
  "Rodrigo", "Diego", "André", "Vinícius", "Léo", "Caio", "Igor", "Marcelo", "Fábio", "Ricardo",
  "Paulo", "João", "Carlos", "Douglas", "Renato", "Alex", "Murilo", "Otávio", "Enzo", "Davi", "Nathan",
];
const LIVE_COMMENTS = [
  "linda 😍", "bonita demais", "você é demais", "que perfeita", "diva 👑", "maravilhosa",
  "tô apaixonado", "🔥🔥🔥", "rainha", "musa", "que sorriso lindo", "deusa", "gata", "te amo ❤️",
  "lindona", "perfeita demais", "arrasou", "😍😍😍", "você é tudo", "que olhos lindos", "🥰",
  "não aguento", "linda de mais", "obcecado por você", "boa noite gata", "vc brilha muito",
];
const LIVE_TIPS = [10, 20, 30, 50, 100, 150, 200, 300];

function LiveScreen({ onExit }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState("user");
  const [camError, setCamError] = useState(false);
  const [feed, setFeed] = useState([]); // {id, name, text, tip}
  const [tipAlert, setTipAlert] = useState(null); // {id, name, amount}
  const [viewers, setViewers] = useState(() => 140 + Math.floor(Math.random() * 260));
  const [hearts, setHearts] = useState([]);
  const { unlocked, progress, holdMs, keepUnlocked, bind } = useHoldUnlock(4000, 12000);

  useWakeLock();
  usePaintChrome("#000000"); // black behind the notch / home-indicator, no white strip

  useEffect(() => {
    let stopped = false;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (stopped) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamError(false);
      } catch { setCamError(true); }
    }
    start();
    return () => { stopped = true; streamRef.current && streamRef.current.getTracks().forEach(t => t.stop()); };
  }, [facing]);

  useEffect(() => {
    let t;
    const tick = () => {
      setFeed(prev => [...prev.slice(-24), { id: uid(), name: pick(LIVE_NAMES), text: pick(LIVE_COMMENTS) }]);
      t = setTimeout(tick, 1300 + Math.random() * 2400);
    };
    t = setTimeout(tick, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t;
    const tick = () => {
      const name = pick(LIVE_NAMES);
      const amount = pick(LIVE_TIPS);
      setTipAlert({ id: uid(), name, amount });
      setFeed(prev => [...prev.slice(-24), { id: uid(), name, text: `enviou R$ ${amount}`, tip: true }]);
      t = setTimeout(tick, 6000 + Math.random() * 10000);
    };
    t = setTimeout(tick, 4000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!tipAlert) return;
    const t = setTimeout(() => setTipAlert(null), 3800);
    return () => clearTimeout(t);
  }, [tipAlert]);

  useEffect(() => {
    const t = setInterval(() => setViewers(v => Math.max(60, v + Math.floor(Math.random() * 17) - 6)), 2800);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setHearts(h => [...h.slice(-10), { id: uid(), x: Math.random() * 26 }]), 850);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[75] bg-black overflow-hidden select-none" style={{ touchAction: "none" }} {...bind}>
      {camError ? (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-700 to-black flex items-center justify-center text-white/45 text-sm px-10 text-center">
          Câmera indisponível — precisa de HTTPS e permissão. O overlay da live continua rodando.
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
        />
      )}

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.7rem)" }}>
        <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AO VIVO
        </span>
        <span className="bg-black/40 text-white text-[11px] px-2 py-1 rounded-md flex items-center gap-1">
          <User size={12} /> {viewers.toLocaleString("pt-BR")}
        </span>
        <div className="flex-1" />
        {unlocked && (
          <>
            <button onPointerDown={e => e.stopPropagation()} onClick={() => { setFacing(f => (f === "user" ? "environment" : "user")); keepUnlocked(); }} className="text-white bg-black/45 p-2 rounded-full">
              <SwitchCamera size={18} />
            </button>
            <button onPointerDown={e => e.stopPropagation()} onClick={onExit} className="text-white bg-black/45 p-2 rounded-full">
              <X size={18} />
            </button>
          </>
        )}
      </div>

      {/* tip alert */}
      {tipAlert && (
        <div className="absolute left-4 right-4 top-24 mx-auto w-fit max-w-[85%] bg-gradient-to-r from-amber-400 to-red-500 text-white rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg animate-mimo-pop">
          <Gem size={20} className="text-white shrink-0" />
          <div className="text-sm leading-tight">
            <span className="font-extrabold">{tipAlert.name}</span> enviou <span className="font-extrabold">R$ {tipAlert.amount}</span>
          </div>
        </div>
      )}

      {/* floating hearts */}
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-24 animate-mimo-float" style={{ right: `${6 + h.x}%`, animationDuration: "2.6s" }}>
          <Heart size={22} className="fill-red-500 text-red-500" />
        </div>
      ))}

      {/* comment stream */}
      <div className="absolute left-3 right-14 bottom-16 flex flex-col gap-1.5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {feed.slice(-6).map(c => (
          <div key={c.id} className={`text-white text-sm w-fit max-w-full rounded-2xl px-3 py-1.5 backdrop-blur-sm ${c.tip ? "bg-amber-500/40 font-semibold" : "bg-black/25"}`}>
            {c.tip ? <><Gem size={13} className="inline mb-0.5 mr-1" /><span className="font-bold mr-1">{c.name}</span>{c.text}</>
                   : <><span className="font-semibold text-white/75 mr-1.5">{c.name}</span>{c.text}</>}
          </div>
        ))}
      </div>

      {!unlocked && <HoldProgress progress={progress} holdMs={holdMs} />}
      {!unlocked && progress === 0 && (
        <div className="absolute left-1/2 bottom-5 -translate-x-1/2 text-[11px] bg-black/40 rounded-full px-3 py-1.5" style={{ color: "rgba(255,255,255,0.9)" }}>
          <span className="inline-flex items-center gap-1.5"><Lock size={11} /> segure 4s para sair</span>
        </div>
      )}
    </div>
  );
}

function TipModal({ onClose, onSend, targetName, isDesktop }) {
  const [custom, setCustom] = useState("");
  const presets = [
    { icon: Star, val: 10, bg: "#F59E0B" },
    { icon: Banknote, val: 30, bg: "#22C55E" },
    { icon: Gem, val: 50, bg: "#3B82F6" },
    { icon: Gem, val: 100, bg: "#0EA5E9" },
    { icon: Crown, val: 300, bg: "#EAB308" },
  ];
  return (
    <div className={`fixed inset-0 bg-black/40 z-50 flex justify-center ${isDesktop ? "items-center" : "items-end"}`} onClick={onClose}>
      <div className={`bg-white p-5 ${isDesktop ? "rounded-2xl w-96" : "rounded-t-2xl w-full"}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">Enviar mimo {targetName ? `para ${targetName}` : ""}</h3>
          <button onClick={onClose}><X size={20} className="text-stone-400" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {presets.map(p => (
            <button
              key={p.val}
              onClick={() => onSend(p.val)}
              className="rounded-xl py-3 flex flex-col items-center gap-1 text-white font-semibold"
              style={{ backgroundColor: p.bg }}
            >
              <p.icon size={20} />
              <span>{p.val}</span>
            </button>
          ))}
          <div className="rounded-xl py-1 flex flex-col items-center justify-center gap-1 bg-stone-100 col-span-3">
            <div className="flex items-center gap-2 w-full px-3">
              <input
                value={custom}
                onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Outro valor"
                className="flex-1 bg-transparent outline-none py-2 text-stone-700"
              />
              <button
                disabled={!custom}
                onClick={() => custom && onSend(Number(custom))}
                className="text-orange-600 font-semibold disabled:text-stone-300"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- screens ----------

function HomeFeed({ creators, posts, toggleLike, likedPosts, openProfile, openTip, toggleSaved, savedPosts, deletePost }) {
  const [menuFor, setMenuFor] = useState(null); // post id whose "..." menu is open

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 text-stone-400">
        <Users size={40} className="mb-3" />
        <p className="font-medium text-stone-500">Nenhum personagem cadastrado ainda</p>
        <p className="text-sm mt-1">Abra o menu ☰ e use Cadastro para criar o primeiro perfil.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 px-3">
      {posts.length === 0 && (
        <div className="text-center text-stone-400 py-16 text-sm">Nenhuma publicação ainda. Adicione uma pelo Cadastro (menu ☰).</div>
      )}
      {posts.map(post => {
        const creator = creators.find(c => c.id === post.creatorId);
        if (!creator) return null;
        const liked = likedPosts.has(post.id);
        const saved = savedPosts.has(post.id);
        return (
          <div key={post.id} className="bg-white rounded-3xl border border-orange-100 shadow-sm p-3">
            <div className="flex items-start gap-3">
              <button onClick={() => openProfile(creator.id)} className="shrink-0">
                <Avatar name={creator.name} color={creator.color} initials={creator.initials} src={creator.avatarSrc} size={44} />
              </button>
              <div className="flex-1 min-w-0">
                <button className="text-left block" onClick={() => openProfile(creator.id)}>
                  <span className="font-bold text-stone-800 text-sm">{creator.name}</span>
                  <span className="text-stone-400 text-sm ml-1.5">@{creator.username}</span>
                </button>
                {post.caption && <div className="text-stone-700 text-sm mt-0.5">{post.caption}</div>}
              </div>
              <div className="relative shrink-0">
                <button onClick={() => setMenuFor(menuFor === post.id ? null : post.id)} className="text-stone-400 p-1 -mr-1">
                  <MoreHorizontal size={20} />
                </button>
                {menuFor === post.id && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                    <div className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-lg border border-stone-100 py-1 w-40">
                      <button
                        onClick={() => {
                          setMenuFor(null);
                          if (window.confirm("Apagar este post?")) deletePost(post.id);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} /> Apagar post
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-2xl overflow-hidden">
              {post.image ? (
                <img src={post.image} alt="" className="w-full max-h-[480px] object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-orange-300">
                  <ImageIcon size={36} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 px-1 pt-3 text-stone-600">
              <button onClick={() => toggleLike(post.id)} className="flex items-center gap-2">
                <Heart size={20} className={liked ? "fill-red-500 text-red-500" : ""} />
                <span className="text-sm font-medium">{formatCount(post.likes + (liked ? 1 : 0))}</span>
              </button>
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="text-sm font-medium">{formatCount(post.comments)}</span>
              </div>
              <button onClick={() => openTip(creator)} className="flex items-center gap-2">
                <Banknote size={20} />
                <span className="text-sm font-medium">{formatCount(post.tips)}</span>
              </button>
              <button onClick={() => toggleSaved(post.id)} className="ml-auto">
                <Bookmark size={20} className={saved ? "fill-stone-700 text-stone-700" : ""} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileScreen({ creator, posts, onBack, openTip, isDesktop, deletePost }) {
  const [tab, setTab] = useState("posts");
  if (!creator) return <div className="p-6 text-stone-400 text-center">Selecione um perfil.</div>;
  const creatorPosts = posts.filter(p => p.creatorId === creator.id);
  const photos = creatorPosts.filter(p => p.image);
  return (
    <div className="px-3">
      {!isDesktop && (
        <button onClick={onBack} className="flex items-center gap-2 text-stone-500 mb-2 text-sm">
          <ArrowLeft size={18} /> Voltar
        </button>
      )}
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden mb-4">
        <div className="h-40" style={{ backgroundColor: creator.color, opacity: 0.85 }} />
        <div className="px-4 pb-4">
          <div className="-mt-10">
            <Avatar name={creator.name} color={creator.color} initials={creator.initials} src={creator.avatarSrc} size={80} ring />
          </div>
          <div className="flex items-start justify-between mt-2">
            <div>
              <div className="font-bold text-lg text-stone-800">{creator.name}</div>
              <div className="text-stone-400 text-sm">@{creator.username}</div>
            </div>
            <button
              onClick={() => openTip(creator)}
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
            >
              Assinar · R${creator.price}
            </button>
          </div>
          <p className="text-stone-600 text-sm mt-3">{creator.bio}</p>
          <div className="flex gap-6 mt-4 border-t border-orange-100 pt-3 text-sm">
            {["posts", "fotos"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-medium capitalize pb-1 ${tab === t ? "text-red-500 border-b-2 border-red-500" : "text-stone-400"}`}
              >
                {t === "posts" ? `Posts ${creatorPosts.length}` : `Fotos ${photos.length}`}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {(tab === "posts" ? creatorPosts : photos).length === 0 && (
          <div className="text-center text-stone-400 py-10 text-sm">Nada por aqui ainda.</div>
        )}
        {(tab === "posts" ? creatorPosts : photos).map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden relative">
            <button
              onClick={() => {
                if (window.confirm("Apagar este post?")) deletePost(post.id);
              }}
              className="absolute top-2 right-2 z-10 bg-black/45 text-white rounded-full p-2 backdrop-blur-sm"
              aria-label="Apagar post"
            >
              <Trash2 size={16} />
            </button>
            {post.caption && <div className="px-4 pt-3 pb-2 pr-12 text-stone-700 text-sm">{post.caption}</div>}
            {post.image ? (
              <img src={post.image} alt="" className="w-full max-h-96 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-orange-300">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ m, creator }) {
  const mine = m.from === "me";
  return (
    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && (
        <Avatar name={creator.name} color={creator.color} initials={creator.initials} src={creator.avatarSrc} size={28} />
      )}
      {m.type === "tip" ? (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl px-3.5 py-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide shadow-sm">
          <Gem size={20} className="text-sky-200 shrink-0" />
          <span>Enviou um mimo</span>
          <span className="bg-white/25 rounded-full px-2 py-0.5 text-xs normal-case tracking-normal">R$ {m.amount}</span>
        </div>
      ) : m.type === "image" ? (
        <img src={m.image} alt="" className="rounded-2xl max-w-[68%] border-4 border-orange-100" />
      ) : (
        <div className={`rounded-2xl px-4 py-2.5 max-w-[75%] text-sm leading-snug ${mine ? "bg-gradient-to-r from-orange-400 to-red-500 text-white" : "bg-orange-100 text-stone-700"}`}>
          {m.text}
        </div>
      )}
    </div>
  );
}

function MessagesScreen({ creators, chats, setChats, activeChatId, setActiveChatId, openTip, tipTargetId, pendingTip, clearPendingTip, isDesktop, onExit }) {
  const [text, setText] = useState("");
  const [sendAs, setSendAs] = useState("me"); // 'me' | 'creator'
  const [filter, setFilter] = useState("todas"); // cosmetic only for now
  const scrollRef = useRef(null);
  const imgRef = useRef(null);
  const activeCreator = creators.find(c => c.id === activeChatId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chats, activeChatId]);

  useEffect(() => {
    if (pendingTip && tipTargetId === activeChatId) {
      setChats(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), { id: uid(), from: sendAs, type: "tip", amount: pendingTip }],
      }));
      clearPendingTip();
    }
    // eslint-disable-next-line
  }, [pendingTip]);

  function send() {
    if (!text.trim() || !activeChatId) return;
    setChats(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), { id: uid(), from: sendAs, type: "text", text }],
    }));
    setText("");
  }

  async function sendImage(file) {
    if (!file || !activeChatId) return;
    const dataUrl = await resizeImageFile(file, 700);
    setChats(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), { id: uid(), from: sendAs, type: "image", image: dataUrl }],
    }));
  }

  function lastPreview(id) {
    const arr = chats[id] || [];
    const m = arr[arr.length - 1];
    if (!m) return "Sem mensagens ainda";
    if (m.type === "tip") return `Mimo enviado · R$ ${m.amount}`;
    if (m.type === "image") return "Foto";
    return m.text;
  }
  function isUnread(id) {
    const arr = chats[id] || [];
    return arr.length > 0 && arr[arr.length - 1].from === "creator";
  }
  function clearChat(id) {
    setChats(prev => { const cp = { ...prev }; delete cp[id]; return cp; });
    if (activeChatId === id) setActiveChatId(null);
  }

  const composer = activeCreator && (
    <div
      className="border-t border-orange-100 px-3 pt-2 shrink-0 bg-white"
      style={{ paddingBottom: isDesktop ? "0.75rem" : "calc(env(safe-area-inset-bottom) * 0.6 + 0.55rem)" }}
    >
      <div className="flex items-center gap-2 mb-2 text-xs text-stone-400">
        <span>Enviar como:</span>
        <button onClick={() => setSendAs("me")} className={`px-2 py-0.5 rounded-full ${sendAs === "me" ? "bg-red-500 text-white" : "bg-stone-100"}`}>Você</button>
        <button onClick={() => setSendAs("creator")} className={`px-2 py-0.5 rounded-full ${sendAs === "creator" ? "bg-red-500 text-white" : "bg-stone-100"}`}>{activeCreator.name.split(" ")[0]}</button>
      </div>
      <div className="flex items-center gap-2">
        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => sendImage(e.target.files?.[0])} />
        <button onClick={() => imgRef.current?.click()} aria-label="Enviar foto"><ImageIcon size={22} className="text-orange-500" /></button>
        <button onClick={() => openTip(activeCreator)} aria-label="Enviar mimo"><Banknote size={22} className="text-orange-500" /></button>
        <div className="flex-1 flex items-center gap-2 bg-orange-50 rounded-full px-3 py-2 min-w-0">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Escreva uma mensagem"
            className="flex-1 bg-transparent outline-none text-sm text-stone-700 min-w-0"
          />
          <Smile size={20} className="text-stone-400 shrink-0" />
        </div>
        <button onClick={send} className="bg-orange-50 rounded-xl p-2" aria-label="Enviar"><Send size={20} className="text-red-500" /></button>
      </div>
    </div>
  );

  // ---------- desktop: two-pane card ----------
  if (isDesktop) {
    return (
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden flex mx-3" style={{ minHeight: "60vh" }}>
        <div className="w-72 border-r border-orange-100 shrink-0">
          <div className="px-4 py-3 font-semibold text-stone-800 border-b border-orange-100">Mensagens · {creators.length} chats</div>
          <div className="flex flex-col">
            {creators.length === 0 && <div className="text-center text-stone-400 text-sm py-10 px-4">Cadastre um personagem para começar a conversar.</div>}
            {creators.map(c => (
              <button key={c.id} onClick={() => setActiveChatId(c.id)} className={`flex items-center gap-3 px-4 py-3 text-left border-b border-orange-50 w-full ${activeChatId === c.id ? "bg-orange-50" : ""}`}>
                <Avatar name={c.name} color={c.color} initials={c.initials} src={c.avatarSrc} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-stone-800 text-sm truncate">{c.name}</div>
                  <div className="text-stone-400 text-xs truncate">{lastPreview(c.id)}</div>
                </div>
                {isUnread(c.id) && <span className="w-2 h-2 rounded-full bg-red-500" />}
              </button>
            ))}
          </div>
        </div>
        {activeCreator ? (
          <div className="flex-1 flex flex-col min-h-[70vh]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-orange-100">
              <Avatar name={activeCreator.name} color={activeCreator.color} initials={activeCreator.initials} src={activeCreator.avatarSrc} size={36} />
              <div>
                <div className="font-semibold text-stone-800 text-sm">{activeCreator.name}</div>
                <div className="text-stone-400 text-xs">@{activeCreator.username}</div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {(chats[activeChatId] || []).map(m => <ChatMessage key={m.id} m={m} creator={activeCreator} />)}
              {(chats[activeChatId] || []).length === 0 && <div className="text-center text-stone-300 text-sm mt-10">Nenhuma mensagem ainda.</div>}
            </div>
            {composer}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-300 text-sm">Selecione uma conversa</div>
        )}
      </div>
    );
  }

  // ---------- mobile: full-screen ----------
  const gradHeader = "bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-b-3xl px-4 pb-4 shrink-0";
  const gradHeaderStyle = { paddingTop: "calc(env(safe-area-inset-top) + 0.9rem)" };

  if (!activeCreator) {
    return (
      <div className="flex-1 min-h-0 flex flex-col bg-orange-50">
        <div className={gradHeader} style={gradHeaderStyle}>
          <div className="flex items-center gap-3">
            <button onClick={onExit} aria-label="Voltar"><ArrowLeft size={24} /></button>
            <div className="flex-1">
              <div className="font-bold text-xl leading-tight">Mensagens</div>
              <div className="text-white/85 text-sm">{creators.length} Chats</div>
            </div>
            <Search size={22} />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          {[["todas", "Todas"], ["naolidas", "Não lidas"], ["favoritas", "Favoritas"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-sm px-3.5 py-1.5 rounded-full border ${filter === k ? "bg-red-500 text-white border-red-500 font-semibold" : "bg-white text-stone-500 border-stone-200"}`}
            >
              {l}
            </button>
          ))}
          <SlidersHorizontal size={20} className="text-red-500 ml-auto" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-28">
          {creators.length === 0 && (
            <div className="text-center text-stone-400 text-sm py-16 px-6">Nenhuma conversa ainda. Cadastre personagens no menu ☰.</div>
          )}
          {creators.map(c => {
            const unread = isUnread(c.id);
            return (
              <div key={c.id} className={`bg-white rounded-2xl shadow-sm mb-3 flex items-center gap-3 px-3 py-3 ${unread ? "ring-1 ring-red-300" : ""}`}>
                <button onClick={() => setActiveChatId(c.id)} className="shrink-0">
                  <Avatar name={c.name} color={c.color} initials={c.initials} src={c.avatarSrc} size={52} />
                </button>
                <button onClick={() => setActiveChatId(c.id)} className="flex-1 min-w-0 text-left">
                  <div className="truncate">
                    <span className="font-bold text-stone-800">{c.name}</span>
                    <span className="text-stone-400 text-sm ml-1.5">@{c.username}</span>
                  </div>
                  <div className={`text-sm truncate ${unread ? "text-stone-700 font-semibold" : "text-stone-400"}`}>{lastPreview(c.id)}</div>
                </button>
                {unread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                <button
                  onClick={() => window.confirm(`Limpar a conversa com ${c.name}?`) && clearChat(c.id)}
                  className="shrink-0 p-1"
                  aria-label="Limpar conversa"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white">
      <div className={gradHeader} style={gradHeaderStyle}>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveChatId(null)} aria-label="Voltar"><ArrowLeft size={24} /></button>
          <Avatar name={activeCreator.name} color={activeCreator.color} initials={activeCreator.initials} src={activeCreator.avatarSrc} size={40} ring />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg leading-tight truncate">{activeCreator.name}</div>
            <div className="text-white/85 text-sm truncate">@{activeCreator.username}</div>
          </div>
          <Info size={22} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        {(chats[activeChatId] || []).map(m => <ChatMessage key={m.id} m={m} creator={activeCreator} />)}
        {(chats[activeChatId] || []).length === 0 && (
          <div className="text-center text-stone-300 text-sm mt-10">Nenhuma mensagem ainda.</div>
        )}
      </div>

      {composer}
    </div>
  );
}

const DEMO_CHATS = [
  [
    { from: "creator", type: "text", text: "Oi amor, viu meu post novo? 🔥" },
    { from: "me", type: "text", text: "Vi sim, você tá linda" },
    { from: "creator", type: "text", text: "Manda um mimo que eu posto mais 😏" },
  ],
  [
    { from: "creator", type: "text", text: "Bom dia! Tem novidade hoje à noite" },
    { from: "me", type: "text", text: "Mal posso esperar" },
    { from: "me", type: "tip", amount: 50 },
    { from: "creator", type: "text", text: "Aaah obrigada lindo!! 💎" },
  ],
  [
    { from: "creator", type: "text", text: "Assina meu perfil, tem conteúdo exclusivo lá" },
    { from: "creator", type: "text", text: "Você não vai se arrepender 😘" },
  ],
  [
    { from: "me", type: "text", text: "Oi, tudo bem?" },
    { from: "creator", type: "text", text: "Tudo ótimo e você? 🥰" },
  ],
  [
    { from: "creator", type: "text", text: "Valeu pelo mimo de ontem 😘" },
    { from: "me", type: "tip", amount: 30 },
    { from: "creator", type: "text", text: "Te mando algo especial mais tarde" },
  ],
  [],
];
const DEMO_NAMES = ["Malsh Safiu", "Haissel Gut", "Kathy Felps", "Carth Linsy", "Mark Golys", "Melis Mollf"];

function CadastroScreen({ creators, setCreators, posts, setPosts, setChats, deleteCreator }) {
  const [form, setForm] = useState({ name: "", bio: "", price: 29, avatarSrc: null, photos: [null, null, null, null] });
  const [quickPost, setQuickPost] = useState({}); // creatorId -> {caption, image}
  const fileRef = useRef(null);
  const photoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const filledPhotos = form.photos.filter(Boolean).length;
  const canPublish = form.name.trim() && filledPhotos === 4;

  function randomize() {
    const r = randomCreator();
    setForm(f => ({ ...f, name: r.name, bio: r.bio, price: r.price, avatarSrc: null }));
  }

  function seedDemo() {
    if (!window.confirm("Adicionar 6 personagens de teste com conversas? (avatares coloridos, sem fotos)")) return;
    const newCreators = DEMO_NAMES.map((name, i) => ({
      id: uid(),
      name,
      username: usernameFrom(name),
      bio: pick(BIOS),
      price: [19, 29, 39, 49][i % 4],
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      initials: initials(name),
      avatarSrc: null,
    }));
    setCreators(prev => [...newCreators, ...prev]);
    setChats(prev => {
      const next = { ...prev };
      newCreators.forEach((c, i) => {
        next[c.id] = (DEMO_CHATS[i] || []).map(m => ({ id: uid(), ...m }));
      });
      return next;
    });
    const demoPosts = [];
    newCreators.forEach(c => {
      for (let k = 0; k < 3; k++) {
        demoPosts.push({ id: uid(), creatorId: c.id, caption: pick(CAPTIONS), image: null, ...randomPostStats() });
      }
    });
    setPosts(prev => [...demoPosts, ...prev]);
  }

  function addCreator() {
    if (!canPublish) return;
    const newC = {
      id: uid(),
      name: form.name.trim(),
      username: usernameFrom(form.name),
      bio: form.bio || pick(BIOS),
      price: form.price || 29,
      color: colorFor(form.name),
      initials: initials(form.name),
      avatarSrc: form.avatarSrc || null,
    };
    setCreators(prev => [newC, ...prev]);
    const newPosts = form.photos.map(photo => ({
      id: uid(),
      creatorId: newC.id,
      caption: pick(CAPTIONS),
      image: photo,
      ...randomPostStats(),
    }));
    setPosts(prev => [...newPosts, ...prev]);
    setForm({ name: "", bio: "", price: 29, avatarSrc: null, photos: [null, null, null, null] });
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 300);
    setForm(f => ({ ...f, avatarSrc: dataUrl }));
  }

  async function handleSlotUpload(index, file) {
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 700);
    setForm(f => {
      const photos = [...f.photos];
      photos[index] = dataUrl;
      return { ...f, photos };
    });
  }

  async function handlePostImage(creatorId, file) {
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 700);
    setQuickPost(q => ({ ...q, [creatorId]: { ...(q[creatorId] || {}), image: dataUrl } }));
  }

  function addQuickPost(creatorId) {
    const qp = quickPost[creatorId] || {};
    setPosts(prev => [{
      id: uid(),
      creatorId,
      caption: qp.caption || pick(CAPTIONS),
      image: qp.image || null,
      ...randomPostStats(),
    }, ...prev]);
    setQuickPost(q => ({ ...q, [creatorId]: {} }));
  }

  return (
    <div className="px-3 flex flex-col gap-5">
      <button
        onClick={seedDemo}
        className="flex items-center justify-center gap-2 bg-white border border-orange-200 text-red-500 font-medium text-sm rounded-2xl py-2.5"
      >
        <Users size={16} /> Popular com 6 conversas de teste
      </button>

      <div className="bg-white rounded-2xl border border-orange-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-800">Novo personagem</h3>
          <button onClick={randomize} className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
            <Shuffle size={16} /> Gerar aleatório
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => fileRef.current?.click()}>
            <Avatar name={form.name || "?"} color={colorFor(form.name || "?")} initials={initials(form.name || "?")} src={form.avatarSrc} size={56} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <button onClick={() => fileRef.current?.click()} className="text-xs text-stone-400 underline">Foto de perfil (opcional)</button>
        </div>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Nome do personagem"
          className="w-full bg-orange-50 rounded-lg px-3 py-2 text-sm mb-2 outline-none"
        />
        <textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          placeholder="Bio (opcional)"
          rows={2}
          className="w-full bg-orange-50 rounded-lg px-3 py-2 text-sm mb-2 outline-none resize-none"
        />
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-stone-500">Preço assinatura R$</span>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            className="w-20 bg-orange-50 rounded-lg px-2 py-1 text-sm outline-none"
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-600">Fotos do feed</span>
          <span className={`text-xs font-medium ${filledPhotos === 4 ? "text-green-600" : "text-stone-400"}`}>{filledPhotos}/4 obrigatórias</span>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => photoRefs[i].current?.click()}
              className="aspect-square rounded-lg bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center overflow-hidden relative"
            >
              <input
                ref={photoRefs[i]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleSlotUpload(i, e.target.files?.[0])}
              />
              {form.photos[i] ? (
                <img src={form.photos[i]} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={18} className="text-orange-300" />
              )}
            </button>
          ))}
        </div>
        {!canPublish && form.name.trim() && (
          <p className="text-xs text-stone-400 mb-2">Faltam {4 - filledPhotos} foto(s) para publicar este personagem no feed.</p>
        )}
        <button
          onClick={addCreator}
          disabled={!canPublish}
          className="w-full bg-gradient-to-r from-orange-400 to-red-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Publicar personagem
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-stone-800 mb-2 px-1">Personagens cadastrados · {creators.length}</h3>
        <div className="flex flex-col gap-3">
          {creators.length === 0 && <div className="text-center text-stone-400 text-sm py-6">Nenhum ainda.</div>}
          {creators.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-orange-100 p-3">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} color={c.color} initials={c.initials} src={c.avatarSrc} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-stone-800 text-sm truncate">{c.name}</div>
                  <div className="text-stone-400 text-xs">@{c.username} · R${c.price}</div>
                </div>
                <button onClick={() => deleteCreator(c.id)}>
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-50 flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handlePostImage(c.id, e.target.files?.[0])}
                  />
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400">
                    <ImageIcon size={16} />
                  </div>
                </label>
                <input
                  value={quickPost[c.id]?.caption || ""}
                  onChange={e => setQuickPost(q => ({ ...q, [c.id]: { ...(q[c.id] || {}), caption: e.target.value } }))}
                  placeholder="Legenda de post extra"
                  className="flex-1 bg-orange-50 rounded-lg px-3 py-2 text-xs outline-none"
                />
                <button onClick={() => addQuickPost(c.id)} className="text-xs font-semibold text-red-500 px-2">
                  Postar
                </button>
              </div>
              {quickPost[c.id]?.image && (
                <img src={quickPost[c.id].image} alt="" className="mt-2 h-16 rounded-lg object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- root ----------

// bottom bar — mirrors the reference layout: 4 icons, no labels
const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Buscar", icon: Search },
  { id: "messages", label: "Mensagens", icon: Mail },
  { id: "profile", label: "Perfil", icon: User },
];

// screens reachable only from the ☰ menu (not in the bottom bar)
const MENU_NAV = [
  { id: "cadastro", label: "Cadastro", icon: Pencil },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [creators, setCreators] = useState([]);
  const [posts, setPosts] = useState([]);
  const [chats, setChats] = useState({});
  const [profileId, setProfileId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [tipTarget, setTipTarget] = useState(null); // creator object or null
  const [pendingTip, setPendingTip] = useState(null);
  const [pendingTipTarget, setPendingTipTarget] = useState(null);
  const [mimoFlash, setMimoFlash] = useState(null); // { id, amount } while the money animation plays
  const [loaded, setLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [setMode, setSetMode] = useState(false); // SET / chroma-key screen active
  const [liveMode, setLiveMode] = useState(false); // Live (camera) screen active

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = e => setIsDesktop(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, []);

  const isRemoteUpdate = useRef(false);
  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, snap => {
      if (snap.exists()) {
        const data = snap.data();
        isRemoteUpdate.current = true;
        setCreators(data.creators || []);
        setPosts(data.posts || []);
        setChats(data.chats || {});
      }
      setLoaded(true);
    }, () => setLoaded(true));
    return () => unsub();
  }, []);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    const t = setTimeout(() => {
      setDoc(DOC_REF, { creators, posts, chats }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [creators, posts, chats, loaded]);

  useEffect(() => {
    // desktop shows list + conversation side by side, so preselect the first chat.
    // on mobile the user should land on the conversation list.
    if (isDesktop && screen === "messages" && !activeChatId && creators.length > 0) {
      setActiveChatId(creators[0].id);
    }
  }, [isDesktop, screen, activeChatId, creators]);

  function goToScreen(id) {
    if (id === "messages") setActiveChatId(null);
    setScreen(id);
  }

  function openProfile(id) {
    setProfileId(id);
    setScreen("profile");
  }

  function deleteCreator(id) {
    setCreators(prev => prev.filter(c => c.id !== id));
    setPosts(prev => prev.filter(p => p.creatorId !== id));
    setChats(prev => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
  }

  function deletePost(id) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  function toggleLike(postId) {
    setLikedPosts(prev => {
      const s = new Set(prev);
      s.has(postId) ? s.delete(postId) : s.add(postId);
      return s;
    });
  }
  function toggleSaved(postId) {
    setSavedPosts(prev => {
      const s = new Set(prev);
      s.has(postId) ? s.delete(postId) : s.add(postId);
      return s;
    });
  }

  function openTip(creator) {
    setTipTarget(creator);
  }
  function sendTip(amount) {
    if (tipTarget) {
      const flash = { id: uid(), amount };
      setMimoFlash(flash);
      setTimeout(() => setMimoFlash(f => (f && f.id === flash.id ? null : f)), 1800);
      setPendingTipTarget(tipTarget.id);
      setPendingTip(amount);
      setActiveChatId(tipTarget.id);
      setScreen("messages");
    }
    setTipTarget(null);
  }

  const activeCreator = creators.find(c => c.id === profileId);
  const mobileMessages = !isDesktop && screen === "messages";

  return (
    <div
      className={`bg-orange-50 text-stone-800 ${isDesktop ? "min-h-screen" : "h-[100dvh] flex flex-col overflow-hidden"}`}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* mobile header — hidden on the messages screen, which has its own gradient bar */}
      {!isDesktop && !mobileMessages && (
        <div
          className="flex items-center justify-between px-4 pb-3 bg-white border-b border-orange-100 shrink-0 z-10"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.85rem)" }}
        >
          <button onClick={() => setMenuOpen(true)}>
            <Menu size={22} className="text-orange-500" />
          </button>
          <Logo size="sm" />
          <Bell size={20} className="text-orange-500" />
        </div>
      )}

      <div className={isDesktop ? "flex max-w-5xl mx-auto" : "flex-1 min-h-0 flex flex-col overflow-hidden"}>
        {/* desktop sidebar */}
        {isDesktop && (
          <div className="flex flex-col w-56 p-5 sticky top-0 h-screen shrink-0">
            <div className="mb-8"><Logo size="lg" /></div>
            <div className="flex flex-col gap-1">
              {[...NAV, ...MENU_NAV].map(n => (
                <button
                  key={n.id}
                  onClick={() => goToScreen(n.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${screen === n.id ? "text-red-500 bg-orange-50" : "text-stone-500"}`}
                >
                  <n.icon size={19} /> {n.label}
                </button>
              ))}
              <button
                onClick={() => setLiveMode(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-stone-600"
              >
                <Radio size={19} /> Live
              </button>
              <button
                onClick={() => setSetMode(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left text-white bg-stone-800 mt-2"
              >
                <Clapperboard size={19} /> SET
              </button>
            </div>
          </div>
        )}

        {/* main content — the only scroll area on mobile, so the bottom bar stays put */}
        <div
          className={
            isDesktop
              ? "flex-1 py-6 max-w-xl mx-auto w-full"
              : mobileMessages
                ? "flex-1 min-h-0 flex flex-col w-full"
                : "flex-1 min-h-0 overflow-y-auto w-full max-w-xl mx-auto pt-4 pb-28"
          }
        >
          {screen === "home" && (
            <>
              {isDesktop && <h1 className="text-lg font-bold mb-3">Home</h1>}
              <HomeFeed
                creators={creators}
                posts={posts}
                toggleLike={toggleLike}
                likedPosts={likedPosts}
                savedPosts={savedPosts}
                toggleSaved={toggleSaved}
                openProfile={openProfile}
                openTip={openTip}
                deletePost={deletePost}
              />
            </>
          )}
          {screen === "search" && (
            <div className="flex flex-col items-center justify-center text-center py-24 px-6 text-stone-400">
              <Search size={40} className="mb-3" />
              <p className="font-medium text-stone-500">Busca</p>
              <p className="text-sm mt-1">Em breve.</p>
            </div>
          )}
          {screen === "profile" && (
            <ProfileScreen
              creator={activeCreator || creators[0]}
              posts={posts}
              onBack={() => setScreen("home")}
              openTip={openTip}
              isDesktop={isDesktop}
              deletePost={deletePost}
            />
          )}
          {screen === "messages" && (
            <MessagesScreen
              creators={creators}
              chats={chats}
              setChats={setChats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              openTip={openTip}
              tipTargetId={pendingTipTarget}
              pendingTip={pendingTip}
              clearPendingTip={() => { setPendingTip(null); setPendingTipTarget(null); }}
              isDesktop={isDesktop}
              onExit={() => setScreen("home")}
            />
          )}
          {screen === "cadastro" && (
            <CadastroScreen
              creators={creators}
              setCreators={setCreators}
              posts={posts}
              setPosts={setPosts}
              setChats={setChats}
              deleteCreator={deleteCreator}
            />
          )}
        </div>
      </div>

      {/* mobile bottom nav — flex child (not fixed), so it never slides while the feed scrolls.
          Hidden inside an open conversation (full-screen chat). */}
      {!isDesktop && !(mobileMessages && activeChatId) && (
        <div
          className="fixed bottom-0 inset-x-0 bg-white flex justify-around pt-2.5 z-30"
          style={{
            paddingBottom: "max(calc(env(safe-area-inset-bottom) - 0.75rem), 0.4rem)",
            boxShadow: "0 -1px 0 rgba(0,0,0,0.06)",
          }}
        >
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => goToScreen(n.id)}
              aria-label={n.label}
              className={`px-4 ${screen === n.id ? "text-red-500" : "text-stone-400"}`}
            >
              <n.icon size={24} />
            </button>
          ))}
        </div>
      )}

      {/* ☰ drawer (mobile) — holds screens not in the bottom bar */}
      {!isDesktop && menuOpen && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-64 h-full p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <Logo size="sm" />
              <button onClick={() => setMenuOpen(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div className="flex flex-col gap-1">
              {MENU_NAV.map(n => (
                <button
                  key={n.id}
                  onClick={() => { goToScreen(n.id); setMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${screen === n.id ? "text-red-500 bg-orange-50" : "text-stone-600"}`}
                >
                  <n.icon size={19} /> {n.label}
                </button>
              ))}
              <button
                onClick={() => { setLiveMode(true); setMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-stone-700"
              >
                <Radio size={19} className="text-red-500" /> Live
              </button>
              <button
                onClick={() => { setSetMode(true); setMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-left text-white bg-stone-800 mt-3"
              >
                <Clapperboard size={19} /> SET
              </button>
              <p className="text-[11px] text-stone-400 px-3 mt-1.5 leading-snug">
                Live = câmera + chat simulado. SET = telas croma. Nas duas, segure 4s para liberar/sair.
              </p>
            </div>
          </div>
        </div>
      )}

      {tipTarget && (
        <TipModal
          targetName={tipTarget.name}
          onClose={() => setTipTarget(null)}
          onSend={sendTip}
          isDesktop={isDesktop}
        />
      )}

      {mimoFlash && <MimoAnimation amount={mimoFlash.amount} />}

      {liveMode && <LiveScreen onExit={() => setLiveMode(false)} />}

      {setMode && <ChromaSet onExit={() => setSetMode(false)} isDesktop={isDesktop} />}
    </div>
  );
}
