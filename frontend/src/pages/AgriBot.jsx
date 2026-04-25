/*
  AgriBot — Full-Screen ChatGPT-Style Interface
  - Left sidebar with chat history + new chat
  - Full-viewport main area (fixed overlay, no navbar visible)
  - Centered welcome / message stream
  - Sticky bottom input bar
*/

import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  User,
  Loader2,
  Leaf,
  Plus,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sprout,
} from "lucide-react";

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "agribot_conversations";

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveConversations(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
  return "conv_" + Math.random().toString(36).slice(2, 9);
}

function makeTitle(text) {
  if (!text) return "New chat";
  const t = text.trim();
  return t.length > 28 ? t.slice(0, 28) + "…" : t;
}

/* ─── Component ─── */
const AgriBotChat = () => {
  /* sidebar visibility */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* conversations */
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);

  /* current conversation derived */
  const activeConv =
    conversations.find((c) => c.id === activeId) ||
    (conversations[0] ?? {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    });

  /* input state */
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  /* persist */
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  /* auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv.messages]);

  /* textarea auto-resize */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputMessage]);

  /* close sidebar on mobile by default */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ─── actions ─── */
  const createNewChat = () => {
    const newConv = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setInputMessage("");
    setSelectedImage(null);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) setActiveId(next[0]?.id || null);
      return next;
    });
  };

  const selectChat = (id) => {
    setActiveId(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  /* ─── image upload ─── */
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setSelectedImage({
          file,
          preview: reader.result,
          base64: reader.result.split(",")[1],
        });
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── send message ─── */
  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      image: selectedImage?.preview,
      timestamp: new Date().toISOString(),
    };

    /* add user message to active conv */
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === activeConv.id);
      if (!conv) return prev;
      const updated = {
        ...conv,
        messages: [...conv.messages, userMsg],
        title: conv.title === "New chat" ? makeTitle(inputMessage) : conv.title,
      };
      return [updated, ...prev.filter((c) => c.id !== conv.id)];
    });

    setInputMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", inputMessage || "Analyze this image");
      if (selectedImage?.file) formData.append("image", selectedImage.file);

      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        body: formData,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botContent = "";
      const botId = Date.now() + 1;

      /* append empty bot message */
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === activeConv.id);
        if (!conv) return prev;
        const updated = {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: botId,
              type: "bot",
              content: "",
              timestamp: new Date().toISOString(),
              isStreaming: true,
            },
          ],
        };
        return [updated, ...prev.filter((c) => c.id !== conv.id)];
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") {
            setConversations((prev) => {
              const conv = prev.find((c) => c.id === activeConv.id);
              if (!conv) return prev;
              const updated = {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === botId ? { ...m, isStreaming: false } : m,
                ),
              };
              return [updated, ...prev.filter((c) => c.id !== conv.id)];
            });
          } else {
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                botContent += parsed.chunk;
                setConversations((prev) => {
                  const conv = prev.find((c) => c.id === activeConv.id);
                  if (!conv) return prev;
                  const updated = {
                    ...conv,
                    messages: conv.messages.map((m) =>
                      m.id === botId ? { ...m, content: botContent } : m,
                    ),
                  };
                  return [updated, ...prev.filter((c) => c.id !== conv.id)];
                });
              }
              if (parsed.error) {
                setConversations((prev) => {
                  const conv = prev.find((c) => c.id === activeConv.id);
                  if (!conv) return prev;
                  const updated = {
                    ...conv,
                    messages: conv.messages.map((m) =>
                      m.id === botId
                        ? {
                            ...m,
                            content: `Error: ${parsed.error}`,
                            error: true,
                          }
                        : m,
                    ),
                  };
                  return [updated, ...prev.filter((c) => c.id !== conv.id)];
                });
              }
            } catch {
              /* ignore parse errors */
            }
          }
        }
      }
    } catch (error) {
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === activeConv.id);
        if (!conv) return prev;
        const updated = {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: Date.now(),
              type: "bot",
              content: `Sorry, I encountered an error: ${error.message}`,
              timestamp: new Date().toISOString(),
              error: true,
            },
          ],
        };
        return [updated, ...prev.filter((c) => c.id !== conv.id)];
      });
    } finally {
      setIsLoading(false);
      removeImage();
    }
  };

  /* ─── suggestion chips ─── */
  const suggestions = [
    { text: "My tomato leaves have brown spots", icon: "🍅" },
    { text: "Best organic pesticides for rice", icon: "🌾" },
    { text: "When to apply nitrogen fertilizer?", icon: "🧪" },
    { text: "Identify wheat rust symptoms", icon: "🍂" },
  ];

  /* ─── sidebar width ─── */
  const sidebarWidth = sidebarOpen ? "260px" : "0px";

  return (
    <div className="fixed inset-0 z-[200] flex bg-[#0d1117] text-gray-100">
      {/* ═══ SIDEBAR ═══ */}
      <aside
        className="flex flex-col border-r border-gray-800 bg-[#161b22] transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="flex w-full items-center gap-3 rounded-xl border border-gray-700/50 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800/60"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-gray-800/40 px-3 py-2 text-sm text-gray-500">
            <Search className="h-3.5 w-3.5" />
            <span>Search chats</span>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-gray-600">
              <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-50" />
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectChat(conv.id)}
                className={`group relative mb-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  conv.id === activeConv.id
                    ? "bg-gray-800/80 text-gray-100"
                    : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span className="truncate">{conv.title}</span>
                <button
                  onClick={(e) => deleteChat(e, conv.id)}
                  className="ml-auto rounded p-1 text-gray-600 opacity-0 transition-opacity hover:bg-gray-700 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-400 hover:bg-gray-800/40 cursor-pointer transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/20">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium text-gray-300">
                AgriVision Pro
              </p>
              <p className="text-[10px] text-gray-500">AgriBot v1.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-12 items-center justify-between border-b border-gray-800/60 px-4">
          <div className="flex items-center gap-3">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-gray-200"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Model selector */}
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Bot className="h-4 w-4 text-emerald-400" />
              <span>AgriBot</span>
              <span className="text-gray-600">▾</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 sm:flex">
              <Leaf className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">
                Gemini 3.1 Flash Lite
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {activeConv.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex min-h-full flex-col items-center justify-center px-4 pb-32">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/10 ring-1 ring-emerald-500/20">
                  <Bot className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="mb-3 text-4xl font-semibold tracking-tight text-gray-100">
                  How can I help you today?
                </h1>
                <p className="mx-auto max-w-lg text-base text-gray-400">
                  Ask about crop diseases, treatments, or upload a photo for
                  instant diagnosis.
                </p>

                {/* Suggestions */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInputMessage(s.text)}
                      className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-left transition-all hover:border-gray-700 hover:bg-gray-800/60"
                    >
                      <span className="mb-1 block text-lg">{s.icon}</span>
                      <span className="text-sm text-gray-300">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="mx-auto max-w-3xl">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`px-4 py-5 sm:px-6 ${
                    msg.type === "bot" ? "bg-[#161b22]/40" : ""
                  }`}
                >
                  <div className="mx-auto flex max-w-3xl gap-4">
                    {/* Avatar */}
                    <div className="mt-0.5 flex-shrink-0">
                      {msg.type === "user" ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700">
                          <User className="h-3.5 w-3.5 text-gray-300" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/20 ring-1 ring-emerald-500/20">
                          <Bot className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-xs font-medium text-gray-500">
                        {msg.type === "user" ? "You" : "AgriBot"}
                      </div>
                      {msg.image && (
                        <div className="mb-3 inline-block max-w-xs overflow-hidden rounded-xl border border-gray-700/50">
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="max-h-48 w-auto object-cover"
                          />
                        </div>
                      )}
                      <div
                        className={`whitespace-pre-wrap text-[15px] leading-relaxed ${
                          msg.error
                            ? "text-red-400"
                            : msg.type === "user"
                              ? "text-gray-100"
                              : "text-gray-300"
                        }`}
                      >
                        {msg.content || (
                          <span className="inline-flex gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:75ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:150ms]" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* Bottom Input */}
        <div className="border-t border-gray-800/60 bg-[#0d1117] px-4 pb-4 pt-3">
          <div className="mx-auto max-w-3xl">
            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-2 flex w-fit items-center gap-2 rounded-lg border border-gray-700/40 bg-gray-800/50 p-2 pr-3">
                <img
                  src={selectedImage.preview}
                  alt="Preview"
                  className="h-8 w-8 rounded-md object-cover"
                />
                <span className="max-w-[160px] truncate text-xs text-gray-400">
                  {selectedImage.file.name}
                </span>
                <button
                  onClick={removeImage}
                  className="rounded p-1 hover:bg-gray-700/50"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            )}

            {/* Input Box */}
            <div className="flex items-end gap-2 rounded-2xl border border-gray-700/50 bg-gray-800/50 px-3 py-3 transition-all focus-within:border-gray-600 focus-within:bg-gray-800/70">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:text-emerald-400 disabled:opacity-40"
                title="Upload image"
              >
                <Plus className="h-5 w-5" />
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask me anything about agriculture..."
                className="max-h-[200px] flex-1 resize-none border-none bg-transparent py-1.5 text-[15px] text-gray-100 placeholder-gray-500 outline-none"
                disabled={isLoading}
              />

              <button
                onClick={sendMessage}
                disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                className="flex-shrink-0 rounded-xl bg-emerald-600 p-2 text-white transition-all hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-gray-600">
              AgriBot can make mistakes. Please verify critical diagnoses with
              agricultural experts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgriBotChat;
