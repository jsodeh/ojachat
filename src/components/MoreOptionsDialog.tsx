import React, { useState, useEffect } from 'react';
import { Image, FileSearch, Edit, Globe, Sparkles } from 'lucide-react';

interface MoreOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number } | null;
}

const MoreOptionsDialog: React.FC<MoreOptionsDialogProps> = ({ 
  isOpen, 
  onClose,
  position
}) => {
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number } | null>(null);
  
  useEffect(() => {
    if (position) {
      // Adjust position to ensure dialog is fully visible on screen
      const dialogHeight = 330; // Approximate height of dialog
      const dialogWidth = 260; // Approximate width of dialog
      
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      let top = position.top;
      let left = position.left;
      
      // Ensure dialog doesn't go off the top of the screen
      if (top < 10) {
        top = 10;
      }
      
      // Ensure dialog doesn't go off the bottom of the screen
      if (top + dialogHeight > windowHeight - 10) {
        top = windowHeight - dialogHeight - 10;
      }
      
      // Ensure dialog doesn't go off the left of the screen
      if (left < 10) {
        left = 10;
      }
      
      // Ensure dialog doesn't go off the right of the screen
      if (left + dialogWidth > windowWidth - 10) {
        left = windowWidth - dialogWidth - 10;
      }
      
      setAdjustedPosition({ top, left });
    } else {
      setAdjustedPosition(null);
    }
  }, [position]);
  
  if (!isOpen || !adjustedPosition) return null;

  const handleOptionClick = (option: string) => {
    console.log(`Selected option: ${option}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  
  const toggleSearch = () => {
    setSearchEnabled(!searchEnabled);
  };

  return (
    <>
      {/* Invisible backdrop to capture clicks outside */}
      <div 
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />
      
      {/* Dialog content */}
      <div 
        className="fixed z-50 w-64 bg-grok-light-secondary dark:bg-grok-dark-secondary rounded-lg shadow-lg border border-grok-light-border dark:border-grok-dark-border overflow-hidden"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left
        }}
      >
        <div className="p-2 border-b border-grok-light-border dark:border-grok-dark-border">
          <div className="font-medium text-sm mb-1">Oja PRIME</div>
          <div className="text-xs text-grok-light-text-secondary dark:text-grok-dark-text-secondary">Premium Features</div>
        </div>
        
        <div className="p-1">
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('create_images')}
          >
            <Image className="h-4 w-4" />
            <span>Create Images</span>
          </button>
          
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('research')}
          >
            <FileSearch className="h-4 w-4" />
            <span>Research</span>
          </button>
          
          <button 
            className="flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover text-left"
            onClick={() => handleOptionClick('edit_image')}
          >
            <Edit className="h-4 w-4" />
            <span>Edit Image</span>
          </button>
        </div>
        
        <div className="p-2 border-t border-grok-light-border dark:border-grok-dark-border">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4" />
            <div className="text-sm">Enable Search</div>
            <div className="flex-grow"></div>
            <button 
              onClick={toggleSearch}
              className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none"
            >
              <span 
                className={`${
                  searchEnabled ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600'
                } inline-block h-6 w-11 rounded-full transition-colors`}
              />
              <span 
                className={`${
                  searchEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </button>
          </div>
          <div className="text-xs text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary">
            OjaChat can browse the web
          </div>
        </div>
        
        <button 
          className="flex items-center justify-between w-full p-2 hover:bg-grok-light-button-hover dark:hover:bg-grok-dark-button-hover border-t border-grok-light-border dark:border-grok-dark-border"
          onClick={() => handleOptionClick('customize')}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Custom Instructions</span>
          </div>
          <div className="text-xs text-grok-light-text-secondary dark:text-grok-dark-text-secondary">
            Customize
          </div>
        </button>
      </div>
    </>
  );
};

export default MoreOptionsDialog; 