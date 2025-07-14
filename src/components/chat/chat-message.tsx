import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Message {
    id: string;
    type: 'user' | 'ai';
    content?: string;
    chartData?: { title: string; data: { name: string; value: number }[] };
    visualAidUrl?: string;
    quizResult?: { question: string; correct: boolean; explanation: string };
}

export function ChatMessage({ message }: { message: Message }) {
    const isUser = message.type === 'user';
    return (
        <div className={cn("flex items-start gap-4", isUser && "justify-end")}>
            {!isUser && (
                <Avatar className="h-10 w-10 border-2 border-accent">
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
            )}
            {message.content && (
                <div className={cn(
                    "max-w-xl rounded-lg p-4 shadow-md",
                    isUser ? "bg-primary/80 text-primary-foreground" : "bg-card"
                )}>
                    <ReactMarkdown className="prose dark:prose-invert prose-p:leading-relaxed prose-a:text-accent">
                        {message.content}
                    </ReactMarkdown>
                </div>
            )}
            {isUser && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src="https://placehold.co/40x40.png" />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}
