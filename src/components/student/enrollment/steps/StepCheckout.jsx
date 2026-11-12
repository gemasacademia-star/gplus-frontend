import React from 'react';
import { AlertTriangle, PackageX } from 'lucide-react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';
import { cartLines, withQty } from '../../../../utils/merchCart';
import MerchAddOnsSlider from '../../../merch/MerchAddOnsSlider';
import MerchOptIn from '../../../merch/MerchOptIn';
import PickupSedeSelect from '../../../merch/PickupSedeSelect';
import EnrollmentSummary from '../EnrollmentSummary';

const StepCheckout = ({
  state, derived, extras, onExtrasChange, catalogoMerch, merchDisponible, ownedMerchCounts, sedes, sedeRecojoId,
  precioBase, beneficios, submitError, onBack, merchAgotado, submitting, onContinuarSinMerch, onRevisarMerch,
}) => {
  const esMensual = state.modalidad === MODALIDAD.MENSUAL;
  const nivelNombre = derived.niveles.find(n => n.id === state.nivelId)?.nombre;
  const horarioUnico = derived.horariosFiltrados.find(h => h.id === state.unica.horarioId);

  // El merch es opcional en ambas modalidades: sin stock no se muestra nada, y con stock
  // solo cuenta si el alumno dijo "Sí". El TOTAL del resumen = precioBase + suma de estos extras.
  const quiereMerch = merchDisponible && extras.quiereMerch === true;
  const extrasElegidos = quiereMerch
    ? cartLines(catalogoMerch, extras.merchQty).map(({ item, qty, subtotal }) => ({
      label: qty > 1 ? `${item.nombre} × ${qty}` : item.nombre,
      price: subtotal,
    }))
    : [];

  const esMerchSeleccionado = extrasElegidos.length > 0;

  const changeQty = (id, qty) => onExtrasChange({ ...extras, merchQty: withQty(extras.merchQty, id, qty) });

  // "No, gracias" descarta lo ya elegido para que nada de merch viaje en el payload.
  const changeOptIn = (quiere) => onExtrasChange(
    quiere ? { ...extras, quiereMerch: true } : { quiereMerch: false, merchQty: {}, sedeId: null }
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter leading-none">
        Confirma tu <span className="text-brand-accent">matrícula</span>
      </h2>

      {submitError && (
        <div role="alert" className="flex items-start gap-4 bg-brand-accent-soft border-2 border-brand-accent rounded-[2rem] p-5">
          <AlertTriangle size={22} className="text-brand-accent-dark shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs font-black text-brand-primary uppercase italic">No pudimos reservar tu lugar</p>
            <p className="text-[11px] font-bold text-slate-600">{submitError}</p>
            <button
              type="button"
              onClick={onBack}
              className="text-[10px] font-black text-brand-accent-dark uppercase italic tracking-widest underline"
            >
              {esMensual ? 'Revisar mis horarios' : 'Elegir otra fecha'}
            </button>
          </div>
        </div>
      )}

      {merchAgotado && (
        <div role="alert" className="flex items-start gap-4 bg-brand-accent-soft border-2 border-brand-accent rounded-[2rem] p-5">
          <PackageX size={22} className="text-brand-accent-dark shrink-0 mt-0.5" />
          <div className="space-y-3">
            <p className="text-xs font-black text-brand-primary uppercase italic">Lo sentimos, el stock se agotó durante tu compra</p>
            <p className="text-[11px] font-bold text-slate-600">
              Tu matrícula no se vio afectada: puedes continuar solo con ella o revisar los artículos que aún quedan.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <button
                type="button"
                onClick={onContinuarSinMerch}
                disabled={submitting}
                className="text-[10px] font-black text-brand-accent-dark uppercase italic tracking-widest underline disabled:opacity-50"
              >
                Continuar solo con mi matrícula
              </button>
              <button
                type="button"
                onClick={onRevisarMerch}
                disabled={submitting}
                className="text-[10px] font-black text-brand-primary uppercase italic tracking-widest underline disabled:opacity-50"
              >
                Revisar artículos
              </button>
            </div>
          </div>
        </div>
      )}

      <EnrollmentSummary
        modalidad={state.modalidad}
        sede={state.sede}
        nivelNombre={nivelNombre}
        horarios={derived.horariosElegidos}
        fechaInicio={state.mensual.fechaInicio}
        fechaUnica={state.unica.fecha}
        horarioUnico={horarioUnico}
        precioBase={precioBase}
        beneficios={beneficios}
        extras={extrasElegidos}
      />

      {merchDisponible && (
        <>
          <MerchOptIn value={extras.quiereMerch} onChange={changeOptIn} />

          {quiereMerch && (
            <MerchAddOnsSlider
              items={catalogoMerch}
              quantities={extras.merchQty}
              onQtyChange={changeQty}
              ownedCounts={ownedMerchCounts}
            />
          )}

          {/* La sede de recojo solo importa si se eligió algún producto */}
          {esMerchSeleccionado && (
            <PickupSedeSelect
              sedes={sedes}
              value={sedeRecojoId}
              onChange={(sedeId) => onExtrasChange({ ...extras, sedeId })}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StepCheckout;
