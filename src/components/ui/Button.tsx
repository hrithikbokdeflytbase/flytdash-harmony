
import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button'; // Importing the existing button component

// Simple wrapper component to use the existing button component
const Button = ({ 
  children, 
  variant = "default", 
  size = "default",
  className,
  ...props 
}: React.ComponentProps<typeof ShadcnButton>) => {
  return (
    <ShadcnButton 
      variant={variant} 
      size={size} 
      className={className}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default Button;
