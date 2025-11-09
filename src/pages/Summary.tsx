import Card from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';


export default function Summary() {
const { t } = useTranslation();
return (
<div className="grid gap-4 md:grid-cols-2">
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">{t('summary.title')}</h2>
<p className="text-sm text-gray-600">{t('summary.description')}</p>
</Card>
<Card className="p-6">
<h2 className="text-lg font-bold mb-2">{t('summary.distributions')}</h2>
<p className="text-sm text-gray-600">{t('summary.distributionsDesc')}</p>
</Card>
</div>
);
}