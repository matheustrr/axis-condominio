import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export async function audit(event: { action: string; entity: string; entityId?: string; userId?: string; condominiumId?: string; metadata?: unknown }) {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URL ?? 'mongodb://localhost:27017');
      await client.connect();
    }
    const db = client.db(process.env.MONGODB_DATABASE ?? 'condominio');
    await db.collection('audit_logs').insertOne({ ...event, createdAt: new Date() });
  } catch {
    // Auditoria não deve derrubar a operação principal.
  }
}
