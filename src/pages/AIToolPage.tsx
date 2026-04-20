import React, { useState, useEffect, useRef } from 'react';
import { TOOLS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";
import * as Icons from 'lucide-react';
import { 
  Loader2, Download, CheckCircle2, AlertCircle, 
  Send, Search, Image as ImageIcon, Video, Mic, Volume2, 
  Sparkles, Globe, Maximize2, History, Trash2, Paperclip, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LiveVoice } from '../components/LiveVoice';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';

// Initialize GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AIToolPage: React.FC<{ toolId: string }> = ({ toolId }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'analysis', timestamp?: any, groundingChunks?: any[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showLiveVoice, setShowLiveVoice] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const tool = TOOLS.find(t => t.id === toolId);
  const Icon = tool ? ((Icons as any)[tool.icon] || Icons.File) : Icons.File;

  // Load existing conversation or create a new one
  useEffect(() => {
    if (!user || !toolId) return;

    const path = `users/${user.uid}/conversations`;
    const q = query(collection(db, path), where('toolId', '==', toolId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestDoc = snapshot.docs.sort((a, b) => b.data().updatedAt?.seconds - a.data().updatedAt?.seconds)[0];
        setConversationId(latestDoc.id);
        setMessages(latestDoc.data().messages || []);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, toolId]);

  const saveMessage = async (newMessages: any[]) => {
    if (!user || !toolId) return;

    const path = `users/${user.uid}/conversations`;
    try {
      if (conversationId) {
        await setDoc(doc(db, path, conversationId), {
          messages: newMessages,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, path), {
          id: '', // Will be updated
          userId: user.uid,
          toolId,
          messages: newMessages,
          updatedAt: serverTimestamp()
        });
        await setDoc(docRef, { id: docRef.id }, { merge: true });
        setConversationId(docRef.id);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = (event.target?.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [
                { inlineData: { data: base64, mimeType: 'audio/wav' } },
                { text: "Transcribe this audio." }
              ]
            });
            setInput(prev => prev + (prev ? ' ' : '') + (response.text || ''));
          } catch (err: any) {
            setError('Transcription failed: ' + err.message);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!tool) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedFile({
          name: file.name,
          data: base64.split(',')[1],
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile && toolId !== 'ai-voice') return;
    
    setIsProcessing(true);
    setError(null);
    const userMessage = { role: 'user' as const, content: input || (attachedFile ? `Uploaded ${attachedFile.name}` : ''), timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      let aiResponse: { role: 'ai', content: string, type?: any, timestamp: string, groundingChunks?: any[] } | null = null;

      if (toolId === 'ai-assistant') {
        const contents: any[] = [];
        if (attachedFile) {
          contents.push({
            parts: [
              { inlineData: { data: attachedFile.data, mimeType: attachedFile.type } },
              { text: input || "Analyze this image." }
            ]
          });
        } else {
          contents.push(input);
        }

        const response = await ai.models.generateContent({
          model: attachedFile ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
          contents,
          config: {
            tools: attachedFile ? [] : [{ googleSearch: {} }],
          },
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        aiResponse = { 
          role: 'ai', 
          content: response.text || 'No response', 
          timestamp: new Date().toISOString(),
          groundingChunks: chunks
        };
      } 
      else if (toolId === 'ai-image-gen') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: { parts: [{ text: input }] },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: imageSize as any
            }
          }
        });
        
        let imageUrl = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
        
        aiResponse = { 
          role: 'ai', 
          content: imageUrl || response.text || 'Failed to generate image', 
          type: imageUrl ? 'image' : 'text',
          timestamp: new Date().toISOString()
        };
      }
      else if (toolId === 'ai-video-gen') {
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt: input,
          config: {
            numberOfVideos: 1,
            resolution: videoResolution as any,
            aspectRatio: videoAspectRatio as any
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        aiResponse = { 
          role: 'ai', 
          content: downloadLink || 'Failed to generate video', 
          type: downloadLink ? 'video' : 'text',
          timestamp: new Date().toISOString()
        };
      }
      else if (toolId === 'ai-voice') {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: input }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        aiResponse = { 
          role: 'ai', 
          content: base64Audio ? `data:audio/pcm;base64,${base64Audio}` : (response.text || 'Failed to generate audio'), 
          type: base64Audio ? 'audio' : 'text',
          timestamp: new Date().toISOString()
        };
      }

      if (aiResponse) {
        const finalMessages = [...updatedMessages, aiResponse];
        setMessages(finalMessages);
        if (user) await saveMessage(finalMessages);
      }
      setAttachedFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing your request.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white relative overflow-hidden",
              "shadow-[0_4px_8px_-2px_rgba(0,0,0,0.3),inset_0_2px_4px_-1px_rgba(255,255,255,0.5),inset_0_-2px_4px_-1px_rgba(0,0,0,0.2)]",
              "border border-white/20",
              tool.color
            )}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
              <Icon size={24} className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] relative z-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">{tool.name}</h1>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col lg:flex-row gap-8 min-h-0">
          <AnimatePresence>
            {showLiveVoice && <LiveVoice onClose={() => setShowLiveVoice(false)} />}
          </AnimatePresence>

          {/* Chat/Result Area */}
          <div className="flex-grow bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white relative overflow-hidden opacity-80",
                    "shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4),inset_0_6px_8px_-2px_rgba(255,255,255,0.5),inset_0_-6px_8px_-2px_rgba(0,0,0,0.2)]",
                    "border border-white/20",
                    tool.color
                  )}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
                    <Icon size={48} className="drop-shadow-[0_3px_4px_rgba(0,0,0,0.4)] relative z-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
                  <p className="text-gray-500 max-w-md">
                    {toolId === 'ai-assistant' && "Ask me anything about your PDFs or the web. I have access to Google Search for real-time info."}
                    {toolId === 'ai-image-gen' && "Describe an image you want to create. You can specify styles, colors, and more."}
                    {toolId === 'ai-video-gen' && "Describe a scene for a video. I'll use Veo 3 to bring it to life."}
                    {toolId === 'ai-voice' && "Type some text for TTS, or click the 'Live Conversation' button for real-time voice chat."}
                  </p>
                  {toolId === 'ai-voice' && (
                    <button 
                      onClick={() => setShowLiveVoice(true)}
                      className="mt-8 px-8 py-4 bg-fuchsia-600 text-white rounded-2xl font-bold shadow-xl shadow-fuchsia-200 hover:bg-fuchsia-700 transition-all flex items-center gap-3"
                    >
                      <Mic size={20} />
                      Start Live Conversation
                    </button>
                  )}
                </div>
              )}
              
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm",
                    msg.role === 'user' ? "bg-fuchsia-600 text-white" : "bg-gray-100 text-gray-900"
                  )}>
                    {msg.type === 'image' ? (
                      <img src={msg.content} alt="Generated" className="rounded-lg max-w-full h-auto shadow-md" />
                    ) : msg.type === 'video' ? (
                      <video src={msg.content} controls className="rounded-lg max-w-full h-auto shadow-md" />
                    ) : msg.type === 'audio' ? (
                      <div className="flex items-center gap-3">
                        <Volume2 size={20} />
                        <audio src={msg.content} controls className="h-8" />
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                              <Globe size={12} /> Sources:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {msg.groundingChunks.map((chunk: any, idx: number) => {
                                if (chunk.web?.uri) {
                                  return (
                                    <a 
                                      key={idx} 
                                      href={chunk.web.uri} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs bg-white/50 hover:bg-white border border-gray-200 rounded-md px-2 py-1 text-blue-600 truncate max-w-[200px] transition-colors"
                                      title={chunk.web.title}
                                    >
                                      {chunk.web.title || chunk.web.uri}
                                    </a>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </motion.div>
              ))}
              
              {isProcessing && (
                <div className="flex items-center gap-3 text-gray-400">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">AI is thinking...</span>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-fuchsia-50 border border-fuchsia-100 rounded-xl flex items-center gap-3 text-fuchsia-600">
                  <AlertCircle size={16} />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <AnimatePresence>
                {attachedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4 p-2 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-fuchsia-50 rounded-lg flex items-center justify-center text-fuchsia-600">
                      <ImageIcon size={20} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Ready to analyze</p>
                    </div>
                    <button 
                      onClick={() => setAttachedFile(null)}
                      className="p-2 hover:bg-fuchsia-50 text-gray-400 hover:text-fuchsia-600 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    toolId === 'ai-image-gen' ? "Describe the image you want to create..." :
                    toolId === 'ai-video-gen' ? "Describe the video scene..." :
                    "Type your message here..."
                  }
                  className="w-full pl-6 pr-28 py-4 bg-white rounded-2xl shadow-lg border-none focus:ring-2 focus:ring-fuchsia-500 transition-all outline-none resize-none min-h-[60px] max-h-[200px]"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                    title="Attach Image"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      isRecording ? "bg-fuchsia-100 text-fuchsia-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                  >
                    <Mic size={20} />
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={isProcessing || (!input.trim() && !attachedFile && toolId !== 'ai-voice')}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      isProcessing ? "bg-gray-200 text-gray-400" : "bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-200"
                    )}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {toolId === 'ai-image-gen' && (
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Maximize2 size={20} className="text-fuchsia-600" />
                  Image Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ratio => (
                        <button 
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "py-2 text-xs font-bold rounded-lg border transition-all",
                            aspectRatio === ratio ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-fuchsia-400"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Quality</label>
                    <div className="flex gap-2">
                      {['512px', '1K', '2K', '4K'].map(size => (
                        <button 
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                            imageSize === size ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-fuchsia-400"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {toolId === 'ai-video-gen' && (
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Video size={20} className="text-fuchsia-600" />
                  Video Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Resolution</label>
                    <div className="flex gap-2">
                      {['720p', '1080p'].map(res => (
                        <button 
                          key={res}
                          onClick={() => setVideoResolution(res)}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                            videoResolution === res ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-fuchsia-400"
                          )}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                      {['16:9', '9:16'].map(ratio => (
                        <button 
                          key={ratio}
                          onClick={() => setVideoAspectRatio(ratio)}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-lg border transition-all",
                            videoAspectRatio === ratio ? "bg-fuchsia-600 border-fuchsia-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-fuchsia-400"
                          )}
                        >
                          {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <History size={20} className="text-fuchsia-600" />
                Session Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Messages</span>
                  <span className="text-xs font-black text-gray-900">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</span>
                  <span className="text-xs font-black text-fuchsia-600">
                    {toolId === 'ai-assistant' ? 'Gemini 3 Flash' : 
                     toolId === 'ai-image-gen' ? 'Gemini 3.1 Flash Image' :
                     toolId === 'ai-video-gen' ? 'Veo 3.1 Lite' : 'Gemini 2.5 Flash TTS'}
                  </span>
                </div>
                <button 
                  onClick={() => setMessages([])}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-xs font-bold text-fuchsia-600 border border-fuchsia-100 rounded-xl hover:bg-fuchsia-50 transition-all"
                >
                  <Trash2 size={14} />
                  Clear Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
