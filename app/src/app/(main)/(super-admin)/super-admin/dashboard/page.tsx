import { auth } from "@/auth";
import { BellIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  // Fetch unread notifications
  const unreadNotifications = await prisma.notification.findMany({
    where: {
      recipients: {
        some: {
          recipient_id: session?.user.id as string
        }
      },
      is_read: false,
    },
    orderBy: {
      created_at: "desc"
    },
    take: 5
  });

  return (
    <>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center'>
          <h1 className='text-lg font-semibold md:text-2xl'>Hi, {session?.user.first_name}, {session?.user.organization?.name} welcome to your super admin dashboard 👋🏽</h1>
        </div>
        
        <div className="relative group">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <BellIcon className="h-6 w-6" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full" />
            )}
          </button>
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
            <div className="p-4">
              <h3 className="font-semibold mb-2">Notifications</h3>
              {unreadNotifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No new notifications</p>
              ) : (
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <Link 
                      key={notification.id}
                      href="/notification"
                      className="block p-2 hover:bg-gray-50 rounded-md"
                    >
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-gray-500 text-sm">{notification.message}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'></div>
    </>
  );
}
