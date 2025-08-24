import React, { useEffect, useMemo, useState } from "react";

// --- Minimal single-file React + Tailwind app ---
// Features:
// - ELI5 toggle (fully clickable button, ARIA-friendly)
// - Font size slider (persists in localStorage)
// - Lesson cards (normal & ELI5 text)
// - Quick Quiz
// - Floating Help widget (stays in-bounds, responsive)
// - No high-contrast option (as requested)

// ---------- Helpers ----------
const LS_KEYS = {
  eli5: "app:eli5",
  fontSize: "app:fontSizePx",
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// ---------- Data ----------
const lessons = [
  {
    id: "lesson1",
    title: "Turning On a Computer",
    normal:
      "Press the power button on your computer case or laptop. Wait a few seconds until the screen lights up and the system loads.",
    eli5:
      "Find the round button with a line ⚡. Press it gently. Wait a bit — your computer wakes up like a person opening their eyes.",
  },
  {
    id: "lesson2",
    title: "Using a Mouse",
    normal:
      "Move the mouse on a flat surface. The pointer on the screen follows your hand movements. Click the left button to select.",
    eli5:
      "Slide the mouse like a tiny car 🚗. The arrow copies you! Tap the left button to pick things.",
  },
  {
    id: "lesson3",
    title: "Opening Programs",
    normal:
      "Click the Start button (Windows logo) on the taskbar. Choose a program from the list to open it.",
    eli5:
      "Click the little window button 🪟 at the corner. Pick the picture of the app you want—like choosing a toy from a box!",
  },
];

// ---------- Components ----------
function Toggle({
  pressed,
  onToggle,
  children,
  id,
}: {
  pressed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  id?: string;
}) {
  // Fully clickable button; no separate label to avoid click-miss issues
  return (
    <button
      id={id}
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-sm transition active:translate-y-[1px]
        ${pressed ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"}
      `}
    >
      <span className="inline-block h-5 w-9 rounded-full border border-black/10 bg-gray-200">
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            pressed ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      <span className="font-medium">{children}</span>
    </button>
  );
}

function LessonCard({
  title,
  normal,
  eli5,
  showEli5,
}: {
  title: string;
  normal: string;
  eli5: string;
  showEli5: boolean;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className={`leading-relaxed ${showEli5 ? "hidden" : "block"}`}>{normal}</p>
      <p className={`leading-relaxed text-lg ${showEli5 ? "block" : "hidden"}`}>{eli5}</p>
    </article>
  );
}

function Quiz() {
  const [answer, setAnswer] = useState<string | null>(null);
  const isCorrect = answer === "correct";

  return (
    <section id="quiz" className="rounded-2xl bg-sky-50 p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-xl font-semibold mb-3">Quick Quiz</h3>
      <p className="mb-3"><strong>Question:</strong> What button do you press to turn on a computer?</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { key: "correct", label: "The round button with a line" },
          { key: "mouse", label: "The mouse" },
          { key: "spacebar", label: "The keyboard spacebar" },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAnswer(opt.key)}
            className={`rounded-xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
              answer === opt.key
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {answer && (
        <p className={`mt-3 font-medium ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
          {isCorrect ? "✅ Correct! That’s the power button." : "❌ Not quite. Try again!"}
        </p>
      )}
    </section>
  );
}

function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "you" | "bot"; text: string }[]>([
    { from: "bot", text: "Hi! Need help? Ask me about any lesson." },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "you", text: t }]);
    // very simple canned reply
    setMessages((m) => [
      ...m,
      { from: "you", text: t },
      {
        from: "bot",
        text:
          "I’ll explain simply: computers are tools. Which part confuses you — power button, mouse, or opening apps?",
      },
    ]);
    setText("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat panel */}
      <div
        className={`mb-3 w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all ${
          open ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="bg-emerald-600 px-4 py-2 text-white">Quick Help</div>
        <div className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto p-3 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                m.from === "you"
                  ? "self-end bg-emerald-600 text-white"
                  : "self-start bg-gray-100 text-gray-900"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t p-2">
          <input
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="Type a question..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            aria-label="Type your question"
          />
          <button
            className="rounded-xl bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>

      {/* Toggle button (fully clickable) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="help-panel"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white shadow-lg transition hover:bg-emerald-700 active:translate-y-[1px]"
        title="Open help"
      >
        💬
      </button>
    </div>
  );
}

export default function App() {
  const [eli5, setEli5] = useState(false);
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = Number(localStorage.getItem(LS_KEYS.fontSize));
    return Number.isFinite(saved) ? clamp(saved, 14, 24) : 16;
  });

  useEffect(() => {
    const savedEli5 = localStorage.getItem(LS_KEYS.eli5);
    if (savedEli5) setEli5(savedEli5 === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.eli5, String(eli5));
  }, [eli5]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.fontSize, String(fontSize));
  }, [fontSize]);

  const fontClass = useMemo(() => `text-[${fontSize}px]`, [fontSize]);

  return (
    <div className={`min-h-dvh bg-gray-50 ${fontClass}`}>
      <header className="bg-emerald-600 px-6 py-6 text-white shadow">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold">Computer Literacy Learning Hub</h1>
          <p className="opacity-90">Learn the basics with accessibility‑friendly lessons and an ELI5 mode.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Controls */}
        <section className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <Toggle pressed={eli5} onToggle={() => setEli5((v) => !v)} id="eli5-toggle">
            {eli5 ? "ELI5: ON" : "ELI5: OFF"}
          </Toggle>

          <label htmlFor="font" className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-2 shadow-sm">
            <span className="whitespace-nowrap font-medium">Font Size</span>
            <input
              id="font"
              type="range"
              min={14}
              max={24}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(clamp(Number(e.target.value), 14, 24))}
              className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-600"
              aria-valuemin={14}
              aria-valuemax={24}
              aria-valuenow={fontSize}
              aria-label="Adjust font size"
            />
            <span className="tabular-nums text-sm text-gray-600">{fontSize}px</span>
          </label>
        </section>

        {/* Lessons */}
        <nav className="mb-4 flex flex-wrap justify-center gap-2">
          {lessons.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50"
            >
              {l.title}
            </a>
          ))}
          <a href="#quiz" className="rounded-xl border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">
            Quiz
          </a>
        </nav>

        <div className="grid gap-4">
          {lessons.map((l) => (
            <div id={l.id} key={l.id}>
              <LessonCard title={l.title} normal={l.normal} eli5={l.eli5} showEli5={eli5} />
            </div>
          ))}
          <Quiz />
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-sm text-gray-600">
        <h4 className="mb-1 font-semibold">Review of Related Literature (RRL)</h4>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            Nettur, S. B., Karpurapu, S., Nettur, U., & Gajja, L. S. (2024). Cypress copilot: Development of an AI
            assistant for boosting productivity and transforming web application testing. <em>IEEE Access</em>.
          </li>
          <li>
            Zhan, X., Xu, Y., & Liu, Y. (2024). Personalized UI layout generation using deep learning: An adaptive
            interface design approach for enhanced user experience. <em>JAIGS</em>, 6(1), 463–478.
          </li>
        </ul>
      </footer>

      <HelpWidget />
    </div>
  );
}
