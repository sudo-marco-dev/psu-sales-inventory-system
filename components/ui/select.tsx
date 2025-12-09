'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(event.target.value);
      }
      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-right [background-image:url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23333\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3e%3c/svg%3e")]',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => {
  return <option ref={ref} {...props} />;
});
SelectItem.displayName = 'SelectItem';


// These are not used with the native select, but are kept for compatibility
// with the previous implementation in app/dashboard/products/add/page.tsx
const SelectTrigger: React.FC<{ children: React.ReactNode, id: string }> = ({ children, id }) => <div id={id}>{children}</div>;
const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => <div>{placeholder}</div>;
const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;


export { Select, SelectItem, SelectTrigger, SelectValue, SelectContent };