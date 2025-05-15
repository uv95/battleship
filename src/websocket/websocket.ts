import { styleText } from 'node:util';
import { WebSocketServer } from 'ws';
import { handleMessage } from './handlers/messageRouter';
import { WebsocketMessage } from '../utils/types';

export function runWebsocket() {
  const server = new WebSocketServer({
    port: 3000,
  });

  server.on('connection', (socket) => {
    console.log(styleText(['cyan'], 'Client connected'));

    socket.on('message', (rawMessage) => {
      const message = JSON.parse(rawMessage.toString());
      console.log(styleText(['yellow'], `Received: ${rawMessage}`));
      handleMessage(message as WebsocketMessage, socket as any);
    });

    socket.on('close', () => {
      console.log(styleText(['cyan'], 'Client disconnected'));
    });
  });

  console.log(
    styleText(['magenta'], 'WebSocket server is running on ws://localhost:3000')
  );
}
