import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => (
    <select
      ref={ref}
      className="sbb-select border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sbb-red focus:border-transparent"
      {...props}
    />
  )
);

Select.displayName = 'Select';
