import { FormEvent, useEffect, useState } from 'react';
import './dashboard.css';
import { AuthUser, bootstrap, clearSession, DashboardData, getDashboard, getMe, login, saveSession } from './api';

type Section = 'dashboard' | 'moradores' | 'unidades' | 'reservas' | 'avisos' | 'ocorrencias' | 'financeiro';
type Theme = 'light' | 'dark';

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' }, { id: 'moradores', label: 'Moradores', icon: '♙' },
  { id: 'unidades', label: 'Unidades', icon: '▦' }, { id: 'reservas', label: 'Reservas', icon: '◷' },
  { id: 'avisos', label: 'Avisos', icon: '◉' }, { id: 'ocorrencias', label: 'Ocorrências', icon: '!' },
  { id: 'financeiro', label: 'Financeiro', icon: 'R$' },
];

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('axis_theme') as Theme) || 'light');

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('axis_theme', theme); }, [theme]);
  useEffect(() => {
    if (!localStorage.getItem('axis_token')) { setChecking(false); return; }
    getMe().then(setUser).catch(clearSession).finally(() => setChecking(false));
  }, []);

  const toggleTheme = () => setTheme(value => value === 'light' ? 'dark' : 'light');
  if (checking) return <div className="loading-screen">Carregando Axis Condomínio...</div>;
  if (!user) return <AuthScreen onAuthenticated={setUser} theme={theme} onToggleTheme={toggleTheme} />;
  return <DashboardApp user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={() => { clearSession(); setUser(null); }} />;
}

function AuthScreen({ onAuthenticated, theme, onToggleTheme }: { onAuthenticated: (user: AuthUser) => void; theme: Theme; onToggleTheme: () => void }) {
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [condominium, setCondominium] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const result = mode === 'login' ? await login(email, password) : await bootstrap({ condominium: { name: condominium }, admin: { name, email, password } });
      saveSession(result.token); onAuthenticated(result.user);
    } catch (err) { setError(axiosMessage(err) || 'Não foi possível concluir. Verifique se o backend está rodando e os dados estão corretos.'); }
    finally { setLoading(false); }
  }

  return <div className="auth-screen">
    <button className="theme-toggle auth-theme-toggle" onClick={onToggleTheme}>{theme === 'light' ? '☾ Escuro' : '☀ Claro'}</button>
    <div className="auth-card">
      <div className="auth-brand"><div className="brand-mark">A</div><div><strong>AXIS</strong><span>Condomínio</span></div></div>
      <p className="eyebrow">GESTÃO CONDOMINIAL</p>
      <h1>{mode === 'login' ? 'Acesse sua administração' : 'Crie o primeiro acesso'}</h1>
      <p className="muted">{mode === 'login' ? 'Entre para administrar seu condomínio.' : 'Cadastre o condomínio e o usuário administrador para começar.'}</p>
      {mode === 'login' && <div className="first-access-hint"><strong>Primeiro acesso?</strong><span>Use a opção abaixo para cadastrar o administrador e o condomínio.</span></div>}
      <form className="auth-form" onSubmit={submit}>
        {mode === 'bootstrap' && <><label>Nome do administrador<input value={name} onChange={e => setName(e.target.value)} placeholder="João Silva" required /></label><label>Nome do condomínio<input value={condominium} onChange={e => setCondominium(e.target.value)} placeholder="Residencial Axis" required /></label></>}
        <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sindico@condominio.com" required /></label>
        <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" required minLength={6} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="primary-button full" disabled={loading}>{loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar acesso'}</button>
      </form>
      <button className="link-button" onClick={() => { setMode(mode === 'login' ? 'bootstrap' : 'login'); setError(''); }}>{mode === 'login' ? 'Primeiro acesso? Criar administração' : 'Já possui acesso? Entrar'}</button>
    </div>
  </div>;
}

