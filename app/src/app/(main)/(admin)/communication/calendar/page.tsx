"use client";

import { ToolbarProps, Views } from "react-big-calendar";
// import useActiveOrganizationStore from "@/store/active-organization.store";
import { trpc } from "@/app/_providers/trpc-provider";
// import Loader from "@/components/dashboard/loader";
// import EventCalendar from "@/components/communication/big-calender";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { format } from "date-fns";
import { useCallback, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { Loader } from "lucide-react";
import EventCalendar from "./_component/big-calendar";

type Keys = keyof typeof Views;

export default function CalendarPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: eventsData, isLoading: isEventLoading } = trpc.getAllEventsForCalenderByOrgSlug.useQuery({
    slug: organizationSlug,
  });
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.MONTH);

  // const onTodayClick = useCallback(() => {
  //   setDate(new Date());
  // }, []);

  const CustomToolbar = (toolbar: ToolbarProps) => {
    const onPrevClick = useCallback(() => {
      if (view === Views.DAY) {
        setDate(moment(date).subtract(1, "d").toDate());
      } else if (view === Views.WEEK) {
        setDate(moment(date).subtract(1, "w").toDate());
      } else {
        setDate(moment(date).subtract(1, "M").toDate());
      }
    }, []);

    const onNextClick = useCallback(() => {
      if (view === Views.DAY) {
        setDate(moment(date).add(1, "d").toDate());
      } else if (view === Views.WEEK) {
        setDate(moment(date).add(1, "w").toDate());
      } else {
        setDate(moment(date).add(1, "M").toDate());
      }
    }, []);

    const viewOptions = [
      { value: Views.DAY, label: "Day" },
      { value: Views.WEEK, label: "Week" },
      { value: Views.MONTH, label: "Month" },
    ];

    return (
      <div className='mb-2 flex items-center justify-between rounded-t-2xl bg-primaryTheme-100 p-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' onClick={onPrevClick} className='p-2'>
            <FaCaretLeft className='h-4 w-4' />
          </Button>
          <Button variant='ghost' onClick={onNextClick} className='p-2'>
            <FaCaretRight className='h-4 w-4' />
          </Button>
          <span className='text-xl font-medium'>{format(toolbar.date, "MMMM yyyy")}</span>
        </div>

        <div className='flex items-center gap-2'>
          <Select
            value={view}
            onValueChange={(selectedView) => {
              const validView = Object.values(Views).find((v) => v === selectedView);
              if (validView) {
                toolbar.onView(validView);
                setView(validView);
              }
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select view' />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (isEventLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className='flex h-[600px] w-full rounded-2xl bg-white shadow-sm'>
        <EventCalendar
          events={eventsData?.events}
          style={{ width: "100%", borderRadius: "8px" }}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          components={{
            toolbar: CustomToolbar,
          }}
          date={date}
          view={view}
          onView={(view) => setView(view)}
          onNavigate={(date) => {
            setDate(new Date(date));
          }}
        />
      </div>
    </div>
  );
}
