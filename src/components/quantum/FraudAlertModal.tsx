/**
 * FraudAlertModal Component
 * Premium Cyber-Futuristic & Luxury Fintech Real-Time Fraud Alert Popup.
 *
 * Triggered automatically when transaction analysis yields:
 * - fraudScore >= 0.700:
 *     Prominent animated high-risk modal with quantum pulse, glowing red accent,
 *     detailed transaction breakdown, risk factor badges, and actionable buttons:
 *     1. Block Transaction (flags as BLOCKED)
 *     2. Flag for Manual Review (flags as UNDER_REVIEW)
 *     3. Override & Clear (Supervisor / Auth) (flags as CLEARED)
 *     4. Close / Dismiss (X) and ESC key support.
 *
 * Visual style strictly matches the Quantum Evaluation Verdict card and Q-FraudX warm cream theme.
 */

import React, { useEffect } from 'react';
import {
  AlertOctagon,
  X,
  Lock,
  CheckCircle2,
  MapPin,
  Store,
  DollarSign,
  Clock,
  Hash,
  Activity,
  Layers,
  FileSearch,
  Flame,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface FraudAlertData {
  transactionId: string;
  amount?: string;
  merchant?: string;
  location?: string;
  timestamp: string;
  fraudScore: number; // Normalized 0.000 – 1.000, e.g. 0.850
  riskLevel: string; // HIGH
  prediction: string; // Fraud
  statusText: string; // Transaction Flagged for Review
  reasons?: string[];
  quantumDepth?: number;
}

interface FraudAlertModalProps {
  isOpen: boolean;
  data: FraudAlertData | null;
  onDismiss: () => void;
  onBlock: (transactionId: string) => void;
  onManualReview: (transactionId: string) => void;
  onOverrideClear: (transactionId: string) => void;
}

export const FraudAlertModal: React.FC<FraudAlertModalProps> = ({
  isOpen,
  data,
  onDismiss,
  onBlock,
  onManualReview,
  onOverrideClear,
}) => {
  // ESC key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onDismiss();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen || !data) return null;

  // Normalized score (0.000 - 1.000)
  const normalizedScore = data.fraudScore;
  const scoreFormatted = normalizedScore.toFixed(3);
  const percentFilled = Math.min(100, Math.max(0, Math.round(normalizedScore * 100)));

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="fraud-alert-title"
      aria-describedby="fraud-alert-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop with Warm Chocolate / Crimson Blur */}
      <div
        className="fixed inset-0 bg-[#2E1E18]/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Cyber-Futuristic Modal Container with Red Neon Glow */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] border-2 border-[#B83A2E] rounded-3xl shadow-[0_20px_70px_rgba(184,58,46,0.3),0_8px_24px_rgba(46,30,24,0.35)] z-10 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Subtle Ambient Red Glow Bar at Top */}
        <div className="h-2 w-full bg-gradient-to-r from-[#B83A2E] via-[#DFB878] to-[#B83A2E] animate-pulse" />

        {/* Modal Top Header with Glowing Icon & Live Status */}
        <div className="p-6 sm:p-7 bg-gradient-to-b from-[#FAECE8]/95 to-[#FFFDF9] border-b border-[#E8D2B5]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Pulsing Warning Icon */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#B83A2E] text-white shadow-[0_0_24px_rgba(184,58,46,0.5)]">
                <span className="absolute -inset-1 rounded-2xl border-2 border-[#B83A2E] opacity-50 animate-ping pointer-events-none" />
                <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#B83A2E] text-white">
                    🚨 FRAUD ALERT
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B83A2E] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B83A2E]" />
                  </span>
                </div>
                <h2
                  id="fraud-alert-title"
                  className="text-xl sm:text-2xl font-serif font-bold text-[#2E1E18] tracking-tight mt-1"
                >
                  High-Risk Transaction Detected
                </h2>
              </div>
            </div>

            {/* Close / Dismiss (X) button */}
            <button
              onClick={onDismiss}
              aria-label="Close fraud alert modal"
              className="p-1.5 text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p
            id="fraud-alert-description"
            className="mt-2 text-xs text-[#8B6245] leading-relaxed max-w-md"
          >
            Authoritative evaluation returned by FastAPI (/predict) exceeded the 0.700 safety threshold. Review indicators and execute mitigation action below.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Key Metric Hero Grid - Perfectly aligned with Quantum Verdict Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Fraud Score with Ring Indicator */}
            <div className="p-3.5 rounded-2xl bg-[#FAECE8] border border-[#B83A2E]/30 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B83A2E]">
                Fraud Score
              </span>
              
              <div className="mt-1 relative flex items-center justify-center w-14 h-14">
                {/* SVG Progress Ring */}
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E8D2B5]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#B83A2E]"
                    strokeDasharray={`${percentFilled}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#B83A2E]">
                  {percentFilled}%
                </div>
              </div>

              <span className="text-base font-mono font-extrabold text-[#B83A2E] tabular-nums mt-0.5">
                {scoreFormatted}
              </span>
              <span className="text-[9px] text-[#8B6245] font-mono">0.000 – 1.000</span>
            </div>

            {/* 2. Risk Level */}
            <div className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#E8D2B5] text-center flex flex-col justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B6245]">
                Risk Level
              </span>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B83A2E] animate-pulse" />
                <span className="text-base sm:text-lg font-bold font-mono text-[#B83A2E]">
                  HIGH
                </span>
              </div>
              <span className="text-[10px] text-[#8B6245] mt-1">
                Score &ge; 0.700
              </span>
            </div>

            {/* 3. Prediction */}
            <div className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#E8D2B5] text-center flex flex-col justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B6245]">
                Prediction
              </span>
              <div className="mt-2 text-base sm:text-lg font-bold font-mono text-[#B83A2E]">
                {data.prediction || 'Fraud'}
              </div>
              <span className="text-[10px] text-[#8B6245] mt-1">
                VQC Classifier
              </span>
            </div>

            {/* 4. Status */}
            <div className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#E8D2B5] text-center flex flex-col justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B6245]">
                Status
              </span>
              <div className="mt-2 text-xs font-bold text-[#4A3024] leading-snug">
                {data.statusText || 'Transaction Flagged for Review'}
              </div>
              <span className="text-[10px] text-[#B83A2E] font-medium mt-1">
                Action Required
              </span>
            </div>
          </div>

          {/* Transaction Information Card (Only displays fields that actually exist) */}
          <div className="rounded-2xl bg-[#F6EBDD]/60 border border-[#E8D2B5] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#2E1E18] pb-2 border-b border-[#E8D2B5]/80">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#B98252]" />
                Transaction Parameters
              </span>
              <span className="font-mono text-[10px] text-[#8B6245]">
                FASTAPI /PREDICT VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Transaction ID */}
              {data.transactionId && (
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-[#8B6245] shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-[#8B6245]">Transaction ID</div>
                    <div className="font-mono font-semibold text-[#2E1E18] truncate">
                      {data.transactionId}
                    </div>
                  </div>
                </div>
              )}

              {/* Amount */}
              {data.amount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#B83A2E] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#8B6245]">Amount</div>
                    <div className="font-mono font-bold text-[#2E1E18]">
                      {data.amount}
                    </div>
                  </div>
                </div>
              )}

              {/* Merchant */}
              {data.merchant && (
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-[#8B6245] shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-[#8B6245]">Merchant</div>
                    <div className="font-medium text-[#2E1E18] truncate">
                      {data.merchant}
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#8B6245] shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-[#8B6245]">Location</div>
                    <div className="font-medium text-[#2E1E18] truncate">
                      {data.location}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {data.timestamp && (
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2 pt-1 border-t border-[#E8D2B5]/50">
                  <Clock className="w-3.5 h-3.5 text-[#8B6245] shrink-0" />
                  <div className="flex items-center gap-2 text-[11px] text-[#4A3024]">
                    <span className="text-[#8B6245]">Evaluated:</span>
                    <span className="font-mono">{data.timestamp}</span>
                    <span className="text-[#8B6245]/60">·</span>
                    <span className="text-[#8B6245]">Engine:</span>
                    <span className="font-mono text-[#B98252]">4-Qubit Variational VQC</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detection Reason & Risk Factors (Only if reasons exist) */}
          {data.reasons && data.reasons.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#2E1E18] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B83A2E]" />
                Relevant Risk Factors
              </span>
              <div className="space-y-1.5">
                {data.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FFF9F0] border border-[#E8D2B5] text-xs text-[#4A3024]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B83A2E] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable Buttons Footer */}
        <div className="p-5 sm:p-6 bg-[#F6EBDD]/70 border-t border-[#E8D2B5] flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Block Transaction */}
            <button
              type="button"
              onClick={() => onBlock(data.transactionId)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B83A2E] text-white hover:bg-[#A03025] font-semibold text-xs tracking-wide shadow-[0_4px_14px_rgba(184,58,46,0.35)] transition-all transform active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Block Transaction</span>
            </button>

            {/* 2. Flag for Manual Review */}
            <button
              type="button"
              onClick={() => onManualReview(data.transactionId)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF9F0] border border-[#C5A46D] text-[#8B6245] hover:bg-[#F6EBDD] hover:text-[#2E1E18] font-semibold text-xs tracking-wide transition-all transform active:scale-95 cursor-pointer"
            >
              <FileSearch className="w-3.5 h-3.5 text-[#B98252]" />
              <span>Flag for Manual Review</span>
            </button>

            {/* 3. Override & Clear (Supervisor / Auth) */}
            <button
              type="button"
              onClick={() => onOverrideClear(data.transactionId)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF7F1] border border-[#3D7A5A]/50 text-[#3D7A5A] hover:bg-[#E0F2E8] font-semibold text-xs tracking-wide transition-all transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3D7A5A]" />
              <span>Override & Clear</span>
            </button>
          </div>

          {/* Dismiss button */}
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-[#8B6245] hover:text-[#2E1E18] text-xs"
            >
              Dismiss (ESC)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
