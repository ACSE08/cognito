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
                <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                </Avatar>
            )}
            {message.content && (
                <div className={cn(
                    "max-w-xl rounded-lg px-4 py-3 shadow-sm",
                    isUser 
                        ? "bg-gradient-to-br from-primary to-violet-600 text-primary-foreground" 
                        : "bg-card"
                )}>
                    <ReactMarkdown className="prose dark:prose-invert prose-p:leading-relaxed prose-a:text-accent-foreground prose-a:underline">
                        {message.content}
                    </ReactMarkdown>
                </div>
            )}
            {isUser && (
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/40x40.png" />
                    <AvatarFallback><User size={20}/></AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}
