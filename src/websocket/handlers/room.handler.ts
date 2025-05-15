import Database from '../../db/db';
import { Room, RoomPlayer, WebsocketCommandType } from '../../utils/types';

export function handleRooms(
  type:
    | WebsocketCommandType.REG
    | WebsocketCommandType.ADD_USER_TO_ROOM
    | WebsocketCommandType.CREATE_ROOM,
  db: Database<Room>,
  id?: string | number,
  player?: RoomPlayer
) {
  switch (type) {
    case WebsocketCommandType.ADD_USER_TO_ROOM: {
      if (id && player) {
        const { players } = db.findById(id) as Room;
        const isPlayerInTheRoom = players.some((p) => p.index === player.index);
        const isRoomReadyForGame = !isPlayerInTheRoom && players.length;

        if (isPlayerInTheRoom) {
          return;
        }
        if (isRoomReadyForGame) {
          db.deleteOne(id);

          return [];
        }

        const updatedPlayes = [...players, player];
        db.updateOne(id, { players: updatedPlayes } as Partial<Room>);
      }

      break;
    }

    case WebsocketCommandType.CREATE_ROOM: {
      db.create({ players: [] });
      break;
    }
  }

  return getRooms();

  function getRooms() {
    const rooms = db.getAll();

    return rooms.map((room) => ({
      roomId: room.id,
      roomUsers: room.players,
    }));
  }
}
