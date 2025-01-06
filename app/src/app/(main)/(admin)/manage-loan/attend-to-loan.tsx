interface RejectedLoanDetailsProps {
  loan: {
    rejected_by?: {
      first_name?: string;
      last_name?: string;
    };
    rejected_at?: Date;
    status: string;
  };
}

export default function RejectedLoanDetails({ loan }: RejectedLoanDetailsProps) {
  if (loan.status !== "rejected" || !loan.rejected_by || !loan.rejected_at) {
    return null;
  }

  const rejectedByFullName = `${loan.rejected_by.first_name || ""} ${loan.rejected_by.last_name || ""}`.trim();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
      <div className="flex items-center gap-2">
        <svg 
          className="w-5 h-5 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="text-red-600 font-medium">Loan Rejected</span>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>Rejected by: <span className="font-medium">{rejectedByFullName}</span></p>
        <p>Date: <span className="font-medium">
          {new Date(loan.rejected_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </span></p>
      </div>
    </div>
  );
}

