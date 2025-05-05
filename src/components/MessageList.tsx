import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Copy, Share2, RotateCcw, Star } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  onRetry?: (content: string, sessionId: string) => void;
}

export default function MessageList({ messages, onRetry }: MessageListProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6 py-8 px-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'flex flex-col max-w-[85%] md:max-w-[75%]',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 min-w-[80px]',
                  message.role === 'user' 
                    ? 'bg-[#22C55E] text-white rounded-br-none' 
                    : 'rounded-bl-none'
                )}
              >
                <div className="prose dark:prose-invert max-w-none">
                  {message.content.text}
                </div>
                {message.content.products && message.content.products.length > 0 && (
                  <div className="mt-4 -mx-4">
                    <div className="relative">
                      <div className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
                        {message.content.products.map((product, idx) => (
                          <div 
                            key={idx} 
                            className="flex-none w-[160px] snap-start"
                          >
                            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                              <div className="relative">
                                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-900">
                                  {/* Product image would go here */}
                                </div>
                                <div className="absolute top-2 left-2">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                    idx === 0 ? "bg-red-500" : "bg-gray-200"
                                  )}>
                                    {idx === 0 && (
                                      <div className="w-3 h-3 bg-white rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="flex items-center gap-1 text-sm text-yellow-500 mb-1">
                                  <Star className="h-3.5 w-3.5 fill-current" />
                                  <span className="font-medium">4.5</span>
                                </div>
                                <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold">₦{product.price}</p>
                                  <button className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => handleCopy(message.content.text)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                    title="Copy message"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                    title="Share message"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  {message.content.actionButtons?.some(btn => btn.label === "Retry") && (
                    <button
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500"
                      title="Retry"
                      onClick={() => onRetry?.(message.content.text, "current_session")}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}