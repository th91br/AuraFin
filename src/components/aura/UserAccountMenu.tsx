import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  Plus, 
  Check, 
  Sparkles, 
  Cloud 
} from 'lucide-react';

interface Props {
  isPJ: boolean;
  onOpenSecuritySettings: () => void;
  onOpenCreateOrg: () => void;
}

export function UserAccountMenu({ isPJ, onOpenSecuritySettings, onOpenCreateOrg }: Props) {
  const { user, profile, signOut, isMfaEnrolled, aal } = useAuth();
  const { organizations, activeOrganization, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || 'usuario@aurafin.app';

  // Initials for Avatar
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('') || 'AF';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center space-x-2 p-1.5 pl-2.5 rounded-2xl border transition-all select-none ${
          isPJ
            ? 'bg-slate-900 border-white/10 hover:border-cyan-500/40 text-slate-200'
            : 'bg-white border-slate-200/90 hover:border-indigo-400 text-slate-800 shadow-xs'
        }`}
        title="Menu do Usuário e Sessão"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner ${
            isPJ
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}>
            {initials}
          </div>
          <div className="hidden lg:block text-left text-xs max-w-[120px] truncate">
            <span className="font-bold block truncate leading-tight">{fullName}</span>
            <span className="text-[10px] text-slate-400 block truncate leading-none">
              {isPJ ? (activeOrganization?.name || 'Sem Empresa') : 'Pessoa Física'}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-3xl p-3 border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
          isPJ 
            ? 'bg-slate-900/95 backdrop-blur-xl border-slate-800 text-slate-100 shadow-black/80' 
            : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}>
          
          {/* User Details Header */}
          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40 space-y-1.5 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Supabase Cloud</span>
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                isMfaEnrolled 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isMfaEnrolled ? 'MFA ATIVO' : 'AAL1'}
              </span>
            </div>
            <p className="font-bold text-xs text-white truncate">{fullName}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{email}</p>
          </div>

          {/* PJ Organizations Switcher (if in PJ mode or user has organizations) */}
          <div className="py-2 px-1 border-t border-slate-800/40 space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <span>Empresas PJ</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateOrg();
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-0.5 font-bold"
                title="Cadastrar Nova Empresa PJ"
              >
                <Plus className="w-3 h-3" />
                <span>Nova</span>
              </button>
            </div>

            {organizations.length > 0 ? (
              <div className="space-y-0.5 max-h-32 overflow-y-auto scrollbar-none">
                {organizations.map(org => {
                  const isActive = activeOrganization?.id === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => {
                        switchOrganization(org.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Building2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateOrg();
                }}
                className="w-full text-left p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cadastrar primeira empresa PJ</span>
              </button>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-2 border-t border-slate-800/40 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSecuritySettings();
              }}
              className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Segurança da Conta & MFA</span>
            </button>

            {/* Sign Out (Logout) */}
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sair da Conta (Logout)</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
