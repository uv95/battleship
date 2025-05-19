import Database from '../../db/db';
import { commandsForAllClients } from '../../utils/consts';
import { formMessage } from '../../utils/formMessage';
import { getRandomPosition } from '../../utils/getRandomPosition';
import { isRoomReadyForGame } from '../../utils/isRoomReadyForGame';
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
import { handleGame } from './game.handler';
import { getRegMessage } from './player.handler';
import { getRoomMessage } from './room.handler';

const store: Store = {
  players: new Database<Player>(),
  rooms: new Database<Room>(),
  game: new Database<Game>(),
};

const players = new Database<Player>();
const rooms = new Database<Room>();
const game = new Database<Game>();

function getMessages(
  type: WebsocketCommandType,
  data: any,
  socket: MyWebSocket
) {
  const messages = [];

  switch (type) {
    case WebsocketCommandType.REG: {
      const regMessage = getRegMessage(store.players, data, socket);
      const roomMessage = getRoomMessage({ type, store });
      messages.push(regMessage, roomMessage);

      break;
    }

    case WebsocketCommandType.CREATE_ROOM: {
      const roomMessage = getRoomMessage({ type, store });
      messages.push(roomMessage);

      break;
    }

    case WebsocketCommandType.ADD_USER_TO_ROOM: {
      const roomMessages = getRoomMessage({ type, store, socket, data });

      if (Array.isArray(roomMessages)) {
        messages.push(...roomMessages);
      } else {
        messages.push(roomMessages);
      }

      break;
    }

    case WebsocketCommandType.ADD_SHIPS: {
      const updatedGame = handleGame(type, game, data) as Game;

      if (updatedGame) {
        const allPlayersAddedShips = updatedGame.players.every(
          (player) => player.ships.length
        );

        if (allPlayersAddedShips) {
          messages.push(
            formMessage(WebsocketCommandType.START_GAME, updatedGame),
            formMessage(WebsocketCommandType.TURN, {
              currentPlayer: updatedGame.firstPlayerId,
            })
          );
        }
      }

      break;
    }

    case WebsocketCommandType.ATTACK: {
      const gameMessages = handleGame(type, game, data) as any;

      if (gameMessages) {
        if (gameMessages.length === 1) {
          messages.push(
            formMessage(WebsocketCommandType.FINISH, gameMessages[0])
          );
          break;
        }

        const attackMessages = gameMessages
          .slice(0, -1)
          .map((msg: Object) => formMessage(WebsocketCommandType.ATTACK, msg));
        const turnMessage = formMessage(
          WebsocketCommandType.TURN,
          gameMessages[gameMessages.length - 1]
        );
        messages.push(...attackMessages, turnMessage);
      }

      break;
    }

    case WebsocketCommandType.RANDOM_ATTACK: {
      const dataWithRandomPosition = { ...data, ...getRandomPosition() };
      const gameMessages = handleGame(
        type,
        game,
        dataWithRandomPosition
      ) as any;

      if (gameMessages) {
        if (gameMessages.length === 1) {
          messages.push(
            formMessage(WebsocketCommandType.FINISH, gameMessages[0])
          );
          break;
        }

        const attackMessages = gameMessages
          .slice(0, -1)
          .map((msg: Object) => formMessage(WebsocketCommandType.ATTACK, msg));
        const turnMessage = formMessage(
          WebsocketCommandType.TURN,
          gameMessages[gameMessages.length - 1]
        );
        messages.push(...attackMessages, turnMessage);
      }

      break;
    }

    default:
      break;
  }

  return messages;
}

export function handleMessage({
  incomingMessage,
  client,
  allClients,
}: {
  incomingMessage: WebsocketMessage;
  client: MyWebSocket | WebSocket;
  allClients: WebSocket[] | MyWebSocket[];
}) {
  const { type, data } = incomingMessage;

  // console.log(messages);
  const messages = getMessages(
    type,
    data ? JSON.parse(data) : '',
    client as MyWebSocket
  );

  messages.forEach((message) => {
    if (commandsForAllClients.includes(message.type)) {
      const data = JSON.parse(message.data);

      allClients.forEach((client) => {
        if (message.type === WebsocketCommandType.CREATE_GAME) {
          message.data = JSON.stringify(
            data.find(
              (playerData: {
                idGame: string | number;
                idPlayer: string | number;
              }) => playerData.idPlayer === (client as MyWebSocket).playerId
            )
          );
        }

        if (message.type === WebsocketCommandType.START_GAME) {
          message.data = JSON.stringify({
            ships: data.players
              .find(
                ({ playerId }: { playerId: string | number }) =>
                  playerId === (client as MyWebSocket).playerId
              )
              .ships.map((ship: Ship) => ({
                position: ship.position,
                direction: ship.direction,
                length: ship.length,
                type: ship.type,
              })),
            currentPlayerIndex: data.firstPlayerId,
          });
        }

        client.hasOwnProperty('playerId') &&
          client.send(JSON.stringify(message));
      });

      return;
    }

    client.send(JSON.stringify(message));
  });
}
