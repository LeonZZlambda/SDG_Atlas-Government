import { motion } from 'framer-motion';
import { getSDGIcon } from './ODSIcons';
import { useTranslation } from '../i18n';

interface ODSCardProps {
  id: number;
  name: string;
  shortDesc: string;
  color: string;
  isSelected: boolean;
  onToggle: () => void;
  analyticalMetadata?: {
    complexity: 'low' | 'medium' | 'high';
    systemicImpact: 'low' | 'medium' | 'high';
    institutionalDependency: 'low' | 'medium' | 'high';
    strongSynergies: number[];
  };
}

export function ODSCard({ id, name, shortDesc, color, isSelected, onToggle, analyticalMetadata }: ODSCardProps) {
  const { t } = useTranslation();
  
  // Keypress handler for keyboard accessibility (space/enter to toggle checkbox)
  const handleKeyDown = (e: any) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.div
      tabIndex={0}
      aria-label={`SDG ${id}: ${name}. ${isSelected ? 'Selected' : 'Not selected'}`}
      onKeyDown={handleKeyDown}
      onClick={onToggle}
      className={`clay-card clay-card-hover ods-card`}
      style={{
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: isSelected ? color : 'var(--bg-glass)',
        color: isSelected ? '#ffffff' : 'var(--text-primary)',
        boxShadow: isSelected
          ? `0 10px 20px ${color}40, inset -4px -4px 8px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.25)`
          : 'var(--clay-card-shadow)',
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Número decorativo — ancorado no canto inferior direito do card */}
      <span style={{
        position: 'absolute',
        bottom: '-8px',
        right: '-4px',
        fontSize: 'clamp(48px, 8vw, 72px)',
        fontWeight: 900,
        opacity: isSelected ? 0.12 : 0.05,
        fontFamily: 'var(--font-heading)',
        userSelect: 'none',
        pointerEvents: 'none',
        color: 'inherit',
        lineHeight: 1,
      }}>
        {id}
      </span>

      {/* Header: ícone + indicador de seleção — sempre no topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: isSelected ? 'rgba(255,255,255,0.2)' : `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '7px',
          flexShrink: 0,
          boxShadow: isSelected ? 'inset -1px -1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>
          {getSDGIcon(id, '', isSelected ? '#ffffff' : color)}
        </div>

        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          flexShrink: 0,
          marginTop: '4px',
          background: isSelected ? '#ffffff' : color,
          boxShadow: isSelected ? '0 0 6px rgba(255,255,255,0.8)' : 'inset -1px -1px 3px rgba(0,0,0,0.15)',
        }} />
      </div>

      {/* Body: título + descrição — sempre logo abaixo do header */}
      <div style={{ zIndex: 1 }}>
        <h3 style={{
          fontSize: 'clamp(11px, 1.3vw, 13px)',
          margin: '0 0 5px 0',
          fontWeight: 800,
          lineHeight: 1.3,
          fontFamily: 'var(--font-heading)',
          color: 'inherit',
         }}>
          {id}. {name}
        </h3>
        <p style={{
          fontSize: 'clamp(10px, 1.1vw, 11px)',
          margin: '0 0 12px 0',
          lineHeight: 1.4,
          color: isSelected ? 'rgba(255,255,255,0.82)' : 'var(--text-secondary)',
        }}>
          {shortDesc}
        </p>
      </div>

      {/* Metadados Analíticos — sempre na base do card */}
      {analyticalMetadata && (
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '10px',
          borderRadius: '8px',
          background: isSelected ? 'var(--bg-glass)' : 'var(--bg-tertiary)',
          fontSize: 'clamp(9px, 1vw, 10px)',
          lineHeight: 1.3
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {t('card_complexity')}:
              </span>
              <span style={{ 
                color: analyticalMetadata.complexity === 'high' ? '#dc2626' : 
                       analyticalMetadata.complexity === 'medium' ? '#d97706' : '#059669',
                fontWeight: 700 
              }}>
                {t(`card_complexity_${analyticalMetadata.complexity}`)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {t('card_systemic_impact')}
              </span>
              <span style={{ 
                color: analyticalMetadata.systemicImpact === 'high' ? '#dc2626' : 
                       analyticalMetadata.systemicImpact === 'medium' ? '#d97706' : '#059669',
                fontWeight: 700 
              }}>
                {t(`card_impact_${analyticalMetadata.systemicImpact}`)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                {t('card_institutional_dependency')}
              </span>
              <span style={{ 
                color: analyticalMetadata.institutionalDependency === 'high' ? '#dc2626' : 
                       analyticalMetadata.institutionalDependency === 'medium' ? '#d97706' : '#059669',
                fontWeight: 700 
              }}>
                {t(`card_dependency_${analyticalMetadata.institutionalDependency}`)}
              </span>
            </div>
            {analyticalMetadata.strongSynergies.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '4px',
                paddingTop: '6px',
                boxShadow: 'inset 0 1px 0 var(--border-dark)'
              }}>
                <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {t('card_strong_synergy')}
                </span>
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  ODS {analyticalMetadata.strongSynergies.join(', ')}
                </span>
              </div>
            )}
        </div>
      )}
    </motion.div>
  );
}
