import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'sonner';
import Index from '@/pages';
import './styles/globals.css';
import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Index />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
