import React, { useState, useEffect, useMemo } from 'react';
import {
    User, ChevronRight, AlertCircle, Calendar,
    Filter, DollarSign, Mail, Phone, FileText, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../interceptors/api';
import AdminPaymentValidation from '../../components/Admin/AdminPaymentValidation';
import AdminPaymentStats from '../../components/Admin/AdminPaymentStats';
import PaymentConcept from '../../components/Admin/PaymentConcept';
import PageTitle from '../../components/shared/PageTitle';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import SearchInput from '../../components/shared/SearchInput';
import { STATUS_SUCCESS } from '../../config/statusColors';
import { COMPANY_NAME } from '../../config/branding';

const AdminPaymentManager = () => {
    const [view, setView] = useState('list');
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDIENTE');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState('ALL');

    // 🔥 NUEVO: data del endpoint /caja/resumen-anual (12 meses, desglosado por tipo)
    const [resumenAnual, setResumenAnual] = useState([]);
    const [, setLoadingResumen] = useState(true);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.PAGOS.BASEADMIN);
            const result = await response.json();
            if (response.ok) setPayments(result.data || []);
        } catch (error) {
            console.error('Error en fetchPayments:', error);
            toast.error("Error al sincronizar ingresos");
        } finally {
            setLoading(false);
        }
    };

    // 🔥 NUEVA FUNCIÓN: trae el resumen anual (para el gráfico) según el año seleccionado
    const fetchResumenAnual = async (anio) => {
        try {
            setLoadingResumen(true);
            const response = await apiFetch.get(`${API_ROUTES.CAJA.RESUMEN_ANUAL}?anio=${anio}`);
            const result = await response.json();
            if (response.ok) setResumenAnual(result.data || []);
        } catch (error) {
            console.error('Error en fetchResumenAnual:', error);
            toast.error("Error al cargar el resumen anual");
        } finally {
            setLoadingResumen(false);
        }
    };

    // 🔥 NUEVA FUNCIÓN: Obtener detalle profundo antes de abrir el modal
    const handleSelectPayment = async (pagoSimple) => {
        setLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.PAGOS.DETALLE_MAESTRO(pagoSimple.id));
            const result = await response.json();
            if (response.ok) {
                setSelectedPayment(result.data);
                setView('detail');
            } else {
                toast.error("No se pudo cargar el detalle del paquete");
            }
        } catch (e) {
            console.error('Error en handleSelectPayment:', e);
            toast.error("Error de conexión al obtener detalles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    // 🔥 NUEVO: cada vez que cambia el año seleccionado, recargamos el resumen anual
    useEffect(() => { fetchResumenAnual(selectedYear); }, [selectedYear]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const date = new Date(p.fecha_pago);
            const yearMatch = date.getFullYear().toString() === selectedYear;
            const monthMatch = selectedMonth === 'ALL' || date.getMonth().toString() === selectedMonth;
            const statusMatch = statusFilter === '' || p.estado_validacion === statusFilter;

            const nombres = p.cuentas_por_cobrar?.alumnos?.usuarios?.nombres || '';
            const apellidos = p.cuentas_por_cobrar?.alumnos?.usuarios?.apellidos || '';
            const alumnoNombre = `${nombres} ${apellidos}`.toLowerCase();
            const searchMatch = searchTerm === '' ||
                alumnoNombre.includes(searchTerm.toLowerCase()) ||
                p.codigo_operacion?.toLowerCase().includes(searchTerm.toLowerCase());

            return yearMatch && monthMatch && statusMatch && searchMatch;
        });
    }, [payments, selectedYear, selectedMonth, statusFilter, searchTerm]);

    // 🔥 REFACTOR: chartData ahora sale del endpoint /caja/resumen-anual, con desglose
    // por tipo (pagos automáticos, ingresos manuales, egresos) en vez de solo un total
    // sumado en el cliente. "pendientes" se mantiene igual, calculado desde `payments`.
    const statsData = useMemo(() => {
        const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        let pendientesTotalAno = 0;

        payments.forEach(p => {
            const date = new Date(p.fecha_pago);
            if (date.getFullYear().toString() !== selectedYear) return;
            if (p.estado_validacion === 'PENDIENTE') pendientesTotalAno++;
        });

        const chartData = mesesNombres.map((name, index) => {
            const mesData = resumenAnual.find(m => m.mes === index + 1);
            return {
                name,
                // 🔥 FIX: antes solo tomaba ingresosPagos, por eso meses con ingreso
                // SOLO manual (ej. marzo) no pintaban barra aunque sí tuvieran ingreso real.
                total: mesData?.totalIngresos || 0,
                // 🔥 desglose por tipo (se mantiene igual)
                ingresosPagos: mesData?.ingresosPagos || 0,
                ingresosManuales: mesData?.ingresosManuales || 0,
                egresos: mesData?.egresos || 0,
                totalIngresos: mesData?.totalIngresos || 0,
                balance: mesData?.balance || 0
            };
        });

        return {
            chartData,
            pendientes: pendientesTotalAno,
            maxRecaudacion: Math.max(...chartData.map(d => d.totalIngresos), 1)
        };
    }, [payments, selectedYear, resumenAnual]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APROBADO': return STATUS_SUCCESS;
            case 'RECHAZADO': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-orange-100 text-brand-accent-dark border-orange-200';
        }
    };

    if (view === 'detail' && selectedPayment) {
        return <AdminPaymentValidation paymentData={selectedPayment} onBack={() => { setView('list'); setSelectedPayment(null); }} onSuccess={fetchPayments} />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <PageTitle title="Gestión de" accent="Ingresos" subtitle={`Monitor de pagos - ${COMPANY_NAME}`} />
                </div>

                <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border shadow-sm">
                    {['2025', '2026'].map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === year ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:text-slate-600'}`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </header>

            <AdminPaymentStats stats={statsData} />

            {/* Filtros */}
            <div className="bg-brand-surface p-3 rounded-[2rem] border border-brand-border shadow-sm flex flex-col xl:flex-row gap-3">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR POR ALUMNO O CÓDIGO..."
                    wrapperClassName="flex-1 relative"
                    className="w-full pl-12 pr-4 py-3 bg-brand-bg border-none rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-2xl border border-brand-border-soft">
                        <Calendar size={14} className="text-brand-muted" />
                        <select
                            className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="ALL">Todos los Meses</option>
                            {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-2xl border border-brand-border-soft">
                        <Filter size={14} className="text-brand-muted" />
                        <select
                            className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Cualquier Estado</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="APROBADO">Aprobados</option>
                            <option value="RECHAZADO">Rechazados</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner className="flex flex-col items-center justify-center py-24 gap-4" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredPayments.map((p) => {
                            const usuario = p.cuentas_por_cobrar?.alumnos?.usuarios;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={p.id}
                                    // 🔥 CAMBIO: Ahora llama a la función de carga profunda
                                    onClick={() => handleSelectPayment(p)}
                                    className={`bg-brand-surface rounded-[2.5rem] border-2 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden border-brand-border hover:border-blue-300`}
                                >

                                    <div className={`flex justify-between items-start mb-6`}>
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(p.estado_validacion)}`}>
                                            {p.cuentas_por_cobrar?.detalle_adicional === 'Plan Individual' ? `${p.estado_validacion} | Clase Única` : p.estado_validacion}
                                        </div>
                                        <div className={`p-2.5 rounded-2xl transition-all duration-300 bg-brand-bg group-hover:bg-brand-primary group-hover:text-white`}>
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <PaymentConcept pago={p} compact />
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl transition-colors duration-300 shrink-0 bg-brand-primary-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white`}>
                                                <User size={22} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Alumno</p>
                                                <h3 className="text-sm font-black text-slate-800 truncate uppercase tracking-tighter italic leading-tight">
                                                    {usuario?.nombres} {usuario?.apellidos}
                                                </h3>

                                                <div className="mt-2 flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                                        <FileText size={12} className="text-brand-muted" />
                                                        <span>{usuario?.numero_documento || 'S/N'}</span>
                                                    </div>

                                                    {/* TELÉFONO PERSONAL (Con mensaje de respaldo) */}
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                                                        <Phone size={12} className={`${usuario?.telefono_personal ? 'text-blue-400' : 'text-slate-300'} shrink-0`} />
                                                        {usuario?.telefono_personal ? (
                                                            <span className="text-brand-primary">{usuario.telefono_personal}</span>
                                                        ) : (
                                                            <span className="text-brand-muted italic">S/N REGISTRADO</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold truncate">
                                                        <Mail size={12} className="text-brand-muted shrink-0" />
                                                        <span className="truncate">{usuario?.email || 'Sin correo'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <div className={`p-3 rounded-2xl shrink-0 bg-brand-accent-soft text-brand-accent-dark`}>
                                                <DollarSign size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Monto Confirmado</p>
                                                <h3 className="text-xl font-black text-brand-heading italic tracking-tighter">
                                                    S/ {parseFloat(p.monto_pagado).toFixed(2)}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <AlertCircle className="absolute -right-8 -bottom-8 text-slate-50 group-hover:text-blue-50/30 transition-colors duration-500" size={140} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminPaymentManager;