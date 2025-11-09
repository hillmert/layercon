import Card from '@/components/ui/Card';


export default function Summary() {
return (
<div className="grid gap-4 md:grid-cols-2">
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">Analíticas generales</h2>
<p className="text-sm text-gray-600">KPIs y tendencias (placeholder).</p>
</Card>
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">Distribuciones</h2>
<p className="text-sm text-gray-600">Gráficos y resúmenes (placeholder).</p>
</Card>
</div>
);
}