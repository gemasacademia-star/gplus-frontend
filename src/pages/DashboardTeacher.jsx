import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Clock, MapPin, CheckCircle, Calendar, Loader2, ChevronRight, Filter, Info, ShieldAlert, RefreshCw } from 'lucide-react';
import AttendanceModal from '../components/teacher/AttendanceModal';
import { useAuth } from '../context/AuthContext';
import { asistenciaService } from '../services/asistencia.service';
import toast from 'react-hot-toast';
import { COMPANY_NAME } from '../config/branding';

const instruccionesSistema = [
  {
    id: 1,
    icono: <ChevronRight size={16} className="text-blue-500 shrink-0 mt-0.5" />,
    texto: (
      <>
        Dar clic en <strong className="text-blue-600">TOMAR ASISTENCIA</strong> para abrir el registro del horario correspondiente.<br></br>
      </>
    )
  },
  {
    id: 2,
    icono: <ShieldAlert size={16} className="text-brand-accent shrink-0 mt-0.5" />,
    texto: (
      <>
        Los alumnos marcados como <strong className="text-brand-accent-dark">JUSTIFICADO MÉD.</strong> estarán bloqueados por ausencia justificada.
      </>
    )
  },
  {
    id: 3,
    icono: <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />,
    texto: (
      <>
        Las sesiones <strong className="text-slate-600">FUTURAS</strong> estarán bloqueadas hasta que llegue la fecha correspondiente.
      </>
    )
  }
];

