import Database from '../../db/db';
import { Player, RoomPlayer } from '../../utils/types';

export function handlePlayers(db: Database<Player>, data: Omit<Player, 'id'>) {
  const result: {
    error: Boolean;
    errorText: string;
  } & RoomPlayer = {
    name: '',
    index: '',
    error: false,
    errorText: '',
  };

  try {
    const player = db.findOne(data) || db.create(data);
    result.name = player.name;
    result.index = player.id;
  } catch (error) {
    result.error = true;
    result.errorText = error ? JSON.stringify(error) : '';
  }
  return result;
}
