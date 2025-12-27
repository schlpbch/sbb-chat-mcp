import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sbb-red text-white hover:bg-sbb-red-125 active:scale-95 shadow-sbb hover:shadow-sbb-red/40',
  secondary: 'bg-anthracite dark:bg-charcoal text-white hover:bg-midnight active:scale-95 shadow-sbb',
  outline: 'border-2 border-sbb-red text-sbb-red hover:bg-sbb-red hover:text-white active:scale-95 transition-all',
  ghost: 'text-anthracite dark:text-graphite hover:bg-milk dark:hover:bg-charcoal active:scale-95 transition-all',
  danger: 'bg-sbb-red text-white hover:bg-sbb-red-125 active:scale-95 shadow-sbb-red/20 hover:shadow-sbb-red/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-sbb',
  md: 'px-6 py-2.5 text-sm rounded-sbb',
  lg: 'px-8 py-3.5 text-base rounded-sbb',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sbb-red focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed';

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
