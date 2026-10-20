import React, { useState } from "react";
import { Code, Heart, Sparkles, Terminal, ShieldCheck, X, ChevronRight, Laptop, Server, Database, Smartphone, Instagram, Globe, ExternalLink } from "lucide-react";

export function ClienteFooter() {
  const [showModal, setShowModal] = useState(false);

  const developers = [
    {
      name: "Emanuel Henao",
      role: "Analista y Desarrollador de Software",
      initials: "EH",
      color: "from-red-500 to-amber-500",
      tag: "ADSO"
    },
    {
      name: "Jafet Caballero",
      role: "Analista y Desarrollador de Software",
      initials: "JC",
      color: "from-amber-500 to-yellow-500",
      tag: "ADSO"
    },
    {
      name: "Samuel Gutiérrez",
      role: "Analista y Desarrollador de Software",
      initials: "SG",
      color: "from-emerald-500 to-teal-500",
      tag: "ADSO"
    },
    {
      name: "Alexis Gómez",
      role: "Analista y Desarrollador de Software",
      initials: "AG",
      color: "from-blue-500 to-cyan-500",
      tag: "ADSO"
    },
    {
      name: "Juan José Gallego Bran",
      role: "Analista y Desarrollador de Software",
      initials: "JG",
      color: "from-purple-500 to-indigo-500",
      tag: "ADSO"
    }
  ];

  const businessInfo = [
    {
      icon: <Instagram className="w-4 h-4 text-pink-400 shrink-0" />,
      label: "Instagram oficial",
      value: "@chazinfood",
      href: "https://instagram.com/chazinfood"
    },
    {
      icon: <Globe className="w-4 h-4 text-sky-400 shrink-0" />,
      label: "Sitio web",
      value: "chazinfood.com",
      href: "https://chazinfood.com"
    },
    {
      icon: <Instagram className="w-4 h-4 text-orange-400 shrink-0" />,
      label: "Marca aliada",
      value: "@saimonbread",
      href: "https://instagram.com/saimonbread"
    }
  ];

  return (
    <footer className="w-full bg-slate-900 text-slate-200 border-t border-slate-800/80 mt-16 relative overflow-hidden transition-colors">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Header Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Desarrollado con pasión y excelencia</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Equipo de Desarrollo</span>
              <span className="text-red-500">Chazin Food</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Equipo ADSO • Plataforma Web &amp; Móvil de Gestión Gastronómica
            </p>
          </div>

          {/* Developers Grid (5 integrants) */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {developers.map((dev, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-red-500/40 transition-all duration-300 shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${dev.color} flex items-center justify-center text-white text-xs font-black shadow-md`}>
                  {dev.initials}
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                    {dev.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {dev.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Business Info Row */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {businessInfo.map((info, idx) => (
              <a
                key={idx}
                href={info.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 transition-all group"
              >
                {info.icon}
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 block leading-none mb-0.5">{info.label}</span>
                  <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">{info.value}</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors ml-0.5" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full max-w-3xl border-t border-slate-800/80 my-4" />

          {/* Footer Bottom Bar */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700/50">
                v1.0.0
              </span>
              <span className="text-slate-500">•</span>
              <span>ADSO Gastronomía</span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors group cursor-pointer"
            >
              <span>Ver ficha de créditos del proyecto</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-slate-400 font-medium">
              Chazin Food © 2026 • Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Modal Ficha Completa de Créditos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar ficha de créditos"
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Créditos del Sistema Chazin Food</h4>
                <p className="text-xs text-slate-400">Versión 1.0.0 • Análisis y Desarrollo de Software</p>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Información del Negocio:</p>
              <div className="space-y-2">
                {businessInfo.map((info, idx) => (
                  <a
                    key={idx}
                    href={info.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {info.icon}
                      <div>
                        <p className="text-[11px] text-slate-400">{info.label}</p>
                        <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{info.value}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Developers List */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Integrantes del Proyecto:</p>
              <div className="space-y-2">
                {developers.map((dev, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${dev.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {dev.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{dev.name}</p>
                        <p className="text-[11px] text-slate-400">{dev.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      {dev.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tecnologías Utilizadas:</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" /> React 18 + Vite
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" /> Flutter 3.x
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  <Server className="w-3.5 h-3.5 text-emerald-400" /> Node.js Express API
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  <Database className="w-3.5 h-3.5 text-amber-400" /> MySQL DB
                </span>
              </div>
            </div>

            {/* Footer Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
            >
              Cerrar Ficha de Créditos
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
