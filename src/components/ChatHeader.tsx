import { ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  onNewChat?: () => void; // Add callback prop
}

const ChatHeader = ({ isSidebarOpen = true, onNewChat }: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 z-30 w-full border-b border-white/20 bg-chatgpt-main/95 backdrop-blur">
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-2 md:flex-grow-0 flex-grow">
          <span className={`font-semibold ${!isSidebarOpen ? 'md:ml-20' : 'md:pl-4'} text-center w-full md:text-left`}>OjaChat</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div 
          onClick={onNewChat}
          className="gizmo-shadow-stroke relative flex h-8 w-8 items-center justify-center rounded-full bg-token-main-surface-primary text-token-text-primary cursor-pointer hover:bg-gray-700"
        >
          <img
            src="/assets/ojastack.png"
            alt="OjaStack"
            className="h-2/3 w-2/3"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;