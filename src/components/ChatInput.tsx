import { useState } from "react";
import { ArrowUp, Loader2, Paperclip, Mic, Plus } from "lucide-react";
import { useAnimatedHints } from '@/hooks/use-animated-hints';
import { useLocation } from '@/hooks/use-location';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ChatInputProps {
  onSend: (message: string, sessionId: string) => void;
  isLoading?: boolean;
  isLarge?: boolean;
  sessionId: string;
  key?: string;
}

const ChatInput = ({ onSend, isLoading = false, isLarge = false, sessionId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { location } = useLocation();
  const { currentText } = useAnimatedHints({
    location: location?.area
  });

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
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
    <div className="relative flex w-full flex-col items-center pb-4">
      <div className="relative w-full">
        <div className={`relative w-full bg-[#2F2F2F] rounded-[8px]`}>
          <textarea
            rows={isLarge ? 3 : 1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Connecting to service..." : currentText}
            className="w-full resize-none px-4 pr-12 pt-4 pb-16 focus:outline-none bg-transparent min-h-[100px]"
            style={{ maxHeight: isLarge ? "300px" : "200px" }}
            disabled={isLoading}
          />
          <button 
            onClick={handleSubmit}
            disabled={isLoading || !message.trim()}
            className="absolute right-3 bottom-3 p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-black animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4 text-black" />
            )}
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-700 rounded-full">
              <Plus className="h-4 w-4 text-gray-400" />
            </button>
            <ToggleGroup type="single" className="gap-2" value={undefined} onValueChange={() => {}}>
              <ToggleGroupItem value="voice" className="flex items-center justify-center w-10 h-10 bg-gray-700 text-white hover:bg-gray-600 data-[state=on]:bg-gray-500 rounded-full">
                <Mic className="h-5 w-5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      {isLoading && (
        <p className="text-xs text-gray-400 mt-1">Processing your message...</p>
      )}
    </div>
  );
};

export default ChatInput;
