"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { CheckCircleIcon, EnvelopeIcon, EnvelopeOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminNotificationPage() {
  const session = useSession();
  const [activeFilter, setActiveFilter] = useState("all");
  const [openNotification, setOpenNotification] = useState("");
  const [showModal, setShowModal] = useState(false);

  const notifications = trpc.getAllNotificationByUserId.useQuery({
    id: session?.data?.user.id ?? ""
  });

 

  const getNotificationById = trpc.getNotificationById.useQuery({
    id: openNotification
  }, {
    enabled: !!openNotification
  });
  const filteredNotifications = notifications.data?.filter(notification => {
    if (activeFilter === "read") return notification.is_read;
    if (activeFilter === "unread") return !notification.is_read;
    return true;
  });

  const handleNotificationClick = (notificationId: string) => {
    setOpenNotification(notificationId);
    setShowModal(true);
  };

  return (
    <div className="w-full h-screen">
      <div className="h-full bg-gray-50 rounded-xl shadow-md">
        <div className="border-b border-gray-200 px-8 py-6 bg-gray-100 rounded-t-xl">
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <div className="mt-6 flex items-center space-x-6">
            <div className="px-6 py-3 bg-white rounded-lg shadow-sm">
              <span className="text-base font-medium text-gray-700">Total: {notifications.data?.length || 0}</span>
            </div>
            <div className="px-6 py-3 bg-green-100 rounded-lg shadow-sm">
              <span className="text-base font-medium text-green-700">Unread: {notifications.data?.filter(n => !n.is_read).length || 0}</span>
            </div>
          </div>
        </div>

        <div className="p-8 h-[calc(100vh-180px)] overflow-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="inline-flex rounded-lg p-2 bg-white shadow-sm border border-gray-200">
              <button 
                onClick={() => setActiveFilter("all")}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeFilter === "all" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter("unread")}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeFilter === "unread" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Unread
              </button>
              <button 
                onClick={() => setActiveFilter("read")}
                className={`px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeFilter === "read" 
                    ? "bg-green-500 text-white shadow-sm" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Read
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredNotifications?.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                <EnvelopeIcon className="mx-auto h-20 w-20 text-gray-400" />
                <h3 className="mt-6 text-xl font-medium text-gray-900">No notifications</h3>
                <p className="mt-3 text-base text-gray-500">No notifications found for the selected filter.</p>
              </div>
            ) : (
              filteredNotifications?.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-6 rounded-lg shadow-sm transition-all duration-200 ${
                    !notification.is_read && openNotification !== notification.id
                      ? "bg-green-50 border-l-4 border border-green-200 border-l-green-500"
                      : "bg-white border border-gray-200 hover:border-green-200 hover:bg-green-50"
                  } cursor-pointer`}
                >
                  <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start space-x-6">
                      <div className="mt-1 flex-shrink-0">
                        {notification.is_read || openNotification === notification.id ? (
                          <EnvelopeOpenIcon className="h-7 w-7 text-gray-400" />
                        ) : (
                          <EnvelopeIcon className="h-7 w-7 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {notification.title}
                        </h3>
                        <p className="mt-3 text-lg text-gray-600 line-clamp-2">{notification.message}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-5 text-base text-gray-500">
                          <span className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2.5 ${
                              notification.priority === 1 ? "bg-red-500" :
                              notification.priority === 2 ? "bg-orange-500" :
                              notification.priority === 3 ? "bg-yellow-500" :
                              notification.priority === 4 ? "bg-blue-500" :
                              "bg-gray-500"
                            }`}></span>
                            Priority {notification.priority}
                          </span>
                          <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                          <span className="capitalize px-4 py-1.5 rounded-full text-base bg-gray-100 font-medium">
                            {notification.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      {(notification.is_read || openNotification === notification.id) && (
                        <CheckCircleIcon className="h-7 w-7 text-green-600" />
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add your mark as read/unread logic here
                        }}
                        className="px-5 py-2.5 text-base font-medium text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                      >
                        {notification.is_read ? "Mark as Unread" : "Mark as Read"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showModal && getNotificationById.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{getNotificationById.data.title}</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setOpenNotification("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Message</h3>
                <p className="text-gray-600">{getNotificationById.data.message}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sender</h3>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-600">{getNotificationById.data.user.first_name} {getNotificationById.data.user.last_name}</span>
                </div>
              </div>

              {getNotificationById.data.recipients && getNotificationById.data.recipients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Recipients</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {getNotificationById.data.recipients.map((recipient, index) => (
                      <span key={recipient.recipient.id} className="text-gray-600">
                        {recipient.recipient.first_name} {recipient.recipient.last_name}
                        {index < (getNotificationById.data?.recipients.length || 0) - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
