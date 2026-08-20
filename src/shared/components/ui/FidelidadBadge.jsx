import React from "react";
import { Sparkles, Crown, Award, Star, Sprout, AlertCircle, Clock } from "lucide-react";

export function FidelidadBadge({
  tipo = "Nuevo",
  descuento = null,
  enGracia = false,
  size = "md",
  showDiscount = true,
  className = ""
}) {
  const normTipo = String(tipo || "Nuevo").toLowerCase();

  let config = {
    label: "Cliente Nuevo",
    shortLabel: "Nuevo",
    desc: 0,
    icon: Sprout,
    emoji: "🌱",
    bgCls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    pillCls: "bg-emerald-600 text-white",
    glowCls: ""
  };

  if (normTipo.includes("vip")) {
    config = {
      label: "Cliente VIP",
      shortLabel: "VIP",
      desc: 15,
      icon: Crown,
      emoji: "🥇",
      bgCls: "bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-orange-500/15 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/80 shadow-xs",
      pillCls: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xs",
      glowCls: "ring-2 ring-amber-400/40 dark:ring-amber-500/30"
    };
  } else if (normTipo.includes("frecuente")) {
    config = {
      label: "Cliente Frecuente",
      shortLabel: "Frecuente",
      desc: 10,
      icon: Award,
      emoji: "🥈",
      bgCls: "bg-gradient-to-r from-indigo-50 dark:from-indigo-950/40 to-purple-50 dark:to-purple-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/60",
      pillCls: "bg-indigo-600 text-white shadow-2xs",
      glowCls: "ring-1 ring-indigo-400/30"
    };
  } else if (normTipo.includes("regular")) {
    config = {
      label: "Cliente Regular",
      shortLabel: "Regular",
      desc: 5,
      icon: Star,
      emoji: "🥉",
      bgCls: "bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800/60",
      pillCls: "bg-orange-500 text-white shadow-2xs",
      glowCls: "ring-1 ring-orange-300/40"
    };
  }

  const finalDesc = descuento !== null ? Number(descuento) : config.desc;
  const IconComp = config.icon;

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-black tracking-tight ${config.bgCls} ${config.glowCls} ${className}`}
      >
        <span>{config.emoji}</span>
        <span>{config.shortLabel}</span>
        {showDiscount && finalDesc > 0 && (
          <span className={`px-1 py-0.2 rounded text-[9px] font-black ${config.pillCls}`}>
            -{finalDesc}%
          </span>
        )}
        {enGracia && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="En periodo de gracia" />
        )}
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div
        className={`inline-flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl border ${config.bgCls} ${config.glowCls} ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-base shadow-2xs border border-white/50 dark:border-gray-700 shrink-0">
            {config.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight leading-tight">{config.label}</span>
              {enGracia && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-black rounded-md flex items-center gap-0.5 shadow-2xs">
                  <Clock className="w-2.5 h-2.5" />
                  <span>En Gracia</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              {finalDesc > 0 ? `Beneficio activo de ${finalDesc}% OFF en pedidos` : "Realiza compras para subir de nivel"}
            </p>
          </div>
        </div>

        {showDiscount && finalDesc > 0 && (
          <span className={`px-2 py-1 rounded-xl text-xs font-black shrink-0 ${config.pillCls}`}>
            {finalDesc}% OFF
          </span>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${config.bgCls} ${config.glowCls} ${className}`}
    >
      <span className="text-sm leading-none">{config.emoji}</span>
      <span className="font-extrabold">{config.label}</span>
      {showDiscount && finalDesc > 0 && (
        <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${config.pillCls}`}>
          {finalDesc}% OFF
        </span>
      )}
      {enGracia && (
        <span className="px-1 py-0.2 bg-amber-500 text-white text-[9px] font-black rounded flex items-center gap-0.5">
          Gracia
        </span>
      )}
    </span>
  );
}

export default FidelidadBadge;
