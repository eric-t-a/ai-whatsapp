# 🤖 WhatsApp AI Agent

An intelligent AI-powered chatbot that connects to WhatsApp and interacts with users in real-time. This project uses Ollama to understand and respond to messages sent via WhatsApp using a headless WhatsApp Business API.

## 📌 Features

- 🔗 Connects to WhatsApp 
- 🤖 Uses an AI model (currently, only Ollama models available) to understand and respond
- 🧠 Listen to audio messages

## 🧰 Tech Stack

- [Node.js](https://nodejs.org/)
- [Ollama](https://ollama.com/)
- [LangChain.js](https://js.langchain.com/)
- [Node-Speech-Recognition](https://www.npmjs.com/package/node-speech-recognition)
- [Express.js](https://expressjs.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eric-t-a/ai-whatsapp
cd ai-whatsapp
````

### 2. Install dependencies

```bash
npm install
```

### 3. Start the bot

```bash
npm run start
```

Scan the QR code that appears in the terminal with your WhatsApp mobile app.

## 🧠 How It Works

1. You connect your WhatsApp through the prompted QR code
2. A user sends a message to your WhatsApp number.
3. The message is passed to the AI model.
4. The AI generates a response.
5. The bot sends the reply back to the user on WhatsApp.

## 📁 Project Structure

```
.
└── src/
    ├── class
    │   └── AI.ts             # AI setup & responses
    │   └── WhatsappAPI.ts    # WhatsApp client setup
    └── index.ts              # Server & Conversation loop

```

## ✅ TODO

* [x] Add support for audio listening
* [x] Add support for WhatsApp Business API
* [x] Integrate with MongoDB
* [ ] Add support for OpenAI
* [ ] Add support for conversation memory
* [ ] Implement enable/disable AI responses
* [ ] Implement UI for chats

## 🛡️ Security

* Rate-limiting can help prevent abuse or accidental infinite loops.

## 📄 License

MIT License. Feel free to fork and improve!

---

Made by [Eric Thomas](https://github.com/eric-t-a)

