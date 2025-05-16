import { styleText } from 'node:util';
import { WebSocketServer } from 'ws';
import { handleMessage } from './handlers/messageRouter';
import { MyWebSocket, WebsocketMessage } from '../utils/types';

const connectedClients: WebSocket[] | MyWebSocket[] = [];

export function runWebsocket() {
  const server = new WebSocketServer({
    port: 3000,
  });

  server.on('connection', (socket) => {
    connectedClients.push(socket as any);
    console.log(styleText(['cyan'], 'Client connected'));

    socket.on('message', (rawMessage) => {
      const message = JSON.parse(rawMessage.toString());
      console.log(styleText(['yellow'], `Received: ${rawMessage}`));

      handleMessage({
        message,
        client: socket as any,
        allClients: connectedClients,
      });
    });

    socket.on('close', () => {
      console.log(styleText(['cyan'], 'Client disconnected'));
    });
  });

  console.log(
    styleText(['magenta'], 'WebSocket server is running on ws://localhost:3000')
  );
}
