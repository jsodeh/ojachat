import { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2, Paperclip, Mic, Camera, Crown } from "lucide-react";
import { useAnimatedHints } from '@/hooks/use-animated-hints';
import { useLocation } from '@/hooks/use-location';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import VoiceModal from "./VoiceModal";
import MoreOptionsDialog from "./MoreOptionsDialog";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthWrapper } from '@/components/AuthWrapper';

// Attachment options menu component
const AttachmentMenu = ({ 
  isOpen, 
  onClose, 
  position,
  onSelectOption 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  position: { top: number; left: number } | null;
  onSelectOption: (option: string) => void;
}) => {
  if (!isOpen || !position) return null;

  const handleOptionClick = (option: string) => {
    onSelectOption(option);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />
      <div 
        className="fixed z-50 w-52 bg-grok-light-secondary dark:bg-grok-dark-secondary rounded-lg shadow-lg border border-grok-light-border dark:border-grok-dark-border overflow-hidden"
        style={{
          top: position.top,
          left: position.left
        }}
      >
        <div className="p-1">
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('picture')}
          >
            <Camera className="h-4 w-4" />
            <span>Take a picture</span>
          </button>
          
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('voice')}
          >
            <Mic className="h-4 w-4" />
            <span>Send a Voice note</span>
          </button>
        </div>
      </div>
    </>
  );
};

interface ChatInputProps {
  onSend: (message: string, sessionId: string) => void;
  isLoading?: boolean;
  isLarge?: boolean;
  sessionId: string;
  key?: string;
}

const ChatInput = ({ onSend, isLoading = false, isLarge = false, sessionId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [moreOptionsPosition, setMoreOptionsPosition] = useState<{ top: number; left: number } | null>(null);
  const [attachmentMenuPosition, setAttachmentMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  
  const { location } = useLocation();
  const { currentText } = useAnimatedHints({
    location: location?.area
  });

  // Get authentication state
  const { isAuthenticated } = useAuth();
  const authWrapper = useAuthWrapper();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      // Check if user is authenticated before sending message
      if (!isAuthenticated) {
        // Trigger auth modal
        authWrapper.showAuthModal();
        return;
      }
      
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

  const handleVoiceTranscript = (text: string) => {
    setMessage(text);
    setIsVoiceModalOpen(false);
  };

  const handleVoiceMode = () => {
    // Check authentication before opening voice modal
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }
    
    setIsVoiceModalOpen(true);
  };

  const handleVoiceModalToggle = () => {
    setIsVoiceModalOpen(!isVoiceModalOpen);
  };
  
  const handleOpenMoreOptions = () => {
    // Check authentication before opening more options
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }
    
    if (moreOptionsButtonRef.current) {
      const rect = moreOptionsButtonRef.current.getBoundingClientRect();
      const dialogHeight = 300; // Approximate height of dialog
      
      // Use clientY/clientX to get viewport position, accounting for scroll
      setMoreOptionsPosition({
        top: rect.top,
        left: Math.max(10, rect.left - 100) // Ensure it's not off-screen on the left
      });
    }
    setIsMoreOptionsOpen(true);
  };

  const handleOpenAttachmentMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Check authentication before opening attachment menu
    if (!isAuthenticated) {
      authWrapper.showAuthModal();
      return;
    }
    
    // Create a fixed position directly at the cursor location in the viewport
    const menuPosition = {
      top: e.clientY,
      left: e.clientX
    };
    
    setAttachmentMenuPosition(menuPosition);
    setIsAttachmentMenuOpen(true);
    
    // Add a click handler to the document to close the menu when clicking elsewhere
    document.addEventListener('click', handleCloseAttachmentMenu);
  };
  
  const handleCloseAttachmentMenu = () => {
    setIsAttachmentMenuOpen(false);
    document.removeEventListener('click', handleCloseAttachmentMenu);
  };

  const handleAttachmentSelect = (option: string) => {
    console.log(`Selected attachment option: ${option}`);
    // Handle the attachment selection
  };

  return (
    <div className="relative w-full">
      <textarea
        rows={isLarge ? 4 : 3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "Connecting to service..." : "What do you want to know?"}
        className="grok-input w-full text-base"
        style={{ minHeight: isLarge ? "140px" : "120px" }}
        disabled={isLoading}
      />
      
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-grok-light-text-secondary dark:text-grok-dark-text-secondary">
        {!isMobile && (
          <button 
            ref={attachmentButtonRef}
            onClick={handleOpenAttachmentMenu}
            className="p-2 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        )}
        
        <button 
          ref={moreOptionsButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenMoreOptions();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white border border-grok-light-border dark:border-grok-dark-border cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #12b76a 0%, #16a34a 50%, #15803d 100%)"
          }}
        >
          <Crown className="h-5 w-5" />
          <span className="text-sm font-medium">Do More</span>
        </button>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button 
          onClick={handleVoiceMode}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover"
        >
          <Mic className="h-5 w-5" />
          <span className="text-sm">Voice Mode</span>
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className="p-2 rounded-full bg-grok-light-button-bg dark:bg-grok-dark-button-bg border border-grok-light-border dark:border-grok-dark-border hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </div>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={handleVoiceModalToggle}
        onTranscript={handleVoiceTranscript}
      />
      
      <MoreOptionsDialog
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        position={moreOptionsPosition}
      />

      {isAttachmentMenuOpen && (
        <AttachmentMenu
          isOpen={isAttachmentMenuOpen}
          onClose={handleCloseAttachmentMenu}
          position={attachmentMenuPosition}
          onSelectOption={handleAttachmentSelect}
        />
      )}
    </div>
  );
};

export default ChatInput;
