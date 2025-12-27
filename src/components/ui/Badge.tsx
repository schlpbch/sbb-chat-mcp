import React from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
 variant?: BadgeVariant;
 size?: BadgeSize;
 className?: string;
 children: React.ReactNode;
 icon?: React.ReactNode;
 removable?: boolean;
 onRemove?: () => void;
}

const variantClasses: Record<BadgeVariant, string> = {
 default: 'bg-milk text-anthracite border border-cloud',
 primary: 'bg-sbb-red text-white shadow-sbb-red',
 secondary: 'bg-charcoal text-white',
 success: 'bg-success-100 text-success-800 border border-success-200',
 warning: 'bg-warning-100 text-warning-800 border border-warning-200',
 error: 'bg-error-100 text-error-800 border border-error-200',
 info: 'bg-cloud text-midnight border border-silver/30',
};

const sizeClasses: Record<BadgeSize, string> = {
 sm: 'px-2 py-0.5 text-[10px] rounded-sbb',
 md: 'px-2.5 py-1 text-xs rounded-sbb',
 lg: 'px-3 py-1.5 text-sm rounded-sbb',
};

export const Badge: React.FC<BadgeProps> = ({
 variant = 'default',
 size = 'md',
 className = '',
 children,
 icon,
 removable = false,
 onRemove,
}) => {
 const classes = [
 'inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-200',
 variantClasses[variant],
 sizeClasses[size],
 className,
 ].filter(Boolean).join(' ');

 return (
 <span className={classes}>
 {icon && <span className="mr-1">{icon}</span>}
 {children}
 {removable && onRemove && (
 <button
 onClick={onRemove}
 className="ml-1 hover:opacity-70 transition-opacity focus:outline-none"
 aria-label="Remove"
 >
 <svg
 className="w-3 h-3"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 )}
 </span>
 );
};
