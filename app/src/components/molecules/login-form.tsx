"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/dtos";
import { useMutation } from "@tanstack/react-query";
import { signInWithPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getSession } from "next-auth/react";
import { PageRole, pageRoleMapping, userRoleNames } from "@/lib/constants";
import Link from "next/link";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export function LoginForm() {
  const router = useRouter();
  const { setOrganizationSlug } = useActiveOrganizationStore();


  const { isPending, mutate } = useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async (response) => {

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.ok) {

        toast.success("Sign in successful");

        await handleRedirect();
        return;
      }
    },
  });

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleRedirect() {
    try {
    const session = await getSession();
    const roles = session?.user.roles?.map(({ role_name }) => role_name) || [];

    const slug = session?.user.organization_id;

    setOrganizationSlug(slug!);

    const defaultPage = pageRoleMapping[roles[0] as PageRole][0];

    if (roles[0] === userRoleNames.employee) {
      router.push("/profile");
      return;

    }else if(roles[0] === userRoleNames.super_admin){

      router.push("/organization");
      return;
    } else {
      router.push(defaultPage.pathname);
    }
  } catch (error) {
    console.error("Error in handleRedirect:", error);
  }

  }

  return (
    <Card className='w-full max-w-xs'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>Enter your credentials below to login.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => mutate(values),
            (error) => console.error(error)
          )}
        >
          <fieldset disabled={isPending}>
            <CardContent className='grid gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Email</Label>
                    <div className='grid gap-1'>
                      <Input {...field} autoComplete='email' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <Label htmlFor={field.name}>Password</Label>
                    <div className='grid gap-1'>
                      <Input {...field} type='password' autoComplete='current-password' />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className='flex-col justify-between gap-3'>
              <Button type='submit' className='w-full' size={"lg"}>
                Sign In
              </Button>
              <div className='flex w-full items-center justify-center gap-3'>
                <hr className='flex-1 bg-gray-400' />
                <div className='text-xs tracking-tighter text-gray-500'>Don&#39;t have an account?</div>
                <hr className='flex-1 bg-gray-400' />
              </div>
              <Link href='/register' className='block w-full'>
                <Button variant='outline' type='button' className='w-full' size={"lg"}>
                  Registration
                </Button>
              </Link>
            </CardFooter>
          </fieldset>
        </form>
      </Form>
    </Card>
  );
}
