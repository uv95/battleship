import Database from '../../db/db';
import { commandsForAllClients } from '../../utils/consts';
import { formMessage } from '../../utils/formMessage';
import { isRoomReadyForGame } from '../../utils/isRoomReadyForGame';
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

    default:
      break;
  }

  return messages;
}

export function handleMessage({
  message,
  client,
  allClients,
}: {
  message: WebsocketMessage;
  client: MyWebSocket | WebSocket;
  allClients: WebSocket[] | MyWebSocket[];
}) {
  const { type, data } = message;

  const messages = getMessages(
    type,
    data ? JSON.parse(data) : '',
    client as MyWebSocket
  );
  // console.log(messages);
  messages.forEach((message) => {
    const msgString = JSON.stringify(message);

    if (commandsForAllClients.includes(message.type)) {
      allClients.forEach((client) => client.send(msgString));

      return;
    }

    client.send(msgString);
  });
}
