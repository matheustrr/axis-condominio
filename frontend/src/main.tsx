import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type Condominium = { id: string; name: string; address?: string | null };

function App() {
  const [items, setItems] = useState<Condominium[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch(`${API}/condominiums`);
    setItems(await response.json());
    setLoading(false);
  }

  async function createCondominium(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await fetch(`${API}/condominiums`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name })
    });
    setName('');
    await load();
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="container">
      <header>
        <span className="eyebrow">AXIS</span>
        <h1>Administração de Condomínio</h1>
        <p>Gestão de condomínios, moradores, reservas, ocorrências e financeiro.</p>
      </header>

      <section className="card">
        <h2>Novo condomínio</h2>
        <form onSubmit={createCondominium}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do condomínio" />
          <button type="submit">Cadastrar</button>
        </form>
      </section>

      <section className="card">
        <h2>Condomínios</h2>
        {loading ? <p>Carregando...</p> : items.length === 0 ? <p>Nenhum condomínio cadastrado.</p> : (
          <ul>{items.map(item => <li key={item.id}><strong>{item.name}</strong>{item.address ? ` — ${item.address}` : ''}</li>)}</ul>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
