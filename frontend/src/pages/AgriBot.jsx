/*
AgriBot Chat Interface — Clean ChatGPT-Style Design
Full-screen immersive chat with proper spacing and clean visuals.
*/

import { useState, useRef, useEffect } from "react";
import { Send, Image, X, Bot, User, Loader2, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";

const AgriBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          file: file,
          preview: reader.result,
          base64: reader.result.split(",")[1],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      image: selectedImage?.preview,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", inputMessage || "Analyze this image");
      if (selectedImage?.file) {
        formData.append("image", selectedImage.file);
      }

      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        body: formData,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessageContent = "";
      let botMessageId = Date.now() + 1;

      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          type: "bot",
          content: "",
          timestamp: new Date().toISOString(),
          isStreaming: true,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId
                    ? { ...msg, isStreaming: false }
                    : msg,
                ),
              );
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  botMessageContent += parsed.chunk;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: botMessageContent }
                        : msg,
                    ),
                  );
                }
                if (parsed.error) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? {
                            ...msg,
                            content: `Error: ${parsed.error}`,
                            error: true,
                          }
                        : msg,
                    ),
                  );
                }
              } catch (e) {
                console.error("Parse error:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "bot",
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: new Date().toISOString(),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      removeImage();
    }
  };

  const suggestions = [
    { text: "My tomato leaves have brown spots", icon: "🍅" },
    { text: "Best organic pesticides for rice", icon: "🌾" },
    { text: "When to apply nitrogen fertilizer?", icon: "🧪" },
    { text: "Identify wheat rust symptoms", icon: "🍂" },
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-gradient-to-br from-gray-50 via-white to-green-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20">
      {/* Top Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200/50 dark:shadow-none">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">AgriBot</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <Leaf className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300 font-semibold">
              Gemini 3.1 Flash Lite
            </span>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Welcome Screen */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-full px-4 py-12"
          >
            <div className="max-w-xl w-full text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200/50 dark:shadow-none"
              >
                <Bot className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How can I help you today?
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Ask about crop diseases, treatments, or upload a photo for diagnosis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInputMessage(suggestion.text)}
                    className="text-left p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg hover:shadow-green-100/50 dark:hover:shadow-none transition-all group"
                  >
                    <span className="text-2xl mb-3 block">{suggestion.icon}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {suggestion.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Chat Messages */}
          <div className="max-w-5xl mx-auto">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`py-6 px-4 sm:px-8 ${
                  message.type === "user" ? "bg-transparent" : "bg-white/50 dark:bg-gray-800/30"
                }`}
              >
                <div className="max-w-3xl mx-auto flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    {message.type === "user" ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-md">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">
                      {message.type === "user" ? "You" : "AgriBot"}
                    </div>

                    {message.image && (
                      <div className="mb-3 inline-block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md max-w-xs">
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-h-48 w-auto object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                        message.error
                          ? "text-red-600 dark:text-red-400"
                          : message.type === "user"
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {message.content || (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75" />
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Image Preview */}
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center gap-3 p-2 pr-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 w-fit"
            >
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px] font-medium">
                {selectedImage.file.name}
              </span>
              <button
                onClick={removeImage}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </motion.div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl px-3 py-3 focus-within:border-green-400 dark:focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900/30 transition-all shadow-sm">
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
              className="flex-shrink-0 p-2.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors disabled:opacity-40"
              title="Upload image"
            >
              <Image className="w-5 h-5" />
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
              placeholder="Message AgriBot..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none py-1.5 max-h-[200px] outline-none font-medium"
              disabled={isLoading}
            />

            <button
              onClick={sendMessage}
              disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white transition-all disabled:cursor-not-allowed shadow-md shadow-green-200/50 dark:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-500 dark:text-gray-500 mt-3 font-medium">
            AgriBot can make mistakes. Verify critical diagnoses with agricultural experts.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AgriBotChat;
