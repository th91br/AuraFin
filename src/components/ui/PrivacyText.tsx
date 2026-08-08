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

  const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits });
  return (
    <span className={className}>
      {prefix} {formatted}
    </span>
  );
}
