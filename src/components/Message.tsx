import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import ProductCarousel from './ProductCarousel';
import { Message as MessageType } from '@/types/chat';

type MessageProps = MessageType;

const Message = ({ role, content, timestamp }: MessageProps) => {
  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex flex-col items-end' : ''}`}>
          <div className={`${role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : ''}`}>
            {content.text}
          </div>
          {content.products && content.products.length > 0 && (
            <ProductCarousel 
              products={content.products} 
              className={role === 'user' ? 'ml-auto' : 'mr-auto'}
            />
          )}
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;