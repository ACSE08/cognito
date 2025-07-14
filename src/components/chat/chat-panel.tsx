import React from 'react';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';

export default function ChatPanel({ chatId }: { chatId: string | null }) {
    return (
        <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <ChatMessages chatId={chatId} />
            </div>
            <div className="border-t bg-background/80 p-4 backdrop-blur-sm">
                 <div className="mx-auto max-w-3xl">
                    <ChatInput />
                 </div>
            </div>
        </div>
    );
}
