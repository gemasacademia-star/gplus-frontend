import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { enrollmentService } from '../../services/enrollment.service';

import EnrollmentStepper from '../../components/student/enrollment/EnrollmentStepper';
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";
import { COMPANY_NAME } from '../../config/branding';
import { beneficioService } from '../../services/beneficio.service';

const Enrollment = () => {
  const { userId } = useAuth();

  // Al terminar una matrícula se cambia la key para remontar el asistente vacío.
  const [stepperKey, setStepperKey] = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState(null);

  const { data: pendingPayment, refetch: refetchDeuda } = useFetch(
    () => (userId ? enrollmentService.deudaPendiente(userId) : null),
    [userId],
    { errorMessage: `Error de sincronización ${COMPANY_NAME}` }
  );
  const { data: beneficios, refetch: recargarBeneficios } = useFetch(
    async () => await beneficioService.getBeneficios(userId) || [],
    [userId],
    { initialData: [] }
  );

  const handleOpenPayment = (debt) => {
    setSelectedDebtForPay(debt);
    setIsPayModalOpen(true);
  };

  const handleEnrolled = () => {
    refetchDeuda();
    setStepperKey(k => k + 1);
  };

  return (
    <div className="relative min-h-screen bg-brand-bg">

      {/* 🚨 ZONA DE ALERTA CRÍTICA (BANNER SUPERIOR STICKY) */}
      {pendingPayment && (
        <div className="w-full bg-brand-primary-dark py-4 border-b-4 border-brand-accent shadow-2xl sticky top-0 z-[200] animate-in slide-in-from-top duration-500">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-brand-accent p-1.5 rounded-lg animate-pulse">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <p className="text-[11px] font-black text-brand-accent uppercase italic tracking-[0.3em]">Acción Administrativa Requerida</p>
            </div>
            <OutstandingDebtAlert
              pendingPayment={pendingPayment}
              onRefresh={() => { refetchDeuda(); recargarBeneficios() }}
              onPay={handleOpenPayment}
            />
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="px-4 md:px-8 transition-all duration-700">
        <div className="max-w-6xl mx-auto py-8">
          <header className="mb-8">
            <Link to="/dashboard/student" className="inline-flex items-center gap-1 text-brand-muted hover:text-brand-primary mb-4 text-[10px] font-black uppercase italic tracking-widest transition-colors">
              <ArrowLeft size={12} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-6xl font-black text-brand-primary italic uppercase tracking-tighter leading-none">
              Matrícula <span className="text-brand-accent">{COMPANY_NAME}</span>
            </h1>
          </header>

          <EnrollmentStepper key={stepperKey} userId={userId} onSuccess={handleEnrolled} beneficios={beneficios} />
        </div>
      </div>

      {/* MODAL DE PAGO (Z-INDEX 1000) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[1000]">
          <ReportPaymentModal
            isOpen={isPayModalOpen}
            onClose={() => setIsPayModalOpen(false)}
            debt={selectedDebtForPay}
            monto={selectedDebtForPay?.saldoRestante ?? selectedDebtForPay?.monto_final}
            onSuccess={() => { setIsPayModalOpen(false); refetchDeuda(); }}
          />
        </div>
      )}
    </div>
  );
};

export default Enrollment;
