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
    const newPlayer = db.create(data);
    result.name = newPlayer.name;
    result.index = newPlayer.id;
  } catch (error) {
    result.error = true;
    result.errorText = error ? JSON.stringify(error) : '';
  }
  return result;
}
