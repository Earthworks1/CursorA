import React from "react";
import { Progress } from "@/components/ui/progress";
import { getProgressColor } from "@/lib/utils";

interface ProgressWithTextProps {
  value: number;
  status: string;
}

const ProgressWithText: React.FC<ProgressWithTextProps> = ({ value, status }) => {
  const color = getProgressColor(value);
  
  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-xs text-right mt-1">{value}%</div>
    </div>
  );
};

export default ProgressWithText;
