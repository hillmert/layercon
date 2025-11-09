import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';


export default function Home() {
return (
<div className="space-y-4">
{/* Botón llamativo para crear caso (en menú principal) */}
<div className="flex justify-center">
<Link to={routes.createCase}>
<Button className="text-lg px-6 py-3">➕ Crear nuevo caso</Button>
</Link>
</div>


{/* Accesos rápidos a secciones principales */}
<div className="grid gap-4 md:grid-cols-3">
<Link to={routes.summary}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">Analíticas generales</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">KPIs y tendencias (overview).</p>
</Card>
</Link>
<Link to={routes.cases}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">Casos</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">Lista, formulario y resultados por caso.</p>
</Card>
</Link>
<Link to={routes.data}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">Data Management</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">Data y Mapping.</p>
</Card>
</Link>
</div>
}