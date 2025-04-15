import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import { Message, ChatSession } from '@/types/chat';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState(`session_${Date.now()}`);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
  }, []);

  const handleNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
  };

  const handleSendMessage = async (content: string, sessionId: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const newMessage: Message = { 
      role: 'user',
      content,
      timestamp: Date.now()
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    const sessionTitle = messages.length === 0 ? content : chatSessions.find(s => s.id === sessionId)?.title || content;
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    const newSession = {
      id: sessionId,
      title: sessionTitle.slice(0, 40) + (sessionTitle.length > 40 ? '...' : ''),
      messages: newMessages,
      timestamp: Date.now()
    };
    
    const allSessions = [newSession, ...updatedSessions];
    setChatSessions(allSessions);
    localStorage.setItem('chatSessions', JSON.stringify(allSessions));

    let retries = 0;
    let success = false;

    while (retries <= MAX_RETRIES && !success) {
      try {
        const requestBody = {
          chatInput: content,
          sessionId: sessionId
        };
        console.log('Sending request:', requestBody);
        
        const response = await fetch('https://gwjtvfisorbdejarfgyx.supabase.co/functions/v1/n8n-router', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Edge function returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        let assistantContent;
        if (data?.output) {
          assistantContent = data.output;
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Invalid response format from assistant');
        }
        
        console.log('Processed assistant content:', assistantContent);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now()
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);

        const updatedSession = {
          ...newSession,
          messages: updatedMessages
        };
        const finalSessions = [updatedSession, ...updatedSessions];
        setChatSessions(finalSessions);
        localStorage.setItem('chatSessions', JSON.stringify(finalSessions));

        success = true;
      } catch (error: any) {
        console.error(`Edge function error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        retries++;
        
        if (retries <= MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          toast({
            title: "Connection Error",
            description: error.message || "Could not connect to the assistant. Please check your connection and try again.",
            variant: "destructive"
          });
          
          const fallbackMessage: Message = {
            role: 'assistant',
            content: "I'm having trouble connecting right now. Please check your connection and try again later.",
            timestamp: Date.now()
          };
          
          setMessages([...newMessages, fallbackMessage]);
        }
      } finally {
        if (retries >= MAX_RETRIES || success) {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onSessionSelect={(sessionId) => {
          setCurrentSessionId(sessionId);
          const session = chatSessions.find(s => s.id === sessionId);
          if (session) {
            setMessages(session.messages);
          }
        }}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        !isMobile && (isSidebarOpen ? 'ml-64' : 'ml-0')
      )}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onNewChat={handleNewChat}
        />
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? (
            <div className="w-full max-w-2xl px-4 space-y-4">  {/* Changed from max-w-3xl */}
              <div>
                <h1 className="mb-8 text-4xl font-semibold text-center">How can I help?</h1>
                <ChatInput 
                  onSend={(content) => handleSendMessage(content, currentSessionId)} 
                  isLoading={isLoading} 
                  isLarge={true} 
                  sessionId={currentSessionId}
                  key={currentSessionId}
                />
              </div>
              <ActionButtons />
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              <div className="w-full max-w-2xl mx-auto px-4 py-2">  {/* Changed from max-w-3xl */}
                <ChatInput 
                  onSend={(content) => handleSendMessage(content, currentSessionId)} 
                  isLoading={isLoading} 
                  isLarge={false} 
                  sessionId={currentSessionId}
                  key={currentSessionId}
                />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                OjaChat can make mistakes. Check important info.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
