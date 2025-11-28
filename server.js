// server.js
import { WebSocketServer } from 'ws';

// Porta em que o servidor WebSocket irá rodar. Deve ser a mesma do ESP32 e do frontend.
const port = 8080; 

const wss = new WebSocketServer({ port });

// Armazena todos os clientes conectados.
const clients = new Set();

console.log(`🔌 Servidor WebSocket iniciado na porta ${port}`);

wss.on('connection', (ws) => {
  // Adiciona o novo cliente ao conjunto de clientes.
  clients.add(ws);
  console.log('Cliente conectado. Total de clientes:', clients.size);

  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message.toString());

    // Retransmite a mensagem para todos os outros clientes.
    // O ESP32 envia, o frontend (e outros ESPs, se houver) recebe.
    for (const client of clients) {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    // Remove o cliente do conjunto quando a conexão é fechada.
    clients.delete(ws);
    console.log('Cliente desconectado. Total de clientes:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});