const DashboardTeacher = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros: Iniciamos en TODOS para ver toda la temporada
  const [filtroMes, setFiltroMes] = useState("TODOS");
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  const { user } = useAuth();
  const hoyRef = useRef(null);

  const coordinatorFullName = user?.user ? `${user.user.nombres} ${user.user.apellidos}` : `Coordinador ${COMPANY_NAME}`;

  const fetchAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const data = await asistenciaService.getAgenda();
      const todasLasSesiones = [];
      const hoy = new Date(Date.now() - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];

      const fechasUnicas = {};

      data.forEach(horario => {
        const baseTimeRange = `${horario.hora_inicio} - ${horario.hora_fin}`;

        horario.inscripciones.forEach(ins => {
          ins.registros_asistencia.forEach(reg => {
            const fechaObj = new Date(reg.fecha);
            const fechaKey = reg.fecha.split('T')[0];
            fechaObj.setHours(0, 0, 0, 0);

            // Override time if this specific date has custom override columns
            let timeRange = baseTimeRange;
            let reprogramacionData = null;

            if (reg.reprogramaciones_clases) {
              timeRange = `${reg.reprogramaciones_clases.hora_inicio_destino} - ${reg.reprogramaciones_clases.hora_fin_destino}`;
              reprogramacionData = reg.reprogramaciones_clases;
            }

            const globalKey = `${fechaKey}-${timeRange}`;

            if (!fechasUnicas[globalKey]) {
              fechasUnicas[globalKey] = {
                id: globalKey,
                title: horario.niveles_entrenamiento?.nombre || 'BASICO-C',
                timeRange, // Start with whatever time range this first student gives us
                reprogramacionData, // Track the full object for UI rendering
                court: horario.canchas?.nombre || 'T1',
                level: horario.niveles_entrenamiento?.nombre || 'BASICO-C',
                fechaReal: reg.fecha,
                anio: new Date(reg.fecha).getFullYear().toString(),
                mes: new Date(reg.fecha).getMonth().toString(),
                isToday: fechaKey === hoy,
                isPast: fechaKey < hoy,
                isFuture: fechaKey > hoy,
                dateFormatted: new Date(reg.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', ''),
                totalStudents: horario.inscripciones.length,
                inscripcionesEnEstaFecha: []
              };
            } else {
              // Priority override: If ANY student in this date bucket has the custom time override, force it onto the bucket.
              if (reg.reprogramaciones_clases) {
                fechasUnicas[globalKey].timeRange = `${reg.reprogramaciones_clases.hora_inicio_destino} - ${reg.reprogramaciones_clases.hora_fin_destino}`;
                fechasUnicas[globalKey].reprogramacionData = reg.reprogramaciones_clases;
              }
            }
            fechasUnicas[globalKey].inscripcionesEnEstaFecha.push({ ...ins, registro_especifico: reg });
          });
        });
      });

      Object.values(fechasUnicas).forEach(sesion => {
        const inscripciones = Array.from(new Map(sesion.inscripcionesEnEstaFecha.map(i => [i.alumno_id, i])).values());
        const esReprogramadaTotal = inscripciones.length > 0 && inscripciones.every(al => al.tipo_sesion === 'REPROGRAMADO');
        const esReposicionTotal = inscripciones.length > 0 && inscripciones.every(al => al.tipo_sesion === 'REPOSICION');
        const tieneRecuperadores = inscripciones.some(al => al.tipo_sesion === 'RECUPERACION');

        const completada = inscripciones.length > 0 && inscripciones.every(al =>
          al.registro_especifico.estado !== 'PROGRAMADA' && al.registro_especifico.estado !== 'PENDIENTE'
        );

        todasLasSesiones.push({
          ...sesion,
          inscripcionesEnEstaFecha: inscripciones,
          attended: completada && !esReprogramadaTotal,
          isReprogramada: esReprogramadaTotal,
          isReposicion: esReposicionTotal,
          tieneRecuperadores,
          totalStudents: inscripciones.length
        });
      });
      todasLasSesiones.sort((a, b) => new Date(a.fechaReal) - new Date(b.fechaReal));
      setClases(todasLasSesiones);

      // Auto-scroll a la sesión de hoy si existe y estamos en vista "TODOS"
      if (filtroMes === "TODOS") {
        setTimeout(() => hoyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 800);
      }

    } catch (error) {
      console.error("DashboardTeacher error:", error);
      toast.error("Error al cargar la agenda deportiva");
    } finally {
      setLoading(false);
    }
  }, [filtroMes]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const anios = ["2025", "2026", "2027"];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-brand-primary" size={48} />
      <p className="font-black text-brand-primary uppercase italic text-xs tracking-widest text-center">Sincronizando Sistema {COMPANY_NAME}...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-10 px-4">

      {/* HEADER ORIGINAL RESTAURADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand-primary uppercase tracking-tighter italic leading-none">
            HOLA, <span className="text-brand-accent">{coordinatorFullName.toUpperCase()}</span> 👋
          </h1>
          <div className="h-2 w-24 bg-brand-accent rounded-full mt-4 shadow-lg shadow-brand-accent/20"></div>
        </div>
        <div className="flex items-center gap-2 bg-brand-surface px-5 py-3 rounded-2xl border border-brand-border shadow-sm text-xs font-black text-brand-primary uppercase tracking-widest italic">
          <Calendar size={18} className="text-brand-accent" />
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </div>
      </div>

      {/* BARRA DE FILTROS TÉCNICOS */}
      <div className="flex flex-wrap items-center gap-4 bg-brand-surface-alt/50 p-4 rounded-[2rem] border border-brand-border">
        <div className="flex items-center gap-3 bg-brand-surface px-4 py-2 rounded-xl border border-brand-border shadow-sm">
          <Filter size={16} className="text-brand-accent" />
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest text-brand-primary outline-none cursor-pointer bg-transparent"
          >
            <option value="TODOS">TODOS LOS MESES</option>
            {meses.map((mes, idx) => <option key={idx} value={idx.toString()}>{mes.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 bg-brand-surface px-4 py-2 rounded-xl border border-brand-border shadow-sm">
          <Calendar size={16} className="text-brand-accent" />
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="text-[10px] font-black uppercase tracking-widest text-brand-primary outline-none cursor-pointer bg-transparent"
          >
            {anios.map(anio => <option key={anio} value={anio}>{anio}</option>)}
          </select>
        </div>
      </div>

      {/* BANNER DINÁMICO DE INSTRUCCIONES */}
      <div className="bg-brand-primary-soft/80 border border-blue-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2 italic mb-4 ">
          <Info size={18} className="text-blue-600" />
          Instrucciones del Coordinador
        </h3>
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instruccionesSistema.map((instruccion) => (
            <li key={instruccion.id} className="flex gap-3 bg-white/60 p-4 rounded-2xl border border-blue-50/50">
              {instruccion.icono}
              <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                {instruccion.texto}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* AGENDA DEPORTIVA */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight flex items-center gap-3 italic">
          <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
          Agenda de Entrenamiento
        </h2>

        <div className="grid gap-6">
          {clases
            .filter(c => (filtroMes === "TODOS" || c.mes === filtroMes) && c.anio === filtroAnio)
            .map((item) => (
              <div
                key={item.id}
                ref={item.isToday ? hoyRef : null}
                className={`group relative bg-brand-surface rounded-[2.5rem] p-7 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden border-l-8 
                  ${item.isToday ? 'border-brand-accent shadow-2xl scale-[1.01]' : 'border-brand-primary shadow-xl hover:shadow-2xl'}
                  ${(item.isPast || item.isFuture) && !item.isToday ? 'opacity-70 bg-brand-bg' : ''}`}
              >
                <div className="flex gap-6 relative z-10">
                  <div className={`hidden md:flex flex-col items-center justify-center w-24 h-24 rounded-[1.5rem] font-black shadow-inner transition-colors 
                    ${item.isToday ? 'bg-brand-accent text-white' : item.attended ? 'bg-brand-surface-alt text-slate-300' : 'bg-brand-primary text-white'}`}>
                    <span className="text-2xl tracking-tighter">{item.dateFormatted.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60 italic">{item.dateFormatted.split(' ')[1]}</span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="md:hidden flex items-center gap-2 mb-2 bg-brand-primary-soft w-fit px-3 py-1 rounded-lg border border-blue-100">
                      <Calendar size={12} className="text-brand-accent" />
                      <span className="text-[10px] font-black text-brand-primary uppercase italic tracking-widest">
                        {item.dateFormatted} {/* Esto mostrará ej: 11 MAR */}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-brand-accent-soft text-brand-accent-dark text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-orange-100 italic">
                        {item.level}
                      </span>
                      {item.isReprogramada ? (
                        <span className="bg-brand-bg text-brand-body text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest border border-brand-border-soft italic">
                          <ShieldAlert size={14} strokeWidth={3} /> SESIÓN MOVIDA
                        </span>
                      ) : item.isReposicion ? (
                        <span className="bg-violet-50 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest border border-violet-100 italic">
                          <RefreshCw size={14} className="animate-spin-slow" /> REPOSICIÓN ACADÉMICA
                        </span>
                      ) : item.tieneRecuperadores ? (
                        <span className="bg-brand-primary-soft text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest border border-blue-100 italic">
                          <RefreshCw size={14} /> RECUPERACIONES PRESENTES
                        </span>
                      ) : item.attended ? (
                        <span className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-widest border border-green-100 italic">
                          <CheckCircle size={14} strokeWidth={3} /> SESIÓN FINALIZADA
                        </span>
                      ) : null}
                    </div>
                    <h3 className={`text-2xl font-black uppercase tracking-tight italic mb-3 leading-none transition-colors ${item.isToday ? 'text-brand-accent-dark' : 'text-brand-primary'}`}>
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-brand-muted uppercase italic">
                      <span className="flex items-center gap-2"><Clock size={16} className="text-blue-400" /> {item.timeRange} HRS</span>
                      <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-400" /> {item.court}</span>
                      <span className="flex items-center gap-2"><Users size={16} className="text-blue-400" /> {item.totalStudents} ATLETAS</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => !item.isFuture && setSelectedClass(item)}
                  disabled={item.isFuture}
                  className={`w-full md:w-auto px-10 py-5 rounded-[1.5rem] font-black text-xs transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl active:scale-95 italic
                    ${item.isToday ? 'bg-brand-accent text-white hover:bg-brand-accent-dark' : item.isFuture ? 'bg-slate-300 text-brand-muted cursor-not-allowed shadow-none' : 'bg-brand-primary text-white hover:bg-[#152a63]'}`}
                >
                  {item.isPast ? 'VER ASISTENCIA' : 'TOMAR ASISTENCIA'}
                  <ChevronRight size={18} />
                </button>

                {item.isToday && (
                  <div className="absolute top-0 right-0 bg-brand-accent text-white text-[8px] font-black px-4 py-1.5 rounded-bl-2xl italic tracking-tighter">
                    LIVE SESSION
                  </div>
                )}
              </div>
            ))}

          {clases.filter(c => (filtroMes === "TODOS" || c.mes === filtroMes) && c.anio === filtroAnio).length === 0 && (
            <div className="bg-brand-surface p-20 rounded-[3rem] border-2 border-dashed border-brand-border text-center">
              <p className="font-black text-slate-300 uppercase italic tracking-widest text-xs">No hay sesiones para este período</p>
            </div>
          )}
        </div>
      </div>

      {selectedClass && (
        <AttendanceModal
          clase={selectedClass}
          onClose={() => setSelectedClass(null)}
          onRefresh={fetchAgenda}
        />
      )}
    </div>
  );
};

export default DashboardTeacher;