"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/app/_providers/trpc-provider";
// import { NewEventDialog } from "@/components/communication/new-event-modal";
// import { DynamicEventCard } from "@/components/communication/dynamic-event-card";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { ViewMode } from "./_components/type";
import { NewEventDialog } from "./_components/new-event-dialog";
import { DynamicEventCard } from "./_components/dynamic-event-card";

export default function EventsPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState("upcoming");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const { data: eventsData } = trpc.getAllEventsForOrganizationBySlug.useQuery({ slug: organizationSlug });
  const events = eventsData?.events;

  const upcomingEvents = useMemo(() => {
    if (!events) return [];

    const now = new Date();
    return events
      .filter((event) => new Date(event.ends) >= now)
      .sort((a, b) => new Date(a.starts).getTime() - new Date(b.starts).getTime());
  }, [events]);

  const pastEvents = useMemo(() => {
    if (!events) return [];

    const now = new Date();
    return events
      .filter((event) => new Date(event.ends) < now)
      .sort((a, b) => new Date(b.starts).getTime() - new Date(a.starts).getTime());
  }, [events]);

  return (
    <>
      <div className='w-full rounded-2xl bg-white p-4 shadow-sm'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Events</h1>
        </div>
        <div className='mb-6 flex w-full'>
          <Tabs value={filter} onValueChange={setFilter} className='w-full'>
            <TabsList className='mb-10 flex !h-fit w-full flex-col justify-start gap-4 !bg-transparent !bg-none md:flex-row md:justify-between'>
              <div className='flex'>
                <TabsTrigger
                  value='all'
                  className='w-auto px-4 py-2 data-[state=active]:rounded-lg data-[state=active]:bg-primaryTheme-100 data-[state=active]:text-primaryTheme-600'
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value='upcoming'
                  className='w-auto px-4 py-2 data-[state=active]:rounded-lg data-[state=active]:bg-primaryTheme-100 data-[state=active]:text-primaryTheme-600'
                >
                  Upcoming
                </TabsTrigger>
                <TabsTrigger
                  value='past'
                  className='data-[state=active]: w-auto px-4 py-2 data-[state=active]:rounded-lg data-[state=active]:bg-primaryTheme-100 data-[state=active]:text-primaryTheme-600'
                >
                  Past
                </TabsTrigger>
              </div>

              <div className='flex items-start gap-4'>
                <div className='flex rounded-md border'>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size='icon'
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size='icon'
                    onClick={() => setViewMode("list")}
                  >
                    <List className='h-4 w-4' />
                  </Button>
                </div>
                <Button onClick={() => setShowNewEvent(true)}>
                  <Plus className='mr-2 h-4 w-4' /> Create Event
                </Button>
              </div>
            </TabsList>
            <TabsContent value='all' className='space-y-4'>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4 lg:flex-row lg:flex-wrap"
                }
              >
                {events?.map((event) => <DynamicEventCard key={event.id} event={event} variant={viewMode} />)}
              </div>
            </TabsContent>
            <TabsContent value='upcoming' className='space-y-4'>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4 lg:flex-row lg:flex-wrap"
                }
              >
                {upcomingEvents?.map((event) => (
                  <DynamicEventCard key={event.id} event={event} variant={viewMode} upcoming={true} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value='past' className='space-y-4'>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4 lg:flex-row lg:flex-wrap"
                }
              >
                {pastEvents?.map((event) => <DynamicEventCard key={event.id} event={event} variant={viewMode} />)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <NewEventDialog open={showNewEvent} onOpenChange={setShowNewEvent} />
    </>
  );
}
