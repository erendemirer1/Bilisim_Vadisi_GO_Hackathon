import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Yönlendirme için
import { Button } from "./ui";

const VITE_AI_URL = "34.118.238.108" + "/input";

// UI içinde kullanacağımız mesaj yapısı
interface ChatMessage {
  id: number;
  text: string; // Ekranda görünecek yazı
  isUser: boolean; // Kim gönderdi?
  expertise?: string; // AI'dan gelen uzmanlık önerisi (Opsiyonel)
  timestamp: Date; // Saat bilgisi
}

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Yönlendirme hook'u

  // Başlangıç mesajı
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Merhaba! Ben 42 Klinik Asistanı. Size randevular, doktorlar veya sağlık hizmetlerimiz hakkında nasıl yardımcı olabilirim?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessageText = input;
    setInput("");

    // 1. Kullanıcı mesajını ekle
    const userMsg: ChatMessage = {
      id: Date.now(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. API İsteği
      const response = await fetch(`${"34.118.238.108"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: userMessageText }),
      });

      const data = await response.json();

      // 3. AI Cevabını İşle (message ve expertise geliyor)
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        text: data.message || "Anlaşılamadı.", // API'den gelen 'message'
        expertise: data.expertise, // API'den gelen 'expertise'
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat hatası:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Uzmanlık alanına yönlendirme fonksiyonu
  const handleExpertiseClick = (dept: string) => {
    setIsOpen(false); // Chati kapat
    navigate(`/doctor-search?dept=${dept}`); // O bölüme git
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm">42 AI Asistan</h3>
                <span className="flex items-center gap-1 text-[10px] text-blue-100 opacity-80">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Çevrimiçi
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm flex flex-col gap-2 ${
                    msg.isUser
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {/* Mesaj Metni */}
                  <p>{msg.text}</p>

                  {/* Expertise Varsa Öneri Butonu Göster */}
                  {!msg.isUser && msg.expertise && (
                    <button
                      onClick={() => handleExpertiseClick(msg.expertise!)}
                      className="mt-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg p-2 text-xs font-semibold flex items-center gap-2 hover:bg-blue-100 transition-colors w-fit"
                    >
                      <span>🔍 {msg.expertise} Bölümüne Git</span>
                    </button>
                  )}

                  {/* Saat */}
                  <span
                    className={`text-[10px] block text-right opacity-70 ${
                      msg.isUser ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Alanı */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir şeyler sorun..."
              className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 w-10 h-10 p-0 flex items-center justify-center rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </Button>
          </form>
        </div>
      )}

      {/* Toggle Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600"
        }`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};
