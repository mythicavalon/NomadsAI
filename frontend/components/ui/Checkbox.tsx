import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      onChange,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className={clsx('space-y-2', containerClassName)}>
        <div className="flex items-start space-x-3">
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className="sr-only"
              onChange={handleChange}
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={clsx(
                'flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 transition-all duration-200',
                'border-gray-600 bg-gray-800 hover:border-accent-400',
                'focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900',
                'peer-checked:border-accent-500 peer-checked:bg-accent-500',
                className
              )}
            >
              <Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </label>
          </div>
          
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium text-gray-300 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-error-500 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;