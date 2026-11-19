import React from 'react';
import { soundEngine } from '../audio/soundEngine';

export type ButtonVariant = 'emerald' | 'amber' | 'amethyst' | 'sapphire' | 'coral';

interface CartoonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  sheen?: boolean;
  fullWidth?: boolean;
}

const SIZE_CLASSES = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-2xl',
};

export const CartoonButton: React.FC<CartoonButtonProps> = ({
  variant = 'emerald',
  size = 'md',
  sheen = false,
  fullWidth = false,
  className = '',
  onClick,
  children,
  disabled,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    soundEngine.playClick();
    soundEngine.triggerHaptic(10);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={[
        'btn-cartoon font-cartoon text-white cartoon-stroke-sm inline-flex items-center justify-center gap-1.5 cursor-pointer select-none leading-none',
        `btn-${variant}`,
        SIZE_CLASSES[size],
        sheen && !disabled ? 'btn-sheen' : '',
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
};
