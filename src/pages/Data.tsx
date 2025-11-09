import { useTranslation } from 'react-i18next';

export default function Data() {
const { t } = useTranslation();
return <p className="text-sm text-gray-700">{t('data.title')}</p>;
}