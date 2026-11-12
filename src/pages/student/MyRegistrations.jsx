import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom'; // 👈 IMPORTANTE: Agregado para el botón del Empty State
import {
  Clock, Trash2, Loader2, Calendar, Trophy,
  Zap, History, ChevronDown, Dumbbell, MapPin, Activity,
  ArrowRight as ArrowIcon, AlertTriangle, CalendarSearch, Rocket
} from 'lucide-react';
import apiFetch from '../../interceptors/api.js';
import { API_ROUTES } from '../../constants/apiRoutes';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseDateOnly, toDateKey, esFechaValida, ultimaClaseProgramada } from '../../utils/enrollmentCycle';
import { useFetch } from '../../hooks/useFetch';
import { asistenciaService } from '../../services/asistencia.service';

import PackageHeader from '../../components/student/PackageHeader';
// COMPONENTES DE SEGURIDAD Y PAGO
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";
import RenovarPlanHistoricoModal from '../../components/student/RenovarPlanHistoricoModal';
import { COMPANY_NAME } from '../../config/branding';
import { formatBrandingText } from '../../utils/formatBrandingText';


const DIAS_NOMBRES = { 1: "LUNES", 2: "MARTES", 3: "MIÉRCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SÁBADO", 7: "DOMINGO", 0: "DOMINGO" };

const esClaseUnica = (reg) => reg.tipo_inscripcion === 'INDIVIDUAL';
// El link de deuda guarda la fecha exacta de la clase (inicio = fin); fecha_inscripcion es solo respaldo.
const fechaClaseUnica = (reg) => reg.inscripciones_deudas_link?.[0]?.fecha_inicio_ciclo ?? reg.fecha_inscripcion;

// Ciclo más reciente (mayor fecha_inicio_ciclo) entre los links de deuda de un paquete mensual.
const cicloActual = (items) => items
  .flatMap(i => i.inscripciones_deudas_link ?? [])
  .filter(l => l.fecha_inicio_ciclo)
  .reduce((best, l) => (!best || toDateKey(l.fecha_inicio_ciclo) > toDateKey(best.fecha_inicio_ciclo) ? l : best), null);

// Id de la inscripción a la que pertenece un registro de asistencia.
const inscripcionDeRegistro = (r) => r.inscripcion_id ?? r.id_inscripcion ?? r.inscripciones?.id;

// Orden descendente: fecha más reciente/futura primero; a igual fecha, ACTIVO antes que el resto.
const porRecientes = (fechaDe) => (a, b) => {
  const fa = fechaDe(a) ? toDateKey(fechaDe(a)) : '';
  const fb = fechaDe(b) ? toDateKey(fechaDe(b)) : '';
  if (fa !== fb) return fb.localeCompare(fa);
  return Number(b.estado === 'ACTIVO') - Number(a.estado === 'ACTIVO');
};

