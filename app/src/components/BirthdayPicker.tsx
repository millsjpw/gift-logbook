import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { today, getLocalTimeZone } from "@internationalized/date";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

interface BirthdayPickerProps {
  value: CalendarDate | null;
  onChange: (date: CalendarDate | null) => void;
  isDisabled?: boolean;
}

export default function BirthdayPicker({
  value,
  onChange,
  isDisabled,
}: BirthdayPickerProps) {
  const maxValue = today(getLocalTimeZone());

  return (
    <DatePicker
      value={value}
      onChange={(d) => onChange(d as CalendarDate | null)}
      maxValue={maxValue}
      isDisabled={isDisabled}
      aria-label="Birthday"
      className="flex flex-col gap-1"
    >
      <div className="relative group inline-block">
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block pointer-events-none z-50">
          <div className="bg-gray-700 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            Select birthday (for unknown year, set to 1900)
          </div>
        </div>
        <Group className="flex items-center border border-gray-300 rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 disabled:bg-gray-100 overflow-hidden">
          <DateInput className="flex items-center px-2 py-1 gap-0.5 flex-1 min-w-0">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="px-0.5 rounded focus:outline-none focus:bg-blue-100 dark:focus:bg-blue-900 caret-transparent tabular-nums data-[type=literal]:text-gray-400 dark:text-white/70"
              />
            )}
          </DateInput>
          <Button className="px-2 py-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border-l border-gray-300">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </Group>
      </div>
      <Popover className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <Dialog>
          <Calendar className="w-64">
            <div className="flex items-center justify-between mb-2">
              <Button
                slot="previous"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
              <Heading className="text-sm font-semibold text-gray-800 dark:text-gray-200" />
              <Button
                slot="next"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
            <CalendarGrid className="w-full border-collapse">
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="h-8 w-8 text-sm text-center dark:text-white rounded hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[selected]:bg-blue-500 data-[selected]:text-white data-[outside-month]:text-gray-300 dark:data-[outside-month]:text-gray-500 data-[unavailable]:text-gray-300 dark:data-[unavailable]:text-gray-500 data-[unavailable]:cursor-not-allowed mx-auto flex items-center justify-center"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}
