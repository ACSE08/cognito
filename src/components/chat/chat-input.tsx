"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Image as ImageIcon, Video, VideoOff } from "lucide-react";
import React, { useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Placeholder for engagement detection call
async function detectDisengagement(imageData: string): Promise<string | null> {
    // In a real app, this would call the GenAI flow `detectStudentDisengagement`
    console.log("Detecting disengagement with image data...");
    if (Math.random() > 0.8) { // Simulate disengagement detection
        return "You seem a bit bored. How about we try a quick quiz on this topic?";
    }
    return null;
}

export default function ChatInput() {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isDetectingEngagement, setIsDetectingEngagement] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const engagementIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    const handleSend = () => {
        if (input.trim()) {
            console.log("Sending text:", input);
            // TODO: Add message to chat history and call AI
            setInput("");
        }
    };

    const handleVoiceRecording = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                
                const audioChunks: Blob[] = [];
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        console.log("Sending voice data URI");
                        // TODO: call AI with voice data `processMultimodalQuery({ voiceDataUri: base64data })`
                    };
                    stream.getTracks().forEach(track => track.stop());
                });

                setIsRecording(true);
            }).catch(err => {
                console.error("Error accessing microphone: ", err);
                toast({ variant: "destructive", title: "Microphone Error", description: "Could not access microphone." });
            });
        }
    };
    
    const handleEngagementDetection = (checked: boolean) => {
        setIsDetectingEngagement(checked);
        if (checked) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                    engagementIntervalRef.current = setInterval(async () => {
                        if (videoRef.current) {
                            const canvas = document.createElement('canvas');
                            canvas.width = videoRef.current.videoWidth;
                            canvas.height = video-ref.current.videoHeight;
                            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                            const imageData = canvas.toDataURL('image/jpeg');
                            const intervention = await detectDisengagement(imageData);
                            if (intervention) {
                                toast({ title: "Engagement Check", description: intervention });
                            }
                        }
                    }, 15000); // Check every 15 seconds
                })
                .catch(err => {
                    console.error("Error accessing webcam: ", err);
                    setIsDetectingEngagement(false);
                    toast({ variant: "destructive", title: "Webcam Error", description: "Could not access webcam for engagement detection." });
                });
        } else {
            if (engagementIntervalRef.current) {
                clearInterval(engagementIntervalRef.current);
            }
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
        }
    };

    return (
        <TooltipProvider>
            <div className="relative">
                <Textarea
                    placeholder="Ask a question about your studies..."
                    className="pr-32 min-h-[52px]"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleVoiceRecording}>
                                <Mic className={cn("h-5 w-5", isRecording && "text-red-500 animate-pulse")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query with voice</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9">
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query with image</p>
                        </TooltipContent>
                    </Tooltip>
                    <Button size="icon" className="h-9 w-9 bg-accent hover:bg-accent/90" onClick={handleSend} disabled={!input.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch id="engagement-detection" checked={isDetectingEngagement} onCheckedChange={handleEngagementDetection} />
                    <Label htmlFor="engagement-detection" className="text-sm text-muted-foreground flex items-center gap-1">
                        {isDetectingEngagement ? <Video className="h-4 w-4 text-green-500" /> : <VideoOff className="h-4 w-4" />}
                        Real-time Engagement Detection
                    </Label>
                </div>
                <p className="text-xs text-muted-foreground">Press Shift+Enter for a new line.</p>
                <video ref={videoRef} className="absolute -z-10 h-px w-px opacity-0" playsInline />
            </div>
        </TooltipProvider>
    );
}
