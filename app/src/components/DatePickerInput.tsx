import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

interface DatePickerInputProps {
  value: CalendarDate | null;
  onChange: (date: CalendarDate | null) => void;
  isDisabled?: boolean;
}

export default function DatePickerInput({
  value,
  onChange,
  isDisabled,
}: DatePickerInputProps) {
  return (
    <DatePicker
      value={value}
      onChange={(d) => onChange(d as CalendarDate | null)}
      isDisabled={isDisabled}
      aria-label="Date"
      className="flex flex-col gap-1"
    >
      <Group className="flex items-center border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500 disabled:bg-gray-100 overflow-hidden">
        <DateInput className="flex items-center px-2 py-1 gap-0.5 flex-1 min-w-0">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="px-0.5 rounded focus:outline-none focus:bg-blue-100 caret-transparent tabular-nums data-[type=literal]:text-gray-400"
            />
          )}
        </DateInput>
        <Button className="px-2 py-1 text-gray-500 hover:text-blue-600 disabled:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 border-l border-gray-300">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </Group>
      <Popover className="z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <Dialog>
          <Calendar className="w-64">
            <div className="flex items-center justify-between mb-2">
              <Button
                slot="previous"
                className="p-1 rounded hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
              </Button>
              <Heading className="text-sm font-semibold text-gray-800" />
              <Button
                slot="next"
                className="p-1 rounded hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            <CalendarGrid className="w-full border-collapse">
              {(date) => (
                <CalendarCell
                  date={date}
                  className="h-8 w-8 text-sm text-center rounded hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 data-[selected]:bg-blue-500 data-[selected]:text-white data-[outside-month]:text-gray-300 mx-auto flex items-center justify-center"
                />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}
