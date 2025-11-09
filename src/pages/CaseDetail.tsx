import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCases } from '@/store/useCases';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useTranslation } from 'react-i18next';


export default function CaseDetail() {
const { t } = useTranslation();
const { id = '' } = useParams();
const nav = useNavigate();
const c = useCases(s => s.getById(id));
const setStatus = useCases(s => s.updateStatus);


if (!c) return <p>{t('caseDetail.notFound')}</p>;


return (
<div className="space-y-3">
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">{c.name}</h2>
<p>{t('caseDetail.method')}: <strong>{c.method}</strong></p>
<p>{t('caseDetail.layers')}: <strong>{c.layers}</strong></p>
<p>{t('caseDetail.currentStatus')}: <strong>{t(`cases.status.${c.status}`)}</strong></p>
<div className="mt-4 flex gap-2">
<Button onClick={() => setStatus(c.id, 'running')}>{t('caseDetail.start')}</Button>
<Button variant="secondary" onClick={() => setStatus(c.id, 'completed')}>{t('caseDetail.markCompleted')}</Button>
<Button variant="ghost" onClick={() => nav(routes.results(c.id))}>{t('caseDetail.viewResults')}</Button>
</div>
</Card>
</div>
);
}