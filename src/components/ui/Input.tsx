import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';


type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };


const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...props }, ref) => {
const inputId = id || props.name || Math.random().toString(36).slice(2, 8);
return (
<div className="flex flex-col gap-1">
{label && <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
<input
id={inputId}
ref={ref}
className={clsx('rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:border-primary dark:focus:border-secondary focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary/20 transition-colors', className)}
{...props}
/>
{error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
</div>
);
});


export default Input;