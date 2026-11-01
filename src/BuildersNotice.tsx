import { useEffect, useState } from "react";

const STATUS_URL =
  "https://gist.githubusercontent.com/retgar11099-crypto/1f133bc097fcf50da45aa81e9426fe46/raw/status.json";

type ServerStatus = { online?: boolean; players?: number; max?: number };

const CLOSED_LINES = [
  "Привал, странник. Строители отложили кирки.",
  "Сайт не работает, потому что сервер закрыт: ворота Джандара на замок, стройка не затихает и в темноте.",
  "Мы валим камни и ровняем дорогу в город. Загляни в Discord — там говорят, когда распахнут ворота. Мы вернёмся за тобой.",
];

const OPEN_LINES = [
  "Привал, странник. Строители вытерли лбы и разогнули спины.",
  "Ворота открыты: сервер жив, сайт работает. Джандар ждёт в стенах.",
  "Заходи, пока стройка не заблокировала дорогу. Строители уже вернулись к делу.",
];

export default function BuildersNotice() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [step, setStep] = useState(0);

  const loadStatus = async () => {
    try {
      const r = await fetch(STATUS_URL, { cache: "no-store" });
      const j = await r.json();
      setStatus((j?.servers?.skyhold as ServerStatus) || null);
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => {
    if (!open) {
      setStep(0);
      return;
    }
    loadStatus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closed = !(status?.online ?? false);
  const lines = closed ? CLOSED_LINES : OPEN_LINES;

  useEffect(() => {
    if (!open || step >= lines.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 850);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, closed]);

  return (
    <>
      <button
        className="group inline-flex min-h-12 items-center justify-center gap-3 border border-white/25 bg-black/20 px-6 py-3 text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition duration-300 hover:border-[#c7a15a]/80 hover:text-[#dfbf79]"
        onClick={() => setOpen(true)}
      >
        Строители
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path
              d="M5 12h14M14 7l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="bld-overlay" onClick={() => setOpen(false)}>
          <div
            className="bld-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Сообщение строителей"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bld-head">
              <span className="bld-title">СТРОИТЕЛИ&#8202;//&#8202;ДЖАНДАР</span>
              <span
                className={`bld-state ${closed ? "" : "bld-state-ok"}`}
                role="status"
              >
                {closed ? "СЕРВЕР ЗАКРЫТ" : "СЕРВЕР ОНЛАЙН"}
              </span>
              <button className="bld-x" onClick={() => setOpen(false)} aria-label="Закрыть">×</button>
            </div>

            <div className="bld-body">
              {lines.slice(0, step).map((l, i) => (
                <p className="bld-line" key={i}>
                  {l}
                </p>
              ))}
              {step < lines.length && <p className="bld-cursor" aria-hidden>▍</p>}

              {status?.online && typeof status.players === "number" && (
                <p className="bld-meta">
                  В городе прямо сейчас: {status.players}/{status.max ?? 100}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{BLD_CSS}</style>
    </>
  );
}

const BLD_CSS = `
.bld-overlay{position:fixed;inset:0;z-index:9400;display:grid;place-items:center;background:rgba(5,6,5,.82);
  padding:20px;animation:bld-fade .2s ease both}
.bld-panel{position:relative;width:min(480px,100%);background:linear-gradient(180deg,#161511,#0e0e0c);
  border:1px solid rgba(199,161,90,.45);box-shadow:0 0 44px rgba(199,161,90,.14),inset 0 0 60px rgba(0,0,0,.5);
  font-family:'Manrope',sans-serif;color:#e7e1d6;animation:bld-rise .24s ease both}
.bld-panel::before{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(199,161,90,.04) 0 1px,transparent 1px 3px)}
.bld-head{position:relative;display:flex;align-items:baseline;gap:8px;padding:13px 16px;
  border-bottom:1px solid rgba(199,161,90,.3);background:rgba(199,161,90,.06)}
.bld-title{font-family:'Cinzel',serif;font-weight:700;letter-spacing:.14em;color:#c7a15a;font-size:13px}
.bld-state{margin-left:auto;font-size:9px;letter-spacing:.2em;color:#c96f5c;border:1px solid rgba(201,111,92,.45);padding:2px 7px}
.bld-state-ok{color:#8fbf72;border-color:rgba(143,191,114,.45)}
.bld-x{background:none;border:0;color:#c7a15a;font-size:20px;cursor:pointer;line-height:1;margin-left:10px}
.bld-body{position:relative;padding:18px 20px 20px}
.bld-line{margin:0 0 12px;text-align:left;font-size:14px;line-height:1.65;color:#ddd5c5;
  border-left:2px solid rgba(199,161,90,.5);padding-left:12px;animation:bld-fade .3s ease both}
.bld-cursor{margin:0 0 12px;padding-left:12px;color:#c7a15a;animation:bld-blink 1s steps(2) infinite}
.bld-meta{margin:14px 0 0;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#a99e87}
@keyframes bld-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes bld-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes bld-blink{50%{opacity:0}}
`;
