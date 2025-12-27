import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sbb-sm',
  md: 'shadow-sbb-md',
  lg: 'shadow-sbb-lg',
  xl: 'shadow-sbb-xl',
};

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  hover = false,
  onClick,
  padding = 'md',
  shadow = 'md',
}) => {
  const baseClasses = 'bg-white dark:bg-charcoal rounded-sbb-xl border border-cloud dark:border-iron transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-sbb-lg hover:-translate-y-0.5 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const classes = [
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
  return (
    <div className={`border-b border-cloud dark:border-iron pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className = '', children }) => {
  return (
    <h3 className={`text-lg font-black text-midnight dark:text-milk tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return (
    <div className={`border-t border-cloud dark:border-iron pt-3 mt-3 ${className}`}>
      {children}
    </div>
  );
};
