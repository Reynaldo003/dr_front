// src/components/BackToHomeButton.jsx
import { useNavigate } from "react-router-dom";

export default function BackToHomeButton({ className = "" }) {
  const navigate = useNavigate();

  const goHome = () => {
    // replace evita que al volver al home, el "atrás" te regrese a la página de ayuda otra vez
    navigate("/", { replace: true });
  };

  return (
    <button
      type="button"
      onClick={goHome}
      className={className}
      aria-label="Volver al inicio"
    >
      ← Volver al inicio
    </button>
  );
}
