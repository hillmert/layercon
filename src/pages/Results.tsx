import Card from '@/components/ui/Card';
import { useParams } from 'react-router-dom';
import { useCases } from '@/store/useCases';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


const chartData = Array.from({ length: 16 }).map((_, i) => ({ step: i, value: Math.round(50 + 20 * Math.sin(i / 2)) }));


export default function Results() {
const { id = '' } = useParams();
const c = useCases(s => s.getById(id));
if (!c) return <p>Case no encontrado.</p>;


return (
<div className="grid gap-4 lg:grid-cols-2">
<Card className="p-6">
<h2 className="text-lg font-bold mb-4">Resumen</h2>
<ul className="list-disc pl-5 space-y-1">
<li>Case: <strong>{c.name}</strong></li>
<li>Método: <strong>{c.method}</strong></li>
<li>Capas: <strong>{c.layers}</strong></li>
<li>Estado: <strong>{c.status}</strong></li>
</ul>
</Card>


<Card className="p-6">
<h2 className="text-lg font-bold mb-4">Serie (mock)</h2>
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={chartData}>
<XAxis dataKey="step" />
<YAxis />
<Tooltip />
<Line type="monotone" dataKey="value" />
</LineChart>
</ResponsiveContainer>
</div>
</Card>
</div>
);
}