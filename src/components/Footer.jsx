import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY_NAME, COMPANY_DEV_NAME, CONTACT_EMAIL } from "../config/branding";
import { THEME_ASSETS } from "../config/themeAssets.js";

const Footer = () => {
  return (
    <footer className="bg-brand-primary-dark pt-24 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <div className="space-y-8">
            <div className="w-24 h-24 bg-brand-surface rounded-3xl p-3 shadow-2xl border-4 border-brand-accent/20">
              <img src={THEME_ASSETS.logoFramed} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              {COMPANY_NAME}
            </h3>
            <p className="text-brand-muted font-medium italic leading-relaxed">
              Formando apasionados del voleibol desde 2015. Nuestra metodología se basa en la disciplina y la excelencia del juego profesional.            
              </p>
          </div>

          <div className="space-y-8">
            <h4 className="text-brand-accent font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
              <div className="w-4 h-1 bg-brand-accent rounded-full"></div> Enlaces Rápidos
            </h4>
            <ul className="space-y-4 text-white/60 font-black uppercase italic text-xs tracking-widest">
              <li><Link to="/login" className="hover:text-white transition-colors">Acceso Alumnos</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Inscripción Nueva</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-brand-accent font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
              <div className="w-4 h-1 bg-brand-accent rounded-full"></div> Contáctanos
            </h4>
            <ul className="space-y-4 text-white/60 font-black uppercase italic text-xs tracking-widest">
              <li className="flex items-center gap-3 italic underline decoration-orange-500/50">Sede San Martín de Porres, Lima</li>
              <li>{CONTACT_EMAIL}</li>
              <li className="text-white text-lg">+51 902 585 995</li>
            </ul>
          </div>
        </div>

        <div className="h-px w-full bg-white/5 mb-12"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] italic">
            © 2026 {COMPANY_NAME} | DESARROLLADO POR {COMPANY_DEV_NAME}
          </p>
          <div className="flex gap-8 text-white/20 text-[10px] font-black uppercase tracking-widest">
            <Link to="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link to="#" className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;