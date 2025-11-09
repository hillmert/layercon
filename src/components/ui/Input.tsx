import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';


type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };


const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...props }, ref) => {
const inputId = id || props.name || Math.random().toString(36).slice(2, 8);
return (
<div className="flex flex-col gap-1">
{label && <label htmlFor={inputId} className="text-sm font-semibold">{label}</label>}
<input
id={inputId}
ref={ref}
className={clsx('rounded-2xl border border-gray-300 px-3 py-2 focus:border-secondary', className)}
{...props}
/>
{error && <p className="text-sm text-red-600" role="alert">{error}</p>}
</div>
);
});


export default Input;