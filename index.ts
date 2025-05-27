import { httpServer } from './src/http_server/index';
import { runWebsocket } from './src/websocket/websocket';

const HTTP_PORT = 8181;

httpServer.listen(HTTP_PORT, () => {
  console.log(`Start static http server on the ${HTTP_PORT} port!`);
  runWebsocket();
});

process.on('unhandledRejection', (error: Error) => {
  console.log('UNHANDLED REJECTION ❗️', error.message);
  process.exit(1);
});
