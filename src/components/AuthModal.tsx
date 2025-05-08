import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { AuthError } from "@supabase/supabase-js";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'options' | 'email-sign-in' | 'email-sign-up';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google');
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === 'email-sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Successfully signed in!');
        onClose();
      }
    } catch (error) {
      console.error('Email auth error:', error);
      const authError = error as AuthError;
      toast.error(authError.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailForm = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 text-black"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 text-black"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : authMode === 'email-sign-up' ? 'Sign Up' : 'Sign In'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setAuthMode('options')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to options
      </Button>
      <div className="text-center text-sm">
        {authMode === 'email-sign-in' ? (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={() => setAuthMode('email-sign-up')}
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="text-green-600 hover:underline"
              onClick={() => setAuthMode('email-sign-in')}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </form>
  );

  const renderOptions = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <img
          src="/assets/ojastack.png"
          alt="OjaStack Logo"
          className="h-16 w-16"
        />
      </div>
      <h2 className="text-xl font-semibold text-center text-white">Welcome to OjaChat</h2>
      <p className="text-sm text-gray-300 text-center">Choose how you'd like to continue</p>
      
      <Button
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full bg-white hover:bg-gray-100 text-gray-900"
      >
        <img
          src="/assets/google.png"
          alt="Google"
          className="mr-2 h-4 w-4"
        />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        onClick={() => setAuthMode('email-sign-in')}
        disabled={isLoading}
        className="w-full bg-white hover:bg-gray-100 text-gray-900"
      >
        <Mail className="mr-2 h-4 w-4" />
        Continue with Email
      </Button>

      <p className="text-xs text-gray-400 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        {authMode === 'options' ? renderOptions() : renderEmailForm()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;