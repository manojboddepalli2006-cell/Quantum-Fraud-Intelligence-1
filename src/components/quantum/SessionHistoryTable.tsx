/**
 * SessionHistoryTable Component
 * Displays transaction analysis history for the CURRENT SESSION.
 * Strictly notes: "In-memory logs for current browser session — not permanent database history."
 * Columns: Time, Prediction, Risk Level, Fraud Score (0.xxx), Status
 */

import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RiskIndicator } from '../ui/StatusIndicator';
import { History, Trash2, Clock, CheckCircle2, AlertOctagon, Lock, AlertTriangle } from 'lucide-react';

export const SessionHistoryTable: React.FC = () => {
  const { sessionHistory, clearSessionHistory } = useQuantum();

  return (
    <Card variant="surface" rounded="2xl" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8D2B5]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#B98252]" />
            <h3 className="text-base font-semibold text-[#2E1E18]">
              Transaction History
            </h3>
            <span className="font-mono text-[10px] font-bold text-[#8B6245] bg-[#F6EBDD] px-2 py-0.5 rounded-md">
              CURRENT SESSION
            </span>
          </div>
          <p className="text-xs text-[#8B6245]">
            In-memory evaluation records for this browser session. Not permanent database history.
          </p>
        </div>

        {sessionHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSessionHistory}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Session Logs
          </Button>
        )}
      </div>

      {/* Table Content */}
      {sessionHistory.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <Clock className="w-8 h-8 text-[#DCC09B] mx-auto" />
          <p className="text-xs font-medium text-[#4A3024]">No Transactions Evaluated in Current Session</p>
          <p className="text-[11px] text-[#8B6245] max-w-sm mx-auto">
            Submit a 6-feature vector in the Transaction Analyzer to generate live session records.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8D2B5] text-[#8B6245] uppercase tracking-wider font-mono text-[11px]">
                <th className="py-2.5 px-3 font-semibold">Tx ID & Merchant</th>
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                <th className="py-2.5 px-3 font-semibold">Fraud Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D2B5]/60 font-mono">
              {sessionHistory.map((item) => {
                const isFlagged = item.status === 'FLAGGED' || item.fraud_score >= 0.70;

                return (
                  <tr key={item.id} className="hover:bg-[#F6EBDD]/40 transition-colors">
                    {/* Tx ID & Merchant */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#2E1E18]">{item.id}</div>
                      {item.merchant && (
                        <div className="text-[11px] font-sans text-[#8B6245] truncate max-w-[160px]">
                          {item.merchant} · {item.amount}
                        </div>
                      )}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 text-[#4A3024] tabular-nums">
                      {item.time}
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-3">
                      <RiskIndicator level={item.risk_level} />
                    </td>

                    {/* Fraud Score: Normalized 0.000 - 1.000 */}
                    <td className="py-3 px-3 font-bold tabular-nums">
                      <span
                        className={
                          item.fraud_score >= 0.700
                            ? 'text-[#B83A2E]'
                            : item.fraud_score >= 0.300
                            ? 'text-[#B98252]'
                            : 'text-[#2E1E18]'
                        }
                      >
                        {item.fraud_score.toFixed(3)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-right">
                      {item.status === 'BLOCKED' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#B83A2E] font-semibold bg-[#FAECE8] px-2 py-0.5 rounded-lg border border-[#B83A2E]/30">
                          <Lock className="w-3.5 h-3.5" />
                          BLOCKED
                        </span>
                      ) : item.status === 'UNDER_REVIEW' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#B98252] font-semibold bg-[#FFF9F0] px-2 py-0.5 rounded-lg border border-[#E8D2B5]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          UNDER REVIEW
                        </span>
                      ) : isFlagged || item.status === 'FLAGGED' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#B83A2E] font-semibold bg-[#FAECE8] px-2 py-0.5 rounded-lg border border-[#B83A2E]/30">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          FLAGGED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#3D7A5A] font-semibold bg-[#EDF7F1] px-2 py-0.5 rounded-lg border border-[#3D7A5A]/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          CLEARED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
