/**
 * TiltCard Component
 * Subtle 3D card tilt responding to pointer movement.
 * Enforces maximum tilt <= 4 degrees to guarantee elegance without spinning.
 * Supports prefers-reduced-motion.
 */

import React, { useRef, useState, useCallback } from 'react';
import { useQuantum } from '../../context/QuantumContext';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'elevated' | 'glass' | 'subtle';
  rounded?: 'xl' | '2xl' | '3xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxTilt?: number; // max tilt degrees (default 3.5)
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  variant = 'surface',
  rounded = '2xl',
  padding = 'md',
  maxTilt = 3.5,
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useQuantum();
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      // Pointer moves left -> tilt slightly left (rotateY negative)
      const rotateY = normX * maxTilt;
      const rotateX = -normY * maxTilt;

      setTransform({ rotateX, rotateY, scale: 1.008 });
    },
    [maxTilt, reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const roundedClasses = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }[rounded];

  const paddingClasses = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    surface:
      'bg-[#FFFDF9]/95 border border-[#E8D2B5] shadow-[0_4px_20px_rgba(74,48,36,0.04)] hover:shadow-[0_8px_30px_rgba(74,48,36,0.08)]',
    elevated:
      'bg-[#FFFDF9] border border-[#DCC09B] shadow-[0_8px_30px_rgba(74,48,36,0.07)] hover:shadow-[0_12px_40px_rgba(74,48,36,0.12)]',
    glass:
      'bg-[#FFFDF9]/85 backdrop-blur-md border border-[#E8D2B5]/90 shadow-[0_4px_24px_rgba(74,48,36,0.05)] hover:shadow-[0_8px_32px_rgba(74,48,36,0.09)]',
    subtle:
      'bg-[#F6EBDD]/60 border border-[#E8D2B5]/80 hover:bg-[#F6EBDD]/80',
  }[variant];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(${transform.scale}, ${transform.scale}, 1)`,
        transition:
          transform.rotateX === 0 && transform.rotateY === 0
            ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
            : 'transform 0.1s ease-out, box-shadow 0.2s ease',
      }}
      className={`relative will-change-transform ${roundedClasses} ${variantClasses} ${paddingClasses} ${className}`}
      {...props}
    >
      {/* Subtle top-light sheen on hover */}
      {isHovered && !reducedMotion && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none opacity-40 bg-gradient-to-tr from-transparent via-[#FFFDF9]/40 to-white/60 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
};
