import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCases } from '@/store/useCases';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/lib/routes';


export default function CaseDetail() {
const { id = '' } = useParams();
const nav = useNavigate();
const c = useCases(s => s.getById(id));
const setStatus = useCases(s => s.updateStatus);


if (!c) return <p>Case no encontrado.</p>;


return (
<div className="space-y-3">
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">{c.name}</h2>
<p>Método: <strong>{c.method}</strong></p>
<p>Capas: <strong>{c.layers}</strong></p>
<p>Estado actual: <strong>{c.status}</strong></p>
<div className="mt-4 flex gap-2">
<Button onClick={() => setStatus(c.id, 'running')}>Iniciar</Button>
<Button variant="secondary" onClick={() => setStatus(c.id, 'completed')}>Marcar completado</Button>
<Button variant="ghost" onClick={() => nav(routes.results(c.id))}>Ver resultados</Button>
</div>
</Card>
</div>
);
}