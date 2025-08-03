
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { SendHorizonal, MessageCircle, Bot, User, Sparkles } from 'lucide-react';
import { chat } from '@/ai/flows/chatbot';
import { useAuth } from "@/lib/auth";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: 'user' | 'model';
  text: string;
};

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', text: "Hi! I'm the SkillSwap assistant. How can I help you today?" }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({
        role: m.role,
        content: [{ text: m.text }],
      }));

      const response = await chat({
        history: historyForApi,
        message: input,
      });

      const modelMessage: Message = { role: 'model', text: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
            className="fixed bottom-6 right-6 z-50"
        >
        <Button
          variant="default"
          className="rounded-full w-16 h-16 shadow-lg flex items-center justify-center"
        >
         <AnimatePresence mode="wait">
            {isOpen ? (
                 <motion.div key="close" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}>
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                 </motion.div>
            ) : (
                <motion.div key="open" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }}>
                    <MessageCircle className="h-8 w-8 text-primary-foreground" />
                </motion.div>
            )}
         </AnimatePresence>
        </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[90vw] max-w-md h-[70vh] max-h-[600px] p-0 rounded-lg shadow-2xl mr-4 mb-2 flex flex-col"
      >
        <header className="p-4 border-b bg-secondary/30 rounded-t-lg">
          <h3 className="font-headline text-lg flex items-center gap-2">
            <Bot className="text-primary" /> SkillSwap Assistant
          </h3>
        </header>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <div className="p-2 bg-primary text-primary-foreground rounded-full">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                 {message.role === 'user' && (
                  <div className="p-2 bg-secondary text-secondary-foreground rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="p-2 bg-primary text-primary-foreground rounded-full">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-4 border-t bg-secondary/30 rounded-b-lg">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || input.trim() === ''} size="icon">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>
        </footer>
      </PopoverContent>
    </Popover>
  );
}
