import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * AIChatbotWidget - AI-Powered Texture Recommendations
 * Features:
 * - Authentication required (protectedProcedure)
 * - LLM-powered intelligent responses
 * - Conversation history support
 * - Mobile-optimized responsive design
 * - Timeout protection (15 seconds)
 */
export const AIChatbotWidget: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Ciao! Sono l\'assistente AI di DecorCarpi. Posso aiutarti a trovare la texture perfetta per i tuoi spazi. Dimmi: cosa stai cercando?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.chatbot.chat.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await chatMutation.mutateAsync({
        message: input,
        conversationHistory,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore nella generazione della risposta';
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ ${errorMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <button
        className="fixed bottom-20 right-4 z-40 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 opacity-50"
        disabled
        aria-label="Caricamento..."
      >
        <Loader2 size={24} className="animate-spin" />
      </button>
    );
  }

  // If not authenticated, show login button
  if (!user) {
    return (
      <button
        onClick={() => {
          window.location.href = getLoginUrl();
        }}
        className="fixed bottom-20 right-4 z-40 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Accedi per usare AI Assistant"
        title="Accedi per usare AI Assistant"
      >
        <LogIn size={24} />
      </button>
    );
  }

  // Closed state - show button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Apri chatbot AI"
        title="Assistente AI - Consigli di texture"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  // Open state - show chat window
  return (
    <Card className="fixed bottom-20 right-4 z-40 w-80 max-h-[70vh] md:w-96 md:max-h-96 flex flex-col bg-gray-900 border-yellow-500 shadow-2xl rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="font-bold text-base md:text-lg">🤖 Asistent AI</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-yellow-700 p-1 rounded transition-colors"
          aria-label="Închide chatbot"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-950">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[200px] md:max-w-xs px-3 py-2 rounded-lg text-xs md:text-sm ${
                msg.role === 'user'
                  ? 'bg-yellow-500 text-black rounded-br-none'
                  : 'bg-gray-800 text-gray-100 rounded-bl-none border border-yellow-500/30'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded-lg rounded-bl-none border border-yellow-500/30 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs md:text-sm">Sto pensando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-900 border-t border-yellow-500/30 rounded-b-lg flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Il tuo stile..."
          className="bg-gray-800 border-yellow-500/50 text-gray-100 placeholder-gray-400 text-xs md:text-sm"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black flex-shrink-0"
          size="sm"
        >
          <Send size={16} />
        </Button>
      </div>
    </Card>
  );
};

export default AIChatbotWidget;
