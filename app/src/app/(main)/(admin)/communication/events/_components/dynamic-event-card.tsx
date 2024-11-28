import { Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Event } from "@prisma/client";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  variant: "grid" | "list";
  upcoming?: boolean;
}

export function DynamicEventCard({ event, variant, upcoming }: EventCardProps) {
  const date = new Date(event.starts);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" }).toUpperCase();

  const formattedTime = `${format(new Date(event.starts), "HH:mm")} - ${format(new Date(event.ends), "HH:mm")}`;

  if (variant === "list") {
    return (
      <Card className={`w-full p-4 transition-colors hover:bg-accent ${upcoming ? "bg-primaryTheme-100" : ""}`}>
        <div className='flex items-center gap-4'>
          <div className='w-20 text-center'>
            <div className='text-3xl font-bold'>{day}</div>
            <div className='text-xs text-muted-foreground'>{month}</div>
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{formattedTime}</span>
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{event.location}</span>
            </div>
          </div>
          <div className='flex-1 text-center font-medium text-primary'>{event.name}</div>
          <div className='flex items-center gap-1'>
            <Users className='h-4 w-4' />
            {/* <span className='text-sm'>{event}</span> */}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`w-full p-4 transition-colors hover:bg-accent ${upcoming ? "bg-primaryTheme-100" : ""}`}>
      <div className='mb-4 flex items-start justify-between'>
        <div>
          <div className='text-4xl font-bold'>{day}</div>
          <div className='text-sm text-muted-foreground'>{month}</div>
        </div>
        <div className='flex flex-col items-end text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Users className='h-4 w-4' />
            {/* <span>{event.invitedCount} Invited</span> */}
          </div>
          {/* <span>{event.acceptedCount} Yes</span>
          <span>{event.declinedCount} No</span> */}
        </div>
      </div>
      <div className='space-y-2'>
        <h3 className='font-medium text-primary'>{event.name}</h3>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Clock className='h-4 w-4' />
          <span>{formattedTime}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <MapPin className='h-4 w-4' />
          <span>{event.location}</span>
        </div>
      </div>
    </Card>
  );
}
