import React, { useEffect, useRef } from 'react';
import { ChatMessage, Message } from './chat-message';
import { Card, CardContent } from '../ui/card';
import { BarChart, Loader2 } from 'lucide-react';
import { Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, BarChart as RechartsBarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Logo } from '../icons/logo';

const mockMessages: { [key: string]: Message[] } = {
  "1": [
    { id: '1', type: 'user', content: 'Can you explain photosynthesis?' },
    { id: '2', type: 'ai', content: 'Of course! Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.' },
    { id: '3', type: 'ai', chartData: {
        title: "Key Components in Photosynthesis",
        data: [
            { name: 'Sunlight', value: 95 },
            { name: 'Water', value: 80 },
            { name: 'CO2', value: 85 },
            { name: 'Chlorophyll', value: 90 },
        ],
    }},
    { id: '4', type: 'user', content: 'Thanks! Can you show me a diagram?' },
    { id: '5', type: 'ai', content: "Certainly. Here is a simple diagram illustrating the process:", visualAidUrl: 'https://placehold.co/600x400.png' },
    { id: '6', type: 'ai', quizResult: { question: "What gas is released during photosynthesis?", correct: true, explanation: "Oxygen is released as a byproduct when water is split to provide electrons." } }
  ],
  "2": [
    { id: '1', type: 'user', content: 'Tell me about the Roman Empire.' },
    { id: '2', type: 'ai', content: 'The Roman Empire was one of the most influential civilizations in world history, which began in the city of Rome in 753 BC.' },
  ]
};

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

export default function ChatMessages({ chatId }: { chatId: string | null }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching messages for the chatId
    setTimeout(() => {
        setMessages(chatId && mockMessages[chatId] ? mockMessages[chatId] : []);
        setIsLoading(false);
    }, 500);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!chatId || messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
            <Logo />
            <p className="mt-4 text-lg text-muted-foreground">Start a new conversation with EduAI!</p>
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
                <Card className="max-w-xl ml-12 my-2 shadow-md">
                    <CardContent className="p-4">
                        <h3 className="font-bold font-headline mb-4 text-lg flex items-center gap-2"><BarChart className="text-accent" /> {message.chartData.title}</h3>
                        <div className="h-64">
                            <ChartContainer config={{value: {label: 'Importance', color: 'hsl(var(--accent))'}}}>
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
                <div className="max-w-xl ml-12 my-2">
                    <Image src={message.visualAidUrl} alt="Visual Aid" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="education diagram"/>
                </div>
            )}
            
            {message.type === 'ai' && message.quizResult && (
                <div className="max-w-xl ml-12 my-2">
                    <QuizResultCard result={message.quizResult} />
                </div>
            )}
        </React.Fragment>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
