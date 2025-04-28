
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-primary font-bold text-xl">Simple</span>
      <span className="text-accent font-bold text-xl">Schedule</span>
    </div>
  );
};

export default Logo;
