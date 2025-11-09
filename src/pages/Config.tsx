import { useTranslation } from 'react-i18next';

export default function Config() {
const { t } = useTranslation();
return <p className="text-sm text-gray-700">{t('config.title')}</p>;
}