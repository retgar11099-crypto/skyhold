import { useEffect, useRef, useState } from "react";
import { sb } from "./sb";

const EMAIL_DOMAIN = "players.dsv-zombi.local";

type Me = { id: string; nick: string; role: string };
type Contact = { id: string; nick: string; role: string };
type Msg = {
  id: string;
  sender: string;
  recipient: string;
  body: string;
  created_at: string;
  read_at: string | null;
};
type Pop = { id: string; peerId: string; nick: string; body: string };

const emailFor = (nick: string) => `${nick.toLowerCase()}@${EMAIL_DOMAIN}`;
const resolveNick = (u: any) =>
  (u?.user_metadata?.nick as string) || u?.email?.split("@")[0] || "user";
const timeOf = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function NexusPhone() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authErr, setAuthErr] = useState("");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [peer, setPeer] = useState<Contact | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [pops, setPops] = useState<Pop[]>([]);

  const peerRef = useRef<Contact | null>(null);
  peerRef.current = peer;
  const openRef = useRef(false);
  openRef.current = open;
  const contactsRef = useRef<Contact[]>([]);
  contactsRef.current = contacts;
  const meRef = useRef<Me | null>(null);
  meRef.current = me;
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread, open]);

  const loadContacts = async (myId: string) => {
    if (!sb) return;
    const { data } = await sb.from("profiles").select("id,nick,role").neq("id", myId).order("nick");
    setContacts((data as Contact[]) || []);
  };

  const loadThread = async (myId: string, other: Contact) => {
    if (!sb) return;
    const { data } = await sb
      .from("pm_messages")
      .select("*")
      .or(
        `and(sender.eq.${myId},recipient.eq.${other.id}),and(sender.eq.${other.id},recipient.eq.${myId})`,
      )
      .order("created_at", { ascending: true })
      .limit(200);
    setThread((data as Msg[]) || []);
    await sb
      .from("pm_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient", myId)
      .eq("sender", other.id)
      .is("read_at", null);
  };

  const bootstrap = async (user: any) => {
    if (!sb || !user) return;
    const { data } = await sb.from("profiles").select("id,nick,role").eq("id", user.id).maybeSingle();
    const profile: Me =
      (data as Me) || { id: user.id, nick: resolveNick(user), role: "player" };
    setMe(profile);
    await loadContacts(profile.id);
  };

  useEffect(() => {
    if (!sb) {
      setReady(true);
      return;
    }
    let channel: any = null;
    (async () => {
      const { data } = await sb.auth.getSession();
      const user = data?.session?.user;
      if (user) await bootstrap(user);
      setReady(true);

      channel = sb
        .channel("skyphone-pm")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "pm_messages" },
          (payload: any) => {
            const m = payload.new as Msg;
            const cur = meRef.current;
            if (!cur) return;
            if (m.sender !== cur.id && m.recipient !== cur.id) return;
            const p = peerRef.current;
            const threadActive = openRef.current && p && (p.id === m.sender || p.id === m.recipient);
            if (threadActive) {
              setThread((t) => (t.some((x) => x.id === m.id) ? t : [...t, m]));
            } else if (m.recipient === cur.id) {
              setUnread((u) => ({ ...u, [m.sender]: (u[m.sender] || 0) + 1 }));
              const from = contactsRef.current.find((c) => c.id === m.sender);
              const pop: Pop = {
                id: m.id,
                peerId: m.sender,
                nick: from?.nick || "Игрок",
                body: m.body,
              };
              setPops((list) => [...list, pop]);
              window.setTimeout(
                () => setPops((list) => list.filter((x) => x.id !== pop.id)),
                6500,
              );
            }
          },
        )
        .subscribe();
    })();
    return () => {
      if (channel) sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) return setAuthErr("Сеть недоступна.");
    const loginEmail = nick.includes("@") ? nick.trim() : emailFor(nick.trim());
    setBusy(true);
    setAuthErr("");
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        setAuthErr("Неверный позывной/почта или пароль.");
        return;
      }
      await bootstrap(data.user);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    if (!sb) return;
    await sb.auth.signOut();
    setMe(null);
    setPeer(null);
    setThread([]);
    setContacts([]);
    setNick("");
    setPassword("");
  };

  const openPeer = async (c: Contact) => {
    if (!me) return;
    setPeer(c);
    setUnread((u) => ({ ...u, [c.id]: 0 }));
    await loadThread(me.id, c);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb || !me || !peer) return;
    const body = text.trim();
    if (!body) return;
    setText("");
    const optimistic: Msg = {
      id: "tmp-" + Date.now(),
      sender: me.id,
      recipient: peer.id,
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setThread((t) => [...t, optimistic]);
    const { error } = await sb.from("pm_messages").insert({ sender: me.id, recipient: peer.id, body });
    if (error) {
      setThread((t) => t.filter((x) => x.id !== optimistic.id));
      setText(body);
    }
  };

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const openFromPop = async (pop: Pop) => {
    setPops((list) => list.filter((x) => x.id !== pop.id));
    setOpen(true);
    const c = contactsRef.current.find((x) => x.id === pop.peerId);
    const my = meRef.current;
    if (c && my) {
      setPeer(c);
      setUnread((u) => ({ ...u, [c.id]: 0 }));
      await loadThread(my.id, c);
    }
  };

  return (
    <>
      <style>{PHONE_CSS}</style>

      <button
        className="nxp-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="NEXUS-LINK"
        title="NEXUS-LINK — сообщения"
      >
        <span className="nxp-fab-ico">▤</span>
        {totalUnread > 0 && <span className="nxp-fab-badge">{totalUnread}</span>}
      </button>

      <div className={`nxp-shell ${open ? "is-open" : ""}`} role="dialog" aria-hidden={!open}>
        <div className="nxp-head">
          <span className="nxp-title">NEXUS&#8202;//&#8202;LINK</span>
          <span className="nxp-sub">{me ? `@${me.nick}` : "оффлайн"}</span>
          <button className="nxp-x" onClick={() => setOpen(false)} aria-label="Закрыть">
            ×
          </button>
        </div>

        {!ready ? (
          <div className="nxp-body"><p className="nxp-note">ПОДКЛЮЧЕНИЕ К СЕТИ…</p></div>
        ) : !sb ? (
          <div className="nxp-body"><p className="nxp-note">СЕТЬ НЕДОСТУПНА. Перезагрузи страницу.</p></div>
        ) : !me ? (
          <form className="nxp-body nxp-login" onSubmit={login}>
            <p className="nxp-note">ВОЙДИ В ЕДИНЫЙ АККАУНТ СЕТИ, ЧТОБЫ ПИСАТЬ ИГРОКАМ.</p>
            <input
              className="nxp-input"
              placeholder="Позывной или e-mail"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              autoFocus
            />
            <input
              className="nxp-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authErr && <p className="nxp-err">{authErr}</p>}
            <button className="nxp-btn" type="submit" disabled={busy}>
              {busy ? "ВХОД…" : "ВОЙТИ"}
            </button>
            <p className="nxp-hint">Аккаунт один на всю сеть — регистрация на protocold7.ru.</p>
          </form>
        ) : !peer ? (
          <div className="nxp-body">
            <div className="nxp-row-head">
              <span className="nxp-eyebrow">КОНТАКТЫ</span>
              <button className="nxp-mini" onClick={logout}>ВЫЙТИ</button>
            </div>
            <ul className="nxp-list">
              {contacts.length === 0 && <li className="nxp-note">Пока никого нет.</li>}
              {contacts.map((c) => (
                <li key={c.id}>
                  <button className="nxp-contact" onClick={() => openPeer(c)}>
                    <span className="nxp-av">{c.nick.slice(0, 2).toUpperCase()}</span>
                    <span className="nxp-cinfo">
                      <b>{c.nick}</b>
                      <small>{c.role === "founder" ? "ОСНОВАТЕЛЬ" : c.role === "admin" ? "АДМИН" : "ИГРОК"}</small>
                    </span>
                    {(unread[c.id] || 0) > 0 && <span className="nxp-dot">{unread[c.id]}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="nxp-body nxp-chatwrap">
            <div className="nxp-row-head">
              <button className="nxp-mini" onClick={() => { setPeer(null); setThread([]); }}>← НАЗАД</button>
              <span className="nxp-peer">{peer.nick}</span>
            </div>
            <div className="nxp-thread">
              {thread.length === 0 && <p className="nxp-note">Начни переписку.</p>}
              {thread.map((m) => (
                <div key={m.id} className={`nxp-msg ${m.sender === me.id ? "out" : "in"}`}>
                  <span className="nxp-bubble">{m.body}</span>
                  <span className="nxp-time">{timeOf(m.created_at)}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="nxp-compose" onSubmit={send}>
              <input
                className="nxp-input"
                placeholder="Сообщение…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
              />
              <button className="nxp-btn" type="submit">▶</button>
            </form>
          </div>
        )}
      </div>

      <div className="nxp-toasts" aria-live="polite">
        {pops.map((p) => (
          <button key={p.id} className="nxp-toast" onClick={() => openFromPop(p)}>
            <span className="nxp-toast-top">
              <span className="nxp-toast-call">ВХОДЯЩЕЕ СООБЩЕНИЕ</span>
              <span className="nxp-toast-x" aria-hidden>↵</span>
            </span>
            <span className="nxp-toast-nick">{p.nick}</span>
            <span className="nxp-toast-body">{p.body}</span>
            <span className="nxp-toast-cta">ОТКРЫТЬ NEXUS-LINK ▤</span>
          </button>
        ))}
      </div>
    </>
  );
}

const GOLD = "#c7a15a";

const PHONE_CSS = `
.nxp-fab{position:fixed;right:22px;bottom:22px;z-index:9000;width:52px;height:52px;border:1px solid ${GOLD};
  background:rgba(13,14,13,.92);color:${GOLD};font-size:20px;cursor:pointer;
  box-shadow:0 0 18px rgba(199,161,90,.3);transition:box-shadow .2s,transform .2s}
.nxp-fab:hover{box-shadow:0 0 28px rgba(199,161,90,.55);transform:translateY(-2px)}
.nxp-fab-ico{line-height:1}
.nxp-fab-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:9px;
  background:#8c3a2e;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center}
.nxp-shell{position:fixed;right:22px;bottom:86px;z-index:9000;width:min(360px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));
  display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(18,17,14,.97),rgba(10,10,9,.98));
  border:1px solid rgba(199,161,90,.4);box-shadow:0 0 40px rgba(199,161,90,.12),inset 0 0 60px rgba(0,0,0,.6);
  transform:translateY(14px) scale(.98);opacity:0;pointer-events:none;transition:opacity .22s ease,transform .22s ease;
  font-family:'Manrope',ui-monospace,monospace;color:#e7e1d6}
.nxp-shell.is-open{opacity:1;transform:none;pointer-events:auto}
.nxp-shell::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(199,161,90,.04) 0 1px,transparent 1px 3px)}
.nxp-head{position:relative;display:flex;align-items:baseline;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(199,161,90,.3);
  background:rgba(199,161,90,.06)}
.nxp-title{font-family:'Cinzel',serif;font-weight:700;letter-spacing:.14em;color:${GOLD};font-size:13px}
.nxp-sub{margin-left:auto;font-size:10px;color:#a99e87;letter-spacing:.1em}
.nxp-x{background:none;border:0;color:${GOLD};font-size:20px;cursor:pointer;line-height:1;margin-left:8px}
.nxp-body{position:relative;flex:1;overflow:auto;padding:14px}
.nxp-note{color:#8b8577;font-size:11px;letter-spacing:.06em;line-height:1.6}
.nxp-err{color:#d16a5a;font-size:11px}
.nxp-hint{color:#6e6a5e;font-size:10px;line-height:1.6}
.nxp-login{display:flex;flex-direction:column;gap:10px}
.nxp-input{width:100%;box-sizing:border-box;padding:10px 12px;background:rgba(199,161,90,.06);
  border:1px solid rgba(199,161,90,.32);color:#f0ead9;font-family:inherit;font-size:13px;outline:none}
.nxp-input:focus{border-color:${GOLD};box-shadow:0 0 14px rgba(199,161,90,.22)}
.nxp-btn{padding:10px 16px;background:${GOLD};color:#151310;border:0;font-family:'Cinzel',serif;font-weight:700;
  letter-spacing:.1em;cursor:pointer}
.nxp-btn:disabled{opacity:.6;cursor:default}
.nxp-row-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.nxp-eyebrow{color:${GOLD};font-size:10px;letter-spacing:.24em}
.nxp-mini{margin-left:auto;background:none;border:1px solid rgba(199,161,90,.3);color:#b8ab8d;font-family:inherit;
  font-size:10px;letter-spacing:.1em;padding:4px 8px;cursor:pointer}
.nxp-peer{font-family:'Cinzel',serif;font-weight:700;color:${GOLD};letter-spacing:.06em}
.nxp-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.nxp-contact{display:flex;width:100%;align-items:center;gap:10px;padding:9px 8px;background:none;border:0;
  border-left:2px solid transparent;color:inherit;text-align:left;cursor:pointer}
.nxp-contact:hover{background:rgba(199,161,90,.07);border-left-color:${GOLD}}
.nxp-av{display:grid;place-items:center;width:34px;height:34px;flex:0 0 auto;background:rgba(199,161,90,.1);
  border:1px solid rgba(199,161,90,.35);color:${GOLD};font-size:11px;font-weight:700}
.nxp-cinfo{display:flex;flex-direction:column;gap:2px;min-width:0}
.nxp-cinfo b{font-family:'Manrope',sans-serif;font-size:13px;color:#f0ead9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nxp-cinfo small{color:#77715f;font-size:9px;letter-spacing:.14em}
.nxp-dot{margin-left:auto;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:${GOLD};color:#151310;
  font-size:11px;font-weight:700;display:grid;place-items:center}
.nxp-chatwrap{display:flex;flex-direction:column;padding-bottom:0}
.nxp-thread{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:6px 0}
.nxp-msg{display:flex;flex-direction:column;max-width:82%}
.nxp-msg.in{align-self:flex-start}
.nxp-msg.out{align-self:flex-end;align-items:flex-end}
.nxp-bubble{padding:8px 11px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word;border:1px solid}
.nxp-msg.in .nxp-bubble{background:rgba(199,161,90,.08);border-color:rgba(199,161,90,.3);color:#e7e1d6}
.nxp-msg.out .nxp-bubble{background:rgba(199,161,90,.14);border-color:rgba(199,161,90,.45);color:#faf5e6}
.nxp-time{font-size:9px;color:#6e6a5e;margin-top:3px;letter-spacing:.06em}
.nxp-compose{display:flex;gap:8px;padding:10px 0;border-top:1px solid rgba(199,161,90,.2)}
.nxp-compose .nxp-input{flex:1}
.nxp-compose .nxp-btn{padding:0 16px}
.nxp-toasts{position:fixed;top:22px;right:22px;z-index:9100;display:flex;flex-direction:column;gap:8px;
  width:min(320px,calc(100vw - 32px))}
.nxp-toast{position:relative;display:flex;flex-direction:column;gap:3px;text-align:left;cursor:pointer;
  padding:11px 13px;background:linear-gradient(180deg,rgba(18,17,14,.97),rgba(10,10,9,.98));
  border:1px solid rgba(199,161,90,.5);border-left:3px solid ${GOLD};
  box-shadow:0 0 26px rgba(199,161,90,.18);color:#e7e1d6;font-family:'Manrope',sans-serif;
  animation:nxp-pop-in .28s ease both}
.nxp-toast::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(199,161,90,.05) 0 1px,transparent 1px 3px)}
.nxp-toast-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.nxp-toast-call{font-size:9px;letter-spacing:.22em;color:#a99e87}
.nxp-toast-x{font-size:12px;color:${GOLD}}
.nxp-toast-nick{font-family:'Cinzel',serif;font-weight:700;color:${GOLD};font-size:13px;letter-spacing:.05em}
.nxp-toast-body{font-size:12px;color:#d9d2c2;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.nxp-toast-cta{font-size:9px;letter-spacing:.16em;color:#a99e87;margin-top:3px}
@keyframes nxp-pop-in{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
@media (max-width:520px){.nxp-toasts{top:12px;right:12px;left:12px;width:auto}}
`;
