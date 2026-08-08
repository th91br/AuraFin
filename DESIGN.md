# Visual Design System: AuraFin (PF & PJ)

<!-- impeccable:design-schema 1 -->

## Core Theme Strategy

AuraFin opera sob um sistema visual adaptativo de duplo modo com suporte a transição de estado sem sobressaltos:

### Modo Pessoa Física (PF) - "Tranquilidade e Futuro"
- **Atmosfera**: Acolhedora, serena, focada em metas de vida, patrimônio e clareza pessoal.
- **Paleta de Cores**:
  - Background: `bg-slate-50` com cartões em `bg-white` e bordas suaves `border-slate-200/80`
  - Primária: Indigo Real (`#4F46E5` / `text-indigo-600`) para ações e destaques intelectuais
  - Secundária: Emerald Saúde (`#059669` / `text-emerald-600`) para saldos positivos, renda e proteção
  - Alertas/Dedutíveis: Rose Warm (`#E11D48`) para saúde e Amber Soft (`#D97706`) para atenção
- **Tipografia & Formas**: Cantos amplos arredondados (`rounded-3xl`, `rounded-[2rem]`), sombras suaves (`shadow-sm`, `shadow-md`), badges acolhedoras e ícones com fundos pastel.

### Modo Pessoa Jurídica (PJ) - "Execução e Performance"
- **Atmosfera**: Executiva, de alta densidade de informação, focada em caixa operacional, margens, faturamento e conformidade fiscal.
- **Paleta de Cores**:
  - Background: `bg-slate-950` / `bg-slate-900` para navegação/headers e cartões em `bg-white` com destaques em Slate corporativo
  - Primária: Cyan/Teal Corporativo (`#0891B2` / `text-cyan-600`) e Deep Indigo (`#4338CA`) para faturamento e DRE
  - Status/Inadimplência: Emerald (`#10B981`) para liquidados, Amber (`#F59E0B`) para a vencer e Rose (`#F43F5E`) para atrasos e riscos de caixa
- **Tipografia & Formas**: Cantos estruturados (`rounded-2xl`, `rounded-3xl`), métricas de alta visibilidade com fontes monospace elegantes para números (`font-mono` / `tabular-nums`), bordas bem demarcadas, tabelas e cards funcionais com filtros.

## Navegação e Estrutura de Páginas

A aplicação possui navegação estruturada estratégica com comutação instantânea PF/PJ:
1. **Header Principal**: Seletor de Modo PF / PJ com animação suave, indicador visual de contexto ativo, estatísticas rápidas do modo e botão de restauração/demo.
2. **Navegação por Abas/Módulos Estratégicos**:
   - **Dashboard Principal**: Resumo financeiro diário, extrato, conciliação e calendário integrado de compromissos/faturas.
   - **Páginas PF Dedicadas**:
     - *Orçamento & Extrato PF*: Categorização detalhada, gastos fixos vs variáveis.
     - *Patrimônio & Ativos*: Imóveis, veículos com simulador FIPE, renda fixa, ações e gráfico de evolução patrimonial.
     - *Inteligência IRPF & Metas*: Radar de despesas dedutíveis (saúde, educação), simulador de Reserva de Segurança com barra de progresso em tempo real.
   - **Páginas PJ Dedicadas**:
     - *Caixa Operacional & DRE*: DRE gerencial simplificado, margem bruta/líquida, Ponto de Equilíbrio com alerta de runway.
     - *Rentabilidade por Projeto*: Margem de lucro por cliente/projeto, custo direto vs receita.
     - *Radar de Inadimplência & Cobrança*: Clientes em atraso, régua de cobrança via WhatsApp/E-mail, agendamento de faturas.
     - *Central do Contador & Pacote Fiscal*: Reconciliação de aportes/pró-labore, filtro de comprovantes e exportação do pacote fiscal JSON/OFX.
3. **Modais Interativos e Reconciliação**:
   - Modal de Nova Transação (com opção de vincular despesa pessoal na PJ ou pagamento PF para a empresa).
   - Modal de Faturamento & Emissão de Boleto/Pix.
   - Modal de Novo Evento / Compromisso Financeiro.
   - Modal de Adição/Edição de Ativo Patrimonial.

## Diretrizes de Qualidade e Usabilidade (Human-Crafted)

- Zero botões mortos ou placeholders sem ação.
- Feedback imediato para o usuário em todas as ações (toast/modais/notificações de estado).
- Persistência total e instantânea de dados em LocalStorage.
- Layout 100% responsivo para telas desktop, tablet e smartphones.
