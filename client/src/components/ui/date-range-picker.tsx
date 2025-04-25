import * as React from "react";
import { format, Locale } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateRangePickerProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
  calendarClassName?: string;
  locale?: Locale;
};

export function DateRangePicker({
  value,
  onChange,
  className,
  calendarClassName,
  locale = fr,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd LLL y", { locale })} -{" "}
                  {format(value.to, "dd LLL y", { locale })}
                </>
              ) : (
                format(value.from, "dd LLL y", { locale })
              )
            ) : (
              <span>Sélectionnez une période</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={locale}
            className={calendarClassName}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}