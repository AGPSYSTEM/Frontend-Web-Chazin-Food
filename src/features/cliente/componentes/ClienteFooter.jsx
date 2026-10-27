import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Clock, Sparkles } from "lucide-react";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export function ClienteFooter() {
  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800/80 mt-16 relative overflow-hidden transition-colors">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-lg border border-red-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <img src={logoImg} alt="Chazin Food" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  Chazin <span className="text-[#F05454]">Food</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">Sabor artesanal auténtico</span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Las mejores hamburguesas, perros calientes, salchipapas y comida rápida artesanal de Medellín. Calidad premium y frescura en cada mordisco.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com/chazinfood"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Chazin Food"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 flex items-center justify-center text-slate-400 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/saimonbread"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Saimon Bread"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 flex items-center justify-center text-slate-400 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <span className="text-[11px] text-slate-500 ml-1">@chazinfood • @saimonbread</span>
            </div>
          </div>

          {/* Horario de Atención */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F05454]" /> Horario
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Lunes - Jueves:</span>
                <span className="font-semibold text-slate-200">4:00 PM - 11:00 PM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Viernes - Sábado:</span>
                <span className="font-semibold text-slate-200">4:00 PM - 12:00 AM</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Domingos y Festivos:</span>
                <span className="font-semibold text-slate-200">4:00 PM - 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Contacto Oficial */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#F05454]" /> Contacto Directo
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Cl. 21 #80-21, Belén, Medellín, Antioquia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/573192028562"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition font-medium"
                >
                  +57 319 202 8562 (WhatsApp / Pedidos)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:simonpaniagua2907@gmail.com"
                  className="hover:text-amber-400 transition font-medium break-all"
                >
                  simonpaniagua2907@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Redes y Marcas Aliadas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F05454]" /> Nuestras Marcas
            </h4>
            <div className="space-y-2">
              <a
                href="https://instagram.com/chazinfood"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs">
                  CF
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-red-400 transition">Chazin Food</p>
                  <p className="text-[10px] text-slate-400">@chazinfood en Instagram</p>
                </div>
              </a>

              <a
                href="https://instagram.com/saimonbread"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  SB
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">Saimon Bread</p>
                  <p className="text-[10px] text-slate-400">@saimonbread en Instagram</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © 2026 <strong className="text-slate-300 font-semibold">Chazin Food</strong>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Medellín, Colombia</span>
            <span>•</span>
            <span className="text-[#F05454] font-medium">Hecho con pasión</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default ClienteFooter;
