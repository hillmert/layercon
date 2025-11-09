import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';


type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
variant?: 'primary' | 'secondary' | 'ghost';
};


export default function Button({ variant = 'primary', className, ...props }: Props) {
const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 font-semibold focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const styles = {
primary: 'bg-primary text-white hover:opacity-90 shadow-soft',
secondary: 'bg-secondary text-white hover:opacity-90 shadow-soft',
ghost: 'bg-transparent text-primary hover:bg-primary/10 dark:text-secondary dark:hover:bg-secondary/10'
} as const;
return <button className={clsx(base, styles[variant], className)} {...props} />;
}