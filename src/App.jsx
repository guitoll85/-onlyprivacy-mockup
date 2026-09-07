import { useState, useEffect, useRef } from "react";
import {
  Home, MessageCircle, User, Plus, Heart, MessageSquare, Gem,
  Trash2, ArrowLeft, Image as ImageIcon, X, Shuffle,
  Bell, Bookmark, Send, Star, Banknote, Crown, Menu, Users, Pencil
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

function HomeFeed({ creators, posts, toggleLike, likedPosts, openProfile, openTip, toggleSaved, savedPosts }) {
  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-6 text-stone-400">
        <Users size={40} className="mb-3" />
        <p className="font-medium text-stone-500">Nenhum personagem cadastrado ainda</p>
        <p className="text-sm mt-1">Use a aba Cadastro para criar o primeiro perfil.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 px-3">
      {posts.length === 0 && (
        <div className="text-center text-stone-400 py-16 text-sm">Nenhuma publicação ainda. Adicione uma pelo Cadastro.</div>
      )}
      {posts.map(post => {
        const creator = creators.find(c => c.id === post.creatorId);
        if (!creator) return null;
        const liked = likedPosts.has(post.id);
        const saved = savedPosts.has(post.id);
        return (
          <div key={post.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <button onClick={() => openProfile(creator.id)}>
                <Avatar name={creator.name} color={creator.color} initials={creator.initials} src={creator.avatarSrc} size={40} />
              </button>
              <button className="text-left" onClick={() => openProfile(creator.id)}>
                <div className="font-semibold text-stone-800 text-sm leading-tight">{creator.name}</div>
                <div className="text-stone-400 text-xs">@{creator.username}</div>
              </button>
            </div>
            {post.caption && <div className="px-4 pb-2 text-stone-700 text-sm">{post.caption}</div>}
            {post.image ? (
              <img src={post.image} alt="" className="w-full max-h-[480px] object-cover" />
            ) : (
              <div className="w-full h-56 bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center text-orange-300">
                <ImageIcon size={36} />
              </div>
            )}
            <div className="flex items-center gap-5 px-4 py-3 text-stone-500">
              <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
                <Heart size={19} className={liked ? "fill-red-500 text-red-500" : ""} />
                <span className="text-sm">{post.likes + (liked ? 1 : 0)}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <MessageSquare size={19} />
                <span className="text-sm">{post.comments}</span>
              </div>
              <button onClick={() => openTip(creator)} className="flex items-center gap-1.5">
                <Gem size={19} />
                <span className="text-sm">{post.tips}</span>
              </button>
              <button onClick={() => toggleSaved(post.id)} className="ml-auto">
                <Bookmark size={19} className={saved ? "fill-stone-700 text-stone-700" : ""} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfileScreen({ creator, posts, onBack, openTip, isDesktop }) {
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
          <div key={post.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
            {post.caption && <div className="px-4 pt-3 pb-2 text-stone-700 text-sm">{post.caption}</div>}
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

function MessagesScreen({ creators, chats, setChats, activeChatId, setActiveChatId, openTip, tipTargetId, pendingTip, clearPendingTip, isDesktop }) {
  const [text, setText] = useState("");
  const [sendAs, setSendAs] = useState("me"); // 'me' | 'creator'
  const scrollRef = useRef(null);
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

  const list = (
    <div className={isDesktop ? "w-72 border-r border-orange-100 shrink-0" : (activeChatId ? "hidden" : "")}>
      <div className="px-4 py-3 font-semibold text-stone-800 border-b border-orange-100">Mensagens · {creators.length} chats</div>
      <div className="flex flex-col">
        {creators.length === 0 && <div className="text-center text-stone-400 text-sm py-10 px-4">Cadastre um personagem para começar a conversar.</div>}
        {creators.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChatId(c.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left border-b border-orange-50 w-full ${activeChatId === c.id ? "bg-orange-50" : ""}`}
          >
            <Avatar name={c.name} color={c.color} initials={c.initials} src={c.avatarSrc} size={44} />
            <div className="min-w-0">
              <div className="font-medium text-stone-800 text-sm truncate">{c.name}</div>
              <div className="text-stone-400 text-xs truncate">@{c.username}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const chat = activeCreator ? (
    <div className={`flex-1 flex flex-col ${isDesktop ? "min-h-[70vh]" : "min-h-[60vh]"}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-orange-100">
        {!isDesktop && (
          <button onClick={() => setActiveChatId(null)}><ArrowLeft size={20} className="text-stone-500" /></button>
        )}
        <Avatar name={activeCreator.name} color={activeCreator.color} initials={activeCreator.initials} src={activeCreator.avatarSrc} size={36} />
        <div>
          <div className="font-semibold text-stone-800 text-sm">{activeCreator.name}</div>
          <div className="text-stone-400 text-xs">@{activeCreator.username}</div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {(chats[activeChatId] || []).map(m => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            {m.type === "tip" ? (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-semibold">
                <Gem size={16} /> Enviou um mimo · {m.amount}
              </div>
            ) : (
              <div className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm ${m.from === "me" ? "bg-gradient-to-r from-orange-400 to-red-500 text-white" : "bg-orange-50 text-stone-700"}`}>
                {m.text}
              </div>
            )}
          </div>
        ))}
        {(chats[activeChatId] || []).length === 0 && (
          <div className="text-center text-stone-300 text-sm mt-10">Nenhuma mensagem ainda.</div>
        )}
      </div>
      <div className="border-t border-orange-100 p-3">
        <div className="flex items-center gap-2 mb-2 text-xs text-stone-400">
          <span>Enviar como:</span>
          <button
            onClick={() => setSendAs("me")}
            className={`px-2 py-0.5 rounded-full ${sendAs === "me" ? "bg-red-500 text-white" : "bg-stone-100"}`}
          >Você</button>
          <button
            onClick={() => setSendAs("creator")}
            className={`px-2 py-0.5 rounded-full ${sendAs === "creator" ? "bg-red-500 text-white" : "bg-stone-100"}`}
          >{activeCreator.name.split(" ")[0]}</button>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 rounded-full px-3 py-2">
          <button onClick={() => openTip(activeCreator)}><Gem size={19} className="text-orange-500" /></button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Escreva uma mensagem"
            className="flex-1 bg-transparent outline-none text-sm text-stone-700"
          />
          <button onClick={send}><Send size={19} className="text-red-500" /></button>
        </div>
      </div>
    </div>
  ) : (
    isDesktop ? <div className="flex-1 flex items-center justify-center text-stone-300 text-sm">Selecione uma conversa</div> : null
  );

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden flex mx-3" style={{ minHeight: "60vh" }}>
      {list}
      {chat}
    </div>
  );
}

function CadastroScreen({ creators, setCreators, posts, setPosts, deleteCreator }) {
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
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      tips: 0,
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
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      tips: 0,
    }, ...prev]);
    setQuickPost(q => ({ ...q, [creatorId]: {} }));
  }

  return (
    <div className="px-3 flex flex-col gap-5">
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

const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "messages", label: "Mensagens", icon: MessageCircle },
  { id: "cadastro", label: "Cadastro", icon: Pencil },
  { id: "profile", label: "Perfil", icon: User },
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
  const [loaded, setLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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
    if (screen === "messages" && !activeChatId && creators.length > 0) {
      setActiveChatId(creators[0].id);
    }
  }, [screen, activeChatId, creators]);

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
      setPendingTipTarget(tipTarget.id);
      setPendingTip(amount);
      if (screen !== "messages") {
        setActiveChatId(tipTarget.id);
      }
    }
    setTipTarget(null);
  }

  const activeCreator = creators.find(c => c.id === profileId);

  return (
    <div className="min-h-screen bg-orange-50 text-stone-800" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* mobile header */}
      {!isDesktop && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-orange-100 sticky top-0 z-10">
          <Menu size={22} className="text-stone-400" />
          <div className="font-bold text-lg flex items-center gap-1">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Only</span>
            <span className="text-stone-800">Privacy</span>
          </div>
          <Bell size={20} className="text-stone-400" />
        </div>
      )}

      <div className={isDesktop ? "flex max-w-5xl mx-auto" : ""}>
        {/* desktop sidebar */}
        {isDesktop && (
          <div className="flex flex-col w-56 p-5 sticky top-0 h-screen shrink-0">
            <div className="font-bold text-xl mb-8 flex items-center gap-1">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Only</span>
              <span>Privacy</span>
            </div>
            <div className="flex flex-col gap-1">
              {NAV.map(n => (
                <button
                  key={n.id}
                  onClick={() => setScreen(n.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${screen === n.id ? "text-red-500 bg-orange-50" : "text-stone-500"}`}
                >
                  <n.icon size={19} /> {n.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* main content */}
        <div className={`flex-1 py-4 ${isDesktop ? "py-6" : "pb-24"} max-w-xl mx-auto w-full`} style={isDesktop ? { marginLeft: 0 } : {}}>
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
              />
            </>
          )}
          {screen === "profile" && (
            <ProfileScreen
              creator={activeCreator || creators[0]}
              posts={posts}
              onBack={() => setScreen("home")}
              openTip={openTip}
              isDesktop={isDesktop}
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
            />
          )}
          {screen === "cadastro" && (
            <CadastroScreen
              creators={creators}
              setCreators={setCreators}
              posts={posts}
              setPosts={setPosts}
              deleteCreator={deleteCreator}
            />
          )}
        </div>
      </div>

      {/* mobile bottom nav */}
      {!isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 flex justify-around py-2 z-10">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setScreen(n.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${screen === n.id ? "text-red-500" : "text-stone-400"}`}
            >
              <n.icon size={21} />
              {n.label}
            </button>
          ))}
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
    </div>
  );
}
