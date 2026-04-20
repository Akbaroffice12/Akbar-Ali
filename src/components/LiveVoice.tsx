import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Volume2, VolumeX, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface LiveVoiceProps {
  onClose: () => void;
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        const session = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
            },
            systemInstruction: "You are a helpful AI assistant in the AR Tools PDF app. You can have real-time voice conversations with users.",
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              startAudioCapture();
            },
            onmessage: async (message: LiveServerMessage) => {
              if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
              }
              if (message.serverContent?.interrupted) {
                stopPlayback();
              }
              if (message.serverContent?.modelTurn?.parts[0]?.text) {
                setTranscription(prev => prev + ' ' + message.serverContent?.modelTurn?.parts[0]?.text);
              }
            },
            onclose: () => {
              setIsConnected(false);
              stopAudioCapture();
            },
            onerror: (err) => {
              console.error('Live API Error:', err);
              setIsConnected(false);
            }
          }
        });
        sessionRef.current = session;
      } catch (err) {
        console.error('Failed to connect to Live API:', err);
      }
    };

    connect();

    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
      stopAudioCapture();
    };
  }, []);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      // In a real app, we'd use a worklet to stream PCM data
      // For this demo, we'll simulate the streaming logic
      console.log('Audio capture started');
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopAudioCapture = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    console.log('Audio capture stopped');
  };

  const playAudio = (base64: string) => {
    // Logic to play raw PCM audio
    console.log('Playing audio chunk');
  };

  const stopPlayback = () => {
    console.log('Stopping playback');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center p-12 text-center relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <X size={24} />
        </button>

        <div className="relative mb-12">
          <div className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500",
            isConnected ? "bg-fuchsia-600 scale-110" : "bg-gray-200"
          )}>
            {isConnected ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Mic size={48} />
              </motion.div>
            ) : (
              <Loader2 className="animate-spin" size={48} />
            )}
          </div>
          {isConnected && (
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-fuchsia-600 -z-10"
            />
          )}
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2">
          {isConnected ? "Listening..." : "Connecting..."}
        </h2>
        <p className="text-gray-500 mb-8">
          {isConnected ? "Go ahead, I'm all ears. Talk to me about your PDFs or anything else." : "Setting up your secure voice session..."}
        </p>

        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 min-h-[100px] text-left">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Transcription</p>
          <p className="text-gray-700 italic">
            {transcription || "Your conversation will appear here..."}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-fuchsia-100 text-fuchsia-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-fuchsia-600 transition-all shadow-xl shadow-gray-200"
          >
            End Call
          </button>
        </div>
      </div>
    </motion.div>
  );
};
