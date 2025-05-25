import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Image, 
  Mic, 
  FileText, 
  Link, 
  Search,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

export default function AttachmentModal({ isOpen, onClose, onSelect }: AttachmentModalProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const isPaidUser = subscription?.status === 'active';

  const options = [
    {
      id: 'image',
      label: 'Upload Image',
      icon: Image,
      color: 'text-blue-500',
      description: 'Upload an image from your device'
    },
    {
      id: 'image-search',
      label: 'Image Search',
      icon: Search,
      color: 'text-purple-500',
      description: 'Search and analyze images'
    },
    {
      id: 'voice-notes',
      label: 'Voice Notes',
      icon: Mic,
      color: 'text-green-500',
      description: 'Record and send voice messages'
    }
  ];

  // For free users, only show image upload, image search, and voice notes
  const filteredOptions = isPaidUser ? options : options.filter(opt => 
    ['image', 'image-search', 'voice-notes'].includes(opt.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {filteredOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3 px-4"
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <option.icon className={cn("w-5 h-5", option.color)} />
              <div className="flex-1 text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 