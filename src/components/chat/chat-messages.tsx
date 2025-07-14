import React, { useEffect, useRef } from 'react';
import { ChatMessage, Message } from './chat-message';
import { Card, CardContent } from '../ui/card';
import { BarChart, Loader2 } from 'lucide-react';
import { Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart as RechartsBarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Logo } from '../icons/logo';

const QuizResultCard = ({ result }: { result: { question: string, correct: boolean, explanation: string }}) => (
    <Card className={cn("my-2", result.correct ? 'border-green-500' : 'border-red-500')}>
        <CardContent className="p-4">
            <p className="font-bold">{result.question}</p>
            <p className={cn(result.correct ? "text-green-600" : "text-red-600")}>
                You answered {result.correct ? 'correctly' : 'incorrectly'}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">{result.explanation}</p>
        </CardContent>
    </Card>
);

interface ChatMessagesProps {
  chatId: string | null;
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ chatId, messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  

  if (!chatId || (messages.length === 0 && !isLoading)) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <Logo />
            <p className="mt-4 text-lg text-muted-foreground">Start a new conversation with Cognita!</p>
            <p className="text-sm text-muted-foreground">Ask anything about your studies.</p>
        </div>
      )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <React.Fragment key={message.id}>
            {message.type !== 'ai' || message.content ? <ChatMessage message={message} /> : null}

            {message.type === 'ai' && message.chartData && (
                <Card className="max-w-xl ml-14 my-2 shadow-sm bg-card">
                    <CardContent className="p-4">
                        <h3 className="font-bold font-headline mb-4 text-lg flex items-center gap-2"><BarChart className="text-primary" /> {message.chartData.title}</h3>
                        <div className="h-64">
                            <ChartContainer config={{value: {label: 'Importance', color: 'hsl(var(--primary))'}}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={message.chartData.data} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {message.type === 'ai' && message.visualAidUrl && (
                <div className="max-w-xl ml-14 my-2">
                    <Image src={message.visualAidUrl} alt="Visual Aid" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="education diagram"/>
                </div>
            )}
            
            {message.type === 'ai' && message.quizResult && (
                <div className="max-w-xl ml-14 my-2">
                    <QuizResultCard result={message.quizResult} />
                </div>
            )}
        </React.Fragment>
      ))}
       {isLoading && (
        <div className="flex items-start gap-4">
          <ChatMessage message={{ id: 'loading', type: 'ai', content: '' }} />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
