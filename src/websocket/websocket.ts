// TODO:  Инициализация Websocket сервера (например, Socket.IO или ws)
// TODO:  Подключение обработчиков сообщений из src/websocket/handlers
// TODO:  Обработка подключения/отключения клиентов
import { styleText } from 'node:util';
import { WebSocketServer } from 'ws';

export function runWebsocket() {
  const server = new WebSocketServer({
    port: 3000,
  });

  server.on('connection', (socket) => {
    console.log(styleText(['cyan'], 'Client connected'));

    socket.on('message', (message) => {
      console.log(styleText(['yellow'], `Received: ${message}`));
      socket.send(`Server: ${message}`);
    });

    socket.on('close', () => {
      console.log(styleText(['cyan'], 'Client disconnected'));
    });
  });

  console.log(
    styleText(['magenta'], 'WebSocket server is running on ws://localhost:3000')
  );
}
