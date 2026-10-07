/**
 * MagneticButton Component
 * Subtle physics-based magnetic button that gently tracks pointer hover
 * and springs back smoothly on leave.
 */

import React, { useRef, useState, useCallback } from 'react';

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  strength?: number; // magnetic pull factor (default 0.22)
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      strength = 0.22,
      ...props
    },
    forwardedRef
  ) => {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading || !btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = (e.clientX - centerX) * strength;
        const distanceY = (e.clientY - centerY) * strength;

        setOffset({
          x: Math.max(-12, Math.min(12, distanceX)),
          y: Math.max(-10, Math.min(10, distanceY)),
        });
      },
      [disabled, isLoading, strength]
    );

    const handleMouseLeave = useCallback(() => {
      setOffset({ x: 0, y: 0 });
    }, []);

    const sizeClasses = {
      sm: 'text-xs py-1.5 px-3.5 rounded-xl gap-1.5 min-h-[34px]',
      md: 'text-sm py-2 px-4.5 rounded-2xl gap-2 min-h-[42px]',
      lg: 'text-base py-2.5 px-6 rounded-2xl gap-2.5 min-h-[48px]',
    }[size];

    const variantClasses = {
      primary:
        'bg-[#2E1E18] text-[#FFF9F0] hover:bg-[#4A3024] active:bg-[#1F130E] border border-[#4A3024] shadow-[0_2px_8px_rgba(46,30,24,0.12)] hover:shadow-[0_4px_16px_rgba(46,30,24,0.22)]',
      secondary:
        'bg-[#F6EBDD] text-[#2E1E18] hover:bg-[#E8D2B5] active:bg-[#DCC09B] border border-[#E8D2B5] shadow-xs',
      outline:
        'bg-[#FFFDF9]/85 backdrop-blur-sm text-[#4A3024] hover:bg-[#F6EBDD] border border-[#DCC09B] hover:border-[#B98252]',
      ghost:
        'bg-transparent text-[#4A3024] hover:bg-[#F6EBDD]/70 active:bg-[#E8D2B5]',
      gold:
        'bg-[#C5A46D] text-[#2E1E18] font-semibold hover:bg-[#DFB878] active:bg-[#B98252] border border-[#B98252]/40 shadow-[0_2px_12px_rgba(197,164,109,0.28)] hover:shadow-[0_4px_20px_rgba(197,164,109,0.38)]',
    }[variant];

    return (
      <button
        ref={(node) => {
          btnRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        disabled={disabled || isLoading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: offset.x === 0 && offset.y === 0 ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out',
        }}
        className={`inline-flex items-center justify-center font-medium whitespace-nowrap cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#B98252] focus-visible:outline-offset-2 ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>{children}</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span className="truncate">{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

MagneticButton.displayName = 'MagneticButton';
