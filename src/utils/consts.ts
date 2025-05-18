import { WebsocketCommandType, ShipType } from './types';

export const commandsForAllClients = [
  WebsocketCommandType.UPDATE_ROOM,
  WebsocketCommandType.UPDATE_WINNERS,
  WebsocketCommandType.ATTACK,
  WebsocketCommandType.CREATE_GAME,
  WebsocketCommandType.TURN,
  WebsocketCommandType.FINISH,
  WebsocketCommandType.START_GAME,
];
