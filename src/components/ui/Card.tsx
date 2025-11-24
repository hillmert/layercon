import { PropsWithChildren } from 'react';
import { clsx } from 'clsx';


export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
return (
<div className={clsx('bg-white dark:bg-slate-800/50 text-inherit rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:border-primary/20 dark:hover:border-secondary/30', className)}>
{children}
</div>
);
}