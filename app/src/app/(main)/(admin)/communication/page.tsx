"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useSearchParams } from "next/navigation";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import EventCard from "./_components/event-card";
import BirthdayEventCard from "./_components/birthday-event-card";

export default function Communication() {
    const { organizationSlug } = useActiveOrganizationStore();
    const { data: eventsData, isLoading: isEventLoading } = trpc.getAllEventsGroupedByMonth.useQuery({
        slug: organizationSlug,
    });

    const { data: eventsBirthdayData, isLoading: isEventBirthdayLoading } =
        trpc.getAllBirthdayEventsForOrganizationBySlug.useQuery({
            slug: organizationSlug,
        });

    console.log(eventsData, "see events data");

    const searchParams = useSearchParams();
    const view = searchParams.get("view") || "events";

    return (
        <div className='flex w-full'>
            <div className='flex-1 rounded-2xl bg-white p-6 shadow-sm'>
                <div className='space-y-4'>
                    {view === "birthdays" && (
                        <>
                            {isEventBirthdayLoading ? (
                                <div>Loading birthdays...</div>
                            ) : eventsBirthdayData?.groupedBirthdayEvents.length ? (
                                eventsBirthdayData.groupedBirthdayEvents.map(({ month, events }) => (
                                    <section key={month}>
                                        <h2 className='mb-4 text-xl font-semibold'>
                                            {new Date(month).toLocaleString("default", { month: "long", year: "numeric" })}
                                        </h2>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            {events.map((event) =>
                                                event.users.map((user, index) => (
                                                    <BirthdayEventCard
                                                        key={index}
                                                        date={new Date(event.date)}
                                                        name={user.userName}
                                                        isLoading={isEventBirthdayLoading}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </section>
                                ))
                            ) : (
                                <div>No birthdays found.</div>
                            )}
                        </>
                    )}

                    {view !== "birthdays" && (
                        <>
                            {isEventLoading ? (
                                <div>Loading events...</div>
                            ) : eventsData?.groupedEvents.length ? (
                                eventsData.groupedEvents.map(({ month, events }) => (
                                    <section key={month}>
                                        <h2 className='mb-4 text-xl font-semibold'>
                                            {new Date(month).toLocaleString("default", { month: "long", year: "numeric" })}
                                        </h2>
                                        <div className='space-y-4'>
                                            {events.map((event) => (
                                                <EventCard key={event.id} event={event} isLoading={isEventLoading} />
                                            ))}
                                        </div>
                                    </section>
                                ))
                            ) : (
                                <div>No events found.</div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
