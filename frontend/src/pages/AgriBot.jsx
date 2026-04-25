/*
AgriBot Chat Interface — Clean ChatGPT-Style Design
Full-screen immersive chat with proper spacing and clean visuals.
*/

import { useState, useRef, useEffect } from "react";
import { Send, Image, X, Bot, User, Loader2, Leaf } from "lucide-react";

const AgriBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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
    <div className="flex flex-col h-[calc(100dvh-5rem)] bg-[#0d1117] text-gray-100 pt-20">
      {/* Top Bar */}
      <div className="border-b border-gray-800/60 bg-[#161b22]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-100">AgriBot</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/60 border border-gray-700/40">
            <Leaf className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-gray-400 font-medium">
              Gemini 3.1 Flash Lite
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            <div className="max-w-xl w-full text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-100 mb-2">
                How can I help you today?
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Ask about crop diseases, treatments, or upload a photo for
                diagnosis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(suggestion.text)}
                    className="text-left p-4 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/70 hover:border-gray-600/40 transition-all group"
                  >
                    <span className="text-lg mb-2 block">
                      {suggestion.icon}
                    </span>
                    <span className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="max-w-5xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`py-6 px-4 sm:px-8 ${
                  message.type === "user" ? "bg-transparent" : "bg-gray-800/20"
                }`}
              >
                <div className="max-w-3xl mx-auto flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-0.5">
                    {message.type === "user" ? (
                      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-gray-200" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1.5 font-medium">
                      {message.type === "user" ? "You" : "AgriBot"}
                    </div>

                    {message.image && (
                      <div className="mb-3 inline-block rounded-xl overflow-hidden border border-gray-700/50 max-w-xs">
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
                          ? "text-red-400"
                          : message.type === "user"
                            ? "text-gray-100"
                            : "text-gray-300"
                      }`}
                    >
                      {message.content || (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-75" />
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800/60 bg-[#0d1117]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-3 flex items-center gap-3 p-2 pr-4 bg-gray-800/50 rounded-xl border border-gray-700/40 w-fit animate-in fade-in slide-in-from-bottom-2 duration-200">
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg"
              />
              <span className="text-xs text-gray-400 truncate max-w-[180px]">
                {selectedImage.file.name}
              </span>
              <button
                onClick={removeImage}
                className="p-1 rounded-md hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-gray-800/50 border border-gray-700/40 rounded-2xl px-3 py-3 focus-within:border-gray-600/50 focus-within:bg-gray-800/70 transition-all">
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
              className="flex-shrink-0 p-2 text-gray-400 hover:text-emerald-400 transition-colors disabled:opacity-40"
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
              className="flex-1 bg-transparent border-none focus:ring-0 text-gray-100 text-[15px] placeholder:text-gray-500 resize-none py-1.5 max-h-[200px] outline-none"
              disabled={isLoading}
            />

            <button
              onClick={sendMessage}
              disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
              className="flex-shrink-0 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-600 mt-2">
            AgriBot can make mistakes. Verify critical diagnoses with
            agricultural experts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgriBotChat;
