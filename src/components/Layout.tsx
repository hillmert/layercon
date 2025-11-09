import { PropsWithChildren, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';


export default function Layout({ children }: PropsWithChildren) {
const [open, setOpen] = useState(true);
return (
<div className="min-h-screen flex flex-col bg-[rgb(var(--t-surface))] text-[rgb(var(--t-on))]">
<Navbar onToggleSidebar={() => setOpen(o => !o)} />
<div className="flex flex-1">
<Sidebar open={open} />
<main id="main" className="flex-1 p-4">{children}</main>
</div>
</div>
);
}