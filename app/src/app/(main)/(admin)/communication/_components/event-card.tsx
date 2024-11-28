import React from "react";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Event } from "@prisma/client";

interface EventCardProps {
    event: Event;
    isLoading: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isLoading }) => {
    if (isLoading) {
        return (
            <div className='mb-1 animate-pulse rounded-xl bg-blue-50 p-4 shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className='text-center'>
                        <div className='h-4 w-8 rounded bg-gray-300'></div>
                        <div className='mt-1 h-8 w-8 rounded bg-gray-300'></div>
                    </div>
                    <div className='mx-2 h-12 w-[2px] rounded bg-gray-300' />
                    <div className='flex w-full items-center space-x-5'>
                        <div>
                            <div className='mb-2 h-4 w-24 rounded bg-gray-300'></div>
                            <div className='h-4 w-32 rounded bg-gray-300'></div>
                        </div>
                        <div className='flex-1'>
                            <div className='mb-2 h-6 w-3/4 rounded bg-gray-300'></div>
                            <div className='h-4 w-full rounded bg-gray-300'></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formattedDate = format(new Date(event.starts), "eee"); // "Wed"
    const formattedDay = format(new Date(event.starts), "dd"); // "25"
    const formattedTime = `${format(new Date(event.starts), "HH:mm")} - ${format(new Date(event.ends), "HH:mm")}`;

    return (
        <div className='mb-1 rounded-xl bg-blue-50 p-4 shadow-sm'>
            <div className='flex items-center gap-4'>
                <div className='text-center'>
                    <div className='text-sm font-medium text-gray-600'>{formattedDate}</div>
                    <div className='text-3xl font-semibold text-gray-700'>{formattedDay}</div>
                </div>
                <div className='mx-2 h-12 w-[2px] rounded bg-gray-400' />
                <div className='flex w-full items-center space-x-5'>
                    <div>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <Clock className='h-4 w-4' />
                            {formattedTime}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <MapPin className='h-4 w-4' />
                            {event.link ? (
                                <Link href={event.link} target='_blank' rel='noopener noreferrer' className='text-primaryTheme-600'>
                                    {event.link.startsWith("http") ? "Virtual" : event.link}
                                </Link>
                            ) : (
                                event.location
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold text-gray-800'>{event.name}</h3>
                        {event.description && <p className='text-sm text-gray-500'>{event.description}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
