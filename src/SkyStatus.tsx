import { useEffect, useState } from "react";

const STATUS_URL =
  "https://gist.githubusercontent.com/retgar11099-crypto/1f133bc097fcf50da45aa81e9426fe46/raw/status.json";

type ServerStatus = { online?: boolean; players?: number; max?: number };

export default function SkyStatus() {
  const [s, setS] = useState<ServerStatus | null>(null);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(STATUS_URL, { cache: "no-store" });
        const j = await r.json();
        if (alive) setS((j?.servers?.skyhold as ServerStatus) || null);
      } catch {
        if (alive) setS(null);
      }
    };
    load();
    const t = window.setInterval(load, 60000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  if (hide) return null;
  if (!s?.online) {
    return (
      <div className="sky-status fixed bottom-6 left-6 z-[8800] hidden items-center gap-2 border border-white/15 bg-black/70 px-3 py-2 text-[0.6rem] uppercase tracking-[0.22em] text-white/40 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        Сервер не отвечает
        <button className="ml-2 text-white/25 hover:text-white/60" onClick={() => setHide(true)} aria-label="Скрыть">×</button>
      </div>
    );
  }
  return (
    <div className="sky-status fixed bottom-6 left-6 z-[8800] hidden items-center gap-2 border border-[#c7a15a]/40 bg-black/70 px-3 py-2 text-[0.6rem] uppercase tracking-[0.22em] text-[#d9bb7a] sm:flex">
      <span className="status-pulse h-1.5 w-1.5 rounded-full bg-[#7fae62]" />
      Сервер онлайн {typeof s.players === "number" ? `· ${s.players}/${s.max ?? 100}` : ""}
      <button className="ml-2 text-white/25 hover:text-white/60" onClick={() => setHide(true)} aria-label="Скрыть">×</button>
      <style>{`.status-pulse{box-shadow:0 0 8px #7fae62aa}`}</style>
    </div>
  );
}
