# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion + Lucide Icons + Supabase persistence engine.

## Users

Empresários, freelancers, consultores e profissionais PJ (Pessoas Jurídicas) no Brasil que precisam gerenciar o fluxo financeiro do seu negócio e, simultaneamente, sua vida financeira pessoal (Pessoa Física), mantendo rigor na separação de contas e agilidade na reconciliação de retiradas e aportes.

## Product Purpose

O AuraFin é uma plataforma financeira híbrida PF/PJ estratégica que respeita a separação jurídica entre sócio e empresa, enquanto oferece inteligência integrada de conciliação de pró-labore/reembolsos, planejamento de longo prazo PF (Reserva de segurança, IRPF, Patrimônio Líquido) e controle gerencial PJ (Ponto de Equilíbrio, DRE por projetos, Inadimplência, Emissão/Controle de faturas e Pacote Fiscal para a contabilidade).

## Positioning

Diferente de gerenciadores financeiros convencionais que tratam todas as movimentações de forma genérica ou misturam despesas corporativas e pessoais, o AuraFin altera a arquitetura de informação, tom visual e métricas de acordo com o perfil ativado (PF ou PJ), rastreando com precisão contábil cruzada qualquer movimentação entre as esferas.

## Operating Context

Uso diário por sócios e gestores via web/mobile:
- **Modo PF (Pessoa Física)**: Foco no momento atual, orçamento mensal, rastreamento de dedutíveis de IRPF, evolução do patrimônio líquido e meta de segurança familiar.
- **Modo PJ (Pessoa Jurídica)**: Foco na saúde operacional do negócio, faturamento, caixa corporativo, margem por projeto, gestão de cobranças/inadimplentes, previsibilidade de fluxo de caixa e envio de documentos para o contador.

## Capabilities and Constraints

- **Arquitetura Multi-Contexto (PF / PJ)**: Alternância fluida com identidades visuais dedicated, layouts adaptados e conjunto funcional customizado por modo.
- **Reconciliação e Trilha de Auditoria**: Lançamentos marcados como "Uso Pessoal na PJ" ou "Despesa da PJ paga via PF" criam transações espelhadas e viabilizam o reembolso ao sócio em 1 clique.
- **Ecossistema PF**: Gestão de patrimônio (imóveis, veículos com cotação FIPE simulada, renda fixa, ações), simulação da reserva de emergência e cálculo de deduções fiscais para IRPF.
- **Ecossistema PJ**: Cálculo em tempo real do Ponto de Equilíbrio, DRE e rentabilidade por cliente/projeto, radar de inadimplentes com ação de cobrança, faturamento integrado e exportação de pacote fiscal JSON/OFX.
- **Privacidade e isolamento**: Dados financeiros persistidos no Supabase com RLS, isolamento PF/PJ e modo demo local somente para desenvolvimento explícito.

## Brand Commitments

- **Identidade PF**: Tonalidades serenidade (Indigo/Violet/Emerald/Slate light), tipografia legível, cards arredondados e calorosos.
- **Identidade PJ**: Tonalidades corporativas de alta performance (Navy/Cyan/Emerald dark/Slate), métricas de densidade executiva, foco em precisão e escala.
- **Tom de Voz**: Profissional, humano, pragmático e direto — parecendo um software desenhado por especialistas de produto e contadores experientes.

## Evidence on Hand

Aplicação React 19 + TypeScript rodando com Vite em `src/`.

## Product Principles

1. **Separação Rígida com Reconciliação Fluida**: Trate PF e PJ com regras fiscais distintas, facilitando o acerto de contas entre as duas pontas.
2. **Identidade Visual Autêntica**: PF transmite paz e planejamento pessoal; PJ transmite controle executivo e força operacional.
3. **Experiência Humana e Funcional**: Todo botão deve funcionar, todo formulário deve ser responsivo e os fluxos devem ter micro-interações refinadas sem excessos.
4. **Respeito aos Dados e Segurança**: Transações auditáveis com persisência segura e exportações prontas para o contador.
