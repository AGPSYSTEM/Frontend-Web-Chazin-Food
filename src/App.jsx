import { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '@/shared/context/CartContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { ToastProvider } from '@/shared/context/ToastContext';
import { ConfirmProvider } from '@/shared/context/ConfirmContext';
import { AppRoutes } from '@/routes/AppRoutes';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem("chazin_user");
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "sans-serif", background: "#f9fafb" }}>
          <div style={{ maxWidth: "480px", background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍔</div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>Chazin Food</h2>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
              Hubo un detalle al cargar la aplicación. Haz clic abajo para restaurar la sesión y recargar.
            </p>
            <button
              onClick={this.handleReset}
              style={{ width: "100%", padding: "12px 24px", background: "#f05454", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}
            >
              Restaurar y Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
