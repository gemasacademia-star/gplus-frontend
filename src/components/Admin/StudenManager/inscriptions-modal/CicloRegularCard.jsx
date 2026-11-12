import React from 'react';
import { Clock, User, DollarSign, Info, Layers } from 'lucide-react';
import { formatearFecha, obtenerRangoCiclo, getEstadoPagoBadge, getEstadoInscripcionBadge } from '../ciclos/cicloHelpers';
import { formatBrandingText } from '../../../../utils/formatBrandingText';

const CicloRegularCard = ({ ciclo }) => {
    const inscripciones = ciclo.inscripciones || [];
    const estadosInscripcion = [...new Set(inscripciones.map(i => i.estado))];
    const sedesUnicas = [...new Set(inscripciones.map(i => i.sede).filter(Boolean))];
    const nivelesUnicos = [...new Set(inscripciones.map(i => i.nivel).filter(Boolean))];
    const profesoresUnicos = [...new Set(inscripciones.map(i => i.profesor).filter(p => p && p !== 'S/D'))];
    const esInterSedes = sedesUnicas.length > 1;

    return (
        <div className="bg-brand-surface border-2 border-slate-50 rounded-2xl p-5 hover:border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary-soft px-2 py-1 rounded-md">
                            {obtenerRangoCiclo(ciclo.fecha_inicio_real, ciclo.fecha_fin_real)}
                        </span>
                        {ciclo.horarios?.length > 1 && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded-md border border-indigo-100 uppercase">
                                <Layers size={9} /> x{ciclo.horarios.length} horarios
                            </span>
                        )}
                        {esInterSedes && (
                            <span className="text-[8px] font-black text-brand-gold-dark bg-brand-gold-soft px-1.5 py-1 rounded-md border border-brand-gold/40 uppercase tracking-widest">
                                Inter-Sedes
                            </span>
                        )}
                    </div>

                    <p className="text-sm font-black text-brand-body uppercase italic mt-2">
                        {esInterSedes ? `SEDES: ${sedesUnicas.join(' + ')}` : `SEDE ${sedesUnicas[0] || 'S/D'}`}
                    </p>

                    <div className="text-[10px] font-bold text-brand-muted flex items-center gap-1.5 mt-1 min-w-0">
                        <User size={11} className="text-brand-muted shrink-0" />
                        <span className="truncate">
                            {nivelesUnicos.join(' / ') || 'S/D'}
                            {profesoresUnicos.length > 0 ? ` · ${profesoresUnicos.join(', ')}` : ''}
                        </span>
                    </div>

                    {ciclo.horarios?.length > 0 && (
                        <div className="flex flex-col gap-1 mt-2">
                            {ciclo.horarios.map((h, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase flex-wrap">
                                    <Clock size={12} className="text-brand-accent shrink-0" />
                                    <span>{h.dia} {h.hora_inicio}-{h.hora_fin}</span>
                                    {esInterSedes && h.sede && (
                                        <span className="text-[8px] font-black text-brand-primary bg-brand-primary-soft px-1.5 py-0.5 rounded uppercase">
                                            {h.sede}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border whitespace-nowrap ${getEstadoPagoBadge(ciclo.estado_pago)}`}>
                        {ciclo.estado_pago}
                    </span>
                    {estadosInscripcion.map((estado, i) => (
                        <span key={i} className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap ${getEstadoInscripcionBadge(estado)}`}>
                            {estado}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-3 mt-3 border-t border-brand-border-soft">
                <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Inicio</span>
                    <span className="text-[10px] font-black text-brand-body truncate">{formatearFecha(ciclo.fecha_inicio_real)}</span>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Fin real</span>
                    <span className="text-[10px] font-black text-brand-body truncate">
                        {ciclo.fecha_fin_real ? formatearFecha(ciclo.fecha_fin_real) : 'EN CURSO'}
                    </span>
                </div>
                {ciclo.monto_final > 0 && (
                    <div className="flex flex-col min-w-0 col-span-2">
                        <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Monto</span>
                        <span className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                            <DollarSign size={10} className="shrink-0" />{Number(ciclo.monto_final).toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {ciclo.fecha_vencimiento_pago && (
                <div className="flex items-start gap-1.5 pt-2 mt-2 border-t border-dashed border-brand-border-soft">
                    <Info size={10} className="text-slate-300 shrink-0 mt-0.5" />
                    <span className="text-[8px] text-brand-muted font-bold uppercase tracking-widest break-words">
                        Plazo de pago: {formatearFecha(ciclo.fecha_vencimiento_pago)}
                    </span>
                </div>
            )}

            <p className="text-[8px] text-slate-300 font-bold italic pt-2">
                Cuenta #{ciclo.cuenta_id} · {ciclo.concepto}
            </p>
        </div>
    );
};

export default CicloRegularCard;
