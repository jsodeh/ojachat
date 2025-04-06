
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Always add the user message immediately
    const newMessages = [
      ...messages,
      { role: 'user', content } as const
    ];
    
    setMessages(newMessages);

    let retries = 0;
    let success = false;

    while (retries <= MAX_RETRIES && !success) {
      try {
        // Send message to webhook
        const response = await fetch('https://odehn.app.n8n.cloud/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            messages: newMessages,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook returned status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the assistant's response
        const assistantContent = data.content || "Sorry, I couldn't process your request.";
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent
        };

        setMessages([...newMessages, assistantMessage]);
        success = true; // Mark as successful
      } catch (error: any) {
        console.error(`Webhook error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        
        retries++;
        
        if (retries <= MAX_RETRIES) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          // If all retries failed, show error and fallback response
          toast({
            title: "Connection Error",
            description: "Could not connect to the assistant. Please check your connection and try again.",
            variant: "destructive"
          });
          
          // Add a fallback response to let the user know what happened
          const fallbackMessage: Message = {
            role: 'assistant',
            content: "I'm having trouble connecting to my services right now. Please check your internet connection and try again later."
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
        onApiKeyChange={() => {}} // Empty function since we don't need API key anymore
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? (
            <div className="w-full max-w-3xl px-4 space-y-4">
              <div>
                <h1 className="mb-8 text-4xl font-semibold text-center">What are we cooking today?</h1>
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <ActionButtons />
            </div>
          ) : (
            <>
              <MessageList messages={messages} />
              <div className="w-full max-w-3xl mx-auto px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                ChatGPT can make mistakes. Check important info.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
