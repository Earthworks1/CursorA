import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: {
    value: string | number;
    positive: boolean;
  };
  period: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  period,
  icon,
  iconBgColor,
  iconTextColor
}) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${iconBgColor} ${iconTextColor}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? (
              <ArrowUpRight size={16} className="mr-1" />
            ) : (
              <ArrowDownRight size={16} className="mr-1" />
            )}
            {change.value}
          </span>
          <span className="text-gray-500 ml-2">{period}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
