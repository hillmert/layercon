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
<thead className="bg-gray-100 text-gray-700">
{children}
</thead>
);
}


export function TBody({ children }: PropsWithChildren) {
return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}


export function TR({ children }: PropsWithChildren) { return <tr className="hover:bg-gray-50">{children}</tr>; }
export function TH({ children }: PropsWithChildren) { return <th className="text-left px-4 py-2 font-semibold">{children}</th>; }
export function TD({ children, ...props }: PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>) { return <td className="px-4 py-2" {...props}>{children}</td>; }