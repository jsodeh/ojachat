import { cn } from '@/lib/utils';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage = ({ className }: WelcomeMessageProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <span className="text-4xl font-semibold text-center">
        How can I help?
      </span>
    </div>
  );
};

export default WelcomeMessage; 