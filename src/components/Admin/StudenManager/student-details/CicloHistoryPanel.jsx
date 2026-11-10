import React from 'react';
import { CalendarClock, Loader2, Layers, MapPin, User, DollarSign, Info } from 'lucide-react';
import ClaseSueltaButton from '../ciclos/ClaseSueltaButton';
import { obtenerRangoCiclo, formatearFecha, getEstadoPagoBadge, getEstadoInscripcionBadge, getEstadoClaseBadge } from '../ciclos/cicloHelpers';
import EmptyState from '../../../shared/EmptyState';
import { formatBrandingText } from '../../../../utils/formatBrandingText';

// ClaseSueltaButton y ClaseSueltaDetailModal (compartidos con InscriptionsModal) leen
// el shape del historial académico; se les entrega un objeto equivalente con las
// llaves de BL-012 para no tocarlos.
const aCicloClaseSuelta = (ciclo) => ({
    cuenta_id: ciclo.cuenta_id,
    concepto: ciclo.tipo_inscripcion,
    fecha_inicio_real: ciclo.fecha_inicio_ciclo,
    fecha_fin_real: ciclo.fecha_fin_ciclo,
    estado_pago: ciclo.estado_pago_mes,
    monto_final: ciclo.monto_mes,
    fecha_vencimiento_pago: ciclo.fecha_vencimiento_pago,
    inscripciones: [{
        sede: ciclo.sede,
        nivel: ciclo.nivel,
        profesor: ciclo.profesor,
        estado: ciclo.estado_inscripcion,
    }],
    horarios: [],
});

const claveCiclo = (ciclo, i) =>
    `${ciclo.inscripcion_id}-${ciclo.numero_mes_ciclo}-${ciclo.cuenta_id ?? `sc${i}`}`;

