import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 select-text hover:shadow-lg transition-shadow duration-200">
    {children}
  </div>
);

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-3 ${className}`}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  className = '',
  children,
}) => {
  return (
    <h3
      className={`text-lg font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}
    >
      {children}
    </h3>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
}) => {
  return <div className={`select-text ${className}`}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-3 ${className}`}
    >
      {children}
    </div>
  );
};
