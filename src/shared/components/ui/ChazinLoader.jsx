import React, { useId, useRef, useEffect } from 'react';
import '@/shared/styles/ChazinLoader.css';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAZIN FOOD - COMPONENTE OFICIAL DE PANTALLA DE CARGA (CHAZIN LOADER)
 * - Salto elástico con física de Slime de Minecraft (Squash & Stretch)
 * - Sombra interactiva en suelo y emisión de cubos pixelados en impacto
 * - Barra delgada con runner luminoso animado "CARGANDO DELICIAS"
 * - Soporte 100% nativo para Modo Claro y Modo Oscuro
 * - 100% Silencioso (sin sonido)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ChazinLoader = ({
  text = "CARGANDO DELICIAS",
  fullScreen = false,
  size = "lg", // "sm" | "md" | "lg"
  className = "",
  showRunner = true
}) => {
  const uniqueId = useId().replace(/:/g, "_");
  const maskId = `chopstickGap_${uniqueId}`;
  const particlesRef = useRef(null);

  // Generador de partículas de cubos Minecraft al aterrizar
  useEffect(() => {
    let timer = null;
    let isMounted = true;

    const burstParticles = () => {
      if (!isMounted || !particlesRef.current) return;
      const container = particlesRef.current;
      const count = size === "sm" ? 3 : (size === "md" ? 5 : 7);

      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "slime-cube-particle";

        const pSize = size === "sm" ? (Math.floor(Math.random() * 3) + 3) : (Math.floor(Math.random() * 5) + 5);
        p.style.width = `${pSize}px`;
        p.style.height = `${pSize}px`;

        container.appendChild(p);

        const angle = (Math.PI / 180) * (190 + Math.random() * 160);
        const maxDist = size === "sm" ? 35 : (size === "md" ? 55 : 80);
        const dist = Math.random() * (maxDist * 0.6) + (maxDist * 0.4);
        const tx = Math.cos(angle) * dist;
        const ty = (Math.sin(angle) * dist * 0.45) - 10;

        const anim = p.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 }
          ],
          {
            duration: 400 + Math.random() * 160,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)"
          }
        );

        anim.onfinish = () => p.remove();
      }
    };

    // Impacto sincronizado al 76% del ciclo de 1.3s (~988ms)
    const runLoop = () => {
      timer = setTimeout(() => {
        burstParticles();
        runLoop();
      }, 1300);
    };

    // Disparo inicial tras primer impacto
    const initialTimer = setTimeout(() => {
      burstParticles();
      runLoop();
    }, 988);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearTimeout(timer);
    };
  }, [size]);

  // Dimensiones según tamaño (sm, md, lg)
  const sizeConfig = {
    sm: {
      slimeJumpH: "-38px",
      logoSize: "w-20 h-20",
      shadowSize: "w-16 h-1.5 mt-1.5",
      textClass: "text-[10px] tracking-[0.24em] mt-4",
      barWidth: "w-28 h-[2px] mt-1.5",
      particlesOffset: "bottom-8"
    },
    md: {
      slimeJumpH: "-65px",
      logoSize: "w-32 h-32 sm:w-36 sm:h-36",
      shadowSize: "w-28 sm:w-32 h-2.5 mt-2",
      textClass: "text-[11px] tracking-[0.28em] mt-7",
      barWidth: "w-36 sm:w-40 h-[2.5px] mt-2",
      particlesOffset: "bottom-12"
    },
    lg: {
      slimeJumpH: "-115px",
      logoSize: "w-52 h-52 sm:w-60 sm:h-60",
      shadowSize: "w-44 sm:w-52 h-3.5 mt-3",
      textClass: "text-[13px] tracking-[0.32em] mt-12",
      barWidth: "w-48 h-[2.5px] mt-2.5",
      particlesOffset: "bottom-16"
    }
  }[size] || {
    slimeJumpH: "-115px",
    logoSize: "w-52 h-52 sm:w-60 sm:h-60",
    shadowSize: "w-44 sm:w-52 h-3.5 mt-3",
    textClass: "text-[13px] tracking-[0.32em] mt-12",
    barWidth: "w-48 h-[2.5px] mt-2.5",
    particlesOffset: "bottom-16"
  };

  const content = (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ "--slime-jump-h": sizeConfig.slimeJumpH }}
    >
      {/* Contenedor del Slime con Animación Física de Salto */}
      <div className="chazin-slime-actor relative cursor-pointer select-none" title="Chazin Food">
        <div className={`${sizeConfig.logoSize} filter drop-shadow-[0_12px_22px_rgba(227,6,19,0.32)]`}>
          {/* SVG Vectorial 100% Transparente */}
          <svg viewBox="0 0 500 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id={maskId}>
                <rect width="500" height="500" fill="white" />
                <line x1="114" y1="290" x2="128" y2="338" stroke="black" strokeWidth="13" strokeLinecap="round" />
              </mask>
            </defs>

            {/* Borde exterior rojo (Squircle redondeado) */}
            <rect
              x="25"
              y="25"
              width="450"
              height="450"
              rx="92"
              fill="none"
              stroke="#e30613"
              strokeWidth="26"
              strokeLinejoin="round"
            />

            {/* Caligrafía Chazin Food */}
            <g transform="translate(250, 150)" textAnchor="middle">
              <text
                x="0"
                y="-12"
                fill="#e30613"
                fontFamily="'Satisfy', cursive"
                fontSize="84"
                fontWeight="bold"
                fontStyle="italic"
                letterSpacing="1"
              >
                Chazin
              </text>
              <path d="M -75 2 C -30 -12, 45 -12, 85 10 C 50 2, -40 2, -75 2 Z" fill="#e30613" />
              <text
                x="0"
                y="78"
                fill="#e30613"
                fontFamily="'Satisfy', cursive"
                fontSize="86"
                fontWeight="bold"
                fontStyle="italic"
                letterSpacing="2"
              >
                Food
              </text>
            </g>

            {/* Visor / Silueta de gafas de los cuencos */}
            <path
              d="M 85 275 C 35 275, 35 405, 85 405 C 140 405, 185 375, 250 375 C 315 375, 360 405, 415 405 C 465 405, 465 275, 415 275 C 345 275, 315 275, 250 275 C 185 275, 155 275, 85 275 Z"
              fill="none"
              stroke="#e30613"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Elemento Izquierdo: Cuenco + Tapa con corte transparente */}
            <g>
              <rect x="94" y="302" width="115" height="24" rx="12" fill="#e30613" mask={`url(#${maskId})`} />
              <path d="M 100 338 L 202 338 C 202 390, 100 390, 100 338 Z" fill="#e30613" />
            </g>

            {/* Elemento Derecho: Cuenco + Tapa */}
            <g>
              <rect x="291" y="302" width="115" height="24" rx="12" fill="#e30613" />
              <path d="M 298 338 L 400 338 C 400 390, 298 390, 298 338 Z" fill="#e30613" />
            </g>
          </svg>
        </div>
      </div>

      {/* Sombra en el Suelo (Dinámica en Modo Claro y Modo Oscuro) */}
      <div
        className={`chazin-slime-shadow ${sizeConfig.shadowSize} rounded-full blur-xs pointer-events-none bg-black/25 dark:bg-black/75`}
      />

      {/* Contenedor de Partículas de Impacto tipo Minecraft */}
      <div
        ref={particlesRef}
        className={`absolute ${sizeConfig.particlesOffset} w-48 h-1 pointer-events-none flex justify-center items-center`}
      />

      {/* Rótulo y Barra de Carga Dinámica */}
      {showRunner && (
        <div className="flex flex-col items-center gap-1.5 w-full">
          {text && (
            <p
              className={`${sizeConfig.textClass} font-semibold uppercase text-gray-500 dark:text-[#8a8b94] select-none text-center`}
            >
              {text}
            </p>
          )}
          <div className={`relative ${sizeConfig.barWidth} bg-gray-200 dark:bg-[#27282d] rounded-full overflow-hidden`}>
            <div className="chazin-loading-runner absolute top-0 bottom-0 bg-[#e30613] rounded-full shadow-[0_0_8px_rgba(227,6,19,0.8)]" />
          </div>
        </div>
      )}
    </div>
  );

  // Si se solicita a pantalla completa con overlay borroso
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none bg-white/95 dark:bg-[#0e0e12]/95 backdrop-blur-md transition-colors duration-300 p-4"
        role="status"
        aria-label={text || "Cargando"}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default ChazinLoader;
