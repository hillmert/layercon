import { PropsWithChildren } from 'react';
import { clsx } from 'clsx';


export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
return (
<div className={clsx('bg-white dark:bg-[#0F162B] text-inherit rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800', className)}>
{children}
</div>
);
}