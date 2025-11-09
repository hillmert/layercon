import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useTranslation } from 'react-i18next';


export default function Home() {
const { t } = useTranslation();
return (
<div className="space-y-4">
<div className="flex justify-center">
<Link to={routes.createCase}>
<Button className="text-lg px-6 py-3">➕ {t('home.createNewCase')}</Button>
</Link>
</div>

<div className="grid gap-4 md:grid-cols-3">
<Link to={routes.summary}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">{t('home.analyticsCard.title')}</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">{t('home.analyticsCard.description')}</p>
</Card>
</Link>
<Link to={routes.cases}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">{t('home.casesCard.title')}</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">{t('home.casesCard.description')}</p>
</Card>
</Link>
<Link to={routes.data}>
<Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
<h2 className="text-lg font-bold mb-2">{t('home.dataCard.title')}</h2>
<p className="text-sm text-gray-600 dark:text-gray-300">{t('home.dataCard.description')}</p>
</Card>
</Link>
</div>
</div>
);
}