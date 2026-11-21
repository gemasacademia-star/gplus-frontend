import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, CheckCircle, Users, Menu, X,
    MapPin, CalendarRange, BarChart3, TicketPercent,
    UserCog, GraduationCap, DollarSign, Activity, Settings, LogOut, History,
    Megaphone, Ticket, Sparkles, Layers,
    Receipt, Gift, PackageCheck, CreditCard
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { THEME_ASSETS } from "../config/themeAssets.js";
import { COMPANY_NAME } from '../config/branding';

const MobileNavbarAdmin = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const bottomNavClass = ({ isActive }) =>
        `flex flex-col items-center gap-1.5 w-full transition-all ${isActive ? 'text-brand-accent' : 'text-blue-100/50'}`;
    const bottomNavLabelClass = "text-[8px] uppercase font-black italic tracking-widest";

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada');
            navigate('/login');
        } catch (error) {
            console.error('Error en handleLogout:', error);
            toast.error('Error al salir');
        }
    };

    return (
        <>
            {/* PANEL LATERAL (DRAWER MÓVIL) */}
            <div className={`fixed inset-0 z-nav ${isMenuOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={toggleMenu}
                ></div>

                <div className={`absolute right-0 top-0 h-full w-[280px] bg-gradient-to-b from-brand-primary to-brand-primary-dark shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full border-l border-white/10">

                        {/* HEADER DEL MENÚ */}
                        <div className="flex-none pt-12 pb-6 px-4 flex flex-col items-center border-b border-white/10 bg-white/5 relative">
                            <button onClick={toggleMenu} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 p-2 rounded-full">
                                <X size={20} />
                            </button>
                            <div className="relative z-10 w-[100px] aspect-square bg-brand-surface rounded-full p-2 shadow-2xl flex items-center justify-center border-[4px] border-white/10 overflow-hidden mb-3">
                                <Link to="/" onClick={toggleMenu}>
                                    <img src={THEME_ASSETS.logoFramed} alt={`Logo ${COMPANY_NAME}`} className="w-full h-full object-cover" />
                                </Link>
                            </div>
                            <span className="font-black text-lg tracking-tighter uppercase italic text-white">
                                {COMPANY_NAME} <span className="text-brand-accent">Admin</span>
                            </span>
                        </div>

                        {/* LISTADO ORGANIZADO */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 [scrollbar-width:none]">

                            <div className="space-y-1">
                                <p className="px-3 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-2">Operaciones</p>
                                <NavLink to="/dashboard/admin/students" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><GraduationCap size={16} className="text-blue-400" /> Alumnos</NavLink>
                                <NavLink to="/dashboard/admin/entregas-merch" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><PackageCheck size={16} className="text-blue-400" /> Entregas Merch</NavLink>
                                <NavLink to="/dashboard/admin/teachers" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><UserCog size={16} className="text-blue-400" /> Coordinadores</NavLink>
                            </div>

                            <div className="space-y-1">
                                <p className="px-3 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-2">Club</p>
                                <NavLink to="/dashboard/admin/schedule" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><CalendarRange size={16} /> Horarios</NavLink>
                                <NavLink to="/dashboard/admin/reprogramaciones" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Layers size={16} /> Reprogramar</NavLink>
                                <NavLink to="/dashboard/admin/locations" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><MapPin size={16} /> Sedes</NavLink>
                                <NavLink to="/dashboard/admin/levels" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><BarChart3 size={16} /> Niveles</NavLink>
                                <NavLink to="/dashboard/admin/merch" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Gift size={16} /> Gestión Merch</NavLink>
                                <NavLink to="/dashboard/admin/cash-flow" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Receipt size={16} /> Balance</NavLink>
                            </div>

                            <div className="space-y-1">
                                <p className="px-3 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-2">Marketing</p>
                                <NavLink to="/dashboard/admin/publications" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Megaphone size={16} /> Muro Noticias</NavLink>
                                <NavLink to="/dashboard/admin/anuncios-beneficios" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Sparkles size={16} /> Carrusel App</NavLink>
                                <NavLink to="/dashboard/admin/CreateBenefits" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><TicketPercent size={16} /> Crear Descuentos</NavLink>
                                <NavLink to="/dashboard/admin/benefits" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><TicketPercent size={16} /> Asignar Descuentos</NavLink>
                                <NavLink to="/dashboard/admin/guest-passes" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Ticket size={16} /> Clases Únicas</NavLink>
                            </div>

                            <div className="space-y-1 pb-6">
                                <p className="px-3 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-2">Sistema</p>
                                <NavLink to="/dashboard/admin/injuries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Activity size={16} /> Lesiones</NavLink>
                                <NavLink to="/dashboard/admin/delete-makeups" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><History size={16} /> Depuración</NavLink>
                                <NavLink to="/dashboard/admin/catalog" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><DollarSign size={16} /> Catálogo</NavLink>
                                <NavLink to="/dashboard/admin/payment-methods" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><CreditCard size={16} /> Métodos de Pago</NavLink>
                                <NavLink to="/dashboard/admin/settings" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-3 py-2.5 rounded-xl hover:bg-white/5 text-[12px] font-bold uppercase tracking-wide"><Settings size={16} /> Ajustes</NavLink>
                            </div>
                        </div>

                        <div className="flex-none p-4 bg-black/20 border-t border-white/10">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-3 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-black uppercase italic text-[11px] tracking-widest">
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🚀 NAVBAR INFERIOR (Las 4 acciones vitales) */}
            <nav className="fixed bottom-0 left-0 w-full bg-brand-primary-dark border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 md:hidden pb-safe transition-all">
                <div className="flex justify-around items-end h-[72px] px-2 pb-2">

                    <NavLink to="/dashboard/admin" end className={bottomNavClass}>
                        <LayoutDashboard size={20} className={location.pathname === '/dashboard/admin' ? 'animate-bounce-short' : ''} />
                        <span className={bottomNavLabelClass}>Inicio</span>
                    </NavLink>

                    <NavLink to="/dashboard/admin/students" className={bottomNavClass}>
                        <GraduationCap size={20} />
                        <span className={bottomNavLabelClass}>Alumnos</span>
                    </NavLink>

                    {/* 🌟 ACCIÓN CLAVE: VALIDAR PAGOS (DESTACADO EN EL CENTRO) */}
                    <NavLink to="/dashboard/admin/payment-validation" className={bottomNavClass}>
                        <CheckCircle size={20} />
                        <span className={bottomNavLabelClass}>Pagos</span>
                    </NavLink>

                    <button onClick={toggleMenu} className="flex flex-col items-center gap-1.5 w-full text-blue-100/50">
                        <Menu size={20} />
                        <span className="text-[8px] uppercase font-black italic tracking-widest">Menú</span>
                    </button>

                </div>
            </nav>
        </>
    );
};

export default MobileNavbarAdmin;
