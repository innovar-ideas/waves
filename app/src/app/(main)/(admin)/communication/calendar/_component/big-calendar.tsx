import { Calendar as BigCalendar, CalendarProps, dateFnsLocalizer } from "react-big-calendar";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendar(props: Omit<CalendarProps, "localizer">) {
  return (
    <BigCalendar {...props} localizer={localizer} startAccessor='start' endAccessor='end' className='calendar-custom' />
  );
}
