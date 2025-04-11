import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, sessionId: string) => void;
  isLoading?: boolean;
  isLarge?: boolean;
  sessionId: string; // Add sessionId prop
  key?: string; // Add key prop to force re-render on new session
}

const ChatInput = ({ onSend, isLoading = false, isLarge = false, sessionId }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      // Pass both message and sessionId to parent component
      onSend(message, sessionId);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative w-full">
        <textarea
          rows={isLarge ? 3 : 1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Connecting to service..." : "Type your message..."}
          className={`w-full resize-none px-4 pr-12 focus:outline-none bg-[#2F2F2F] ${
            isLarge ? 'py-6 rounded-[8px]' : 'py-4 rounded-full'
          }`}
          style={{ maxHeight: isLarge ? "300px" : "200px" }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className={`absolute right-3 p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLarge ? 'bottom-3' : 'top-[50%] -translate-y-[50%]'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
      {isLoading && (
        <p className="text-xs text-gray-400 mt-1">Processing your message...</p>
      )}
    </div>
  );
};

export default ChatInput;
