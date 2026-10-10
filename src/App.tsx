import { useMemo, useState } from "react";
import {
  Activity, Archive, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness,
  CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Command, FileText,
  Filter, Gauge, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck,
  Sparkles, Timer, Users, Wallet, X
} from "lucide-react";
import { isSupabaseConfigured } from "./lib/supabase";

type Role = "Analista" | "Coordenador" | "Gerente";
type Status = "Em andamento" | "A fazer" | "Em revisão" | "Concluída";
type Task = { id: number; title: string; client: string; category: string; owner: string; initials: string; color: string; due: string; status: Status; hours: number; budget: number; archived?: boolean };

const initialTasks: Task[] = [
  { id: 1, title: "Fechamento contábil mensal", client: "Nexa Tecnologia", category: "Contábil", owner: "Mariana Costa", initials: "MC", color: "#dbeafe", due: "10/10/2026", status: "Em andamento", hours: 5.5, budget: 8 },
  { id: 2, title: "Apuração de impostos — 09/2026", client: "Grupo Horizonte", category: "Fiscal", owner: "Lucas Martins", initials: "LM", color: "#d1fae5", due: "12/10/2026", status: "Em revisão", hours: 3.2, budget: 4 },
  { id: 3, title: "Conciliação bancária", client: "Vértice Energia", category: "BPO Financeiro", owner: "Ana Beatriz", initials: "AB", color: "#fef3c7", due: "13/10/2026", status: "A fazer", hours: 0, budget: 3 },
  { id: 4, title: "Entrega de obrigações acessórias", client: "Mobi Sistemas", category: "Fiscal", owner: "Pedro Henrique", initials: "PH", color: "#f3e8ff", due: "14/10/2026", status: "Em andamento", hours: 2.4, budget: 5 },
  { id: 5, title: "Revisão de balancete", client: "Clínica Plural", category: "Contábil", owner: "Mariana Costa", initials: "MC", color: "#dbeafe", due: "15/10/2026", status: "Concluída", hours: 2.1, budget: 3 },
];
const nav = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Tarefas", icon: CheckCircle2 },
  { label: "Apontamento de horas", icon: Timer },
  { label: "Rentabilidade", icon: Gauge },
  { label: "Equipe", icon: Users },
  { label: "Clientes", icon: BriefcaseBusiness },
];
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const statusStyle: Record<Status, string> = {
  "Em andamento": "bg-blue-50 text-[#204B8F]",
  "A fazer": "bg-slate-100 text-slate-600",
  "Em revisão": "bg-amber-50 text-amber-700",
  "Concluída": "bg-emerald-50 text-emerald-700"
};

