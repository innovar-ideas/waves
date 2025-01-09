"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TUpdateTeamSchema } from "@/lib/dtos";
import { updateTeamSchema } from "@/lib/dtos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Team } from "@prisma/client";

interface UpdateTeamFormProps {
  team: Team;
}

export function UpdateTeamForm({ team }: UpdateTeamFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<TUpdateTeamSchema>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      id: team.id,
      name: team.name ?? "",
      description: team.description ?? "",
    },
  });

  const { mutate: updateTeam, isPending } = trpc.updateTeam.useMutation({
    onSuccess: () => {
      toast.success("Team updated successfully");
      utils.getAllParentTeamByOrganizations.invalidate();
      setOpen(false);
      router.push("/team");
    },
    onError: (error) => {
        toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof updateTeamSchema>) {
    updateTeam(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          Edit Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Make changes to your team here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder={team.name} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder={team.description ?? ""} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? "Updating..." : "Update Team"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
