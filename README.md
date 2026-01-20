# 🎙️ OMEGA - AI Chat Application

> **Advanced AI Chat with Real-Time Streaming, Voice Control & Barge-In Support**

[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-13AA52?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-GPL%203.0-blue?style=flat-square)](LICENSE)

<div align="center">
  
**[⭐ Star this repo](#-support-this-project) if you find it useful!**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🤖 **Multiple AI Models**

- DeepSeek R1
- ChatGPT (OpenAI)
- Grok 4
- Gemini 2.5 Pro
- Claude Sonnet 4.5
- **Multi-provider fallback system** (Official → OpenRouter → BYTEZ)

### 🎙️ **Voice Features (ChatGPT Voice Mode Clone)**

- ✅ **Real-time Voice Input** - Continuous listening with wake words
- ✅ **Text-to-Speech Output** - Multiple voices & languages
- ✅ **Barge-In Support** - Interrupt AI mid-response anytime
- ✅ **True Streaming** - Real-time token streaming (no fake typing)
- ✅ **Voice-Only Mode** - AI ignores its own voice (no feedback loops)
- ✅ **Instant Response** - Human speech only triggers responses

### 💬 **Chat Features**

- Create & manage multiple conversations
- Edit and regenerate messages
- Smart chat history grouping
- Auto-generated chat titles
- Search & filter chats

### 🎨 **User Experience**

- Dark mode optimized UI
- Responsive (Mobile & Desktop)
- Syntax-highlighted code blocks
- Markdown rendering
- Copy/paste functionality

### 🔐 **Security**

- Clerk authentication
- Protected API endpoints
- User data export
- GDPR-compliant

---

## 🛠️ Tech Stack

| Layer        | Technologies                                     |
| ------------ | ------------------------------------------------ |
| **Frontend** | Next.js 14+, React 18+, TypeScript, Tailwind CSS |
| **Backend**  | Node.js, Next.js API Routes                      |
| **Database** | MongoDB, Mongoose                                |
| **Auth**     | Clerk                                            |
| **Voice**    | Web Speech API                                   |
| **AI**       | OpenAI, OpenRouter, BYTEZ                        |
| **UI**       | Lucide Icons, React Markdown, Prism.js           |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Clerk account
- API keys (optional for AI fallbacks)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/abhishekprajapatt/omega-ai-web.git
cd omega-ai-web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 API Endpoints

### Chat Management

```
POST   /api/chat/create      - Create new chat
GET    /api/chat/get         - Fetch all chats
DELETE /api/chat/delete      - Delete chat
POST   /api/chat/rename      - Rename chat
```

### AI Response (Streaming)

```
POST   /api/chat/ai          - Send message & get streaming response
```

### User

```
DELETE /api/user/delete-all-chats - Delete all chats
GET    /api/user/export-data      - Export user data
```

---

## 🎯 Key Implementations

### ⚡ **Real-Time Streaming**

- Backend: AsyncGenerator + ReadableStream
- Frontend: fetch() + response.body.getReader()
- UI updates on every token arrival

### 🔊 **Voice State Management**

- Guards against AI listening to its own voice
- Only processes human speech
- Seamless barge-in interruption

### 🎤 **Barge-In Support**

- Detects user speech while AI responding
- Cancels speech synthesis instantly
- Aborts streaming & processes new input

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -t omega-ai .
docker run -p 3000:3000 omega-ai
```

### Manual

```bash
npm run build
npm start
```

---

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Prettier for formatting
- Write meaningful commit messages
- Test on mobile & desktop

---

## ⭐ Support This Project

If this project helps you, please consider:

- **Star** the repository ⭐
- **Follow** on GitHub 👤
- **Share** with others 📢
- **Sponsor** development 💝

---

## 📝 License

GNU General Public License v3.0 - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**Abhishek Prajapatt**

- GitHub: [@abhishekprajapatt](https://github.com/abhishekprajapatt)

---

## 🙏 Acknowledgments

- Inspired by ChatGPT Voice Mode
- Built with Next.js ecosystem
- Voice APIs by Web Speech API
- Icons by Lucide React

---

<div align="center">

Made with ❤️ by Abhishek Prajapat

</div>