function App() {
  const [role, setRole] = useState<Role>("Coordenador");
  const [active, setActive] = useState("Visão geral");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [showNew, setShowNew] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDue, setNewDue] = useState("2026-10-16");
  const [newBudget, setNewBudget] = useState("4");
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleTasks = useMemo(() => tasks.filter(t => Boolean(t.archived) === showArchived)
    .filter(t => [t.title, t.client, t.owner, t.category].some(v => v.toLowerCase().includes(query.toLowerCase())))
    .filter(t => filter === "Todas" || t.status === filter), [tasks, query, filter, showArchived]);
  const activeTasks = tasks.filter(t => !t.archived);
  const completed = activeTasks.filter(t => t.status === "Concluída").length;
  const totalHours = activeTasks.reduce((sum, t) => sum + t.hours, 0);

  function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;
    const [y, m, d] = newDue.split("-");
    setTasks(prev => [{ id: Math.max(0, ...prev.map(t => t.id)) + 1, title: newTitle.trim(), client: newClient.trim(), category: "Contábil", owner: "Você", initials: "VC", color: "#dbeafe", due: `${d}/${m}/${y}`, status: "A fazer", hours: 0, budget: Number(newBudget) || 1 }, ...prev]);
    setNewTitle(""); setNewClient(""); setShowNew(false); setNotice("Tarefa criada com sucesso."); setTimeout(() => setNotice(""), 3000);
  }
  function archiveTask(id: number) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, archived: !t.archived } : t));
    setNotice(showArchived ? "Tarefa restaurada." : "Tarefa arquivada. O histórico foi preservado.");
    setTimeout(() => setNotice(""), 3000);
  }

  return <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
      <div className="mb-9 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#204B8F] text-white shadow-md shadow-blue-900/15"><Activity size={22} strokeWidth={2.5}/></div>
        <div><div className="font-display text-[19px] font-extrabold tracking-tight text-[#204B8F]">RG <span className="text-[#5171A5]">FLOW</span></div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Gestão inteligente</div></div>
      </div>
      <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
      <nav className="space-y-1">
        {nav.map(item => { const Icon = item.icon; const selected = active === item.label; return <button key={item.label} onClick={() => {setActive(item.label); setShowArchived(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition ${selected ? "bg-[#EEF9FD] text-[#204B8F]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon size={18} strokeWidth={selected ? 2.4 : 1.8}/>{item.label}{item.label === "Tarefas" && <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">{activeTasks.length}</span>}</button>})}
      </nav>
      <div className="mt-8 px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Organização</div>
      <button onClick={() => {setShowArchived(!showArchived); setActive("Tarefas");}} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold ${showArchived ? "bg-[#EEF9FD] text-[#204B8F]" : "text-slate-500 hover:bg-slate-50"}`}><Archive size={18}/>{showArchived ? "Ver tarefas ativas" : "Itens arquivados"}</button>
      <div className="mt-auto rounded-2xl bg-gradient-to-br from-[#204B8F] to-[#264677] p-4 text-white">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Sparkles size={18}/></div>
        <div className="font-display text-sm font-bold">Mais clareza. Melhor resultado.</div>
        <p className="mt-1.5 text-xs leading-5 text-blue-100">Acompanhe horas, prazos e rentabilidade em um só lugar.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[72%] rounded-full bg-white"/></div>
        <div className="mt-2 text-[10px] text-blue-100">Seu escritório, em fluxo.</div>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-2 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#204B8F]">RK</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">Roger Kaufmann</div><div className="text-[10px] text-slate-400">RG Contadores</div></div><MoreHorizontal size={18} className="text-slate-400"/>
      </div>
    </aside>

    <main className="min-h-screen lg:ml-[248px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-7 xl:px-10">
        <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20}/></button><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span>RG Flow</span><span>/</span><span className="font-semibold text-slate-700">{showArchived ? "Itens arquivados" : active}</span></div><div className="sm:hidden font-display font-extrabold text-[#204B8F]">RG FLOW</div></div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative hidden md:block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar tarefas, clientes..." className="h-9 w-[230px] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-xs outline-none transition focus:border-[#A1B6D5] focus:bg-white"/><kbd className="absolute right-2 top-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400">⌘ K</kbd></div>
          <button aria-label="Notificações" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell size={19}/><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-rose-500"/></button>
          <div className="hidden h-8 w-px bg-slate-200 sm:block"/>
          <div className="flex items-center gap-2"><div className="hidden text-right sm:block"><div className="text-xs font-bold text-slate-700">Roger Kaufmann</div><div className="text-[10px] text-slate-400">Administrador</div></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#204B8F] text-xs font-bold text-white">RK</div></div>
        </div>
      </header>

      {menuOpen && <div className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-72 bg-white p-5" onClick={e => e.stopPropagation()}><div className="mb-5 font-display text-xl font-extrabold text-[#204B8F]">RG FLOW</div>{nav.map(n => <button key={n.label} onClick={() => {setActive(n.label);setMenuOpen(false);}} className="block w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-slate-50">{n.label}</button>)}</div></div>}

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:py-9 xl:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#5171A5]"><CalendarDays size={14}/> SÁBADO, 10 DE OUTUBRO DE 2026</div><h1 className="font-display text-[27px] font-extrabold tracking-tight text-slate-900 sm:text-[32px]">{active === "Visão geral" ? "Bom dia, Roger 👋" : active}</h1><p className="mt-1.5 text-sm text-slate-500">{active === "Visão geral" ? "Aqui está o resumo da operação do seu escritório." : showArchived ? "Consulte e restaure itens arquivados sem perder o histórico." : "Acompanhe atividades, prazos e resultados da sua equipe."}</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"><ShieldCheck size={15} className="text-[#5171A5]"/><span className="text-[11px] font-semibold text-slate-500">Visualizar como</span><select value={role} onChange={e => setRole(e.target.value as Role)} className="max-w-[120px] bg-transparent text-xs font-bold text-[#204B8F] outline-none"><option>Analista</option><option>Coordenador</option><option>Gerente</option></select></div>
            {role !== "Analista" && <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-xl bg-[#204B8F] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-900/10 transition hover:bg-[#264677]"><Plus size={16}/> Nova tarefa</button>}
          </div>
        </div>

        {!isSupabaseConfigured && <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-[#EEF9FD] px-4 py-3 text-xs text-[#264677]"><CircleHelp size={16} className="shrink-0"/><span><strong>Modo demonstração:</strong> dados de exemplo para explorar o produto. Configure as variáveis do Supabase para conectar o banco de dados.</span></div>}
        {notice && <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><CheckCircle2 size={16}/>{notice}</div>}

        {active === "Visão geral" && !showArchived && <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <Metric title="Tarefas ativas" value={String(activeTasks.filter(t => t.status !== "Concluída").length).padStart(2,"0")} change="+12,5%" caption="vs. mês anterior" icon={CheckCircle2} trend="up"/>
            <Metric title="Horas apontadas" value={totalHours.toLocaleString("pt-BR",{maximumFractionDigits:1})+" h"} change="+8,2%" caption="neste período" icon={Clock3} trend="up"/>
            <Metric title="Receita recorrente" value={money(86450)} change="+4,6%" caption="carteira mensal" icon={Wallet} trend="up"/>
            <Metric title="Rentabilidade média" value="32,8%" change="-1,4%" caption="vs. mês anterior" icon={Gauge} trend="down"/>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
              <div className="mb-5 flex items-start justify-between"><div><h2 className="font-display text-base font-extrabold">Visão da operação</h2><p className="mt-1 text-xs text-slate-400">Acompanhamento de tarefas e capacidade</p></div><button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">Este mês <ChevronDown size={13}/></button></div>
              <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-5"><div><div className="text-[11px] text-slate-400">Concluídas</div><div className="mt-1 text-xl font-extrabold text-slate-800">{completed + 34}<span className="ml-1 text-[10px] font-medium text-slate-400">tarefas</span></div></div><div><div className="text-[11px] text-slate-400">Em andamento</div><div className="mt-1 text-xl font-extrabold text-slate-800">{activeTasks.filter(t=>t.status==="Em andamento").length + 12}<span className="ml-1 text-[10px] font-medium text-slate-400">tarefas</span></div></div><div><div className="text-[11px] text-slate-400">No prazo</div><div className="mt-1 text-xl font-extrabold text-slate-800">94<span className="text-sm">%</span></div></div></div>
              <div className="mt-5 space-y-4"><Progress label="Contábil" detail="42 tarefas" value={76} color="#204B8F"/><Progress label="Fiscal" detail="36 tarefas" value={61} color="#5171A5"/><Progress label="BPO Financeiro" detail="18 tarefas" value={48} color="#A1B6D5"/></div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500"><Activity size={15} className="text-[#5171A5]"/> Capacidade da equipe utilizada: <strong className="text-slate-700">68%</strong><span className="ml-auto text-emerald-600">Saudável</span></div>
            </section>
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-start justify-between"><div><h2 className="font-display text-base font-extrabold">Rentabilidade da carteira</h2><p className="mt-1 text-xs text-slate-400">Receita x custo operacional</p></div><button onClick={() => setActive("Rentabilidade")} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"><ArrowRight size={17}/></button></div>
              <div className="mt-6 flex items-center justify-center gap-6"><div className="relative flex h-36 w-36 items-center justify-center rounded-full" style={{background:"conic-gradient(#204B8F 0 32.8%, #dce6f3 32.8% 100%)"}}><div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-extrabold text-slate-800">32,8%</span><span className="text-[10px] text-slate-400">margem média</span></div></div><div className="space-y-4"><div><div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-[#204B8F]"/>Margem</div><div className="mt-1 text-sm font-bold">R$ 28.372</div></div><div><div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="h-2 w-2 rounded-full bg-[#dce6f3]"/>Custos</div><div className="mt-1 text-sm font-bold">R$ 58.078</div></div></div></div>
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3"><div className="flex items-center gap-2 text-xs font-bold text-emerald-700"><ArrowUpRight size={15}/> Acima da meta</div><p className="mt-1 text-[11px] leading-4 text-emerald-700/80">Sua margem está 2,8 pontos acima da meta de 30%.</p></div>
            </section>
          </div>
        </>}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div><div className="flex items-center gap-2"><h2 className="font-display text-base font-extrabold">{showArchived ? "Itens arquivados" : "Tarefas recentes"}</h2><span className="rounded-md bg-[#EEF9FD] px-2 py-0.5 text-[10px] font-bold text-[#204B8F]">{visibleTasks.length}</span></div><p className="mt-1 text-xs text-slate-400">{showArchived ? "Dados preservados e disponíveis para restauração." : "Priorize o que precisa de atenção hoje."}</p></div>
            <div className="flex flex-wrap items-center gap-2"><div className="relative md:hidden"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar..." className="h-9 w-36 rounded-lg border border-slate-200 pl-8 text-xs outline-none focus:border-[#A1B6D5]"/></div><div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2"><Filter size={14} className="text-slate-400"/><select value={filter} onChange={e=>setFilter(e.target.value)} className="max-w-[125px] bg-transparent text-[11px] font-semibold text-slate-600 outline-none"><option>Todas</option><option>A fazer</option><option>Em andamento</option><option>Em revisão</option><option>Concluída</option></select></div><button onClick={() => {setShowArchived(!showArchived);setActive("Tarefas");}} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"><Archive size={14}/><span className="hidden sm:inline">{showArchived ? "Ativas" : "Arquivadas"}</span></button></div>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-[.08em] text-slate-400"><th className="px-6 py-3.5 font-semibold">Tarefa / Cliente</th><th className="px-4 py-3.5 font-semibold">Responsável</th><th className="px-4 py-3.5 font-semibold">Prazo</th><th className="px-4 py-3.5 font-semibold">Tempo</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">
            {visibleTasks.map(t => <tr key={t.id} className="group transition hover:bg-slate-50/60"><td className="px-6 py-4"><div className="text-xs font-bold text-slate-800">{t.title}</div><div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400"><span>{t.client}</span><span className="h-1 w-1 rounded-full bg-slate-300"/><span>{t.category}</span></div></td><td className="px-4 py-4"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-[#264677]" style={{background:t.color}}>{t.initials}</div><span className="whitespace-nowrap text-xs font-medium text-slate-600">{t.owner}</span></div></td><td className="px-4 py-4"><span className="whitespace-nowrap text-xs text-slate-600">{t.due}</span></td><td className="px-4 py-4"><div className="text-xs font-bold text-slate-700">{t.hours.toLocaleString("pt-BR")} h <span className="font-normal text-slate-400">/ {t.budget} h</span></div><div className="mt-2 h-1 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#5171A5]" style={{width:`${Math.min(100,t.hours/Math.max(1,t.budget)*100)}%`}}/></div></td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-bold ${statusStyle[t.status]}`}>{t.status}</span></td><td className="px-4 py-4"><button title={showArchived ? "Restaurar tarefa" : "Arquivar tarefa"} onClick={() => archiveTask(t.id)} className="rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-[#EEF9FD] hover:text-[#204B8F] sm:opacity-0 sm:group-hover:opacity-100">{showArchived ? <ArrowUpRight size={16}/> : <Archive size={15}/>}</button></td></tr>)}
            {visibleTasks.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center"><FileText size={25} className="mx-auto mb-2 text-slate-300"/><div className="text-sm font-semibold text-slate-600">Nenhuma tarefa encontrada</div><div className="mt-1 text-xs text-slate-400">Tente mudar os filtros ou a busca.</div></td></tr>}
          </tbody></table></div>
          <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-6 py-3.5 text-[10px] text-slate-400 sm:flex-row sm:items-center"><span>Exibindo <strong className="text-slate-600">{visibleTasks.length}</strong> registros · Dados em demonstração</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#5171A5]"/> Exclusão desabilitada · Arquivamento preserva histórico</span></div>
        </section>

        {active === "Rentabilidade" && <div className="mt-5 grid gap-4 md:grid-cols-3"><Metric title="Receita mensal" value={money(86450)} change="+4,6%" caption="carteira ativa" icon={Wallet} trend="up"/><Metric title="Custos estimados" value={money(58078)} change="+2,1%" caption="horas e estrutura" icon={BriefcaseBusiness} trend="down"/><Metric title="Margem operacional" value="32,8%" change="+2,8 p.p." caption="meta: 30%" icon={Gauge} trend="up"/></div>}
        {active === "Apontamento de horas" && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#EEF9FD] p-3 text-[#204B8F]"><Timer size={22}/></div><div><h2 className="font-display font-extrabold">Apontamento de horas</h2><p className="text-xs text-slate-400">Registre o tempo dedicado a cada cliente e tarefa.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-400">Horas apontadas</div><div className="mt-1 text-2xl font-extrabold">{totalHours.toLocaleString("pt-BR")} h</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-400">Horas orçadas</div><div className="mt-1 text-2xl font-extrabold">{activeTasks.reduce((s,t)=>s+t.budget,0)} h</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-400">Aproveitamento</div><div className="mt-1 text-2xl font-extrabold">{Math.round(totalHours/Math.max(1,activeTasks.reduce((s,t)=>s+t.budget,0))*100)}%</div></div></div><p className="mt-4 text-xs text-slate-400">O lançamento detalhado de horas por usuário e o cronômetro serão conectados ao Supabase na próxima etapa.</p></div>}
        {active === "Equipe" && <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[["Mariana Costa","Contábil","MC","78%"],["Lucas Martins","Fiscal","LM","64%"],["Ana Beatriz","BPO Financeiro","AB","52%"],["Pedro Henrique","Fiscal","PH","86%"]].map(p=><div key={p[0]} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF9FD] text-xs font-bold text-[#204B8F]">{p[2]}</div><div><div className="text-sm font-bold">{p[0]}</div><div className="mt-0.5 text-xs text-slate-400">{p[1]}</div></div><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">Ativo</span></div><div className="mt-5 flex justify-between text-xs"><span className="text-slate-400">Capacidade utilizada</span><strong>{p[3]}</strong></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#5171A5]" style={{width:p[3]}}/></div></div>)}</div>}
        {active === "Clientes" && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-display font-extrabold">Carteira de clientes</h2><p className="mt-1 text-xs text-slate-400">Visão demonstrativa dos clientes associados às tarefas.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[...new Set(activeTasks.map(t=>t.client))].map((client,i)=><div key={client} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF9FD] text-[#204B8F]"><BriefcaseBusiness size={18}/></div><div><div className="text-xs font-bold">{client}</div><div className="mt-1 text-[10px] text-slate-400">{activeTasks.filter(t=>t.client===client).length} tarefa(s) vinculada(s)</div></div></div>)}</div></div>}
        <footer className="mt-8 flex flex-col justify-between gap-2 pb-4 text-[10px] text-slate-400 sm:flex-row"><span>© 2026 RG Flow · Feito para quem cuida dos números.</span><span className="flex items-center gap-1"><ShieldCheck size={12}/> Acesso por perfil · Dados protegidos por RLS no banco</span></footer>
      </div>
    </main>

    {showNew && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]" onClick={() => setShowNew(false)}><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="mb-5 flex items-start justify-between"><div><h2 className="font-display text-xl font-extrabold">Criar nova tarefa</h2><p className="mt-1 text-xs text-slate-400">Organize a próxima entrega da equipe.</p></div><button onClick={() => setShowNew(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={createTask} className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Nome da tarefa</span><input required value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Ex.: Fechamento contábil mensal" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#5171A5]"/></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Cliente</span><input required value={newClient} onChange={e=>setNewClient(e.target.value)} placeholder="Nome do cliente" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#5171A5]"/></label><div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Prazo</span><input type="date" required value={newDue} onChange={e=>setNewDue(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-[#5171A5]"/></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Horas orçadas</span><input type="number" min="1" max="500" value={newBudget} onChange={e=>setNewBudget(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#5171A5]"/></label></div><div className="flex items-center gap-2 rounded-xl bg-[#EEF9FD] p-3 text-[11px] text-[#264677]"><ShieldCheck size={16}/><span>Registros não são excluídos. Quando necessário, serão arquivados para preservar o histórico.</span></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowNew(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Cancelar</button><button type="submit" className="rounded-xl bg-[#204B8F] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#264677]"><Plus size={14} className="mr-1 inline"/> Criar tarefa</button></div></form></div></div>}
  </div>;
}

function Metric({title,value,change,caption,icon:Icon,trend}:{title:string;value:string;change:string;caption:string;icon:typeof Wallet;trend:"up"|"down"}) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div className="text-xs font-semibold text-slate-500">{title}</div><div className="rounded-xl bg-[#EEF9FD] p-2.5 text-[#204B8F]"><Icon size={18}/></div></div><div className="mt-3 flex items-end justify-between gap-2"><div className="font-display text-[27px] font-extrabold tracking-tight text-slate-900">{value}</div><span className={`mb-1 flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[10px] font-bold ${trend==="up"?"bg-emerald-50 text-emerald-600":"bg-rose-50 text-rose-600"}`}>{trend==="up"?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {change}</span></div><div className="mt-1 text-[10px] text-slate-400">{caption}</div></div>;
}
function Progress({label,detail,value,color}:{label:string;detail:string;value:number;color:string}) {
  return <div><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><span className="h-2 w-2 rounded-full" style={{background:color}}/>{label}<span className="font-normal text-slate-400">{detail}</span></div><span className="text-xs font-bold text-slate-600">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{width:`${value}%`,background:color}}/></div></div>;
}
export default App;
