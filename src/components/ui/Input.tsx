import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 helperText?: string;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
 (
 {
 label,
 error,
 helperText,
 leftIcon,
 rightIcon,
 fullWidth = false,
 className = '',
 id,
 ...props
 },
 ref
 ) => {
 const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
 const hasError = !!error;

 const inputClasses = [
 'px-4 py-2.5 border-2 rounded-sbb transition-all duration-200',
 'focus:outline-none focus:border-sbb-red:border-sbb-red focus:shadow-sbb-red/20',
 'disabled:opacity-50 disabled:cursor-not-allowed',
 hasError
 ? 'border-sbb-red'
 : 'border-cloud hover:border-silver:border-storm',
 'bg-milk',
 'text-midnight font-bold text-sm',
 'placeholder:text-smoke:text-graphite',
 leftIcon ? 'pl-11' : '',
 rightIcon ? 'pr-11' : '',
 fullWidth ? 'w-full' : '',
 className,
 ].filter(Boolean).join(' ');

 return (
 <div className={fullWidth ? 'w-full' : ''}>
 {label && (
 <label
 htmlFor={inputId}
 className="block text-xs font-black text-midnight mb-1.5 uppercase tracking-widest"
 >
 {label}
 </label>
 )}
 <div className="relative">
 {leftIcon && (
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
 {leftIcon}
 </div>
 )}
 <input
 ref={ref}
 id={inputId}
 className={inputClasses}
 {...props}
 />
 {rightIcon && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
 {rightIcon}
 </div>
 )}
 </div>
 {error && (
 <p className="mt-1 text-sm text-error">{error}</p>
 )}
 {helperText && !error && (
 <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
 )}
 </div>
 );
 }
);

Input.displayName = 'Input';
