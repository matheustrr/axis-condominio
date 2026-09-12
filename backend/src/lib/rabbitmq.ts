import amqp, { Channel, ChannelModel } from 'amqplib';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  connection = await amqp.connect(
    process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  );

  channel = await connection.createChannel();
  await channel.assertExchange('condominio.events', 'topic', { durable: true });

  return channel;
}

export async function publishEvent(routingKey: string, payload: unknown) {
  try {
    const ch = await getChannel();
    ch.publish(
      'condominio.events',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: 'application/json' },
    );
  } catch {
    // Mensageria é assíncrona e não deve derrubar a requisição principal.
  }
}
