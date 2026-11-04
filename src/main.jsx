import { createRoot } from "react-dom/client";
import App from "./App";
import "./shared/styles/index.css";

// Manejo automático de nuevas versiones desplegadas en producción (Vite preload error)
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  console.warn("Nueva versión desplegada detectada. Recargando automáticamente...");
  window.location.reload();
});

createRoot(document.getElementById("root")).render(<App />);
