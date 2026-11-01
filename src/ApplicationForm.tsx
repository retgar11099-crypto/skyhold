import { useState } from "react";
import { sb } from "./sb";

type FormState = {
  nick: string;
  age: string;
  contact: string;
  story: string;
  hp: string; // honeypot
};

const empty: FormState = { nick: "", age: "", contact: "", story: "", hp: "" };

export default function ApplicationForm() {
  const [f, setF] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!sb) {
      setErr("Сеть недоступна. Подай анкету через Discord.");
      return;
    }
    if (f.hp) return; // bot trap
    setBusy(true);
    try {
      const payload = {
        nick: f.nick.trim(),
        age: Number(f.age) || null,
        discord_contact: f.contact.trim(),
        story: f.story.trim(),
        site: "skyhold",
      };
      const { error } = await sb.from("skyhold_applications").insert(payload);
      if (error) throw error;
      setOk(true);
      setF(empty);
    } catch {
      setErr("Анкета недоступна прямо сейчас. Подай её через Discord.");
    } finally {
      setBusy(false);
    }
  };

  if (ok) {
    return (
      <div className="mt-8 border border-[#c7a15a]/40 bg-black/30 p-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#c7a15a]">Анкета принята</p>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Твоё имя внесено в хронику. Решение по анкете объявят в Discord — следи за городом.
        </p>
        <button
          className="mt-4 text-[0.62rem] uppercase tracking-[0.2em] text-[#c7a15a] hover:text-[#ecd08e]"
          onClick={() => setOk(false)}
        >
          Подать ещё одну
        </button>
      </div>
    );
  }

  return (
    <form className="mt-8 border border-[#c7a15a]/25 bg-black/25 p-6 sm:p-8" onSubmit={submit}>
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#c7a15a]">
        Анкета на вступление
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="afm-label">
          <span>Игровой ник *</span>
          <input className="afm-input" required maxLength={40} value={f.nick} onChange={set("nick")} />
        </label>
        <label className="afm-label">
          <span>Возраст</span>
          <input className="afm-input" inputMode="numeric" maxLength={3} value={f.age} onChange={set("age")} />
        </label>
        <label className="afm-label sm:col-span-2">
          <span>Контакт в Discord *</span>
          <input className="afm-input" required maxLength={80} placeholder="nick#0000 или @nick" value={f.contact} onChange={set("contact")} />
        </label>
        <label className="afm-label sm:col-span-2">
          <span>Почему Джандар? *</span>
          <textarea
            className="afm-input afm-area"
            required
            maxLength={1500}
            rows={4}
            placeholder="Пара честных абзацев о себе и о том, что будешь строить."
            value={f.story}
            onChange={set("story")}
          />
        </label>
      </div>
      {/* honeypot */}
      <input className="hidden" tabIndex={-1} autoComplete="off" value={f.hp} onChange={set("hp")} />

      {err && <p className="mt-4 text-xs text-[#d16a5a]">{err}</p>}

      <button
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-[#c7a15a] px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#11110f] transition hover:bg-[#dfbf79] disabled:opacity-60"
        disabled={busy}
        type="submit"
      >
        {busy ? "Отправка…" : "Отправить анкету"}
      </button>
      <style>{AFM_CSS}</style>
    </form>
  );
}

const AFM_CSS = `
.afm-label{display:flex;flex-direction:column;gap:2px}
.afm-label span{color:#e7e1d6;font-size:0.65rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:6px}
.afm-label span::after{content:""}
.afm-input{width:100%;box-sizing:border-box;background:rgba(199,161,90,.06);border:1px solid rgba(199,161,90,.3);
  color:#f0ead9;padding:10px 12px;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
.afm-input:focus{border-color:#c7a15a;box-shadow:0 0 12px rgba(199,161,90,.2)}
.afm-area{resize:vertical;min-height:96px}
.afm-label span{position:relative}
.afm-label span:empty{display:none}
`;
