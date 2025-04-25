import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressWithLabelProps {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorVariant?: 'default' | 'success' | 'warning' | 'danger';
}

const ProgressWithLabel: React.FC<ProgressWithLabelProps> = ({
  value,
  showLabel = true,
  size = 'md',
  colorVariant = 'default'
}) => {
  const height = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[size];

  const colorClass = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }[colorVariant];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(value)}%
          </span>
        )}
      </div>
      <Progress 
        value={value} 
        className={`${height} [&>div]:${colorClass}`}
      />
    </div>
  );
};

export default ProgressWithLabel; 