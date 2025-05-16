import Database from '../../db/db';
import { commandsForAllClients } from '../../utils/consts';
import { formMessage } from '../../utils/formMessage';
import { isRoomReadyForGame } from '../../utils/isRoomReadyForGame';
import {
  MyWebSocket,
  Player,
  Game,
  Room,
  WebsocketCommandType,
  WebsocketMessage,
} from '../../utils/types';
import { handlePlayers } from './player.handler';
import { handleRooms } from './room.handler';

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
      const player = handlePlayers(players, data);
      socket.playerId = player.index;

      messages.push(
        formMessage(type, player),
        formMessage(WebsocketCommandType.UPDATE_ROOM, handleRooms(type, rooms))
      );

      break;
    }

    case WebsocketCommandType.CREATE_ROOM: {
      messages.push(
        formMessage(WebsocketCommandType.UPDATE_ROOM, handleRooms(type, rooms))
      );

      break;
    }

    case WebsocketCommandType.ADD_USER_TO_ROOM: {
      const player = players.findById(socket.playerId);

      if (!player) {
        break;
      }

      const roomId = data.indexRoom;
      const room = rooms.findById(roomId);

      if (!room) {
        break;
      }

      if (isRoomReadyForGame(room.players, socket.playerId)) {
        messages.push(
          formMessage(WebsocketCommandType.CREATE_GAME, {
            idGame: roomId,
            idPlayer: socket.playerId,
          })
        );
      }

      messages.push(
        formMessage(
          WebsocketCommandType.UPDATE_ROOM,
          handleRooms(type, rooms, roomId, {
            name: player.name,
            index: player.id,
          })
        )
      );

      break;
    }

    case WebsocketCommandType.ADD_SHIPS: {
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
      allClients.forEach((client) => {
        if (message.type === WebsocketCommandType.CREATE_GAME) {
          const data = JSON.parse(message.data);

          message.data = JSON.stringify({
            ...data,
            idPlayer: (client as MyWebSocket).playerId,
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
