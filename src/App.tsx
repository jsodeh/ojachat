import React, { useState, useEffect } from "react";
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import AuthWrapper from '@/components/AuthWrapper';
import AuthModal from '@/components/AuthModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import './styles/globals.css';
import { BrowserRouter } from 'react-router-dom';
import { ElevenLabsProvider } from '@/providers/ElevenLabsProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Component to handle auth modal display
function AuthModalHandler() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Listen for custom events to show/hide auth modal
    const handleShowModal = () => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
      }
    };

    const handleHideModal = () => {
      setShowAuthModal(false);
    };

    window.addEventListener('ojachat:show-auth-modal', handleShowModal);
    window.addEventListener('ojachat:hide-auth-modal', handleHideModal);

    return () => {
      window.removeEventListener('ojachat:show-auth-modal', handleShowModal);
      window.removeEventListener('ojachat:hide-auth-modal', handleHideModal);
    };
  }, [isAuthenticated]);

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => {
        // Allow closing the modal, but only if authenticated
        if (isAuthenticated) {
          setShowAuthModal(false);
        }
      }}
      initialMode="options"
    />
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="flex h-screen w-full bg-grok-light-background dark:bg-grok-dark-background text-grok-light-text-primary dark:text-grok-dark-text-primary">
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <ElevenLabsProvider>
                  <AuthWrapper>
                    <Index />
                  </AuthWrapper>
                  <AuthModalHandler />
                  <Toaster />
                </ElevenLabsProvider>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
