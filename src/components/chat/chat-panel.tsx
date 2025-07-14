"use client";

import React, { useState, useEffect } from 'react';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import type { Message } from './chat-message';

const MOCK_HISTORY: { [key: string]: Message[] } = {
  "1": [
    { id: '1', type: 'user', content: 'Can you explain photosynthesis?' },
    { id: '2', type: 'ai', content: 'Of course! Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.' },
  ],
  "2": [
    { id: '1', type: 'user', content: 'Tell me about the Roman Empire.' },
    { id: '2', type: 'ai', content: 'The Roman Empire was one of the most influential civilizations in world history, which began in the city of Rome in 753 BC.' },
  ]
};

export default function ChatPanel({ chatId }: { chatId: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Simulate fetching messages for the chatId
        if (chatId && MOCK_HISTORY[chatId]) {
            setMessages(MOCK_HISTORY[chatId]);
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const handleNewMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    return (
        <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <ChatMessages chatId={chatId} messages={messages} isLoading={isLoading} />
            </div>
            <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
                 <div className="mx-auto max-w-3xl">
                    <ChatInput onNewMessage={handleNewMessage} setLoading={setIsLoading} isLoading={isLoading} />
                 </div>
            </div>
        </div>
    );
}