function DashboardApp({ user, theme, onToggleTheme, onLogout }: { user: AuthUser; theme: Theme; onToggleTheme: () => void; onLogout: () => void }) {
  const [active, setActive] = useState<Section>('dashboard'); const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null); const [error, setError] = useState('');
  const activeLabel = navigation.find(item => item.id === active)?.label ?? 'Dashboard';
  useEffect(() => { getDashboard().then(setData).catch(() => setError('Não foi possível carregar os dados do dashboard.')); }, []);
  const selectSection = (section: Section) => { setActive(section); setMobileOpen(false); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">A</div><div><strong>AXIS</strong><span>Condomínio</span></div></div>
      <div className="condominium-switcher"><span>CONDOMÍNIO</span><strong>Administração</strong><small>{user.role === 'ADMIN' ? 'Administrador' : 'Síndico'}</small></div>
      <nav className="sidebar-nav">{navigation.map(item => <button key={item.id} className={active === item.id ? 'nav-item active' : 'nav-item'} onClick={() => selectSection(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-footer">
        <button className="nav-item" onClick={onToggleTheme}><span className="nav-icon">{theme === 'light' ? '☾' : '☀'}</span>{theme === 'light' ? 'Tema escuro' : 'Tema claro'}</button>
        <button className="nav-item" onClick={() => alert('Configurações em breve')}><span className="nav-icon">⚙</span>Configurações</button>
        <button className="user-mini user-button" onClick={onLogout}><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.role === 'ADMIN' ? 'Administrador' : user.role}</span></div><small>Sair</small></button>
      </div>
    </aside>
    {mobileOpen && <button className="backdrop" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="menu-button" onClick={() => setMobileOpen(true)}>☰</button><div className="breadcrumb"><span>Administração</span><b>/</b><strong>{activeLabel}</strong></div><div className="topbar-actions"><button className="theme-toggle" onClick={onToggleTheme}>{theme === 'light' ? '☾ Escuro' : '☀ Claro'}</button><div className="profile"><div className="avatar">{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.email}</span></div></div></div></header>
      {error && <div className="api-warning">{error}</div>}
      {active === 'dashboard' ? <Dashboard data={data} user={user} onNavigate={selectSection} /> : <SectionPlaceholder title={activeLabel} />}
    </main>
  </div>;
}

function Dashboard({ data, user, onNavigate }: { data: DashboardData | null; user: AuthUser; onNavigate: (section: Section) => void }) {
  const stats = [['Unidades', data?.units ?? '—', 'total cadastradas', 'blue'], ['Moradores', data?.residents ?? '—', 'residentes cadastrados', 'green'], ['Reservas', data?.upcomingReservations ?? '—', 'próximas reservas', 'purple'], ['Ocorrências', data?.openIncidents ?? '—', 'em aberto', 'orange']];
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">VISÃO GERAL</p><h1>Olá, {user.name.split(' ')[0]} 👋</h1><p className="muted">Dados reais do seu condomínio.</p></div><button className="primary-button" onClick={() => onNavigate('avisos')}>+ Novo aviso</button></div><section className="stats-grid">{stats.map(([label, value, detail, tone]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}>{label.slice(0, 1)}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>)}</section><section className="content-grid"><div className="panel"><div className="panel-header"><div><h2>Centro de operação</h2><p>Próximos módulos do sistema</p></div></div><div className="module-list"><button onClick={() => onNavigate('moradores')}><strong>Moradores</strong><span>Cadastro e gestão de residentes →</span></button><button onClick={() => onNavigate('unidades')}><strong>Unidades</strong><span>Blocos, apartamentos e vínculos →</span></button><button onClick={() => onNavigate('reservas')}><strong>Reservas</strong><span>Áreas comuns e aprovações →</span></button></div></div><div className="panel"><div className="panel-header"><div><h2>Financeiro</h2><p>Visão rápida das cobranças</p></div><button className="text-button" onClick={() => onNavigate('financeiro')}>Abrir →</button></div><div className="finance-highlight"><span>Cobranças pendentes</span><strong>{data?.pendingCharges ?? '—'}</strong><small>itens ainda não pagos</small></div></div></section><section className="quick-actions"><div><h2>Ações rápidas</h2><p>Acesse as tarefas mais usadas pelo síndico.</p></div><div className="action-grid"><button onClick={() => onNavigate('moradores')}><span>♙</span><strong>Cadastrar morador</strong><small>Adicionar residente</small></button><button onClick={() => onNavigate('reservas')}><span>◷</span><strong>Gerenciar reservas</strong><small>Aprovar ou cancelar</small></button><button onClick={() => onNavigate('ocorrencias')}><span>!</span><strong>Nova ocorrência</strong><small>Registrar problema</small></button><button onClick={() => onNavigate('financeiro')}><span>R$</span><strong>Ver financeiro</strong><small>Inadimplência e cobranças</small></button></div></section></div>;
}

function SectionPlaceholder({ title }: { title: string }) { return <div className="page placeholder"><p className="eyebrow">MÓDULO</p><h1>{title}</h1><p className="muted">A estrutura da API já está preparada. Esta tela será conectada às operações reais do módulo na próxima etapa.</p><div className="panel"><h2>Módulo em construção</h2><p>O próximo passo é transformar este espaço em CRUD completo, com listagem, filtros, cadastro, edição e validações.</p></div></div>; }
function initials(name: string) { return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
function axiosMessage(error: unknown) { if (typeof error === 'object' && error !== null && 'response' in error) { const response = (error as { response?: { data?: { message?: string } } }).response; return response?.data?.message ?? ''; } return ''; }
export default App;
