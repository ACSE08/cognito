"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Image as ImageIcon, Video, VideoOff, Loader2 } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-message";
import { processMultimodalQuery } from "@/ai/flows/process-multimodal-query";
import { detectStudentDisengagement } from "@/ai/flows/detect-student-disengagement";

interface ChatInputProps {
  onNewMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

export default function ChatInput({ onNewMessage, setLoading, isLoading }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isDetectingEngagement, setIsDetectingEngagement] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const engagementIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const [hasCameraPermission, setHasCameraPermission] = useState(false);


    const handleSend = async () => {
        if (input.trim()) {
            const userMessage: Message = { id: crypto.randomUUID(), type: 'user', content: input };
            onNewMessage(userMessage);
            setInput("");
            setLoading(true);

            try {
                const result = await processMultimodalQuery({ textQuery: input });
                const aiMessage: Message = {
                    id: crypto.randomUUID(),
                    type: 'ai',
                    content: result.response,
                    chartData: result.includesChart ? { title: "Data Visualization", data: [{ name: 'A', value: 400 }, { name: 'B', value: 300 }] } : undefined,
                };
                onNewMessage(aiMessage);
            } catch (error) {
                console.error("Error processing query:", error);
                toast({ variant: "destructive", title: "AI Error", description: "Failed to get a response from the AI." });
            } finally {
                setLoading(false);
            }
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
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        console.log("Sending voice data URI");
                        onNewMessage({ id: crypto.randomUUID(), type: 'user', content: '[Voice message]' });
                        setLoading(true);
                        try {
                            const result = await processMultimodalQuery({ voiceDataUri: base64data });
                             const aiMessage: Message = {
                                id: crypto.randomUUID(),
                                type: 'ai',
                                content: result.response,
                                chartData: result.includesChart ? { title: "Data Visualization", data: [{ name: 'A', value: 400 }, { name: 'B', value: 300 }] } : undefined,
                            };
                            onNewMessage(aiMessage);
                        } catch (error) {
                             console.error("Error processing query:", error);
                            toast({ variant: "destructive", title: "AI Error", description: "Failed to get a response from the AI." });
                        } finally {
                            setLoading(false);
                        }
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
    
    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            // Stop the tracks immediately after getting permission if not actively detecting
            if (!isDetectingEngagement) {
                 stream.getTracks().forEach(track => track.stop());
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
          }
        };
    
        getCameraPermission();

        return () => {
             if (engagementIntervalRef.current) {
                clearInterval(engagementIntervalRef.current);
            }
            const stream = videoRef.current?.srcObject as MediaStream | null;
            stream?.getTracks().forEach(track => track.stop());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleEngagementDetection = (checked: boolean) => {
        setIsDetectingEngagement(checked);
        if (checked) {
            if (!hasCameraPermission) {
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
                setIsDetectingEngagement(false);
                return;
            }
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                    engagementIntervalRef.current = setInterval(async () => {
                        if (videoRef.current && videoRef.current.readyState >= 2) {
                            const canvas = document.createElement('canvas');
                            canvas.width = videoRef.current.videoWidth;
                            canvas.height = videoRef.current.videoHeight;
                            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                            const faceDataUri = canvas.toDataURL('image/jpeg');
                            
                            try {
                                const result = await detectStudentDisengagement({ faceDataUri, learningModule: "Current Topic" });
                                if (result.isDisengaged && result.boredomLevel > 60) {
                                    toast({ title: "Engagement Check", description: result.suggestedIntervention });
                                }
                            } catch(e) {
                                console.error("Error detecting disengagement", e);
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
                    className="pr-36 min-h-[52px] resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isLoading}
                />
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleVoiceRecording} disabled={isLoading}>
                                <Mic className={cn("h-5 w-5", isRecording && "text-red-500 animate-pulse")} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query with voice</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9" disabled={isLoading}>
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Query with image</p>
                        </TooltipContent>
                    </Tooltip>
                    <Button size="icon" className="h-9 w-9 bg-gradient-to-br from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90" onClick={handleSend} disabled={!input.trim() || isLoading}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch id="engagement-detection" checked={isDetectingEngagement} onCheckedChange={handleEngagementDetection} />
                    <Label htmlFor="engagement-detection" className="text-sm text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                        {isDetectingEngagement ? <Video className="h-4 w-4 text-primary" /> : <VideoOff className="h-4 w-4" />}
                        Real-time Engagement
                    </Label>
                </div>
                <p className="text-xs text-muted-foreground">Press Shift+Enter for a new line.</p>
                <video ref={videoRef} className={cn("absolute -z-10 h-px w-px opacity-0", isDetectingEngagement && "right-0 bottom-full mb-2 h-24 w-auto rounded-md border" )} playsInline muted />
            </div>
        </TooltipProvider>
    );
}
