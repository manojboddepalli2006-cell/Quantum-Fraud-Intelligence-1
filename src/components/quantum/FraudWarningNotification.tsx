/**
 * FraudWarningNotification Component
 * Subtle, non-modal floating warning notification for MEDIUM RISK transactions
 * (0.300 <= fraudScore < 0.700).
 *
 * Requirements:
 * - ⚠️ SUSPICIOUS TRANSACTION
 * - Fraud Score: 0.450 (normalized format)
 * - Risk Level: MEDIUM
 * - Prediction: Suspicious
 * - Message: This transaction requires additional verification.
 * - Non-blocking amber/yellow toast banner with auto-dismiss and manual dismiss.
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';

export interface FraudWarningData {
  transactionId: string;
  amount?: string;
  merchant?: string;
  fraudScore: number; // Normalized 0.000 - 1.000, e.g. 0.450
  riskLevel: string; // MEDIUM
  prediction: string; // Suspicious
}

interface FraudWarningNotificationProps {
  data: FraudWarningData | null;
  onDismiss: () => void;
  onReview?: () => void;
}

export const FraudWarningNotification: React.FC<FraudWarningNotificationProps> = ({
  data,
  onDismiss,
  onReview,
}) => {
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000);
    return () => clearTimeout(timer);
  }, [data, onDismiss]);

  if (!data) return null;

  return (
    <aside
      aria-label="Suspicious Transaction Warning"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#FFFDF9] border-2 border-[#C5A46D] rounded-2xl shadow-[0_12px_40px_rgba(74,48,36,0.18)] p-4 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFF9F0] text-[#B98252] shrink-0 border border-[#E8D2B5]">
            <AlertTriangle className="w-5 h-5 text-[#B98252]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B98252] bg-[#FFF9F0] px-2 py-0.5 rounded-md border border-[#E8D2B5]">
                ⚠️ SUSPICIOUS TRANSACTION
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#2E1E18] mt-1">
              Warning Notification
            </h4>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Close notification"
          className="text-[#8B6245] hover:text-[#2E1E18] p-1 rounded-lg hover:bg-[#F6EBDD] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row: Fraud Score, Risk Level, Prediction */}
      <div className="mt-3 pt-2.5 border-t border-[#E8D2B5]/60 grid grid-cols-3 gap-2 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#8B6245] block uppercase tracking-wider">Fraud Score</span>
          <span className="font-mono font-bold text-[#B98252] text-sm tabular-nums">
            {data.fraudScore.toFixed(3)}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-[#8B6245] block uppercase tracking-wider">Risk Level</span>
          <span className="font-mono font-bold text-[#B98252] text-sm">
            {data.riskLevel || 'MEDIUM'}
          </span>
        </div>

        <div className="space-y-0.5 text-right">
          <span className="text-[10px] text-[#8B6245] block uppercase tracking-wider">Prediction</span>
          <span className="font-mono font-bold text-[#4A3024] text-xs">
            {data.prediction || 'Suspicious'}
          </span>
        </div>
      </div>

      {/* Required Message */}
      <div className="mt-3 p-2.5 rounded-xl bg-[#FFF9F0] border border-[#E8D2B5]/70">
        <p className="text-xs font-semibold text-[#4A3024] leading-snug">
          This transaction requires additional verification.
        </p>
      </div>

      {/* Transaction ID & Optional Review Action */}
      <div className="mt-2.5 pt-2 border-t border-[#E8D2B5]/40 flex items-center justify-between text-[11px] text-[#8B6245]">
        <span className="font-mono">ID: {data.transactionId}</span>
        {onReview && (
          <button
            onClick={() => {
              onReview();
              onDismiss();
            }}
            className="inline-flex items-center gap-1 font-semibold text-[#B98252] hover:text-[#8B6245] transition-colors cursor-pointer"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </aside>
  );
};
