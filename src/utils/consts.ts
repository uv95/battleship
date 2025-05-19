import { styleText } from 'node:util';
import { WebsocketCommandType } from './types';

export const commandsForAllClients = [
  WebsocketCommandType.UPDATE_ROOM,
  WebsocketCommandType.UPDATE_WINNERS,
  WebsocketCommandType.ATTACK,
  WebsocketCommandType.CREATE_GAME,
  WebsocketCommandType.TURN,
  WebsocketCommandType.FINISH,
  WebsocketCommandType.START_GAME,
];

export const BOT_NAME = 'Bot Player';

export function logMessage(command: WebsocketCommandType, result: string) {
  console.log(styleText(['yellow'], `Command: ${colorize(command)}`));
  console.log(styleText(['yellow'], `Result: ${colorize(result)}`));
}

function colorize(text: string) {
  return styleText(['cyan'], `${text}`);
}
