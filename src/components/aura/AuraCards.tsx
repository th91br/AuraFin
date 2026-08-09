import React from 'react';
import { PrivacyText } from '../ui/PrivacyText';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  isPrivacyMode?: boolean;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isPJ?: boolean;
  prefix?: string;
}

export function MetricCard({
  title,
  value,
  isPrivacyMode = false,
  subtitle,
  trend,
  trendValue,
  isPJ = false,
  prefix = 'R$',
}: MetricCardProps) {
  return (
    <div className={`p-5 rounded-2xl transition-all duration-200 border ${
      isPJ 
        ? 'bg-[#172033] border-white/5 text-white shadow-sm' 
        : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </span>
        {trend && (
          <span className={`flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' 
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trendValue}</span>
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <PrivacyText
          value={value}
          isPrivacyMode={isPrivacyMode}
          prefix={prefix}
          className={`text-2xl font-black tracking-tight font-mono ${
            isPJ ? 'text-white' : 'text-slate-950'
          }`}
        />
      </div>

      {subtitle && (
        <p className={`text-[11px] font-medium mt-1.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface DonutChartCardProps {
  title: string;
  subtitle?: string;
  spent: number;
  target: number;
  categories: { label: string; amount: number; color: string }[];
  isPJ?: boolean;
}

export function DonutChartCard({ title, subtitle, spent, target, categories, isPJ = false }: DonutChartCardProps) {
  const percentage = Math.min(100, Math.round((spent / (target || 1)) * 100));

  return (
    <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
      isPJ ? 'bg-[#172033] border-white/5 text-white' : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm tracking-tight">{title}</h3>
          <span className="text-xs text-emerald-500 font-semibold">No Limite</span>
        </div>
        {subtitle && <p className={`text-xs ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-4">
        {/* Circular Donut Visual */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className={isPJ ? 'text-slate-800' : 'text-slate-100'}
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-600 transition-all duration-700"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-center space-y-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>Gasto</span>
            <span className="text-lg font-black font-mono tracking-tight block">R$ {spent.toLocaleString('pt-BR')}</span>
            <span className={`text-[10px] font-semibold block ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>de R$ {target.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className={`font-medium ${isPJ ? 'text-slate-300' : 'text-slate-700'}`}>{cat.label}</span>
              </div>
              <span className="font-mono font-bold">R$ {cat.amount.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  daysLeft: number;
  isPJ?: boolean;
}

export function GoalCard({ title, current, target, daysLeft, isPJ = false }: GoalCardProps) {
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));

  return (
    <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
      isPJ ? 'bg-[#1E293B] border-white/5 text-white' : 'bg-slate-50 border-slate-200/80 text-slate-900'
    }`}>
      {/* Mini Donut */}
      <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className={isPJ ? 'text-slate-700' : 'text-slate-200'}
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-emerald-500"
            strokeDasharray={`${percentage}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-[10px] font-black font-mono">{percentage}%</span>
      </div>

      <div className="truncate flex-1">
        <h4 className="font-bold text-xs truncate">{title}</h4>
        <p className={`text-[11px] font-mono font-semibold ${isPJ ? 'text-emerald-400' : 'text-emerald-700'}`}>
          R$ {current.toLocaleString('pt-BR')} <span className={`font-normal ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>de R$ {target.toLocaleString('pt-BR')}</span>
        </p>
        <span className={`text-[9px] block mt-0.5 ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>{daysLeft} dias restantes</span>
      </div>
    </div>
  );
}

interface VisualPaymentCardProps {
  cardName: string;
  cardNumberMasked: string;
  balance: number;
  dueDate: string;
  isPJ?: boolean;
}

export function VisualPaymentCard({ cardName, cardNumberMasked, balance, dueDate, isPJ = false }: VisualPaymentCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md space-y-4 relative overflow-hidden">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider">{cardName}</span>
        <span className="text-xs font-black tracking-widest uppercase">VISA</span>
      </div>

      <div className="py-2">
        <p className="font-mono text-sm tracking-widest text-sky-100">{cardNumberMasked}</p>
        <p className="text-2xl font-black font-mono tracking-tight mt-1">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-sky-100 pt-1 border-t border-white/20">
        <span>VENCIMENTO: {dueDate}</span>
        <span>AURAFIN CARD</span>
      </div>
    </div>
  );
}

interface ActivityRowProps {
  key?: React.Key;
  title: string;
  subtitle: string;
  amount: number;
  isIncome?: boolean;
  isPJ?: boolean;
}

export function ActivityRow({ title, subtitle, amount, isIncome = false, isPJ = false }: ActivityRowProps) {
  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
      isPJ ? 'bg-[#1E293B] border-white/5 text-white hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 text-slate-900 hover:bg-slate-100/80'
    }`}>
      <div className="flex items-center space-x-3 truncate mr-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isIncome ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div className="truncate">
          <p className="font-bold truncate text-xs">{title}</p>
          <p className={`text-[10px] truncate ${isPJ ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
      </div>

      <span className={`font-mono font-bold shrink-0 ${isIncome ? 'text-emerald-500' : isPJ ? 'text-slate-200' : 'text-slate-900'}`}>
        {isIncome ? '+' : '-'} R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
}
