"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TeamsPage() {
  const redirect = useRouter();

  const verify = trpc.generateUserToken.useMutation({
    onSuccess: async (data) => {
      toast.success("verification successful");
      redirect.push(data.redirectUrl);


    },
    onError: (error) => {
      console.error(error);
      toast.error("Error in designating role");

    },
  });

  function onSubmit(values: { userId: string }) {
    console.log(values);
    verify.mutate({ ...values });
  }

  return (
    <div className="container mx-auto py-10">
      <button className="py-2 px-4 border rounded" onClick={() => onSubmit({ userId: "01938d34-24ec-7664-ba02-40441c175e32" })}>Trigger</button>
    </div>
  );
}

