import { ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  onNewChat?: () => void;
}

const ChatHeader = ({ isSidebarOpen = true, onNewChat }: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 z-30 w-full border-b border-white/20 bg-chatgpt-main/95 backdrop-blur">
      <div className="flex h-[60px] items-center justify-between px-2 sm:px-4">
        <div className="flex-1 flex items-center">
          <div className="w-12 sm:w-auto" /> {/* Spacer for mobile */}
        </div>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <span className="font-semibold text-center truncate max-w-[150px] sm:max-w-none">OjaChat</span>
          <ChevronDown className="h-4 w-4 hidden sm:block" />
        </div>
        <div 
          onClick={onNewChat}
          className="flex-1 flex justify-end"
        >
          <div className="gizmo-shadow-stroke relative flex h-8 w-8 items-center justify-center rounded-full bg-token-main-surface-primary text-token-text-primary cursor-pointer hover:bg-gray-700">
            <img
              src={`${import.meta.env.BASE_URL}ojastack.png`}
              alt="OjaStack"
              className="h-2/3 w-2/3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;