// --- MODAL DE RENOVACIÓN ---
const RenovacionModal = ({ isOpen, onClose, onConfirm, fechasSugeridas }) => {
  if (!isOpen || !fechasSugeridas) return null;
  const etiquetas = [
    { label: 'RENOVACIÓN INMEDIATA', desc: 'Inicia en tu próxima clase.', style: 'border-green-500 bg-green-50/50', iconColor: 'text-green-600' },
    { label: 'REPROGRAMACIÓN +1 SESIÓN', desc: 'Saltas un turno y retomas.', style: 'border-slate-300 bg-brand-bg/50', iconColor: 'text-blue-600' },
    { label: 'REINICIO POSTERGADO', desc: 'Retoma en una semana.', style: 'border-brand-border bg-brand-surface', iconColor: 'text-brand-accent-dark' }
  ];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-brand-primary-dark/95 backdrop-blur-xl p-6">
      <div className="bg-brand-surface w-full max-w-[420px] rounded-[3.5rem] relative shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center bg-brand-bg/80 border-b border-brand-border-soft">
          <div className="bg-brand-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"><Zap size={24} fill="white" /></div>
          <h2 className="text-2xl font-black text-brand-primary uppercase italic tracking-tighter leading-none">Renovación {COMPANY_NAME}</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
          {fechasSugeridas.map((fecha, idx) => (
            <button key={idx} onClick={() => onConfirm(fecha)} className={`w-full flex items-center justify-between p-5 border-2 rounded-[2.2rem] transition-all group active:scale-95 ${etiquetas[idx]?.style}`}>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase italic ${etiquetas[idx]?.iconColor}`}>{etiquetas[idx]?.label}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="bg-brand-primary-dark text-white px-3 py-1 rounded-lg text-[10px] font-black italic uppercase">{format(parseDateOnly(fecha), 'EEEE dd', { locale: es })}</div>
                  <span className="text-[10px] font-bold text-brand-body uppercase">{format(parseDateOnly(fecha), 'MMMM', { locale: es })}</span>
                </div>
              </div>
              <ArrowIcon size={18} className="text-slate-300 group-hover:translate-x-1" />
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-6 bg-brand-bg text-brand-muted font-black uppercase text-[9px] tracking-[0.4em]">CANCELAR</button>
      </div>
    </div>
  );
};

const MyRegistrations = () => {
  const { user, userId } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const [pendingPayment, setPendingPayment] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState(null);
  const [renovacionModal, setRenovacionModal] = useState({ open: false, pkgId: null, fechasSugeridas: null });
  const [planesHistoricos, setPlanesHistoricos] = useState([]);
  const [planARenovar, setPlanARenovar] = useState(null);
  const [actionTarget, setActionTarget] = useState(null); // reg pendiente de confirmar borrado/finalización

  // Clases programadas del alumno: respaldo para el "Fin" del ciclo cuando fecha_fin_ciclo no llega.
  // Si falla, la tarjeta simplemente muestra "Por confirmar" (no es crítico para la vista).
  const { data: asistencias, loading: loadingAsistencias, refetch: refetchAsistencias } = useFetch(
    async () => {
      if (!userId) return [];
      try { return await asistenciaService.getHistorialAlumno(userId); } catch { return []; }
    },
    [userId],
    { initialData: [] }
  );

  const formatTimeSafe = useCallback((timeStr) => {
    if (!timeStr) return "--:--";
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
    return String(timeStr).substring(0, 5);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [resI, resC] = await Promise.all([
        apiFetch.get(`/inscripciones/alumno/${userId}`),
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(userId))
      ]);
      const dataI = await resI.json();
      const dataC = await resC.json();

      try {
        const resP = await apiFetch.get(API_ROUTES.INSCRIPCIONES.PLANES_HISTORICOS(userId));
        const dataP = await resP.json();
        setPlanesHistoricos(resP.ok ? (dataP.data || []) : []);
      } catch (e) {
        console.error('Error cargando planes históricos:', e);
        setPlanesHistoricos([]);
      }

      if (resI.ok) setRegistrations(dataI.data || []);
      if (resC.ok) {
        const deuda = dataC.data?.find(c =>
          c.alumno_id == userId && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
        );
        setPendingPayment(deuda);
      }
    } catch (error) {
        console.error('Error en fetchInitialData:', error);
        toast.error("Error de sincronización"); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleOpenPayment = (debt) => {
    setSelectedDebtForPay(debt);
    setIsPayModalOpen(true);
  };

  const handlePrepaymentGroup = async (pkgId) => {
    const toastId = toast.loading("Consultando slots...");
    try {
      const res = await apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.SUGERIR_FECHA(pkgId));
      const data = await res.json();
      toast.dismiss(toastId);
      if (res.ok) setRenovacionModal({ open: true, pkgId, fechasSugeridas: data.fechaSugerida });
    } catch (error) {
        console.error('Error en handlePrepaymentGroup:', error);
        toast.dismiss(toastId); toast.error("Error"); }
  };

  const confirmarRenovacionMasiva = async (fechaInicio) => {
    const { pkgId } = renovacionModal;
    setRenovacionModal({ open: false, pkgId: null, fechasSugeridas: null });
    const toastId = toast.loading("Sincronizando renovación...");
    try {
      const res = await apiFetch.post(API_ROUTES.CUENTAS_POR_COBRAR.GENERAR_ADELANTADO(pkgId), { fecha_inicio: fechaInicio });
      if (res.ok) { toast.success("¡Renovado! Paga para activar."); fetchInitialData(); refetchAsistencias(); }
      else { const r = await res.json(); toast.error(r.error || "Error"); }
    } catch (error) {
        console.error('Error en confirmarRenovacionMasiva:', error);
        toast.error("Error de red"); } finally { toast.dismiss(toastId); }
  };

  const handleAction = (reg) => {
    setActionTarget(reg);
  };

  const executeAction = async () => {
    const reg = actionTarget;
    setActionTarget(null);
    const isPending = reg.estado === 'PENDIENTE_PAGO';
    try {
      const endpoint = isPending ? `/inscripciones/${reg.id}/cancelar-reserva` : `/inscripciones/${reg.id}/separar-finalizar`;
      const res = await apiFetch.patch(endpoint);
      if (res.ok) { toast.success("Actualizado"); fetchInitialData(); refetchAsistencias(); }
    } catch (error) {
        console.error('Error en executeAction:', error);
        toast.error("Error"); }
  };

  const { currentPackages, historyItems } = useMemo(() => {
    const packages = {};
    const history = [];
    registrations.forEach(reg => {
      if (reg.estado === 'FINALIZADO') { history.push(reg); return; }

      // Clase única: nace sin id_grupo_transaccion, así que va como paquete propio
      // (una tarjeta por clase) con la fecha exacta del link de deuda.
      if (esClaseUnica(reg)) {
        const id = `unica-${reg.id}`;
        packages[id] = { id, tipo: 'INDIVIDUAL', estado: reg.estado, fecha_clase: fechaClaseUnica(reg), items: [reg] };
        return;
      }

      if (!reg.id_grupo_transaccion) { history.push(reg); return; }
      const gid = reg.id_grupo_transaccion;
      if (!packages[gid]) packages[gid] = { id: gid, tipo: 'MENSUAL', fecha_inicio: reg.fecha_inscripcion, items: [] };
      packages[gid].items.push(reg);
    });

    // BL-011: el rango del ciclo mensual sale del link de deuda. Si fecha_fin_ciclo es nulo o
    // inválido, el fin es la fecha de la última clase programada; sin clases => null ("Por confirmar").
    Object.values(packages).forEach(pkg => {
      if (pkg.tipo !== 'MENSUAL') return;
      const ciclo = cicloActual(pkg.items);
      if (ciclo) pkg.fecha_inicio = ciclo.fecha_inicio_ciclo;
      if (esFechaValida(ciclo?.fecha_fin_ciclo)) {
        pkg.fecha_fin = ciclo.fecha_fin_ciclo;
      } else {
        const ids = new Set(pkg.items.map(i => i.id));
        const clasesDelPaquete = (asistencias ?? []).filter(r => ids.has(inscripcionDeRegistro(r)));
        pkg.fecha_fin = ultimaClaseProgramada(clasesDelPaquete, pkg.fecha_inicio);
      }
      pkg.estado = pkg.items.some(i => i.estado === 'ACTIVO') ? 'ACTIVO' : pkg.items[0]?.estado;
    });

    const fechaPaquete = (pkg) => (pkg.tipo === 'INDIVIDUAL' ? pkg.fecha_clase : pkg.fecha_inicio);
    const fechaHistorial = (reg) => (esClaseUnica(reg) ? fechaClaseUnica(reg) : reg.fecha_inscripcion);
    return {
      currentPackages: Object.values(packages).sort(porRecientes(fechaPaquete)),
      historyItems: history.sort(porRecientes(fechaHistorial)),
    };
  }, [registrations, asistencias]);

  // 🚀 ESTADO DE CARGA MEJORADO
  if (loading || loadingAsistencias) return (
    <div className="flex flex-col h-screen items-center justify-center bg-brand-bg gap-4">
      <Loader2 className="animate-spin text-brand-accent" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary animate-pulse">Sincronizando tus clases...</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-brand-bg">

      {/* 🛡️ BANNER DE DEUDA ULTRA EVIDENTE (STICKY) */}
      {pendingPayment && (
        <div className="w-full bg-brand-primary-dark py-4 border-b-4 border-brand-accent shadow-2xl sticky top-0 z-[100] animate-in slide-in-from-top duration-500">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-accent p-1.5 rounded-lg animate-pulse">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <p className="text-[11px] font-black text-brand-accent uppercase italic tracking-[0.3em]">Acción Requerida: Regularizar Pago</p>
            </div>
            <OutstandingDebtAlert pendingPayment={pendingPayment} onRefresh={fetchInitialData} onPay={handleOpenPayment} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 px-2">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-primary uppercase italic tracking-tighter leading-none">MIS <span className="text-brand-accent">CLASES</span></h2>
            <p className="text-[10px] font-black text-brand-muted uppercase mt-3 flex items-center gap-2 italic tracking-widest text-brand-accent-dark">
              <Dumbbell size={14} /> Atleta: {user?.user?.nombres}
            </p>
          </div>
          <div className="bg-brand-surface px-5 py-3 rounded-[1.5rem] border border-brand-border-soft shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <Trophy size={16} className="text-brand-accent" />
            <div className="flex flex-col items-end">
              <p className="text-2xl font-black text-brand-primary italic leading-none">{currentPackages.length}</p>
              <p className="text-[8px] font-bold text-brand-muted uppercase tracking-widest">Paquetes Activos</p>
            </div>
          </div>
        </header>

        {/* 🌟 EMPTY STATE SUPERIOR (Si no hay clases activas) */}
        {currentPackages.length === 0 && (
          <div className="bg-brand-surface rounded-[3.5rem] border-2 border-dashed border-brand-border p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[50vh] shadow-sm animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-brand-accent-soft rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
              <CalendarSearch size={48} className="text-brand-accent" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black text-brand-primary uppercase italic mb-3 tracking-tighter">¡Aún no estás en la cancha!</h3>
            <p className="text-brand-muted text-[12px] font-bold uppercase tracking-[0.2em] max-w-md mb-8 leading-relaxed">
              No tienes paquetes de clases activos en este momento. Dale play a tu entrenamiento y reserva tu horario.
            </p>
            <Link
              to="/dashboard/student/enrollment" // 👈 Asegúrate que esta ruta es la correcta
              className="bg-brand-accent text-white px-10 py-5 rounded-full font-black uppercase italic tracking-widest text-[12px] hover:bg-brand-accent-dark hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 flex items-center gap-3 active:scale-95 group"
            >
              <Rocket size={18} fill="currentColor" className="group-hover:-translate-y-1 transition-transform" />
              Matricularme Ahora
            </Link>
          </div>
        )}

        {/* LISTA DE PAQUETES ACTIVOS */}
        <div className="space-y-12">
          {currentPackages.map((pkg) => (
            <div key={pkg.id} className="bg-brand-surface rounded-[3.5rem] border border-brand-border-soft shadow-xl overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
              <PackageHeader pkg={pkg} />

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-surface">
                {pkg.items.map((reg) => (
                  <div key={reg.id} className="bg-brand-bg rounded-[2.5rem] p-6 border border-brand-border-soft shadow-sm hover:border-blue-300 hover:bg-brand-primary-soft/30 transition-all flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white to-transparent opacity-50 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-brand-primary flex items-center justify-center text-white shadow-lg"><Calendar size={24} /></div>
                        <div>
                          <h4 className="text-2xl font-black text-brand-primary uppercase italic leading-none">{DIAS_NOMBRES[reg.horarios_clases?.dia_semana]}</h4>
                          <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5 uppercase bg-brand-surface w-fit px-2 py-0.5 rounded-md border border-brand-border">
                            <Clock size={12} className="text-brand-accent" /> {formatTimeSafe(reg.horarios_clases?.hora_inicio)} - {formatTimeSafe(reg.horarios_clases?.hora_fin)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${reg.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                        {reg.estado}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-brand-border/60 relative z-10">
                      <div className="flex items-center gap-2 text-slate-500 bg-brand-surface px-3 py-2 rounded-xl border border-brand-border-soft">
                        <MapPin size={14} className="text-brand-accent shrink-0" />
                        <span className="text-[10px] font-black uppercase italic truncate">{formatBrandingText(reg.horarios_clases?.canchas?.sedes?.nombre)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-brand-surface px-3 py-2 rounded-xl border border-brand-border-soft shadow-sm">
                          <Activity size={12} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{reg.horarios_clases?.niveles_entrenamiento?.nombre}</span>
                        </div>
                        <button onClick={() => handleAction(reg)} className="p-3 text-rose-500 bg-brand-surface border border-rose-100 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm hover:shadow-rose-500/30">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Una clase única no se renueva */}
              {pkg.tipo !== 'INDIVIDUAL' && (
                <div className="p-6 bg-brand-bg/80 flex justify-center border-t border-brand-border-soft">
                  <button onClick={() => handlePrepaymentGroup(pkg.id)} className="w-full max-w-md py-4 bg-brand-primary text-white rounded-2xl text-[11px] font-black uppercase italic hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 active:scale-95">
                    <Zap size={16} fill="white" /> Renovar Paquete Completo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* HISTORIAL SEGMENTADO */}
        {(historyItems.length > 0 || planesHistoricos.length > 0) && (
          <div className="mt-20 bg-brand-bg/80 rounded-[3.5rem] p-6 md:p-10 border-2 border-dashed border-brand-border transition-all hover:border-slate-300">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-between w-full text-brand-primary group transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-surface rounded-2xl shadow-sm border border-brand-border group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300"><History size={22} /></div>
                <div className="text-left">
                  <span className="block text-[14px] font-black uppercase tracking-[0.2em] italic">Expediente Histórico</span>
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{historyItems.length} registros pasados</span>
                </div>
              </div>
              <div className={`p-2 bg-brand-surface rounded-full shadow-sm border border-brand-border-soft transition-transform duration-500 ${showHistory ? 'rotate-180 bg-brand-surface-alt' : ''}`}>
                <ChevronDown size={24} className="text-brand-muted" />
              </div>
            </button>

            {showHistory && planesHistoricos.length > 0 && (
              <div className="mt-10 space-y-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Planes anteriores</p>
                {planesHistoricos.map(plan => (
                  <div key={plan.cuenta_id} className="bg-brand-surface p-5 rounded-[2rem] border border-brand-border-soft shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-black text-brand-primary italic uppercase">{plan.concepto?.nombre || 'Plan'}</p>
                        <p className="text-[10px] font-bold text-brand-muted uppercase">
                          {plan.fecha_inicio_ciclo ? format(parseISO(String(plan.fecha_inicio_ciclo).split('T')[0]), 'dd MMM yyyy', { locale: es }) : '---'}
                          {' - '}
                          {plan.fecha_fin_ciclo ? format(parseISO(String(plan.fecha_fin_ciclo).split('T')[0]), 'dd MMM yyyy', { locale: es }) : '---'}
                        </p>
                      </div>
                      {plan.puede_renovar && (
                        <button onClick={() => setPlanARenovar(plan)} className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase italic hover:bg-brand-accent transition-all flex items-center gap-2 active:scale-95">
                          <Zap size={14} fill="white" /> Renovar
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(plan.horarios || []).map(h => (
                        <span key={h.id} className="text-[10px] font-bold text-slate-600 bg-brand-bg border border-brand-border-soft px-3 py-1.5 rounded-lg uppercase">
                          {DIAS_NOMBRES[h.dia_semana]} {formatTimeSafe(h.hora_inicio)}-{formatTimeSafe(h.hora_fin)} · {formatBrandingText(h.cancha?.sede?.nombre)}
                        </span>
                      ))}
                    </div>
                    {!plan.puede_renovar && plan.motivo_no_renovable && (
                      <p className="text-[10px] font-bold text-brand-muted italic">{plan.motivo_no_renovable}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showHistory && (
              <div className="mt-10 space-y-3 animate-in slide-in-from-top-4 duration-500">
                {historyItems.map(item => (
                  <div key={item.id} className="bg-brand-surface p-5 rounded-[2rem] border border-brand-border-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group/h hover:bg-brand-primary transition-all duration-300 shadow-sm hover:shadow-xl">
                    <div className="flex items-center gap-4 md:gap-8 pl-2">
                      <span className="text-[13px] font-black text-brand-primary italic w-28 group-hover:text-brand-accent transition-colors">{DIAS_NOMBRES[item.horarios_clases?.dia_semana]}</span>
                      <div className="hidden md:block h-6 w-[2px] bg-brand-surface-alt group-hover:bg-slate-700 transition-colors"></div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold group-hover:text-slate-300 transition-colors bg-brand-bg group-hover:bg-slate-800 px-3 py-1.5 rounded-lg">
                        <Clock size={12} className="text-brand-accent group-hover:text-white" />
                        <span>{formatTimeSafe(item.horarios_clases?.hora_inicio)} - {formatTimeSafe(item.horarios_clases?.hora_fin)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-brand-muted border-brand-border-soft px-4 py-2 rounded-xl uppercase italic transition-colors">
                      {esClaseUnica(item)
                        ? `CLASE ÚNICA · ${format(parseDateOnly(fechaClaseUnica(item)),'dd MMM yyyy', { locale: es })}`
                        : item.tipo_inscripcion}
                    </span>
                    <span className="text-[9px] font-black text-brand-muted border-2 border-brand-border-soft px-4 py-2 rounded-xl group-hover:border-slate-700 group-hover:text-slate-300 uppercase italic transition-colors">
                      {item.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES SUPERIORES */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[1000]">
          <ReportPaymentModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} debt={selectedDebtForPay} onSuccess={() => { setIsPayModalOpen(false); fetchInitialData(); }} />
        </div>
      )}
      <RenovacionModal isOpen={renovacionModal.open} fechasSugeridas={renovacionModal.fechasSugeridas} onClose={() => setRenovacionModal({ open: false, pkgId: null, fechasSugeridas: null })} onConfirm={confirmarRenovacionMasiva} />

      {planARenovar && (
        <RenovarPlanHistoricoModal
          plan={planARenovar}
          alumnoId={userId}
          onClose={() => setPlanARenovar(null)}
          onSuccess={() => { setPlanARenovar(null); fetchInitialData(); }}
        />
      )}

      <ConfirmModal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={executeAction}
        title={actionTarget ? (actionTarget.estado === 'PENDIENTE_PAGO' ? '¿Borrar reserva?' : esClaseUnica(actionTarget) ? '¿Cancelar clase única?' : '¿Finalizar horario?') : ''}
        message="Se liberará el cupo en este horario."
        iconType="danger"
        confirmText="Confirmar"
      />
    </div>
  );
};

export default MyRegistrations;