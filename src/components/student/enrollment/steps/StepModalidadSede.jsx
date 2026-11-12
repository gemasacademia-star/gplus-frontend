import React from 'react';
import { MapPin, CheckCircle2, Trash2 } from 'lucide-react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';
import ModalityChoice from '../modalidad/ModalityChoice';
import SedeSelector from '../sede/SedeSelector';
import NivelSelector from '../sede/NivelSelector';
import EmptyState from '../../../shared/EmptyState';

const Title = ({ children }) => (
  <h2 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-3 ml-2">{children}</h2>
);

const StepModalidadSede = ({ state, derived, actions }) => {
  const sedesElegidas = state.sedesElegidas || (state.sede ? [state.sede] : []);
  const nivelesPorSede = state.nivelesPorSede || {};
  const nivelesOpciones = derived.nivelesPorSedeOpciones || {};
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <section>
        <h2 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter leading-none mb-6">
          ¿Qué modalidad <span className="text-brand-accent">buscas?</span>
        </h2>
        <ModalityChoice value={state.modalidad} onChange={actions.setModalidad} />
      </section>
      {state.modalidad && (
        <section>
          <Title>1. ¿Dónde quieres entrenar?</Title>
          <SedeSelector
            sedes={derived.sedes}
            selectedSedes={sedesElegidas}
            allowMultiSede={state.modalidad === MODALIDAD.MENSUAL}
            esMultiSede={state.esMultiSede}
            onChangeModoSede={actions.setModoSede}
            onSelect={actions.setSede}
          />
        </section>
      )}

      {sedesElegidas.length === 1 && !state.esMultiSede && (
        <section>
          <Title>2. ¿Qué nivel en {sedesElegidas[0]}?</Title>
          {(nivelesOpciones[sedesElegidas[0]] || derived.niveles).length === 0 ? (
            <EmptyState message="Esta sede no tiene niveles disponibles." />
          ) : (
            <NivelSelector
              niveles={nivelesOpciones[sedesElegidas[0]] || derived.niveles}
              activeId={nivelesPorSede[sedesElegidas[0]] ?? state.nivelId}
              onSelect={(nivelId) => actions.setNivel(nivelId, sedesElegidas[0])}
            />
          )}
        </section>
      )}

      {sedesElegidas.length >= 1 && state.esMultiSede && (
        <section className="space-y-4">
          <Title>2. Elige el nivel para cada sede seleccionada</Title>
          <div className="space-y-4">
            {sedesElegidas.map((sedeNombre) => {
              const opciones = nivelesOpciones[sedeNombre] || [];
              const nivelElegidoId = nivelesPorSede[sedeNombre] ?? null;
              const tieneNivel = Boolean(nivelElegidoId);

              return (
                <div
                  key={sedeNombre}
                  className={`p-5 rounded-[2rem] border-2 transition-all ${tieneNivel
                    ? 'bg-brand-surface border-brand-primary/60 shadow-sm'
                    : 'bg-brand-surface border-brand-accent/60 shadow-sm'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-brand-primary" />
                      <span className="text-xs sm:text-sm font-black uppercase italic text-brand-primary">
                        Sede {sedeNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${tieneNivel
                          ? 'bg-green-100 text-green-700'
                          : 'bg-brand-accent-soft text-brand-accent-dark'
                          }`}
                      >
                        {tieneNivel && <CheckCircle2 size={11} />}
                        <span>{tieneNivel ? 'Nivel elegido' : 'Elige un nivel'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => actions.setSede(sedeNombre)}
                        title={`Quitar sede ${sedeNombre}`}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {opciones.length === 0 ? (
                    <EmptyState message="Esta sede no tiene niveles disponibles." />
                  ) : (
                    <NivelSelector
                      niveles={opciones}
                      activeId={nivelElegidoId}
                      onSelect={(nivelId) => actions.setNivel(nivelId, sedeNombre)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default StepModalidadSede;
