import { useTranslation } from 'react-i18next';

export default function Mapping() {
const { t } = useTranslation();
return <p className="text-sm text-gray-700">{t('mapping.title')}</p>;
}