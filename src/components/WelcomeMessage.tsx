import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage = ({ className }: WelcomeMessageProps) => {
  const { isAuthenticated, user } = useAuth();
  const [timeGreeting, setTimeGreeting] = useState('');
  const appName = "OjaChat";
  const name = isAuthenticated && user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ")[0]
    : "";
    
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setTimeGreeting('good morning');
    } else if (hours < 18) {
      setTimeGreeting('good afternoon');
    } else {
      setTimeGreeting('good evening');
    }
  }, []);

  const fullGreeting = `Hello, ${timeGreeting}`;

  return (
    <div className={cn("grok-welcome-container", className)}>
      <h1 className="grok-welcome-title text-2xl md:text-3xl mb-1">
        {isAuthenticated ? `${fullGreeting}, ${name}` : fullGreeting}
      </h1>
      <h2 className="grok-welcome-subtitle text-lg md:text-xl mb-4">
        How can I help you today?
      </h2>
    </div>
  );
};

export default WelcomeMessage; 