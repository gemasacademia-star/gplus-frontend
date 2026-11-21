import React, { useState } from 'react';
import { Plus, Trophy, Edit3, Trash2, ChevronRight } from 'lucide-react';
import AdminLevels from '../../components/Admin/AdminLevels';
import PageTitle from '../../components/shared/PageTitle';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';
import ConfirmModal from '../../components/shared/ConfirmModal';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { useFetch } from '../../hooks/useFetch';

const AdminLevelsManager = () => {
    const [view, setView] = useState('list');
    const [selectedNivel, setSelectedNivel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const {
        data: niveles,
        loading,
        refetch: fetchNiveles,
    } = useFetch(
        async () => {
            const response = await apiFetch.get(API_ROUTES.NIVELES.BASE);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Error al obtener niveles");
            return result.data || [];
        },
        [],
        { initialData: [], errorMessage: "No se pudieron cargar los niveles" }
    );

    const handleDelete = (id) => {
        setDeleteTargetId(id);
    };

    const executeDelete = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);

        const deletePromise = async () => {
            const response = await apiFetch.delete(API_ROUTES.NIVELES.BY_ID(id));
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Error al eliminar");
            fetchNiveles();
            return result.message || "Nivel eliminado correctamente";
        };

        toast.promise(deletePromise(), {
            loading: 'Procesando eliminación...',
            success: (msg) => <b>{msg}</b>,
            error: (err) => <b>{err.message}</b>,
        });
    };

    const handleEdit = (nivel) => {
        setSelectedNivel(nivel);
        setView('edit');
    };

    const filteredNiveles = Array.isArray(niveles)
        ? niveles.filter(n => n.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    if (view === 'create' || view === 'edit') {
        return <AdminLevels
            onBack={() => {
                setView('list');
                setSelectedNivel(null);
                fetchNiveles();
            }}
            initialData={selectedNivel}
        />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <PageTitle title="Gestión de" accent="Niveles" />
                <button onClick={() => setView('create')} className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-brand-accent transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Nuevo Nivel
                </button>
            </div>

            {/* Buscador */}
            <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="BUSCAR NIVEL..."
                wrapperClassName="relative group"
                className="w-full bg-brand-surface border border-brand-border rounded-2xl pl-12 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {loading ? (
                <LoadingSpinner className="flex justify-center p-20" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNiveles.map((nivel) => (
                        <div key={nivel.id} className="bg-brand-surface rounded-3xl border border-brand-border p-6 hover:shadow-xl transition-all group flex flex-col justify-between min-h-[160px]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-brand-primary-soft text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                    <Trophy size={24} />
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(nivel)}
                                        className="p-2 text-slate-300 hover:text-brand-primary transition-colors"
                                        title="Editar nombre"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(nivel.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Eliminar nivel"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="font-black text-slate-800 text-lg uppercase italic leading-tight">
                                        {nivel.nombre}
                                    </h3>
                                    {nivel.descripcion && (
                                        <p className="text-xs text-brand-muted mt-1.5 line-clamp-2">
                                            {nivel.descripcion}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight size={20} className="shrink-0 text-slate-200 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredNiveles.length === 0 && !loading && (
                <EmptyState message="No se encontraron niveles registrados" />
            )}

            <ConfirmModal
                isOpen={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeDelete}
                title="¿Confirmas la eliminación?"
                message="Esta acción no se puede deshacer."
                iconType="danger"
                confirmText="Eliminar Nivel"
            />
        </div>
    );
};

export default AdminLevelsManager;