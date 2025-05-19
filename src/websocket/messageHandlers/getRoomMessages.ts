import Database from '../../db/db';
import { formMessage } from '../../utils/formMessage';
import {
  MyWebSocket,
  Room,
  Store,
  WebsocketCommandType,
} from '../../utils/types';

export function getRoomMessages({
  type,
  store,
  socket,
  data,
}: {
  type:
    | WebsocketCommandType.REG
    | WebsocketCommandType.ADD_USER_TO_ROOM
    | WebsocketCommandType.CREATE_ROOM;
  store: Store;
  socket?: MyWebSocket;
  data?: any;
}) {
  const { players, rooms, game } = store;

  if (type === WebsocketCommandType.CREATE_ROOM) {
    rooms.create({ players: [] });
  }

  if (type === WebsocketCommandType.ADD_USER_TO_ROOM) {
    if (!socket) {
      return;
    }

    const player = players.findById(socket.playerId);
    const roomId = data.indexRoom;

    if (player) {
      const room = rooms.findById(roomId) as Room;
      const isPlayerInTheRoom = room.players.some((p) => p.index === player.id);
      const isRoomReadyForGame = !isPlayerInTheRoom && room.players.length;

      if (isPlayerInTheRoom) {
        return formMessage(WebsocketCommandType.UPDATE_ROOM, getRooms(rooms));
      }

      if (isRoomReadyForGame) {
        rooms.deleteOne(roomId);

        const allPlayerIds = [room.players[0].index, socket.playerId];
        const newGame = game.create({
          players: allPlayerIds.map((playerId: string | number) => ({
            playerId,
            ships: [],
          })),
          firstPlayerId: '',
        });
        const newGameData = allPlayerIds.map((playerId) => ({
          idGame: newGame.id,
          idPlayer: playerId,
        }));

        const createGameMessage = formMessage(
          WebsocketCommandType.CREATE_GAME,
          newGameData
        );
        const updateRoomMessage = formMessage(
          WebsocketCommandType.UPDATE_ROOM,
          []
        );

        return [createGameMessage, updateRoomMessage];
      }

      const updatedPlayers = [
        ...room.players,
        {
          name: player.name,
          index: player.id,
        },
      ];
      rooms.updateOne(roomId, { players: updatedPlayers } as Partial<Room>);
    }
  }

  return formMessage(WebsocketCommandType.UPDATE_ROOM, getRooms(rooms));
}

function getRooms(db: Database<Room>) {
  const rooms = db.getAll();

  return rooms.map((room) => ({
    roomId: room.id,
    roomUsers: room.players,
  }));
}