const CicloHistoryPanel = ({ historial, loadingCiclos, onSelectMes, onSelectIndividual }) => {
    const ciclos = historial?.ciclos || [];
    const mesesDisponibles = historial?.meses_disponibles || [];
    const resumen = historial?.resumen_mes;

    return (
        <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-brand-accent-soft/50 border-b border-orange-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-accent-dark flex items-center justify-center shrink-0">
                    <CalendarClock size={16} />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase italic tracking-widest leading-tight">
                    Historial de Ciclos
                </h3>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[500px] space-y-3 bg-brand-bg/30">
                {mesesDisponibles.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Mes</span>
                        <select
                            value={`${historial.mes}-${historial.anio}`}
                            onChange={(e) => {
                                const [mes, anio] = e.target.value.split('-');
                                onSelectMes(Number(mes), Number(anio));
                            }}
                            className="w-full p-2.5 rounded-xl border border-brand-border shadow-sm text-[10px] font-black uppercase bg-brand-surface focus:ring-2 focus:ring-brand-accent"
                        >
                            {mesesDisponibles.map((m) => (
                                <option key={`${m.mes}-${m.anio}`} value={`${m.mes}-${m.anio}`}>
                                    {m.etiqueta} ({m.total_ciclos})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {loadingCiclos ? (
                    <div className="flex flex-col justify-center items-center py-10 gap-2">
                        <Loader2 className="animate-spin text-brand-accent" size={24} />
                        <span className="text-[9px] text-brand-muted uppercase font-bold tracking-widest">Cargando ciclos...</span>
                    </div>
                ) : (
                    <>
                        {resumen && resumen.total_clases > 0 && (
                            <div className="bg-brand-surface border border-brand-border rounded-2xl p-3 grid grid-cols-4 gap-2 shadow-sm">
                                {[
                                    ['Clases', resumen.total_clases],
                                    ['Presente', resumen.clases_presente],
                                    ['Falta', resumen.clases_falta],
                                    ['Program.', resumen.clases_programadas],
                                ].map(([label, valor]) => (
                                    <div key={label} className="flex flex-col min-w-0">
                                        <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest truncate">{label}</span>
                                        <span className="text-[11px] font-black text-brand-body">{valor}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {ciclos.length > 0 ? (
                            ciclos.map((ciclo, i) => {
                                // Tarjeta compacta para CLASE INDIVIDUAL: solo un botón que abre el modal
                                // con el resumen completo. Así no compite en tamaño/detalle con los paquetes.
                                if (ciclo.tipo_inscripcion === 'INDIVIDUAL') {
                                    const claseSuelta = aCicloClaseSuelta(ciclo);
                                    return (
                                        <ClaseSueltaButton
                                            key={claveCiclo(ciclo, i)}
                                            ciclo={claseSuelta}
                                            onSelect={() => onSelectIndividual(claseSuelta)}
                                        />
                                    );
                                }

                                const desglose = ciclo.desglose_mes;

                                return (
                                    <div key={claveCiclo(ciclo, i)} className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative transition-all hover:border-orange-200 hover:shadow-md overflow-hidden">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary-soft px-2 py-1 rounded-md">
                                                        {obtenerRangoCiclo(ciclo.fecha_inicio_ciclo, ciclo.fecha_fin_ciclo)}
                                                    </span>

                                                    {ciclo.numero_mes_ciclo > 0 && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded-md border border-indigo-100 uppercase">
                                                            <Layers size={9} /> Mes {ciclo.numero_mes_ciclo}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-2 min-w-0">
                                                    <MapPin size={10} className="text-brand-accent shrink-0" />
                                                    <span className="truncate">{formatBrandingText(ciclo.sede || 'S/D')}</span>
                                                </div>
                                                <div className="text-[9px] font-bold text-brand-muted flex items-center gap-1.5 mt-1 min-w-0">
                                                    <User size={10} className="text-brand-muted shrink-0" />
                                                    <span className="truncate">
                                                        {ciclo.nivel || 'S/D'}
                                                        {ciclo.profesor ? ` · ${ciclo.profesor}` : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border whitespace-nowrap ${getEstadoPagoBadge(ciclo.estado_pago_mes)}`}>
                                                    {ciclo.estado_pago_mes}
                                                </span>
                                                {ciclo.estado_inscripcion && (
                                                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap ${getEstadoInscripcionBadge(ciclo.estado_inscripcion)}`}>
                                                        {ciclo.estado_inscripcion}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-3 border-t border-brand-border-soft">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Inicio</span>
                                                <span className="text-[10px] font-black text-brand-body truncate">{ciclo.fecha_inicio_ciclo_label}</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Fin real</span>
                                                <span className="text-[10px] font-black text-brand-body truncate">{ciclo.fecha_fin_ciclo_label}</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">Corte</span>
                                                <span className="text-[10px] font-black text-brand-body truncate">{ciclo.fecha_corte_ciclo_label}</span>
                                            </div>
                                        </div>

                                        {desglose && desglose.total_clases > 0 && (
                                            <div className="flex flex-col gap-2 pt-3 border-t border-brand-border-soft">
                                                <span className="text-[8px] text-brand-muted uppercase font-black tracking-widest">
                                                    Clases en {historial.etiqueta_mes} · {desglose.total_clases}
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {desglose.clases.map((clase, j) => (
                                                        <span
                                                            key={`${clase.fecha}-${j}`}
                                                            title={clase.estado}
                                                            className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap ${getEstadoClaseBadge(clase.estado)}`}
                                                        >
                                                            {clase.fecha_label?.slice(0, 5)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {ciclo.fecha_vencimiento_pago && (
                                            <div className="flex items-start gap-1.5 pt-2 border-t border-dashed border-brand-border-soft" title="Fecha límite administrativa para pagar esta cuenta, no representa el fin de las clases">
                                                <Info size={10} className="text-slate-300 shrink-0 mt-0.5" />
                                                <span className="text-[8px] text-brand-muted font-bold uppercase tracking-widest break-words">
                                                    Plazo de pago: {formatearFecha(ciclo.fecha_vencimiento_pago)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState
                                className="text-center py-10 flex flex-col items-center justify-center opacity-60"
                                icon={CalendarClock}
                                iconSize={32}
                                iconClassName="text-slate-300 mb-2"
                                as="span"
                                message="Sin registros de ciclos"
                                messageClassName="text-[10px] font-bold text-brand-muted uppercase tracking-widest"
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CicloHistoryPanel;
