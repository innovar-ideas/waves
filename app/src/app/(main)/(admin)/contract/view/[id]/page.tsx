"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { replaceVariables } from "@/lib/helper-function";
import { useParams } from "next/navigation";


const ViewContract = () => {
    const params = useParams();
    const id = params?.id as string;

  const { data: staffs, isLoading } = trpc.getSingleStaffById.useQuery({ id });

  const staffData = {
    name: staffs?.user.first_name as string,
    email: staffs?.user.email as string,
  };

  const contractContent = staffs?.contracts[0].details;

  const previewContent = replaceVariables(contractContent as string, staffData);

  if(isLoading){
    <Skeleton className='my-1.5 h-3 w-36' />;

  }


    return (
        <div>
            <h2 className="my-6 font-semibold">View {staffs?.user.first_name} Contract</h2>
            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </div>
    );
};

export default ViewContract;