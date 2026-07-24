import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '@/shared/context/CartContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { ToastProvider } from '@/shared/context/ToastContext';
import { ConfirmProvider } from '@/shared/context/ConfirmContext';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <CartProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CartProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
