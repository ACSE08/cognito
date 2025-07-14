"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  History,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import React from "react";
import ChatPanel from "./chat-panel";
import Link from "next/link";

// Mock data, to be replaced with real data from a use-chat-history hook
const MOCK_HISTORY = [
  { id: "1", title: "Photosynthesis Explained" },
  { id: "2", title: "History of Roman Empire" },
  { id: "3", title: "What is a black hole?" },
  { id: "4", title: "Quantum Computing Basics" },
];

export default function ChatLayout() {
  const [activeChatId, setActiveChatId] = React.useState<string | null>(
    MOCK_HISTORY[0]?.id || null
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo className="group-data-[collapsible=icon]:hidden" />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveChatId("new")}
                isActive={activeChatId === "new"}
                tooltip="New Chat"
              >
                <MessageSquare />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Recent Chats</span>
            </div>
          </div>
          <SidebarMenu>
            {MOCK_HISTORY.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  onClick={() => setActiveChatId(chat.id)}
                  isActive={activeChatId === chat.id}
                  tooltip={chat.title}
                >
                  <MessageSquare />
                  <span>{chat.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-md p-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="font-medium group-data-[collapsible=icon]:hidden">
                    User Name
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Student User
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    student@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <ChatPanel key={activeChatId} chatId={activeChatId} />
      </SidebarInset>
    </SidebarProvider>
  );
}
