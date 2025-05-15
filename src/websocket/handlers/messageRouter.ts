import Database from '../../db/db';
import { formMessage } from '../../utils/formMessage';
import {
  MyWebSocket,
  Player,
  Room,
  WebsocketCommandType,
  WebsocketMessage,
} from '../../utils/types';
import { handlePlayers } from './player.handler';
import { handleRooms } from './room.handler';

const players = new Database<Player>();
const rooms = new Database<Room>();

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

      const isPlayerInTheRoom = room.players.some(
        (p) => p.index === socket.playerId
      );
      const isRoomReadyForGame =
        rooms.findById(roomId)?.players.length && !isPlayerInTheRoom;

      if (isRoomReadyForGame) {
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

    default:
      break;
  }

  return messages;
}

export function handleMessage(message: WebsocketMessage, socket: MyWebSocket) {
  const { type, data } = message;

  const messages = getMessages(type, data ? JSON.parse(data) : '', socket);
  // console.log(messages);
  messages.forEach((message) => socket.send(message));
}
