import Link from "next/link";
import { Page } from "@/lib/constants";

export default function MobileNav({ pages }: { pages: Page[] }) {
  return (
    <nav className='fixed bottom-0 w-full border-t border-gray-200 bg-white py-3 md:hidden'>
      <ul className='grid grid-cols-4 px-2'>
        {pages.map((page) => (
          <li key={page.pathname}>
            <Link href={page.pathname} className='flex flex-col items-center text-gray-500'>
              <div className='size-6'>{page.icon}</div>
              <span className='mt-1 text-xs tracking-tight'>{page.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
