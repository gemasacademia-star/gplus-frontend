import React, { useState } from 'react';
import { Save, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { metodoPagoService } from '../../services/metodoPago.service';

const AdminPaymentMethodForm = ({ onBack, initialData }) => {
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    activo: initialData?.activo ?? true,
    titular: initialData?.titular || '',
    numero_telefono: initialData?.numero_telefono || '',
    banco: initialData?.banco || '',
    numero_cuenta: initialData?.numero_cuenta || '',
    cci: initialData?.cci || '',
    detalle_instrucciones: initialData?.detalle_instrucciones || '',
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return toast.error('El nombre del método de pago es obligatorio');
    }

    setLoading(true);
    const payload = {
      nombre: formData.nombre.trim().toUpperCase(),
      activo: Boolean(formData.activo),
      titular: formData.titular.trim() || null,
      numero_telefono: formData.numero_telefono.trim() || null,
      banco: formData.banco.trim() || null,
      numero_cuenta: formData.numero_cuenta.trim() || null,
      cci: formData.cci.trim() || null,
      detalle_instrucciones: formData.detalle_instrucciones.trim() || null,
    };

    try {
      if (isEdit) {
        await metodoPagoService.update(initialData.id, payload);
        toast.success('¡Método de pago actualizado!');
      } else {
        await metodoPagoService.create(payload);
        toast.success('¡Método de pago creado exitosamente!');
      }
      onBack();
    } catch (error) {
      toast.error(error.message || 'Error al guardar método de pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up p-1 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-center hover:text-brand-accent transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-brand-heading uppercase">
            {isEdit ? 'Editar' : 'Nuevo'}{' '}
            <span className="text-brand-primary">Método de Pago</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-brand-primary-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isEdit ? 'ACTUALIZAR' : 'REGISTRAR'}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-brand-surface rounded-3xl border border-brand-border overflow-hidden shadow-sm"
      >
        <div className="p-6 border-b border-brand-border-soft bg-brand-bg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="text-brand-primary" size={20} />
            <span className="font-black text-slate-800 text-xs uppercase">
              Configuración del Método
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={handleChange('activo')}
              className="w-4 h-4 accent-brand-primary rounded"
            />
            <span className="text-xs font-black uppercase text-slate-700">Activo</span>
          </label>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                Nombre *
              </label>
              <input
                value={formData.nombre}
                onChange={handleChange('nombre')}
                maxLength={50}
                placeholder="Ej: YAPE, PLIN, TRANSFERENCIA"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                Titular
              </label>
              <input
                value={formData.titular}
                onChange={handleChange('titular')}
                maxLength={150}
                placeholder="Ej: Academia Gema Voley S.A.C."
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                Número de Teléfono (Yape / Plin)
              </label>
              <input
                value={formData.numero_telefono}
                onChange={handleChange('numero_telefono')}
                maxLength={30}
                placeholder="Ej: 999 888 777"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                Banco
              </label>
              <input
                value={formData.banco}
                onChange={handleChange('banco')}
                maxLength={80}
                placeholder="Ej: BCP, Interbank, BBVA"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                Número de Cuenta
              </label>
              <input
                value={formData.numero_cuenta}
                onChange={handleChange('numero_cuenta')}
                maxLength={50}
                placeholder="Ej: 193-12345678-0-12"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-muted uppercase">
                CCI
              </label>
              <input
                value={formData.cci}
                onChange={handleChange('cci')}
                maxLength={50}
                placeholder="Ej: 002-193-001234567812-15"
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-brand-muted uppercase">
              Detalle / Instrucciones para el Alumno
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={formData.detalle_instrucciones}
              onChange={handleChange('detalle_instrucciones')}
              placeholder="Ej: Yapea al número indicado y adjunta la captura del comprobante."
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminPaymentMethodForm;
