"use client";

import { Button } from "@/components/ui/button";

export function Pagination() {
  return (
    <div className='mt-5 flex items-center justify-between px-2'>
      <div></div>
      <div className='flex items-center gap-3'>
        <Button disabled variant='secondary' size='sm'>
          Previous
        </Button>
        <Button disabled variant='secondary' size='sm'>
          Next
        </Button>
      </div>
    </div>
  );
}
