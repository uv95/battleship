import Database from '../../db/db';
import { getRandomShips } from '../../utils/getRandomShips';
import {
  BOT_NAME,
  commandsForAllClients,
  logMessage,
} from '../../utils/consts';
import { formMessage } from '../../utils/formMessage';
import { getIndividualDataForAllPlayers } from '../../utils/getIndividualDataForAllPlayers';
import { getRandomPosition } from '../../utils/getRandomPosition';
import {
  MyWebSocket,
  Player,
  Game,
  Room,
  WebsocketCommandType,
  WebsocketMessage,
  Store,
  Ship,
} from '../../utils/types';
import { getGameMessages } from './getGameMessages';
import { getRegMessage } from './getRegMessage';
import { getRoomMessages } from './getRoomMessages';
import { getWinnerMessage } from './getWinnerMessage';

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
  logMessage(type, JSON.stringify(data));

  switch (type) {
    case WebsocketCommandType.REG: {
      const regMessage = getRegMessage(store.players, data, socket);
      const regData = JSON.parse(regMessage.data);

      if (regData.error) {
        break;
      }

      const loggedUser = {
        name: regData.name,
        index: regData.index,
      };

      const roomMessage = getRoomMessages({ type, store });
      const winnersMessage = getWinnerMessage(type, store.players, loggedUser);

      messages.push(regMessage, roomMessage, winnersMessage);

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
      const gameMessages = getGameMessages(type, store, data);

      if (Array.isArray(gameMessages)) {
        messages.push(...gameMessages);
      }

      break;
    }

    case WebsocketCommandType.ATTACK: {
      const gameMessages = getGameMessages(type, store, data);

      if (!gameMessages) {
        break;
      }

      if (Array.isArray(gameMessages)) {
        messages.push(...gameMessages);
      } else {
        messages.push(gameMessages);
      }

      const botId = store.players.findOne({ name: BOT_NAME })?.id;
      const game = store.game.findById(data.gameId);
      const isGameWithBot = game?.players.some(
        ({ playerId }) => playerId === botId
      );

      while (isGameWithBot && game?.firstPlayerId === botId) {
        const attackData = {
          gameId: game?.id,
          indexPlayer: botId,
          ...getRandomPosition(),
        };

        const gameMessages = getGameMessages(type, store, attackData);

        if (!gameMessages) {
          break;
        }

        if (Array.isArray(gameMessages)) {
          messages.push(...gameMessages);
        } else {
          messages.push(gameMessages);
        }
      }

      break;
    }

    case WebsocketCommandType.RANDOM_ATTACK: {
      const dataWithRandomPosition = { ...data, ...getRandomPosition() };
      const gameMessages = getGameMessages(
        type,
        store,
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

      const botId = store.players.findOne({ name: BOT_NAME })?.id;
      const game = store.game.findById(data.gameId);
      const isGameWithBot = game?.players.some(
        ({ playerId }) => playerId === botId
      );

      while (isGameWithBot && game?.firstPlayerId === botId) {
        const attackData = {
          gameId: game?.id,
          indexPlayer: botId,
          ...getRandomPosition(),
        };

        const gameMessages = getGameMessages(type, store, attackData);

        if (!gameMessages) {
          break;
        }

        if (Array.isArray(gameMessages)) {
          messages.push(...gameMessages);
        } else {
          messages.push(gameMessages);
        }
      }

      break;
    }

    case WebsocketCommandType.SINGLE_PLAY: {
      const botData = {
        name: BOT_NAME,
        password: 'botbot',
      } as Omit<Player, 'id'>;

      const bot = store.players.create({ ...botData, wins: 0 });
      const allPlayerIds = [socket.playerId, bot.id];

      const botShips = getRandomShips() as Ship[];
      const newGame = store.game.create({
        players: allPlayerIds.map((playerId: string | number) => ({
          playerId,
          ships: playerId === bot.id ? botShips : [],
        })),
        firstPlayerId: '',
      });

      const newGameData = [
        {
          idGame: newGame.id,
          idPlayer: socket.playerId,
        },
      ];

      const createGameMessage = formMessage(
        WebsocketCommandType.CREATE_GAME,
        newGameData
      );

      messages.push(createGameMessage);

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
          const playerIds = data.map((playerData: any) => playerData.idPlayer);
          if (!playerIds.includes((client as MyWebSocket).playerId)) {
            return;
          }

          message.data = JSON.stringify(
            createGameData(data, client as MyWebSocket)
          );
        }

        if (message.type === WebsocketCommandType.START_GAME) {
          const playerIds = data.players.map(
            (playerData: any) => playerData.playerId
          );
          if (!playerIds.includes((client as MyWebSocket).playerId)) {
            return;
          }

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
