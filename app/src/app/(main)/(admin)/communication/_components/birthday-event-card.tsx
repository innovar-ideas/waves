import React from "react";
import { format } from "date-fns";

interface EventCardProps {
    date: Date;
    name: string;
    isLoading: boolean;
    role?: string;
}

const BirthdayEventCard: React.FC<EventCardProps> = ({ date, role, name, isLoading }) => {
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

    const formattedDate = format(new Date(date), "eee");
    const formattedDay = format(new Date(date), "dd");

    return (
        <div className='mb-1 w-full rounded-xl bg-blue-50 p-4 shadow-sm'>
            <div className='flex items-center gap-4'>
                <div className='text-center'>
                    <div className='text-sm font-medium text-gray-600'>{formattedDate}</div>
                    <div className='text-3xl font-semibold text-gray-700'>{formattedDay}</div>
                </div>
                <div className='mx-2 h-12 w-[2px] rounded bg-gray-400' />
                <div className='flex w-full items-center space-x-5'>
                    <div>
                        <h3 className='text-lg font-semibold text-gray-800'>{name}</h3>
                        {role && <p className='text-sm text-gray-500'>{role}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BirthdayEventCard;
