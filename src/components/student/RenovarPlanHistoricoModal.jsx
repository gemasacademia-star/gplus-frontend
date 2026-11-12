import React, { useState, useMemo } from 'react';
import { Zap, Loader2, AlertTriangle, X, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import Modal from '../shared/Modal';
import { formatBrandingText } from '../../utils/formatBrandingText';

const DIAS = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

const etiqueta = (h) =>
  `${DIAS[h.dia_semana] || '?'} ${String(h.hora_inicio).slice(0, 5)}-${String(h.hora_fin).slice(0, 5)} · ${formatBrandingText(h.cancha?.sede?.nombre || '')}`;

const RenovarPlanHistoricoModal = ({ plan, alumnoId, onClose, onSuccess }) => {
  const original = plan.horarios || [];
  const alternativos = plan.horarios_alternativos || [];
  const [seleccion, setSeleccion] = useState(original.map(h => h.id));
  const [saving, setSaving] = useState(false);

  const opcionesOrdenadas = useMemo(
    () => [...alternativos].sort((a, b) => Number(!!b.mismo_dia) - Number(!!a.mismo_dia)),
    [alternativos]
  );

  const duplicados = new Set(seleccion).size !== seleccion.length;
  const cambiado = seleccion.some((id, i) => id !== original[i]?.id);
  const sinVigente = !plan.concepto_vigente;
  const puedeConfirmar = !sinVigente && !duplicados && seleccion.length === original.length && !saving;

  const cambiarSlot = (idx, nuevoId) => {
    setSeleccion(prev => prev.map((id, i) => (i === idx ? Number(nuevoId) : id)));
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const body = {};
      if (cambiado) body.horario_ids = seleccion;
      const res = await apiFetch.post(API_ROUTES.INSCRIPCIONES.RENOVAR_HISTORICO(alumnoId, plan.cuenta_id), body);
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Renovación creada. Paga para activar.');
        onSuccess();
      } else {
        toast.error(json.message || json.error || 'No se pudo renovar');
      }
    } catch (e) {
      console.error('Error renovando plan histórico:', e);
      toast.error('Error de red');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      overlayClassName="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-brand-primary-dark/90 backdrop-blur-md"
      boxClassName="bg-brand-surface w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-brand-border-soft"
    >
      <div className="p-8 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center"><Zap size={22} fill="white" /></div>
            <div>
              <h3 className="text-lg font-black uppercase italic text-brand-primary leading-tight">Renovar plan</h3>
              <p className="text-[10px] font-bold text-brand-muted uppercase">{plan.concepto?.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-primary"><X size={18} /></button>
        </div>

        {sinVigente ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-2 text-[11px] font-bold text-orange-700">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Este plan ya no existe en el catálogo vigente, por eso no se puede renovar.</span>
          </div>
        ) : (
          <div className="bg-brand-bg rounded-2xl p-4 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-brand-muted">Precio de tu plan</span>
            <span className="text-lg font-black text-brand-primary">S/ {Number(plan.concepto_vigente.precio_base).toFixed(2)}</span>
          </div>
        )}

        <div className="space-y-3">
          {original.map((h, idx) => {
            const noDisp = h.disponible === false;
            return (
              <div key={h.id} className={`rounded-2xl p-4 border-2 ${noDisp ? 'border-orange-200 bg-orange-50' : 'border-brand-border-soft bg-brand-bg'}`}>
                <p className="text-[11px] font-black text-brand-primary uppercase flex items-center gap-2">
                  <Clock size={12} className="text-brand-accent" /> {etiqueta(h)}
                </p>
                {noDisp && (
                  <>
                    <p className="text-[10px] font-bold text-orange-700 mt-1">{h.motivo_no_disponible || 'Horario no disponible'}</p>
                    <select
                      value={seleccion[idx]}
                      onChange={(e) => cambiarSlot(idx, e.target.value)}
                      className="mt-2 w-full bg-brand-surface border-2 border-brand-border-soft rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-brand-accent"
                    >
                      <option value={h.id} disabled>Elige un horario alternativo</option>
                      {opcionesOrdenadas.map(a => (
                        <option key={a.id} value={a.id}>{a.mismo_dia ? '★ ' : ''}{etiqueta(a)}</option>
                      ))}
                    </select>
                    {opcionesOrdenadas.length === 0 && <p className="text-[10px] font-bold text-red-600 mt-1">No hay alternativas con cupo.</p>}
                  </>
                )}
                {!noDisp && h.cancha?.sede?.nombre && (
                  <p className="text-[10px] font-bold text-brand-muted mt-1 flex items-center gap-1"><MapPin size={10} /> {formatBrandingText(h.cancha.sede.nombre)}</p>
                )}
              </div>
            );
          })}
          {duplicados && <p className="text-[10px] font-bold text-red-600">No puedes repetir un mismo horario.</p>}
          {seleccion.some(id => original.find(h => h.id === id)?.disponible === false) && (
            <p className="text-[10px] font-bold text-red-600">Reemplaza los horarios no disponibles para continuar.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="py-3 rounded-2xl text-[10px] font-black uppercase text-brand-muted bg-brand-bg">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!puedeConfirmar || seleccion.some(id => original.find(h => h.id === id)?.disponible === false)}
            className="py-3 rounded-2xl text-[10px] font-black uppercase italic bg-brand-accent text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={14} />} Confirmar renovación
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RenovarPlanHistoricoModal;
