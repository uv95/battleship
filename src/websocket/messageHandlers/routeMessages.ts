import Database from '../../db/db';
import { commandsForAllClients } from '../../utils/consts';
import { getIndividualDataForAllPlayers } from '../../utils/getIndividualDataForAllPlayers';
import { getRandomPosition } from '../../utils/getRandomPosition';
import {
  MyWebSocket,
  Player,
  Game,
  Room,
  WebsocketCommandType,
  WebsocketMessage,
  Ship,
  Store,
} from '../../utils/types';
import { getGameMessages } from './getGameMessages';
import { getRegMessage } from './getRegMessage';
import { getRoomMessages } from './getRoomMessages';

const store: Store = {
  players: new Database<Player>(),
  rooms: new Database<Room>(),
  game: new Database<Game>(),
};

function getMessages(
  type: WebsocketCommandType,
  data: any,
  socket: MyWebSocket
) {
  const messages = [];

  switch (type) {
    case WebsocketCommandType.REG: {
      const regMessage = getRegMessage(store.players, data, socket);
      const roomMessage = getRoomMessages({ type, store });
      messages.push(regMessage, roomMessage);

      break;
    }

    case WebsocketCommandType.CREATE_ROOM: {
      const roomMessage = getRoomMessages({ type, store });
      messages.push(roomMessage);

      break;
    }

    case WebsocketCommandType.ADD_USER_TO_ROOM: {
      const roomMessages = getRoomMessages({ type, store, socket, data });

      if (Array.isArray(roomMessages)) {
        messages.push(...roomMessages);
      } else {
        messages.push(roomMessages);
      }

      break;
    }

    case WebsocketCommandType.ADD_SHIPS: {
      const gameMessages = getGameMessages(type, store.game, data);

      if (Array.isArray(gameMessages)) {
        messages.push(...gameMessages);
      }

      break;
    }

    case WebsocketCommandType.ATTACK: {
      const gameMessages = getGameMessages(type, store.game, data);

      if (!gameMessages) {
        break;
      }

      if (Array.isArray(gameMessages)) {
        messages.push(...gameMessages);
      } else {
        messages.push(gameMessages);
      }

      break;
    }

    case WebsocketCommandType.RANDOM_ATTACK: {
      const dataWithRandomPosition = { ...data, ...getRandomPosition() };
      const gameMessages = getGameMessages(
        type,
        store.game,
        dataWithRandomPosition
      ) as any;

      if (!gameMessages) {
        break;
      }

      if (Array.isArray(gameMessages)) {
        messages.push(...gameMessages);
      } else {
        messages.push(gameMessages);
      }

      break;
    }

    default:
      break;
  }

  return messages;
}

export function routeMessages({
  incomingMessage,
  client,
  allClients,
}: {
  incomingMessage: WebsocketMessage;
  client: MyWebSocket | WebSocket;
  allClients: WebSocket[] | MyWebSocket[];
}) {
  const { type, data } = incomingMessage;

  const messages = getMessages(
    type,
    data ? JSON.parse(data) : '',
    client as MyWebSocket
  );

  messages.forEach((message) => {
    if (commandsForAllClients.includes(message.type)) {
      const data = JSON.parse(message.data);
      const { createGameData, startGameData } =
        getIndividualDataForAllPlayers();

      allClients.forEach((client) => {
        if (message.type === WebsocketCommandType.CREATE_GAME) {
          message.data = JSON.stringify(
            createGameData(data, client as MyWebSocket)
          );
        }

        if (message.type === WebsocketCommandType.START_GAME) {
          message.data = JSON.stringify(
            startGameData(data, client as MyWebSocket)
          );
        }

        client.hasOwnProperty('playerId') &&
          client.send(JSON.stringify(message));
      });

      return;
    }

    client.send(JSON.stringify(message));
  });
}
