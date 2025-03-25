
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-icon-01/84", // Text-1 color with 84% opacity
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-text-icon-02 rounded-md w-9 font-normal text-[0.8rem]", // Text-2 color for days of week headers
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-text-icon-01/84" // Text-1 color with 84% opacity
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary-200 text-text-icon-01 hover:bg-primary-states-hover hover:text-text-icon-01 focus:bg-primary-states-focused focus:text-text-icon-01",
        day_today: 
          "bg-secondary-200 text-text-icon-01 border border-primary-100 font-bold ring-2 ring-primary-50/30",
        day_outside:
          "day-outside text-text-icon-02/50 opacity-50 aria-selected:bg-accent/50 aria-selected:text-text-icon-02/50 aria-selected:opacity-30", // Text-2 color with reduced opacity
        day_disabled: "text-text-icon-02/50 opacity-50", // Text-2 color with reduced opacity
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 text-text-icon-01/84" />, // Added text color to icons
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 text-text-icon-01/84" />, // Added text color to icons
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
