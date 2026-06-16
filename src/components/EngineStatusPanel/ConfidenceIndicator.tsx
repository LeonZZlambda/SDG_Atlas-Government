import { Tooltip } from './Tooltip';
import { useTranslation } from '../../i18n';

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
}

export function ConfidenceIndicator({ level }: ConfidenceIndicatorProps) {
  const { t } = useTranslation();
  
  const colors = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };
  
  const getLabel = () => {
    if (level === 'high') return t('confidence_high');
    if (level === 'medium') return t('confidence_medium');
    return t('confidence_low');
  };
  
  return (
    <Tooltip content={`${t('confidence_label')}: ${getLabel()}`}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 9,
        fontWeight: 600,
        color: colors[level],
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: colors[level],
        }} />
        {getLabel()}
      </span>
    </Tooltip>
  );
}
