import React, { useState } from 'react';
import { Plus, CreditCard, Edit3, Trash2, Phone, Landmark, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTitle from '../../components/shared/PageTitle';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal';
import AdminPaymentMethodForm from '../../components/Admin/AdminPaymentMethodForm';
import { useFetch } from '../../hooks/useFetch';
import { metodoPagoService } from '../../services/metodoPago.service';

const AdminPaymentMethodsManager = () => {
  const [view, setView] = useState('list');
  const [selectedMetodo, setSelectedMetodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const {
    data: metodos,
    loading,
    refetch: fetchMetodos,
  } = useFetch(
    () => metodoPagoService.getAllAdmin(),
    [],
    { initialData: [], errorMessage: 'No se pudieron cargar los métodos de pago' }
  );

  const executeDelete = async () => {
    const id = deleteTargetId;
    setDeleteTargetId(null);

    toast.promise(
      metodoPagoService.remove(id).then(() => {
        fetchMetodos();
        return 'Método de pago eliminado correctamente';
      }),
      {
        loading: 'Procesando eliminación...',
        success: (msg) => <b>{msg}</b>,
        error: (err) => <b>{err.message || 'No se pudo eliminar'}</b>,
      }
    );
  };

  const handleEdit = (metodo) => {
    setSelectedMetodo(metodo);
    setView('edit');
  };

  const filteredMetodos = Array.isArray(metodos)
    ? metodos.filter((m) => {
        const term = searchTerm.toLowerCase();
        return (
          m.nombre?.toLowerCase().includes(term) ||
          m.titular?.toLowerCase().includes(term) ||
          m.banco?.toLowerCase().includes(term)
        );
      })
    : [];

  if (view === 'create' || view === 'edit') {
    return (
      <AdminPaymentMethodForm
        initialData={selectedMetodo}
        onBack={() => {
          setView('list');
          setSelectedMetodo(null);
          fetchMetodos();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up p-1 pb-20">
      <div className="flex justify-between items-center gap-4">
        <PageTitle title="Gestión de" accent="Métodos de Pago" />
        <button
          onClick={() => setView('create')}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-brand-accent transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nuevo Método
        </button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="BUSCAR MÉTODO, TITULAR O BANCO..."
        wrapperClassName="relative group"
        className="w-full bg-brand-surface border border-brand-border rounded-2xl pl-12 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
      />

      {loading ? (
        <LoadingSpinner className="flex justify-center p-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMetodos.map((metodo) => (
            <div
              key={metodo.id}
              className="bg-brand-surface rounded-3xl border border-brand-border p-6 hover:shadow-xl transition-all group flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-primary-soft text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                      <CreditCard size={22} />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        metodo.activo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {metodo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(metodo)}
                      className="p-2 text-slate-300 hover:text-brand-primary transition-colors"
                      title="Editar método"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(metodo.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      title="Eliminar método"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-slate-800 text-lg uppercase italic leading-tight mb-3">
                  {metodo.nombre}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {metodo.titular && (
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-brand-muted shrink-0" />
                      <span className="truncate font-semibold">{metodo.titular}</span>
                    </div>
                  )}
                  {metodo.numero_telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-brand-muted shrink-0" />
                      <span className="font-mono font-bold">{metodo.numero_telefono}</span>
                    </div>
                  )}
                  {(metodo.banco || metodo.numero_cuenta) && (
                    <div className="flex items-center gap-2">
                      <Landmark size={13} className="text-brand-muted shrink-0" />
                      <span className="truncate font-mono">
                        {[metodo.banco, metodo.numero_cuenta].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  )}
                  {metodo.cci && (
                    <div className="text-[11px] font-mono text-brand-muted pl-5 truncate">
                      CCI: {metodo.cci}
                    </div>
                  )}
                  {metodo.detalle_instrucciones && (
                    <div className="flex items-start gap-2 pt-1 text-[11px] text-brand-muted">
                      <FileText size={13} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{metodo.detalle_instrucciones}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMetodos.length === 0 && !loading && (
        <EmptyState message="No se encontraron métodos de pago registrados" />
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="¿Confirmas la eliminación?"
        message="Si este método tiene pagos o movimientos asociados, no podrá eliminarse."
        iconType="danger"
        confirmText="Eliminar Método"
      />
    </div>
  );
};

export default AdminPaymentMethodsManager;
