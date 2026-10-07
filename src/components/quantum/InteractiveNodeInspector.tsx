/**
 * InteractiveNodeInspector Component
 * Floating cinematic contextual panel displayed when a quantum node is focused.
 * Shows Role, Status, Pipeline position, mathematical detail, and related node shortcuts.
 * Includes prominent "RETURN TO FIELD" button.
 */

import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { QUANTUM_NODES } from '../../data/quantumNodes';
import { Button } from '../ui/Button';
import {
  ArrowLeft,
  Binary,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
} from 'lucide-react';

export const InteractiveNodeInspector: React.FC<{
  onReturnToField: () => void;
  onFocusNode: (nodeId: string) => void;
}> = ({ onReturnToField, onFocusNode }) => {
  const { focusedNode } = useQuantum();

  if (!focusedNode) return null;

  const categoryIcon = {
    feature: <Binary className="w-4 h-4 text-[#B98252]" />,
    qubit: <Zap className="w-4 h-4 text-[#DFB878]" />,
    circuit: <Cpu className="w-4 h-4 text-[#C5A46D]" />,
    decision: <ShieldCheck className="w-4 h-4 text-[#2E1E18]" />,
  }[focusedNode.category];

  return (
    <div
      role="region"
      aria-label="Quantum Node Inspector"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 max-w-sm w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      <div className="bg-[#FFFDF9]/95 backdrop-blur-md border border-[#DCC09B] rounded-3xl shadow-[0_16px_50px_rgba(46,30,24,0.18)] p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8D2B5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {categoryIcon}
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8B6245]">
                {focusedNode.category} Node
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3D7A5A]/15 text-[#3D7A5A] font-bold border border-[#3D7A5A]/30">
                {focusedNode.status}
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2E1E18]">
              {focusedNode.title}
            </h3>
            <p className="text-xs font-mono text-[#8B6245]">
              {focusedNode.label}
            </p>
          </div>

          <button
            onClick={onReturnToField}
            className="p-1.5 rounded-xl text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] transition-colors cursor-pointer"
            aria-label="Close inspector and return to field"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3 text-xs">
          {/* Role */}
          <div className="space-y-0.5">
            <span className="font-semibold text-[#8B6245] uppercase tracking-wider text-[10px]">
              Role
            </span>
            <p className="font-medium text-[#2E1E18]">{focusedNode.role}</p>
          </div>

          {/* Pipeline */}
          <div className="space-y-0.5">
            <span className="font-semibold text-[#8B6245] uppercase tracking-wider text-[10px]">
              Pipeline Position
            </span>
            <p className="font-mono text-[11px] text-[#4A3024] bg-[#F6EBDD]/60 p-2 rounded-xl border border-[#E8D2B5]/80">
              {focusedNode.pipeline}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-0.5">
            <span className="font-semibold text-[#8B6245] uppercase tracking-wider text-[10px]">
              Technical Formulation
            </span>
            <p className="text-[#4A3024] leading-relaxed">
              {focusedNode.description}
            </p>
          </div>

          {/* Formula or Math Detail */}
          {focusedNode.mathDetail && (
            <div className="p-2.5 rounded-xl bg-[#2E1E18] text-[#FFF9F0] font-mono text-[11px] border border-[#4A3024]">
              <span className="text-[#DFB878] block text-[9px] uppercase tracking-wider mb-0.5">
                Mathematical Operator
              </span>
              <code>{focusedNode.mathDetail}</code>
            </div>
          )}

          {/* Related Entangled Nodes */}
          {focusedNode.relatedNodes && focusedNode.relatedNodes.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-[#8B6245] uppercase tracking-wider text-[10px]">
                Entangled & Connected Nodes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {focusedNode.relatedNodes.map((relId) => {
                  const target = QUANTUM_NODES[relId];
                  if (!target) return null;
                  return (
                    <button
                      key={relId}
                      onClick={() => onFocusNode(relId)}
                      className="px-2 py-1 rounded-lg bg-[#F6EBDD] hover:bg-[#E8D2B5] text-[#2E1E18] text-[10px] font-mono font-medium border border-[#DCC09B] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{target.title}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-[#8B6245]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Return Action */}
        <div className="pt-2 border-t border-[#E8D2B5] flex items-center justify-between">
          <Button
            variant="gold"
            size="sm"
            onClick={onReturnToField}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            className="w-full"
          >
            RETURN TO FIELD
          </Button>
        </div>
      </div>
    </div>
  );
};
