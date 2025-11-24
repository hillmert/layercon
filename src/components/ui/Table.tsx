import { PropsWithChildren } from 'react';


export function Table({ children }: PropsWithChildren) {
return (
<div className="overflow-x-auto">
<table className="min-w-full text-sm">
{children}
</table>
</div>
);
}


export function THead({ children }: PropsWithChildren) {
return (
<thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b-2 border-primary/20 dark:border-secondary/20">
{children}
</thead>
);
}


export function TBody({ children }: PropsWithChildren) {
return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}


export function TR({ children }: PropsWithChildren) { return <tr className="hover:bg-primary/5 dark:hover:bg-secondary/10 transition-all duration-150 hover:shadow-sm">{children}</tr>; }
export function TH({ children }: PropsWithChildren) { return <th className="text-left px-4 py-3 font-semibold text-sm uppercase tracking-wider">{children}</th>; }
export function TD({ children, ...props }: PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>) { return <td className="px-4 py-3 text-sm" {...props}>{children}</td>; }