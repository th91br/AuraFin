/**
/**
 * AuraFin - Formatter Utilities (BRL & Dates)
 * Centralizador único de formatação monetária e de datas para o contexto PF & PJ.
 */

/**
 * Formata um valor numérico (Reais ou Cents) para o padrão BRL (ex: R$ 1.250,50)
 * @param value Valor numérico em Reais (ex: 1250.5) ou Cents (se isCents = true)
 * @param showSymbol Se true, inclui o prefixo "R$ "
 * @param isCents Se true, divide o valor por 100 antes de formatar
 */
export function formatCurrencyBRL(
  value: number | undefined | null,
  showSymbol: boolean = true,
  isCents: boolean = false
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return showSymbol ? 'R$ 0,00' : '0,00';
  }

  const normalizedValue = isCents ? value / 100 : value;

  const formatted = normalizedValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `R$ ${formatted}` : formatted;
}

/**
 * Converte um valor em Reais para Centavos inteiros (Money Safety)
 * @param reais Valor em Reais (ex: 10.50)
 * @returns Centavos inteiros (ex: 1050)
 */
export function toCents(reais: number): number {
  if (isNaN(reais) || reais === undefined || reais === null) return 0;
  return Math.round(reais * 100);
}

/**
 * Converte centavos inteiros para valor em Reais
 * @param cents Centavos inteiros (ex: 1050)
 * @returns Reais (ex: 10.5)
 */
export function toReais(cents: number): number {
  if (isNaN(cents) || cents === undefined || cents === null) return 0;
  return cents / 100;
}

/**
 * Formata uma data ISO (YYYY-MM-DD) ou timestamp para exibição amigável em pt-BR (DD/MM/AAAA)
 * @param dateStr String de data no formato YYYY-MM-DD ou ISO string
 */
export function formatDateBRL(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';

  try {
    // Se a data já estiver no formato DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }

    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) return dateStr;

    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Retorna a data atual ou uma Date em formato ISO string YYYY-MM-DD
 */
export function formatDateISO(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
