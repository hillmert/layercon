import { FormEvent, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCases } from '@/store/useCases';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/lib/routes';


export default function CreateCase() {
const nav = useNavigate();
const add = useCases(s => s.addCase);
const [name, setName] = useState('');
const [layers, setLayers] = useState(1);
const [error, setError] = useState<string | undefined>();


function onSubmit(e: FormEvent) {
e.preventDefault();
if (!name.trim()) { setError('Nombre requerido'); return; }
if (layers <= 0) { setError('Capas debe ser > 0'); return; }
const created = add({ name, layers, method: 'Darcy 3 phases' });
nav(routes.caseDetail(created.id));
}


return (
<div className="max-w-xl">
<Card className="p-6">
<h2 className="text-lg font-bold mb-4">Crear caso</h2>
<form onSubmit={onSubmit} className="space-y-4" aria-label="Formulario crear caso">
<Input label="Nombre" name="name" value={name} onChange={e => setName(e.target.value)} />
<Input label="Método" value="Darcy 3 phases" disabled />
<Input label="Capas" type="number" value={layers} onChange={e => setLayers(Number(e.target.value))} />
{error && <p className="text-sm text-red-600" role="alert">{error}</p>}
<div className="flex gap-2">
<Button type="submit">Guardar</Button>
<Button type="button" variant="ghost" onClick={() => nav(routes.cases)}>Cancelar</Button>
</div>
</form>
</Card>
</div>
);
}