
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { chat } from '@/ai/flows/chatbot';
import type { z } from 'genkit';

type Message = z.infer<typeof ChatMessageSchema>;

// Re-define schema from chatbot.ts to use in the component
const ChatMessageSchema = {
  role: 'user' as const | 'model' as const,
  content: [{ text: '' }],
};


export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: [{ text: "Hello! I'm the SkillSwap assistant. How can I help you today?" }],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
        setTimeout(() => {
             const scrollableView = scrollAreaRef.current?.querySelector('div');
             if (scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
             }
        }, 100);
    }
  }, [messages, isOpen]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat({
        history: messages,
        message: input,
      });

      const modelMessage: Message = { role: 'model', content: [{ text: response }] };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'model',
        content: [{ text: 'Sorry, I encountered an error. Please try again.' }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
              <CardHeader className="flex-row items-center gap-3">
                <Bot className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle className="font-headline text-xl">SkillSwap Assistant</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                  <div className="flex flex-col gap-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role === 'model' && (
                          <div className="p-2 bg-secondary rounded-full">
                            <Bot className="w-5 h-5 text-secondary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.content[0].text}
                        </div>
                        {message.role === 'user' && (
                           <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                    ))}
                     {isLoading && (
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-secondary rounded-full">
                           <Loader2 className="w-5 h-5 text-secondary-foreground animate-spin" />
                         </div>
                        <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-muted animate-pulse">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
    </>
  );
}
