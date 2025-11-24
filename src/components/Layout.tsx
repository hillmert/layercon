import { PropsWithChildren, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';


export default function Layout({ children }: PropsWithChildren) {
const [open, setOpen] = useState(true);
return (
<div className="h-screen flex flex-col bg-[rgb(var(--t-surface))] text-[rgb(var(--t-on))] overflow-hidden w-screen">
<Navbar onToggleSidebar={() => setOpen(o => !o)} />
<div className="flex flex-1 overflow-hidden w-full">
<Sidebar open={open} />
<main id="main" className="flex-1 overflow-y-auto overflow-x-hidden p-4">{children}</main>
</div>
</div>
);
}