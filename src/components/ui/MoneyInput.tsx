import React from 'react';

interface MoneyInputProps {
  value: number; // Valor em reais (ex: 1250.50)
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function MoneyInput({ value, onChange, className = '', placeholder = 'R$ 0,00', disabled = false }: MoneyInputProps) {
  // Formatador de exibição brasileira
  const formatDisplay = (val: number): string => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Apenas dígitos
    if (!rawValue) {
      onChange(0);
      return;
    }
    const cents = parseInt(rawValue, 10);
    const floatVal = cents / 100;
    onChange(floatVal);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={value > 0 ? formatDisplay(value) : ''}
        onChange={handleInputChange}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white outline-none focus:border-slate-500 dark:focus:border-slate-400 transition-colors ${className}`}
      />
    </div>
  );
}
