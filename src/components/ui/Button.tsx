import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ variant = 'primary', className, ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200';
  const styles = {
    primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] shadow-md',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 hover:shadow-lg hover:scale-[1.02] shadow-md',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 dark:text-secondary dark:hover:bg-secondary/20 dark:hover:text-white hover:scale-105'
  } as const;
  return <button className={clsx(base, styles[variant], className)} {...props} />;
}