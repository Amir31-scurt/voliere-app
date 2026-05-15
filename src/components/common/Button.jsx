import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  className, 
  disabled, 
  onClick, 
  type = 'button',
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={twMerge(
        'btn',
        `btn-${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
