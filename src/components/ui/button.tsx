import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'medium', children, ...props }) => {
  const baseStyles = 'rounded focus:outline-none focus:ring';
  const variantStyles = variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white';
  const sizeStyles = size === 'small' ? 'px-2 py-1 text-sm' : size === 'large' ? 'px-4 py-2 text-lg' : 'px-3 py-2';

  return (
    <button className={`${baseStyles} ${variantStyles} ${sizeStyles}`} {...props}>
      {children}
    </button>
  );
};

export default Button;