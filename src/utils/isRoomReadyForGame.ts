import { RoomPlayer } from './types';

export function isRoomReadyForGame(
  players: RoomPlayer[],
  playerId: string | number
) {
  const isPlayerInTheRoom = players.some((p) => p.index === playerId);
  return players.length && !isPlayerInTheRoom;
}
