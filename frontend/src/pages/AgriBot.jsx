/**
 * AgriBot — Full-Screen Chat Interface (Refactored)
 * Improvements:
 *   • Markdown rendering for bot responses
 *   • Copy-to-clipboard & retry actions
 *   • Smart auto-scroll (respects user scroll position)
 *   • Buffered streaming for smoother performance
 *   • Functional sidebar search
 *   • Relative timestamps
 *   • Better error/retry UI
 */

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { formatDistanceToNow } from "date-fns";
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
  ChevronDown,
  Sun,
  Moon,
  Home,
  ScanLine,
  History,
  Info,
  Copy,
  Check,
  RotateCcw,
  ArrowDown,
  ImageIcon,
} from "lucide-react";

/* ═══════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════ */

const STORAGE_KEY = "agribot_conversations";
const SCROLL_THRESHOLD = 120; // px from bottom to trigger auto-scroll

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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

function formatTime(iso) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function normalizeBotResponse(rawText) {
  if (!rawText) return "";

  let text = String(rawText).replace(/\r\n?/g, "\n");

  // Convert inline markdown headings into proper section breaks.
  text = text.replace(/\s*---\s*(#{1,4}\s+)/g, "\n\n$1");
  text = text.replace(/([^\n])\s+(#{1,4}\s+)/g, "$1\n\n$2");
  text = text.replace(/^\s*#{2,6}\s*$/gm, "");
  text = text.replace(/^\s*###\s+(\d+\.)/gm, "## $1");

  // Split known section headings from inline text for clearer layout.
  text = text.replace(
    /^##\s*(Quick Answer|What To Do|Safety Checks|Next Step)\s+(.+)$/gm,
    "## $1\n$2",
  );

  // Convert inline dash-delimited points into proper bullet lines.
  text = text.replace(/\s+-\s+(?=[A-Z*])/g, "\n- ");

  // Put common numbered section starts on their own lines.
  text = text.replace(/([^\n])\s+(\d+\.\s+[A-Z])/g, "$1\n\n$2");

  // Keep marker labels readable when model emits long inline sentences.
  text = text.replace(
    /\s+(Key Timing:|Why:|Warning:|Immediate actions:)/g,
    "\n$1",
  );

  // Normalize excessive whitespace.
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* ── SimpleMarkdown ── */
const SimpleMarkdown = memo(function SimpleMarkdown({ text, isDark }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let listBuffer = null;
  let listType = null;
  let keyIdx = 0;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag
        key={`list-${keyIdx++}`}
        className={`my-2 pl-5 ${
          listType === "ol" ? "list-decimal" : "list-disc"
        } ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {listBuffer.map((item, i) => (
          <li key={i} className="my-1">
            {renderInline(item, isDark)}
          </li>
        ))}
      </Tag>,
    );
    listBuffer = null;
    listType = null;
  };

  for (let line of lines) {
    const trimmed = line.trim();

    // Code block
    if (trimmed.startsWith("```")) {
      flushList();
      elements.push(
        <pre
          key={`pre-${keyIdx++}`}
          className={`my-2 rounded-lg p-3 overflow-x-auto text-sm font-mono ${
            isDark
              ? "bg-gray-900 text-gray-200 border border-gray-700"
              : "bg-gray-100 text-gray-800 border border-gray-200"
          }`}
        >
          <code>{trimmed.replace(/^```+/, "").replace(/```+$/, "")}</code>
        </pre>,
      );
      continue;
    }

    // Inline code
    if (
      trimmed.startsWith("`") &&
      trimmed.endsWith("`") &&
      trimmed.length > 2
    ) {
      flushList();
      elements.push(
        <code
          key={`code-${keyIdx++}`}
          className={`px-1.5 py-0.5 rounded text-sm font-mono ${
            isDark
              ? "bg-gray-800 text-emerald-300"
              : "bg-gray-100 text-emerald-700"
          }`}
        >
          {trimmed.slice(1, -1)}
        </code>,
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s/.test(trimmed)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer = listBuffer || [];
      listBuffer.push(trimmed.replace(/^[-*]\s/, ""));
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer = listBuffer || [];
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${keyIdx++}`} className="h-2" />);
      continue;
    }

    // Heading
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${keyIdx++}`}
          className={`mt-4 mb-2 text-lg font-bold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {renderInline(trimmed.slice(4), isDark)}
        </h3>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${keyIdx++}`}
          className={`mt-5 mb-2 text-xl font-bold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {renderInline(trimmed.slice(3), isDark)}
        </h2>,
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={`h1-${keyIdx++}`}
          className={`mt-6 mb-3 text-2xl font-bold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {renderInline(trimmed.slice(2), isDark)}
        </h1>,
      );
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p
        key={`p-${keyIdx++}`}
        className={`my-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {renderInline(line, isDark)}
      </p>,
    );
  }

  flushList();
  return <div className="space-y-0.5">{elements}</div>;
});

function renderInline(text, isDark) {
  const parts = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${i++}`}>{text.slice(lastIndex, match.index)}</span>,
      );
    }
    const content =
      match[2] || match[3] || match[4] || match[5] || match[6] || match[0];
    if (match[2]) {
      // ***bold italic***
      parts.push(
        <strong
          key={`t-${i++}`}
          className={`italic ${isDark ? "text-gray-100" : "text-gray-900"}`}
        >
          {content}
        </strong>,
      );
    } else if (match[3]) {
      // **bold**
      parts.push(
        <strong
          key={`t-${i++}`}
          className={isDark ? "text-gray-100" : "text-gray-900"}
        >
          {content}
        </strong>,
      );
    } else if (match[4] || match[5]) {
      // *italic* or _italic_
      parts.push(
        <em key={`t-${i++}`} className="italic">
          {content}
        </em>,
      );
    } else if (match[6]) {
      // `code`
      parts.push(
        <code
          key={`t-${i++}`}
          className={`px-1 py-0.5 rounded text-sm font-mono ${
            isDark
              ? "bg-gray-800 text-emerald-300"
              : "bg-gray-100 text-emerald-700"
          }`}
        >
          {content}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${i++}`}>{text.slice(lastIndex)}</span>);
  }

  return parts.length ? parts : text;
}

/* ── CopyButton ── */
const CopyButton = memo(function CopyButton({ text, isDark }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy response"}
      className={`rounded-md p-1.5 transition-all ${
        copied
          ? "text-emerald-500"
          : isDark
            ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
            : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
});

/* ── TypingIndicator ── */
const TypingIndicator = memo(function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:240ms]" />
    </span>
  );
});

/* ═══════════════════════════════════════
   Component
   ═══════════════════════════════════════ */

const AgriBotChat = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  /* ── Sidebar ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Conversations ── */
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(null);

  const activeConv =
    conversations.find((c) => c.id === activeId) ||
    (conversations[0] ?? {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    });

  /* ── Input ── */
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ── Dropdown ── */
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* ── Scroll ── */
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  /* ── Refs ── */
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  /* ── Derived ── */
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  /* ── Effects ── */
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    if (!userScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConv.messages, userScrolledUp]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [inputMessage]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Scroll detection */
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
    setUserScrolledUp(!nearBottom);
    setShowScrollBtn(!nearBottom && el.scrollHeight > el.clientHeight + 100);
  }, []);

  /* ── Actions ── */
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
    setSearchQuery("");
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
    setUserScrolledUp(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolledUp(false);
    setShowScrollBtn(false);
  };

  /* ── Image Upload ── */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setSelectedImage({
        file,
        preview: reader.result,
        base64: reader.result.split(",")[1],
      });
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Retry Message ── */
  const retryMessage = useCallback(
    (msgId) => {
      const conv = conversations.find((c) => c.id === activeConv.id);
      if (!conv) return;
      const msgIndex = conv.messages.findIndex((m) => m.id === msgId);
      if (msgIndex < 1) return;
      const userMsg = conv.messages[msgIndex - 1];
      if (userMsg?.type !== "user") return;

      // Remove error message and resend
      setConversations((prev) => {
        const c = prev.find((x) => x.id === activeConv.id);
        if (!c) return prev;
        const idx = c.messages.findIndex((m) => m.id === msgId);
        if (idx < 0) return prev;
        const updated = {
          ...c,
          messages: c.messages.slice(0, idx),
        };
        return [updated, ...prev.filter((x) => x.id !== c.id)];
      });

      // Re-trigger send with same content
      setInputMessage(userMsg.content);
      if (userMsg.image) {
        setSelectedImage({ preview: userMsg.image });
      }
      // Use setTimeout to let state update first
      setTimeout(() => {
        sendMessage(userMsg.content, userMsg.image);
      }, 50);
    },
    [conversations, activeConv.id],
  );

  /* ── Send Message ── */
  const sendMessage = async (overrideText, overrideImage) => {
    const text = overrideText ?? inputMessage;
    const img =
      overrideImage !== undefined ? overrideImage : selectedImage?.preview;
    if ((!text.trim() && !img) || isLoading) return;

    // Ensure there is a persisted conversation before first send.
    let workingConvId = activeId;
    if (!workingConvId || !conversations.some((c) => c.id === workingConvId)) {
      workingConvId = generateId();
      const seededConv = {
        id: workingConvId,
        title: makeTitle(text),
        messages: [],
        createdAt: Date.now(),
      };
      setConversations((prev) => [seededConv, ...prev]);
      setActiveId(workingConvId);
    }

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: text,
      image: img ?? null,
      timestamp: new Date().toISOString(),
    };

    /* optimistic user message */
    setConversations((prev) => {
      const conv = prev.find((c) => c.id === workingConvId);
      if (!conv) return prev;
      const updated = {
        ...conv,
        messages: [...conv.messages, userMsg],
        title: conv.title === "New chat" ? makeTitle(text) : conv.title,
      };
      return [updated, ...prev.filter((c) => c.id !== conv.id)];
    });

    if (!overrideText) setInputMessage("");
    setIsLoading(true);
    setUserScrolledUp(false);

    try {
      const formData = new FormData();
      formData.append("message", text || "Analyze this image");
      if (selectedImage?.file && !overrideText)
        formData.append("image", selectedImage.file);

      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botContent = "";
      const botId = Date.now() + 1;
      let chunkBuffer = "";
      let lastUpdate = 0;

      /* placeholder bot message */
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === workingConvId);
        if (!conv) return prev;
        return [
          {
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
          },
          ...prev.filter((c) => c.id !== conv.id),
        ];
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkBuffer += decoder.decode(value, { stream: true });
        const lines = chunkBuffer.split("\n");
        chunkBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") {
            setConversations((prev) => {
              const conv = prev.find((c) => c.id === workingConvId);
              if (!conv) return prev;
              return [
                {
                  ...conv,
                  messages: conv.messages.map((m) =>
                    m.id === botId ? { ...m, isStreaming: false } : m,
                  ),
                },
                ...prev.filter((c) => c.id !== conv.id),
              ];
            });
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              botContent += parsed.chunk;
              // Throttle state updates to every ~60ms for smoother rendering
              const now = Date.now();
              if (now - lastUpdate > 60) {
                lastUpdate = now;
                setConversations((prev) => {
                  const conv = prev.find((c) => c.id === workingConvId);
                  if (!conv) return prev;
                  return [
                    {
                      ...conv,
                      messages: conv.messages.map((m) =>
                        m.id === botId ? { ...m, content: botContent } : m,
                      ),
                    },
                    ...prev.filter((c) => c.id !== conv.id),
                  ];
                });
              }
            }
            if (parsed.error) {
              setConversations((prev) => {
                const conv = prev.find((c) => c.id === workingConvId);
                if (!conv) return prev;
                return [
                  {
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
                  },
                  ...prev.filter((c) => c.id !== conv.id),
                ];
              });
            }
          } catch {
            /* ignore malformed SSE lines */
          }
        }
      }

      // Final update to ensure all content is rendered
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === workingConvId);
        if (!conv) return prev;
        return [
          {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === botId
                ? { ...m, content: botContent, isStreaming: false }
                : m,
            ),
          },
          ...prev.filter((c) => c.id !== conv.id),
        ];
      });
    } catch (err) {
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === workingConvId);
        if (!conv) return prev;
        return [
          {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: Date.now(),
                type: "bot",
                content: `Sorry, something went wrong: ${err.message}`,
                timestamp: new Date().toISOString(),
                error: true,
              },
            ],
          },
          ...prev.filter((c) => c.id !== conv.id),
        ];
      });
    } finally {
      setIsLoading(false);
      if (!overrideText) removeImage();
    }
  };

  /* ── Suggestions ── */
  const suggestions = [
    { text: "My tomato leaves have brown spots", icon: "🍅" },
    { text: "Best organic pesticides for rice", icon: "🌾" },
    { text: "When to apply nitrogen fertilizer?", icon: "🧪" },
    { text: "Identify wheat rust symptoms", icon: "🍂" },
  ];

  const sidebarWidth = sidebarOpen ? "260px" : "0px";

  /* ═══════════════════════════════════════
     Render Helpers
     ═══════════════════════════════════════ */

  const cls = {
    root: isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-50 text-gray-900",
    sidebar: isDark
      ? "border-gray-800 bg-[#161b22]"
      : "border-gray-200 bg-white",
    header: isDark ? "border-gray-800/60" : "border-gray-200",
    inputArea: isDark
      ? "border-gray-800/60 bg-[#0d1117]"
      : "border-gray-200 bg-gray-50",
    inputBox: isDark
      ? "border-gray-700/50 bg-gray-800/50 focus-within:border-gray-600 focus-within:bg-gray-800/70"
      : "border-gray-200 bg-white focus-within:border-gray-300 focus-within:bg-white",
    msgBotBg: isDark ? "bg-[#161b22]/40" : "bg-gray-100/50",
    suggestionCard: isDark
      ? "border-gray-800 bg-gray-800/30 hover:border-gray-700 hover:bg-gray-800/60"
      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
  };

  return (
    <div className={`fixed inset-0 z-[200] flex ${cls.root}`}>
      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`flex flex-col border-r transition-all duration-300 ease-in-out overflow-hidden ${cls.sidebar}`}
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              isDark
                ? "border-gray-700/50 text-gray-300 hover:bg-gray-800/60"
                : "border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              isDark
                ? "bg-gray-800/40 text-gray-500"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className={`w-full bg-transparent outline-none text-sm ${
                isDark
                  ? "placeholder-gray-600 text-gray-300"
                  : "placeholder-gray-400 text-gray-700"
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {filteredConversations.length === 0 ? (
            <div
              className={`px-3 py-8 text-center text-xs ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            >
              <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-50" />
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectChat(conv.id)}
                className={`group relative mb-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  conv.id === activeConv.id
                    ? isDark
                      ? "bg-gray-800/80 text-gray-100"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                      ? "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                <span className="truncate">{conv.title}</span>
                <button
                  onClick={(e) => deleteChat(e, conv.id)}
                  className={`ml-auto rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                    isDark
                      ? "text-gray-600 hover:bg-gray-700 hover:text-red-400"
                      : "text-gray-400 hover:bg-gray-200 hover:text-red-500"
                  }`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div
          className={`border-t p-3 ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <div
            className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm cursor-pointer transition-colors ${
              isDark
                ? "text-gray-400 hover:bg-gray-800/40"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                isDark ? "bg-emerald-600/20" : "bg-emerald-100"
              }`}
            >
              <Sprout
                className={`h-3.5 w-3.5 ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
            <div className="leading-tight">
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                AgriVision Pro
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                AgriBot v1.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header
          className={`flex h-12 items-center justify-between border-b px-4 ${cls.header}`}
        >
          <div className="flex items-center gap-3">
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-lg p-1.5 transition-colors ${
                isDark
                  ? "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Model selector — FUNCTIONAL DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 text-sm font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                <Bot className="h-4 w-4 text-emerald-500" />
                <span>AgriBot</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute left-0 top-full mt-2 w-56 rounded-xl border shadow-lg py-2 z-50 ${
                    isDark
                      ? "bg-[#1c2128] border-gray-700 text-gray-200"
                      : "bg-white border-gray-200 text-gray-800"
                  }`}
                >
                  <div className="px-3 py-2">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Model
                    </p>
                    <div className="mt-1 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                      <Leaf className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Gemini 3.1 Flash Lite
                      </span>
                    </div>
                  </div>
                  <div
                    className={`my-1 border-t ${
                      isDark ? "border-gray-700" : "border-gray-100"
                    }`}
                  />
                  <p
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Navigation
                  </p>
                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <Link
                    to="/predict"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ScanLine className="h-4 w-4" />
                    Detection
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <History className="h-4 w-4" />
                    History
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setDropdownOpen(false)}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <div
                    className={`my-1 border-t ${
                      isDark ? "border-gray-700" : "border-gray-100"
                    }`}
                  />
                  <button
                    onClick={() => {
                      toggleTheme();
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      isDark
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {isDark ? "Light mode" : "Dark mode"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 sm:flex ${
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <Leaf className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Gemini 3.1 Flash Lite
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative"
        >
          {activeConv.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex min-h-full flex-col items-center justify-center px-4 pb-32">
              <div className="mx-auto max-w-2xl text-center">
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${
                    isDark
                      ? "bg-emerald-600/10 ring-emerald-500/20"
                      : "bg-emerald-50 ring-emerald-200"
                  }`}
                >
                  <Bot className="h-8 w-8 text-emerald-500" />
                </div>
                <h1
                  className={`mb-3 text-4xl font-semibold tracking-tight ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  How can I help you today?
                </h1>
                <p
                  className={`mx-auto max-w-lg text-base ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Ask about crop diseases, treatments, or upload a photo for
                  instant diagnosis.
                </p>

                {/* Suggestions */}
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInputMessage(s.text)}
                      className={`rounded-xl border p-4 text-left transition-all ${cls.suggestionCard}`}
                    >
                      <span className="mb-1 block text-lg">{s.icon}</span>
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {s.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="mx-auto max-w-3xl">
              {activeConv.messages.map((msg) => {
                const displayContent =
                  msg.type === "bot"
                    ? normalizeBotResponse(msg.content)
                    : msg.content;

                return (
                  <div
                    key={msg.id}
                    className={`px-4 py-5 sm:px-6 ${
                      msg.type === "bot" ? cls.msgBotBg : ""
                    }`}
                  >
                    <div className="mx-auto flex max-w-3xl gap-4">
                      {/* Avatar */}
                      <div className="mt-0.5 flex-shrink-0">
                        {msg.type === "user" ? (
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full ${
                              isDark ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <User
                              className={`h-3.5 w-3.5 ${
                                isDark ? "text-gray-300" : "text-gray-600"
                              }`}
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full ring-1 ${
                              isDark
                                ? "bg-emerald-600/20 ring-emerald-500/20"
                                : "bg-emerald-100 ring-emerald-200"
                            }`}
                          >
                            <Bot
                              className={`h-3.5 w-3.5 ${
                                isDark ? "text-emerald-400" : "text-emerald-600"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-medium ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {msg.type === "user" ? "You" : "AgriBot"}
                          </span>
                          {msg.timestamp && (
                            <span
                              className={`text-[10px] ${
                                isDark ? "text-gray-600" : "text-gray-400"
                              }`}
                              title={new Date(msg.timestamp).toLocaleString()}
                            >
                              {formatTime(msg.timestamp)}
                            </span>
                          )}
                        </div>
                        {msg.image && (
                          <div
                            className={`mb-3 inline-block max-w-xs overflow-hidden rounded-xl border ${
                              isDark ? "border-gray-700/50" : "border-gray-200"
                            }`}
                          >
                            <img
                              src={msg.image}
                              alt="Uploaded"
                              className="max-h-48 w-auto object-cover"
                            />
                          </div>
                        )}
                        <div
                          className={`text-[15px] leading-relaxed ${
                            msg.error
                              ? "text-red-500"
                              : msg.type === "user"
                                ? isDark
                                  ? "text-gray-100"
                                  : "text-gray-900"
                                : isDark
                                  ? "text-gray-300"
                                  : "text-gray-700"
                          }`}
                        >
                          {msg.type === "bot" && msg.content ? (
                            <SimpleMarkdown
                              text={displayContent}
                              isDark={isDark}
                            />
                          ) : (
                            <span className="whitespace-pre-wrap">
                              {displayContent}
                            </span>
                          )}
                          {msg.isStreaming && !msg.content && (
                            <TypingIndicator />
                          )}
                        </div>

                        {/* Message actions */}
                        {msg.type === "bot" && (
                          <div className="mt-2 flex items-center gap-1">
                            {msg.content && !msg.error && !msg.isStreaming && (
                              <CopyButton
                                text={displayContent}
                                isDark={isDark}
                              />
                            )}
                            {msg.error && (
                              <button
                                onClick={() => retryMessage(msg.id)}
                                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                  isDark
                                    ? "text-red-400 hover:bg-red-900/20"
                                    : "text-red-600 hover:bg-red-50"
                                }`}
                              >
                                <RotateCcw className="h-3 w-3" />
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className={`absolute bottom-4 right-4 rounded-full p-2 shadow-lg transition-all hover:scale-105 ${
                isDark
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Bottom Input */}
        <div className={`border-t px-4 pb-4 pt-3 ${cls.inputArea}`}>
          <div className="mx-auto max-w-3xl">
            {/* Image Preview */}
            {selectedImage && (
              <div
                className={`mb-2 flex w-fit items-center gap-2 rounded-lg border p-2 pr-3 ${
                  isDark
                    ? "border-gray-700/40 bg-gray-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <img
                  src={selectedImage.preview}
                  alt="Preview"
                  className="h-8 w-8 rounded-md object-cover"
                />
                <span
                  className={`max-w-[160px] truncate text-xs ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {selectedImage.file?.name || "Image"}
                </span>
                <button
                  onClick={removeImage}
                  className={`rounded p-1 ${
                    isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                  }`}
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            )}

            {/* Input Box */}
            <div
              className={`flex items-end gap-2 rounded-2xl border px-3 py-3 transition-all focus-within:ring-2 focus-within:ring-emerald-500/30 ${cls.inputBox}`}
            >
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
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:text-emerald-500 disabled:opacity-40"
                title="Upload image"
              >
                <ImageIcon className="h-5 w-5" />
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
                className={`max-h-[200px] flex-1 resize-none border-none bg-transparent py-1.5 text-[15px] outline-none placeholder-gray-500 ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
                disabled={isLoading}
              />

              <button
                onClick={() => sendMessage()}
                disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                className={`flex-shrink-0 rounded-xl p-2 text-white transition-all ${
                  isLoading || (!inputMessage.trim() && !selectedImage)
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p
              className={`mt-2 text-center text-[11px] ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            >
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
