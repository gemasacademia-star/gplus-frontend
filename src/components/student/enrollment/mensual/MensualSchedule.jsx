import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useFetch } from '../../../../hooks/useFetch';
import { enrollmentService } from '../../../../services/enrollment.service';
import { buildCyclePreview } from '../../../../utils/enrollmentCycle';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import EmptyState from '../../../shared/EmptyState';
import StudentEnrollmentGroup from '../../StudentEnrollmentGroup';
import StartDateChoice from './StartDateChoice';
import CyclePreview from './CyclePreview';

const SectionTitle = ({ n, children }) => (
  <h2 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-4 ml-2">{n}. {children}</h2>
);

const MensualSchedule = ({ userId, bloques, horariosElegidos, mensual, feriados, onToggle, onSelectInicio }) => {
  // useFetch pide deps primitivas: la lista de ids se serializa.
  const idsKey = [...mensual.horarioIds].sort((a, b) => a - b).join(',');

  const { data: previewData, loading: loadingFechas } = useFetch(
    () => (idsKey ? enrollmentService.previsualizarFechas(userId, mensual.horarioIds) : null),
    [userId, idsKey],
    { errorMessage: 'No se pudieron calcular las fechas de inicio' }
  );

  const [sedeFiltro, setSedeFiltro] = useState('TODAS');

  const sedesEnBloques = useMemo(
    () => [...new Set(bloques.map((b) => b.sede).filter(Boolean))],
    [bloques]
  );
  const bloquesVisibles = useMemo(
    () =>
      sedeFiltro === 'TODAS' || !sedesEnBloques.includes(sedeFiltro)
        ? bloques
        : bloques.filter((b) => b.sede === sedeFiltro),
    [bloques, sedeFiltro, sedesEnBloques]
  );

  const ciclo = useMemo(() => buildCyclePreview({
    fechaInicio: mensual.fechaInicio,
    diasSemana: horariosElegidos.map(h => h.dia_semana),
    feriados,
  }), [mensual.fechaInicio, horariosElegidos, feriados]);

  if (bloques.length === 0) return <EmptyState message="No hay horarios activos para esta sede y nivel." />;

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionTitle n={1}>
            {sedesEnBloques.length > 1
              ? `Elige tus días (Combinando ${sedesEnBloques.join(' + ')})`
              : 'Elige tus días'}
          </SectionTitle>

          {sedesEnBloques.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2 sm:mb-0">
              <button
                type="button"
                onClick={() => setSedeFiltro('TODAS')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all cursor-pointer ${sedeFiltro === 'TODAS'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-surface border border-brand-border-soft text-brand-muted hover:text-brand-primary'
                  }`}
              >
                Todas ({bloques.length})
              </button>
              {sedesEnBloques.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSedeFiltro(s)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all cursor-pointer ${sedeFiltro === s
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-brand-surface border border-brand-border-soft text-brand-muted hover:text-brand-primary'
                    }`}
                >
                  <MapPin size={10} className="text-brand-accent" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          {bloquesVisibles.map(grupo => (
            <StudentEnrollmentGroup key={grupo.key} group={grupo} selectedIds={mensual.horarioIds} onToggle={onToggle} />
          ))}
        </div>
      </section>

      {mensual.horarioIds.length > 0 && (
        <section>
          <SectionTitle n={2}>¿Cuándo empiezas?</SectionTitle>
          {loadingFechas || !previewData
            ? <LoadingSpinner className="flex justify-center py-10" />
            : <StartDateChoice previewData={previewData} selectedDate={mensual.fechaInicio} onSelect={onSelectInicio} />}
        </section>
      )}

      {ciclo.length > 0 && (
        <section>
          <SectionTitle n={3}>Así queda tu ciclo</SectionTitle>
          <CyclePreview fechas={ciclo} />
        </section>
      )}
    </div>
  );
};

export default MensualSchedule;
