import { useMemo, useState } from 'react';
import { useCases } from '@/store/useCases';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';


export default function Cases() {
const cases = useCases(s => s.cases);
const [q, setQ] = useState('');
const filtered = useMemo(() => cases.filter(c => c.name.toLowerCase().includes(q.toLowerCase())), [cases, q]);


return (
<div className="space-y-3">
{/* Botón llamativo para crear nuevo caso */}
<div className="flex justify-end">
<Link to={routes.createCase}><Button className="text-base px-5 py-2">➕ Crear nuevo caso</Button></Link>
</div>


<Card className="p-4">
<div className="flex items-end gap-3">
<div className="flex-1"><Input label="Buscar" value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar por nombre"/></div>
</div>
</Card>


<Card className="p-0">
<Table>
<THead>
<TR>
<TH>Nombre</TH>
<TH>Método</TH>
<TH>Capas</TH>
<TH>Estado</TH>
<TH>Creado</TH>
}