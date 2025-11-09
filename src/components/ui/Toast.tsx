import { useEffect, useState } from 'react';


export function Toast({ message, open, onClose }: { message: string; open: boolean; onClose: () => void }) {
const [visible, setVisible] = useState(open);
useEffect(() => setVisible(open), [open]);
useEffect(() => {
if (!visible) return;
const id = setTimeout(() => onClose(), 2500);
return () => clearTimeout(id);
}, [visible, onClose]);
if (!visible) return null;
return (
<div role="status" aria-live="polite" className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-2xl shadow-soft">
{message}
</div>
);
}