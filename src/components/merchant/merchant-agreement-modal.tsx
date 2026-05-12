"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MerchantAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  hasAgreed: boolean;
}

export function MerchantAgreementModal({
  isOpen,
  onClose,
  onAgree,
  hasAgreed,
}: MerchantAgreementModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Merchant Partner Agreement
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-6 text-slate-700 space-y-4"
          >
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                1. Partnership Agreement
              </h3>
              <p className="text-sm leading-relaxed">
                By submitting this application, you agree to become a merchant partner with SLYDE. This agreement governs the relationship between you (the "Merchant") and SLYDE Network Inc. ("SLYDE"), and outlines the terms and conditions for using our delivery and logistics platform.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                2. Service Terms
              </h3>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>You agree to operate your business in compliance with all applicable local, state, and federal laws.</li>
                <li>You will maintain accurate business information and update it as needed.</li>
                <li>You will provide accurate product/service details and pricing to customers through SLYDE.</li>
                <li>You will fulfill orders within agreed-upon timeframes and maintain quality standards.</li>
                <li>You will be responsible for all taxes, licenses, and permits required for your operations.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                3. Fees and Payments
              </h3>
              <p className="text-sm leading-relaxed">
                You understand that SLYDE operates on a commission-based model. Transaction fees, commission rates, and any applicable charges will be disclosed separately. You agree to accept these terms for the tier you select. During the promotional 60-day free trial period, no commissions or fees will apply.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                4. Liability and Insurance
              </h3>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>SLYDE is not liable for lost, damaged, or stolen goods during transit unless explicitly covered by supplemental insurance.</li>
                <li>You are responsible for maintaining appropriate business liability insurance.</li>
                <li>You agree to indemnify SLYDE against claims arising from your products, services, or conduct.</li>
                <li>SLYDE's liability is limited to the total fees paid in the preceding 12 months.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                5. Intellectual Property
              </h3>
              <p className="text-sm leading-relaxed">
                You retain ownership of your business name, logos, and product images. By submitting them to SLYDE, you grant SLYDE a non-exclusive, worldwide license to use these materials for operational and marketing purposes related to this partnership.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                6. Data and Privacy
              </h3>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside">
                <li>SLYDE will collect and process data necessary for operations, analytics, and fraud prevention.</li>
                <li>All personal and business data will be handled in compliance with applicable data protection regulations.</li>
                <li>You authorize SLYDE to share information with payment processors, logistics partners, and regulatory authorities as required.</li>
                <li>See our Privacy Policy for complete details on data handling practices.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                7. Conduct and Compliance
              </h3>
              <p className="text-sm leading-relaxed">
                You agree not to engage in fraudulent activities, sell prohibited items, violate intellectual property rights, or conduct any illegal operations. SLYDE reserves the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                8. Account Termination
              </h3>
              <p className="text-sm leading-relaxed">
                Either party may terminate this agreement with written notice. SLYDE may immediately terminate accounts for fraud, security violations, or breach of terms. Upon termination, you must settle any outstanding balances within 30 days.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                9. Dispute Resolution
              </h3>
              <p className="text-sm leading-relaxed">
                Disputes will be resolved through good-faith negotiation, mediation, or binding arbitration as outlined in our terms of service. You agree that claims must be filed within one year of the incident.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                10. Modifications
              </h3>
              <p className="text-sm leading-relaxed">
                SLYDE reserves the right to modify these terms with 30 days' notice. Continued use of the platform constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">
                📋 Key Acknowledgments
              </h3>
              <ul className="text-sm leading-relaxed space-y-2 list-disc list-inside text-blue-900">
                <li>I understand the terms and conditions of this partnership.</li>
                <li>I confirm that all information provided is accurate and truthful.</li>
                <li>I agree to comply with all applicable laws and regulations.</li>
                <li>I understand the fee structure and commission rates for my selected tier.</li>
                <li>I accept responsibility for my products, services, and customer satisfaction.</li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Decline
            </button>
            <button
              onClick={onAgree}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              I Agree to These Terms
            </button>
          </div>

          {/* Signed Status */}
          {hasAgreed && (
            <div className="px-6 py-2 bg-emerald-50 border-t border-emerald-200 text-center text-sm font-medium text-emerald-700">
              ✓ Agreement Signed - Ready to Submit
            </div>
          )}
        </div>
      </div>
    </>
  );
}
