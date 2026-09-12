import { useState } from 'react';
import './dashboard.css';

type Section = 'dashboard' | 'moradores' | 'unidades' | 'reservas' | 'avisos' | 'ocorrencias' | 'financeiro';

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'moradores', label: 'Moradores', icon: '♙' },
  { id: 'unidades', label: 'Unidades', icon: '▦' },
  { id: 'reservas', label: 'Reservas', icon: '◷' },
  { id: 'avisos', label: 'Avisos', icon: '◉' },
  { id: 'ocorrencias', label: 'Ocorrências', icon: '!' },
  { id: 'financeiro', label: 'Financeiro', icon: 'R$' },
];

const stats = [
  { label: 'Unidades', value: '128', detail: '120 ocupadas', tone: 'blue' },
  { label: 'Moradores', value: '312', detail: '8 novos este mês', tone: 'green' },
  { label: 'Reservas', value: '14', detail: '5 aguardando aprovação', tone: 'purple' },
  { label: 'Ocorrências', value: '7', detail: '2 pendentes', tone: 'orange' },
];

const reservations = [
  ['Salão de festas', 'Apto 204 · Ana Paula', 'Hoje · 19:00'],
  ['Churrasqueira', 'Apto 801 · Carlos Silva', 'Amanhã · 12:00'],
  ['Área gourmet', 'Apto 306 · Marina Costa', '18 set · 20:00'],
];

const notices = [
  ['Manutenção do elevador social', 'Publicado hoje', 'Atenção'],
  ['Assembleia ordinária de setembro', 'Publicado ontem', 'Assembleia'],
  ['Dedetização das áreas comuns', '12 set', 'Manutenção'],
];

function App() {
  const [active, setActive] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = navigation.find((item) => item.id === active)?.label ?? 'Dashboard';

  function selectSection(section: Section) { setActive(section); setMobileOpen(false); }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><div className="brand-mark">A</div><div><strong>AXIS</strong><span>Condomínio</span></div></div>
        <div className="condominium-switcher"><span>CONDOMÍNIO</span><strong>Residencial Axis</strong><small>Bloco A · 128 unidades</small></div>
        <nav className="sidebar-nav" aria-label="Menu principal">
          {navigation.map((item) => <button key={item.id} className={active === item.id ? 'nav-item active' : 'nav-item'} onClick={() => selectSection(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => alert('Configurações em breve')}><span className="nav-icon">⚙</span>Configurações</button>
          <div className="user-mini"><div className="avatar">JS</div><div><strong>João Silva</strong><span>Síndico</span></div></div>
        </div>
      </aside>
      {mobileOpen && <button className="backdrop" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">☰</button>
          <div className="breadcrumb"><span>Administração</span><b>/</b><strong>{activeLabel}</strong></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notificações">◔<span className="notification-dot" /></button><div className="profile"><div className="avatar">JS</div><div><strong>João Silva</strong><span>Síndico</span></div></div></div>
        </header>
        {active === 'dashboard' ? <Dashboard onNavigate={selectSection} /> : <SectionPlaceholder title={activeLabel} />}
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return <div className="page">
    <div className="page-heading"><div><p className="eyebrow">VISÃO GERAL</p><h1>Bom dia, João 👋</h1><p className="muted">Aqui está um resumo do seu condomínio.</p></div><button className="primary-button" onClick={() => onNavigate('avisos')}>+ Novo aviso</button></div>
    <section className="stats-grid">{stats.map((stat) => <div className="stat-card" key={stat.label}><div className={`stat-icon ${stat.tone}`}>{stat.label.slice(0, 1)}</div><div><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.detail}</small></div></div>)}</section>
    <section className="content-grid">
      <div className="panel"><div className="panel-header"><div><h2>Reservas recentes</h2><p>Últimas reservas das áreas comuns</p></div><button className="text-button" onClick={() => onNavigate('reservas')}>Ver todas →</button></div><div className="table-wrap"><table><thead><tr><th>Área</th><th>Solicitante</th><th>Data</th><th>Status</th></tr></thead><tbody>{reservations.map(([area, person, date]) => <tr key={area}><td><strong>{area}</strong></td><td>{person}</td><td>{date}</td><td><span className="status approved">Aprovada</span></td></tr>)}</tbody></table></div></div>
      <div className="panel"><div className="panel-header"><div><h2>Avisos</h2><p>Comunicações recentes</p></div><button className="text-button" onClick={() => onNavigate('avisos')}>Ver todos</button></div><div className="notice-list">{notices.map(([title, date, tag]) => <button className="notice-item" key={title} onClick={() => onNavigate('avisos')}><div className="notice-bullet" /><div><strong>{title}</strong><span>{date}</span></div><small>{tag}</small></button>)}</div></div>
    </section>
    <section className="quick-actions"><div><h2>Ações rápidas</h2><p>Acesse as tarefas mais usadas pelo síndico.</p></div><div className="action-grid">
      <button onClick={() => onNavigate('moradores')}><span>♙</span><strong>Cadastrar morador</strong><small>Adicionar novo residente</small></button>
      <button onClick={() => onNavigate('reservas')}><span>◷</span><strong>Gerenciar reservas</strong><small>Aprovar ou cancelar</small></button>
      <button onClick={() => onNavigate('ocorrencias')}><span>!</span><strong>Nova ocorrência</strong><small>Registrar problema</small></button>
      <button onClick={() => onNavigate('financeiro')}><span>R$</span><strong>Ver financeiro</strong><small>Inadimplência e cobranças</small></button>
    </div></section>
  </div>;
}

function SectionPlaceholder({ title }: { title: string }) {
  return <div className="page placeholder"><p className="eyebrow">MÓDULO</p><h1>{title}</h1><p className="muted">Este módulo faz parte do sistema Axis Condomínio. A interface e as operações serão conectadas à API nesta próxima etapa.</p><div className="panel"><h2>Estrutura preparada</h2><p>O frontend já possui navegação, identidade visual, layout responsivo e a área reservada para este módulo.</p></div></div>;
}

export default App;
