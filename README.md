# 🌟 Taliyo Marketplace — Your concierge for curated services

![Build](https://img.shields.io/badge/build-passing-22c55e?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-0ea5e9?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Supabase%20%7C%20Tailwind-22d3ee?style=for-the-badge)

> Discover, book, and manage services with a polished buyer experience and a command-ready admin cockpit — all under one brand.

---

## 📚 Table of Contents

1. [Overview](#-overview)
2. [Screenshots & Demo](#-screenshots--demo)
3. [Core Features](#-core-features)
4. [Tech Stack](#-tech-stack)
5. [Installation](#-installation)
6. [Usage](#-usage)
7. [Feature Highlights](#-feature-highlights)
8. [Folder Structure](#-folder-structure)
9. [Contributing](#-contributing)
10. [License](#-license)
11. [Team & Contact](#-team--contact)

---

## ✨ Overview

Taliyo Marketplace is a full-stack platform that blends a customer-facing storefront with a secure operations dashboard. Shoppers get a delightful browsing and booking experience, while admins orchestrate inventory, campaigns, and analytics with confidence.

**What makes it special?**

- Lightning-fast search, curated categories, and WhatsApp bookings out of the box.
- Modular design system built with Tailwind CSS + motion micro-interactions.
- Secure admin APIs powered by Supabase with row-level security and audit trails.

---

## 🖼 Screenshots & Demo

| Hero Landing            | Service Detail             | Checkout (WhatsApp)         |
| ----------------------- | -------------------------- | --------------------------- |
| _Add `./docs/hero.png`_ | _Add `./docs/service.png`_ | _Add `./docs/checkout.png`_ |

- **Live Demo:** _Add your deployment URL here_
- **Product Walkthrough:** _Add Loom/YouTube link here_

---

## 🧭 Core Features

- 🛍️ **Marketplace Frontend** — Browse curated categories, add to cart, and chat-to-book.
- 📱 **Mobile-first UI** — Optimized navigation, bottom tabs, and quick actions for touch users.
- 💬 **WhatsApp Booking Flow** — One-tap checkout that launches a personalized WhatsApp thread.
- 🔐 **Admin Control Room** — Manage services, categories, banners, and analytics with audit logs.
- ⚙️ **Bulk & Automation** — CSV imports, real-time stats, and scheduled media campaigns.

---

## ⚙️ Tech Stack

- ⚡ **App Framework:** ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
- 💡 **Language:** ![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
- 🎨 **Styling:** ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38bdf8?logo=tailwind-css&logoColor=white)
- 🧠 **Data Layer:** ![Supabase](https://img.shields.io/badge/Supabase-3ecf8e?logo=supabase&logoColor=white)
- 📊 **Charts & Insights:** ![Chart.js](https://img.shields.io/badge/Chart.js-f87171?logo=chart.js&logoColor=white)
- 🔌 **Messaging:** ![WhatsApp](https://img.shields.io/badge/WhatsApp%20API-25d366?logo=whatsapp&logoColor=white)

---

## 🛠 Installation

```bash
# Clone the mono-repo
git clone https://github.com/virajverse/Final-Taliyo-Marketplace.git
cd "Taliyo Marketplace (1)"

# Install dependencies for the consumer app
pnpm install

# Install admin panel deps
cd admin-panel
pnpm install
cd ..

# Configure environment
cp .env.example .env.local
cp admin-panel/.env.example admin-panel/.env.local
# fill in Supabase + WhatsApp settings

# Start both apps (in separate terminals)
pnpm dev                # consumer app (port 3000)
cd admin-panel && pnpm dev   # admin console (port 3001)
```

---

## 🚀 Usage

- **Consumer storefront:** `http://localhost:3000`
- **Admin console:** `http://localhost:3001`
- **Default admin login:** `admin@taliyo.com` / `admin123`

### Production build

```bash
pnpm build && pnpm start        # storefront
cd admin-panel && pnpm build && pnpm start
```

### Linting

```bash
pnpm lint
cd admin-panel && pnpm lint
```

---

## 🌟 Feature Highlights

- ✔️ **Personalized landing pages** with dynamic hero, trending categories, and testimonials.
- ✔️ **Advanced search** supporting filters, tags, and real-time results.
- ✔️ **Wishlist, cart, and order history** tied to Supabase profiles.
- ✔️ **Multi-channel support** (WhatsApp, phone, email) baked into the UI.
- ✔️ **Banner & campaign management** with scheduling and performance metrics.
- ✔️ **Real-time analytics** dashboards for bookings, clicks, and revenue signals.

---

## 🗂 Folder Structure

```
Taliyo Marketplace (1)/
├── app/                  # Next.js App Router pages for storefront
├── components/           # Shared UI components
├── lib/                  # Helpers, Supabase client, constants
├── public/               # Static assets
├── admin-panel/          # Secure admin console (Next.js + Supabase)
├── styles/               # Global Tailwind styles
├── next.config.mjs       # Project-wide Next.js config
├── package.json          # Root scripts and dependencies
├── pnpm-lock.yaml        # Lockfile
└── README.md             # You are here
```

---

## 🤝 Contributing

We’re excited to collaborate! To contribute:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/your-idea`
3. **Commit changes:** `git commit -m "feat: add your idea"`
4. **Push & PR:** `git push origin feature/your-idea`

Include screenshots or demo clips for UI changes. For major work, open an issue to align on scope.

---

## 📜 License

![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)

This project ships under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

## 🧑‍🚀 Team & Contact

| Role                  | Name  | GitHub                                       | LinkedIn                                            | Website                                |
| --------------------- | ----- | -------------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| Product & Engineering | Viraj | [@virajverse](https://github.com/virajverse) | [LinkedIn](https://www.linkedin.com/in/virajverse/) | [www.viraj.dev](https://www.viraj.dev) |

Need a hand? Raise an issue or reach us at `team@taliyo.com`.

---

_Crafted with ⚡ energy to help marketplaces launch faster and scale smarter._
