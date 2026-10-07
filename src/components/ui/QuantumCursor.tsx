/**
 * QuantumCursor Component
 * Subtle desktop ambient cursor follower.
 * Features:
 * - Small warm-gold point
 * - Expands slightly on interactive button / link hover
 * - Displays subtle rotating ring on 3D canvas / node hover
 * - Brief ripple on click
 * - Automatically disabled on touch / mobile devices (pointer: coarse)
 * - Keeps standard system cursor intact for accessibility
 */

import React, { useEffect, useState, useRef } from 'react';
import { useQuantum } from '../../context/QuantumContext';

export const QuantumCursor: React.FC = () => {
  const { reducedMotion } = useQuantum();
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports fine pointer (desktop mouse)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      setIsTouchDevice(!finePointer);
      if (!finePointer) return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Inspect target element for cursor styling
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('button, a, input, select, textarea, [role="button"]');
        const isCanvas = !!target.closest('canvas, [data-interactive-3d]');
        setIsPointer(isInteractive);
        setIs3D(isCanvas);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    const loop = () => {
      animFrame.current = requestAnimationFrame(loop);
      const lerp = 0.35;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp;
      setPos({ x: currentPos.current.x, y: currentPos.current.y });
    };
    animFrame.current = requestAnimationFrame(loop);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (isTouchDevice || reducedMotion || !isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] select-none overflow-hidden"
    >
      {/* 1. Trailing Core Point */}
      <div
        className="absolute rounded-full bg-[#B98252] transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isClicking ? '12px' : isPointer ? '8px' : '5px',
          height: isClicking ? '12px' : isPointer ? '8px' : '5px',
          opacity: 0.9,
          boxShadow: '0 0 10px rgba(185, 130, 82, 0.45)',
        }}
      />

      {/* 2. Expanding 3D Ring on Canvas / Interactive Hover */}
      {(is3D || isPointer) && (
        <div
          className={`absolute rounded-full border border-[#C5A46D] -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
            is3D ? 'border-dashed animate-spin' : ''
          }`}
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: is3D ? '34px' : '26px',
            height: is3D ? '34px' : '26px',
            opacity: 0.7,
            animationDuration: '6s',
          }}
        />
      )}

      {/* 3. Click Ripple */}
      {isClicking && (
        <div
          className="absolute rounded-full border-2 border-[#DFB878] -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: '28px',
            height: '28px',
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
};
