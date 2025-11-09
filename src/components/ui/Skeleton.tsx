export default function Skeleton({ className = 'h-4 w-24' }: { className?: string }) {
return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}