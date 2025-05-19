import { styleText } from 'node:util';
import { WebSocketServer } from 'ws';
import { routeMessages } from './messageHandlers/routeMessages';
import { MyWebSocket } from '../utils/types';

const connectedClients: WebSocket[] | MyWebSocket[] = [];

export function runWebsocket() {
  const server = new WebSocketServer({
    port: 3000,
  });

  server.on('connection', (socket) => {
    connectedClients.push(socket as any);
    console.log(styleText(['green'], 'Client connected'));

    socket.on('message', (rawMessage) => {
      const incomingMessage = JSON.parse(rawMessage.toString());
      // console.log(styleText(['yellow'], `Received: ${rawMessage}`));

      routeMessages({
        incomingMessage,
        client: socket as any,
        allClients: connectedClients,
      });
    });

    socket.on('close', () => {
      console.log(styleText(['red'], 'Client disconnected'));
    });

    process.on('SIGINT', () => {
      console.log(styleText(['bgRed'], 'Server closed'));
      socket.close(1000, 'Websocket server closed');
      process.exit();
    });
  });

  console.log(
    styleText(['magenta'], 'WebSocket server is running on ws://localhost:3000')
  );
}
