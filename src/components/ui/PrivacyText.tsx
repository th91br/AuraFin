interface PrivacyTextProps {
  value: number;
  isPrivacyMode: boolean;
  className?: string;
  prefix?: string;
  minimumFractionDigits?: number;
}

export function PrivacyText({
  value,
  isPrivacyMode,
  className = '',
  prefix = 'R$',
  minimumFractionDigits = 2,
}: PrivacyTextProps) {
  if (isPrivacyMode) {
    return <span className={`font-mono select-none tracking-widest ${className}`}>{prefix} ••••••</span>;
  }

  const safeValue = (value !== undefined && value !== null && !isNaN(value)) ? value : 0;
  const formatted = safeValue.toLocaleString('pt-BR', { minimumFractionDigits });
  return (
    <span className={className}>
      {prefix} {formatted}
    </span>
  );
}
