import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import WelcomeMessage from '@/components/WelcomeMessage';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { Message, ChatSession } from '@/types/chat';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!SUPABASE_ANON_KEY || !SUPABASE_URL) {
  console.error('Missing required environment variables');
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
      content: {
        text: content,
      },
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
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/n8n-router`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'testauth': 'testauth'
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
          try {
            // Try to parse the output as JSON first
            const parsedOutput = JSON.parse(data.output);
            console.log('Parsed output:', parsedOutput);
            
            assistantContent = {
              text: parsedOutput.text,
              products: parsedOutput.rawResponse?.products || [],
              rawResponse: parsedOutput.rawResponse
            };
          } catch (e) {
            // If parsing fails, use the output as plain text
            console.log('Output is not JSON, using as plain text');
            assistantContent = {
              text: data.output,
              products: []
            };
          }
          console.log('Final assistant content:', assistantContent);
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
      } catch (error) {
        console.error(`Edge function error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        retries++;
        
        if (retries <= MAX_RETRIES) {
          console.log(`Retrying request (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          console.error('Final error after retries:', errorMessage);
          
          toast({
            title: "Connection Error",
            description: `Failed to connect: ${errorMessage}. Please check your connection and try again.`,
            variant: "destructive"
          });
          
          const fallbackMessage: Message = {
            role: 'assistant',
            content: {
              text: "I apologize, but I'm having troubl                                                                                                                         e connecting to the server. This might be due to:",
              actionButtons: [
                {
                  label: "Retry",
                  onClick: () => handleSendMessage(content, sessionId)
                }
              ]
            },
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

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
  };

  const handleOrderStatus = (status: OrderStatus) => {
    const newMessage: Message = {
      role: 'assistant',
      content: {
        text: status.message,
        richComponent: status
      },
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update the session with the new message
    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, newMessage]
        };
      }
      return session;
    });
    
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  return (
    <>
      <div className="flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          isMobile={isMobile}
          onNewChat={handleNewChat}
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onCartClick={() => setIsCartModalOpen(true)}
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
              <div className="w-full max-w-2xl px-4 space-y-4">
                <div>
                  <WelcomeMessage className="mb-8" />
                  <ChatInput 
                    onSend={(content) => handleSendMessage(content, currentSessionId)} 
                    isLoading={isLoading} 
                    isLarge={true} 
                    sessionId={currentSessionId}
                    key={currentSessionId}
                  />
                </div>
                <ActionButtons onSend={(content) => handleSendMessage(content, currentSessionId)} />
              </div>
            ) : (
              <>
                <MessageList messages={messages} onRetry={handleSendMessage} isLoading={isLoading} />
                <div className="w-full max-w-2xl mx-auto px-4 py-2">
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

      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
        onCheckout={() => {
          setIsCartModalOpen(false);
          setIsCheckoutModalOpen(true);
        }}
        onOrderStatus={handleOrderStatus}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </>
  );
};

export default Index;
