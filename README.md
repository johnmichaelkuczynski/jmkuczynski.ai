# 🎓 AI-Powered Courses — jmkuczynski.ai

**The complete digital showcase of John-Michael Kuczynski, PhD — AI Courseware Developer, philosopher, and builder of intelligent learning tools.**

One site. Fifty-one AI-powered courses. Thirty-nine working apps. And a live AI channel to the mind behind them all.

🌐 **Live at [jmkuczynski.ai](https://jmkuczynski.ai)**

---

## ✨ What This Is

A distinctive editorial-style web presence — cream, ink, and crimson, set in archival serif type — that puts an entire body of AI courseware in one place:

- **📚 51 AI Courses** — Every course hyperlinked and ready to launch, from logic and mathematics to psychoanalysis and economics. Each one is a fully AI-powered interactive learning experience, not a video playlist.
- **🛠️ 39 Key Apps** — A working arsenal of intelligent tools: graders, tutors, analyzers, generators. Every app listed is live and clickable.
- **🔗 Professional Record** — Direct links to Google Scholar, PhilPapers, Amazon, Amazon Music, and Quora — the full scholarly and creative footprint, open to every visitor.

---

## 🗣️ Ask Dr. K — A Live AI Dialogue

The centerpiece: a draggable, resizable dialogue window that channels Kuczynski's digital corpus in real time.

- **Voice-Powered Input** — Speak your question; professional-grade AssemblyAI transcription turns it into text instantly. No typing required.
- **Spoken Replies** — Toggle the speaker and hear answers read aloud.
- **Answer Length Control** — From *Super Concise* (50 words) to *Detailed* (1,200 words). You decide how deep the answer goes.
- **Bullet-Point Mode** — One click reformats replies as clean, scannable bullets.
- **Downloadable Transcripts** — Export any exchange as a text file with a single click.
- **Open Access** — Every visitor can ask questions, use voice input, and receive spoken replies immediately.

---

## 📊 Built-In Management & Analytics

- **Visitor Analytics** — An anonymous, cookie-based unique-visitor counter with no personal data collection.
- **Open Management Tools** — Timeline and content-management pages remain available without a login.
- **Profile & Record Editing** — Update the headline, accomplishments, and featured items directly from the browser.

---

## ⚙️ Technical Features

- **pnpm Monorepo Architecture** — Separate web frontend and API server artifacts sharing typed libraries.
- **Contract-First API** — Single OpenAPI document; React Query hooks for the UI and Zod validators for the server are generated from it.
- **AssemblyAI Speech-to-Text Pipeline** — Browser audio capture → raw upload → transcription job → polled result, with abort timeouts at every hop and per-user rate limiting to protect the API quota.
- **Login-Free Access** — All dialogue, voice, analytics, timeline, diagnostics, uploads, and management capabilities work without authentication.
- **Self-Rate-Limited AI Channel** — The dialogue proxy enforces per-IP limits to protect the shared upstream key.
- **Unique-Visitor Tracking** — PostgreSQL (Drizzle ORM) with cookie-deduplicated visitor rows and a live public count.
- **Full SEO Layer** — Rich meta tags, Open Graph and Twitter cards, JSON-LD structured data (Person + WebSite), robots.txt, and sitemap.

---

## 🔑 Required Secrets

- `KUCZYNSKI_BOT_API` — upstream key for the Ask Dr. K dialogue channel.
- `ASSEMBLYAI_API_KEY` — powers voice-to-text transcription.
- `DATABASE_URL` — PostgreSQL connection string (provisioned automatically on Replit).

---

## 🧭 Designed For

- **Students & Autodidacts** hunting for serious, AI-driven courses in philosophy, logic, mathematics, psychology, and economics.
- **Readers & Researchers** who want the complete Kuczynski record — publications, books, audiobooks — one click away.
- **The Curious** who would rather *ask the author directly* than read an FAQ. That's what the red button is for.

---

## 🏗️ Stack

React 18 · Vite · TypeScript · Tailwind CSS · Express · PostgreSQL · Drizzle ORM · AssemblyAI · pnpm workspaces

---

*"The record is open."*
