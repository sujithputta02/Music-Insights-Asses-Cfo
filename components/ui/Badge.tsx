import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'red' | 'blue' | 'green' | 'yellow';
}

const variantStyles = {
  default: 'bg-canvas-warm text-text-secondary',
  red: 'bg-accent-red-bg text-accent-red-text',
  blue: 'bg-accent-blue-bg text-accent-blue-text',
  green: 'bg-accent-green-bg text-accent-green-text',
  yellow: 'bg-accent-yellow-bg text-accent-yellow-text',
};

export default function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx('badge', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
