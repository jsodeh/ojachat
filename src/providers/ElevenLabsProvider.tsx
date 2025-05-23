import { createContext, useContext, ReactNode, useRef } from 'react';
import { Conversation } from '@11labs/client';

interface ElevenLabsContextType {
  startAgentSession: (handlers: ConversationHandlers) => Promise<void>;
  stopAgentSession: () => Promise<void>;
}

interface ConversationHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onModeChange?: (mode: any) => void;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

interface ElevenLabsProviderProps {
  children: ReactNode;
}

export function ElevenLabsProvider({ children }: ElevenLabsProviderProps) {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
  const conversationRef = useRef<any>(null);

  const startAgentSession = async (handlers: ConversationHandlers) => {
    if (!agentId || !apiKey) {
      throw new Error('Missing ElevenLabs agent ID or API key');
    }
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    conversationRef.current = await Conversation.startSession({
      agentId,
      apiKey,
      ...handlers,
    });
  };

  const stopAgentSession = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
  };

  return (
    <ElevenLabsContext.Provider value={{ startAgentSession, stopAgentSession }}>
      {children}
    </ElevenLabsContext.Provider>
  );
}

export function useElevenLabs() {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
} 