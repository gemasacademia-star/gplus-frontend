import React from 'react';
import { MapPin, Trophy, CalendarDays, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MODALIDAD } from '../../../hooks/useEnrollmentWizard';
import { formatBrandingText } from '../../../utils/formatBrandingText';

const DIAS_CORTOS = ['', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const soles = (n) => `S/ ${Number(n).toFixed(2)}`;
const fechaLarga = (key) => format(parseISO(key), "EEEE d 'de' MMMM", { locale: es });

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-2xl bg-brand-primary-soft text-brand-primary flex items-center justify-center shrink-0">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="text-left">
      <p className="text-[9px] text-brand-muted font-black uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-black text-slate-800 leading-tight uppercase">{children}</p>
    </div>
  </div>
);

const EnrollmentSummary = ({ modalidad, sede, nivelNombre, horarios, fechaInicio, fechaUnica, horarioUnico, precioBase, beneficios, extras }) => {
  const total = precioBase == null ? null : (Number(precioBase) + extras.reduce((acc, e) => acc + Number(e.price || 0), 0) - beneficios.reduce((acc, b) => acc + Number(b.tipos_beneficio?.valor_por_defecto || 0), 0));
  const esMensual = modalidad === MODALIDAD.MENSUAL;

  const sedesReales = esMensual
    ? [...new Set((horarios || []).map((h) => h.cancha?.sede?.nombre).filter(Boolean))]
    : [];
  const esMultiSede = sedesReales.length > 1;
  const textoSedes = sedesReales.length > 0 ? sedesReales.join(' + ') : sede;
  const textoDias = (horarios || [])
    .map((h) => {
      const dia = DIAS_CORTOS[h.dia_semana];
      const sedeHorario = h.cancha?.sede?.nombre;
      return esMultiSede && sedeHorario ? `${dia} (${sedeHorario})` : dia;
    })
    .join(' + ');

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 border-2 border-brand-border-soft space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-brand-accent text-white">
          {esMensual ? 'Matrícula mensual' : 'Clase única'}
        </span>
        {esMultiSede && (
          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-brand-primary text-brand-gold">
            Modalidad Inter-Sedes
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Row icon={MapPin} label={esMultiSede ? 'Sedes' : 'Sede'}>{textoSedes}</Row>
        <Row icon={Trophy} label="Nivel">{nivelNombre}</Row>
        {esMensual ? (
          <>
            <Row icon={CalendarDays} label="Días">{textoDias}</Row>
            <Row icon={Clock} label="Empiezas">{fechaLarga(fechaInicio)}</Row>
          </>
        ) : (
          <>
            <Row icon={CalendarDays} label="Fecha">{fechaLarga(fechaUnica)}</Row>
            {horarioUnico && <Row icon={Clock} label="Horario">{horarioUnico.hora_inicio.slice(0, 5)} - {horarioUnico.hora_fin.slice(0, 5)}</Row>}
          </>
        )}
      </div>

      <div className="border-t border-brand-border-soft pt-5 space-y-2">
        {precioBase != null && (
          <div className="flex justify-between text-[11px] font-black uppercase italic text-brand-muted">
            <span>{esMensual ? 'Matrícula' : 'Clase única'}</span><span>{soles(precioBase)}</span>
          </div>
        )}
        {beneficios.map(b => (
          <div key={b.id} className="flex justify-between text-[11px] font-black uppercase italic text-emerald-500">
            <span className="flex items-center gap-1">
              <span>Descuento:</span> {b.motivo ? b.motivo : b.tipos_beneficio.nombre}
            </span>
            <span>- {soles(b.tipos_beneficio.valor_por_defecto)}</span>
          </div>
        ))}
        {extras.map(e => (
          <div key={e.label} className="flex justify-between text-[11px] font-black uppercase italic text-brand-muted">
            <span>{e.label}</span><span>{soles(e.price)}</span>
          </div>
        ))}
        <div className="flex justify-between items-end pt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Total</span>
          <span className="text-3xl font-black italic text-brand-primary leading-none">
            {total == null ? 'Se confirma al generar' : soles(total)}
          </span>
        </div>
      </div>
    </div >
  );
};

export default EnrollmentSummary;
