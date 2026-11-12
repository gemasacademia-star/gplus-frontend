import React, { useState } from 'react';
import { Bell, Menu, X, UserCircle, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { THEME_ASSETS } from "../config/themeAssets.js";
import { COMPANY_NAME } from '../config/branding';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Nosotros', path: '/about' },
    { label: 'Planes', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
  ];

  const currentUser = user?.user || user;
  const firstName = currentUser?.nombres ? currentUser.nombres.split(' ')[0] : null;

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    switch (currentUser.rol) {
      case 'Alumno':
        return '/dashboard/student';
      case 'Coordinador':
        return '/dashboard//teacher';
      case 'Administrador':
        return '/dashboard//admin';
      default:
        return '/login';
    }
  };

  const targetPath = getDashboardPath();

  return (
    <nav className="bg-brand-surface border-b border-brand-border-soft sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Altura ajustada a h-20 para un look más compacto y moderno */}
        <div className="flex justify-between items-center h-24">

          {/* --- BLOQUE LOGO --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              {/* Logo reducido a w-14 h-14 */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/10 group-hover:scale-105 transition-transform overflow-hidden border border-slate-50">
                <img
                  src={THEME_ASSETS.logoPublic}
                  alt="Logo"
                  className="w-full h-full object-contain p-1.5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              </div>
              {/* Punto naranja decorativo escalado */}
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-accent rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">
                {COMPANY_NAME}
              </span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${location.pathname === link.path
                  ? 'text-brand-primary bg-brand-primary-soft'
                  : 'text-slate-500 hover:text-brand-accent hover:bg-brand-accent-soft'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Acciones Derecha */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <Link
              to={targetPath}
              className="flex items-center gap-2.5 pl-2 group"
            >
              <div className="text-right hidden lg:block">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none">Mi Portal</p>
                <p className="text-xs font-black text-brand-primary group-hover:text-brand-accent transition-colors mt-0.5">{currentUser ? firstName : 'Ingresar'}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-bg flex items-center justify-center text-brand-muted group-hover:bg-brand-primary group-hover:text-white transition-all border border-brand-border-soft shadow-sm">
                <UserCircle size={22} />
              </div>
            </Link>
          </div>

          {/* Mobile Hamburguesa */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-brand-accent text-white shadow-lg shadow-orange-200' : 'bg-brand-surface-alt text-brand-primary'
                }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-border-soft absolute w-full left-0 shadow-2xl animate-fade-in-down z-50">
          <div className="px-5 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-brand-primary bg-brand-bg/50 hover:bg-brand-primary-soft transition-all"
              >
                {link.label}
                <ChevronRight size={18} className="text-brand-accent" />
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-brand-border-soft">
              <Link
                to={targetPath}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all
                  ${currentUser
                    ? 'bg-gradient-to-br from-[#1e40af] to-brand-primary-dark text-white shadow-brand-primary/20'
                    : 'bg-brand-primary text-white shadow-brand-primary/20'}`}
              >
                <UserCircle size={20} />
                {currentUser ? 'Ir a mi Portal' : 'Iniciar Sesión'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;