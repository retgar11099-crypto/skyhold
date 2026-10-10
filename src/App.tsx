const LORE_URL =
  "https://docs.google.com/document/d/1av1iPQn4NIFczoYO9sSYpUTFECD1eX_q3c673oUlcS4/edit?usp=sharing"
const DISCORD_URL = "https://discord.gg/RJvGhBAdmc"

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 52"
      fill="none"
      className="h-9 w-8"
    >
      <path
        d="M22 2.5 39 9v14.5C39 35 32 44 22 49.5 12 44 5 35 5 23.5V9l17-6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M14 15.5h16M17 15.5v17M27 15.5v17M13 32.5h18M22 8v33"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}

function ExternalButton({
  href,
  children,
  variant = "gold",
}: {
  href: string
  children: React.ReactNode
  variant?: "gold" | "outline"
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] transition duration-300 ${
        variant === "gold"
          ? "bg-[#c7a15a] text-[#11110f] hover:bg-[#dfbf79]"
          : "border border-white/25 bg-black/20 text-[#eee9df] hover:border-[#c7a15a]/80 hover:text-[#dfbf79]"
      }`}
    >
      {children}
      <span className="transition-transform duration-300 group-hover:translate-x-1">
        <ArrowIcon />
      </span>
    </a>
  )
}

export default function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0e0d] text-[#e7e1d6]">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-16">
          <a
            href="#top"
            className="flex items-center gap-3 text-[#d4b675]"
            aria-label="SkyHold — на главную"
          >
            <ShieldMark />
            <span className="font-display text-xl tracking-[0.18em] text-[#f1eadc]">
              SKYHOLD
            </span>
          </a>

          <nav className="flex items-center gap-2 sm:gap-8" aria-label="Главное меню">
            <a
              href={LORE_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-white/65 transition hover:text-[#d4b675] sm:block"
            >
              Лор
            </a>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="border border-[#c7a15a]/70 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#d9bb7a] transition hover:bg-[#c7a15a] hover:text-black sm:px-5"
            >
              Discord
            </a>
          </nav>
        </div>
      </header>

      <section
        id="top"
        className="hero relative flex min-h-[760px] items-end sm:min-h-[820px] lg:min-h-screen"
      >
        <div className="hero-image absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,8,.96)_0%,rgba(8,9,8,.65)_48%,rgba(8,9,8,.18)_80%),linear-gradient(0deg,#0d0e0d_0%,transparent_40%)]" />
        <div className="noise absolute inset-0 opacity-25" />

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-24 pt-40 md:px-10 md:pb-28 lg:px-16 lg:pb-32">
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-4 text-[#c7a15a]">
              <span className="h-px w-10 bg-current" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.34em]">
                Хроники тёмного мира
              </p>
            </div>

            <h1 className="font-display text-[clamp(3.7rem,10vw,8.5rem)] leading-[0.82] tracking-[-0.045em] text-[#f1ede5]">
              SKY
              <span className="text-stroke block text-transparent">HOLD</span>
            </h1>

            <div className="mt-8 border-l border-[#c7a15a]/60 pl-5 sm:pl-7">
              <p className="max-w-xl text-lg leading-relaxed text-[#d4cec3] sm:text-xl">
                Джандар помнит каждого, кто осмелился войти. Здесь смерть
                не освобождает, а молчание трона пугает сильнее войны.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ExternalButton href={DISCORD_URL}>Войти в Джандар</ExternalButton>
              <ExternalButton href={LORE_URL} variant="outline">
                Читать лор
              </ExternalButton>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 z-10 hidden items-center gap-3 text-[0.6rem] uppercase tracking-[0.28em] text-white/35 lg:flex">
          <span>Листай вниз</span>
          <span className="h-px w-14 bg-white/25" />
        </div>
      </section>

      <section className="relative px-5 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="pointer-events-none absolute right-[-8rem] top-16 font-display text-[22rem] leading-none text-white/[0.018]">
          I
        </div>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div>
              <p className="eyebrow">Первый шаг</p>
              <h2 className="font-display mt-5 text-4xl leading-tight text-[#f0eadf] sm:text-5xl">
                Войти в
                <br />
                Джандар
              </h2>
              <div className="mt-7 h-px w-24 bg-[#c7a15a]" />
            </div>

            <div>
              <h3 className="font-display text-2xl text-[#ddd5c7] sm:text-3xl">
                Регистрация аккаунта
              </h3>
              <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[#c7a15a]">
                Чтобы ступить в город, сначала обрети имя.
              </p>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                Создай аккаунт — без него ты не существуешь ни в одном из
                указов, ни в одной анкете, ни в одной памяти Джандара.
                Анонимов здесь не хоронят. Их просто не было.
              </p>
              <div className="mt-9">
                <ExternalButton href={DISCORD_URL}>
                  Зарегистрировать аккаунт
                </ExternalButton>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/30">
                Регистрация и доступ к анкете проходят через сообщество Discord.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#111311]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="relative min-h-[390px] overflow-hidden lg:min-h-[680px]">
            <div className="discord-image absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111311] via-transparent to-black/15 lg:bg-gradient-to-r lg:from-transparent lg:to-[#111311]" />
            <div className="absolute bottom-7 left-7 border-l border-[#c7a15a] pl-4 text-[0.62rem] uppercase tracking-[0.26em] text-white/50">
              Джандар ждёт
            </div>
          </div>

          <div className="flex items-center px-5 py-20 md:px-12 lg:px-20 lg:py-24">
            <div className="max-w-xl">
              <p className="eyebrow">Сердце сервера</p>
              <h2 className="font-display mt-5 text-4xl leading-tight text-[#f0eadf] sm:text-5xl">
                Весь кровоток Джандара проходит через Discord
              </h2>
              <p className="mt-7 text-base leading-8 text-white/60 sm:text-lg">
                Тут живут указы короля и тут подаётся анкета на вступление.
                Вход в мир без Discord — вход вслепую. А в городе, где каждая
                тишина может оказаться Варделоном, вслепую не ходят.
              </p>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="group mt-8 inline-flex items-center gap-3 font-display text-xl text-[#d2b46f] transition hover:text-[#ecd08e]"
              >
                discord.gg/RJvGhBAdmc
                <span className="transition-transform group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 md:py-32 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Порядок вступления</p>
            <h2 className="font-display mt-5 text-4xl text-[#f0eadf] sm:text-5xl">
              Твоё имя станет частью хроники
            </h2>
          </div>

          <div className="mt-14 grid border-y border-white/10 md:grid-cols-2">
            <article className="relative py-10 md:border-r md:border-white/10 md:py-14 md:pr-12">
              <span className="font-display absolute right-6 top-5 text-7xl text-white/[0.035]">
                01
              </span>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#c7a15a]">
                Указы короля
              </p>
              <h3 className="font-display mt-5 text-2xl text-[#e6dfd3]">
                Властелин мёртв — но трон молчит не зря
              </h3>
              <p className="mt-5 text-base leading-7 text-white/55">
                На Discord выходят указы короля — законы, события и решения,
                которые меняют Джандар. Принимай участие и следи за
                переменами, пока твоё имя не попало в один из них против твоей
                воли.
              </p>
              <p className="mt-6 border-l border-white/15 pl-4 text-sm italic text-white/35">
                Указы публикуются в Discord-канале «Указы короля».
              </p>
            </article>

            <article className="relative border-t border-white/10 py-10 md:border-t-0 md:py-14 md:pl-12">
              <span className="font-display absolute right-6 top-5 text-7xl text-white/[0.035]">
                02
              </span>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[#c7a15a]">
                Подача анкеты
              </p>
              <h3 className="font-display mt-5 text-2xl text-[#e6dfd3]">
                Твой первый ритуал
              </h3>
              <p className="mt-5 text-base leading-7 text-white/55">
                Каждый, кто входит в Джандар, проходит через анкету — она
                связана с Discord-аккаунтом, так что соврать выйдет дороже, чем
                выжить. Заполни её, пройди проверку и получи право рождения в
                мире, где смерть не является освобождением.
              </p>
              <div className="mt-8">
                <ExternalButton href={DISCORD_URL} variant="outline">
                  Подать анкету
                </ExternalButton>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative mx-5 mb-5 overflow-hidden border border-[#c7a15a]/20 px-6 py-20 text-center md:mx-10 md:mb-10 md:px-10 md:py-28 lg:mx-16">
        <div className="cta-image absolute inset-0" />
        <div className="absolute inset-0 bg-[#090a09]/85" />
        <div className="noise absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-3xl">
          <p className="eyebrow">Врата открыты</p>
          <h2 className="font-display mt-5 text-4xl leading-tight text-[#f4eee4] sm:text-6xl">
            Джандар не обещает спасения
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/55">
            Но он даст тебе имя, историю и место среди тех, кого город ещё
            помнит.
          </p>
          <div className="mt-9">
            <ExternalButton href={DISCORD_URL}>Вступить в Discord</ExternalButton>
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-[0.62rem] uppercase tracking-[0.2em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 SkyHold. Хроники Джандара.</p>
          <div className="flex gap-6">
            <a className="transition hover:text-[#c7a15a]" href={LORE_URL}>
              Лор
            </a>
            <a className="transition hover:text-[#c7a15a]" href={DISCORD_URL}>
              Discord
            </a>
            <a
              className="transition hover:text-[#c7a15a]"
              href="https://unsplash.com/@cedericvandenberghe"
              target="_blank"
              rel="noreferrer"
            >
              Фото: C. Vandenberghe
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
