"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/app/_providers/trpc-provider";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { performanceReviewFeedbackType } from "@/app/server/module/performance-review";
import { Button } from "@/components/ui/button";

export default function ViewStaffReviewPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const { data: review, isLoading } = trpc.findPerformanceReviewById.useQuery({
    id: reviewId
  });
  const feedback = review?.feedback as unknown as performanceReviewFeedbackType[];

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="text-center">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">No Review Found</h2>
          <p className="mt-2 text-gray-500">The performance review you are looking for does not exist or has been removed.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleGoBack}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Go Back
          </Button>
       
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Performance Review Details</h1>
          <p className="text-gray-600 mt-2">
            Review for {review.staff.user.first_name} {review.staff.user.last_name}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleGoBack}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Go Back
          </Button>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="border-b border-gray-100 bg-emerald-50">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Staff Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-800 font-semibold mt-1">{review.staff.user.first_name} {review.staff.user.last_name}</p>
              </div>
              {/* <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-800 font-semibold mt-1">{review.staff.email}</p>
              </div> */}
              <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Team</label>
                <p className="text-gray-800 font-semibold mt-1">{review.team?.name || "Not Assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="border-b border-gray-100 bg-emerald-50">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Review Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Template</label>
                <p className="text-gray-800 font-semibold mt-1">{review.template.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Reviewer</label>
                <p className="text-gray-800 font-semibold mt-1">{review.reviewer.first_name} {review.reviewer.last_name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <label className="text-sm font-medium text-gray-500">Review Date</label>
                <p className="text-gray-800 font-semibold mt-1">
                  {format(new Date(review.created_at), "PPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="border-b border-gray-100 bg-emerald-50">
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Feedback Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            {feedback?.map((item: performanceReviewFeedbackType, index: number) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 border-l-4 border-emerald-400 hover:border-emerald-600 transition-colors duration-200">
                <label className="text-sm font-medium text-gray-500">{item.column_name}</label>
                <p className="text-gray-800 font-semibold mt-2 whitespace-pre-wrap">{item.column_value}</p>
                {item.column_description && (
                  <p className="text-sm text-gray-500 mt-2 italic">{item.column_description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
