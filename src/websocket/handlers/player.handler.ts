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
  const { name: nameInput, password: passwordInput } = data;
  const existingPlayer = db.findOne({ name: nameInput });

  if (!existingPlayer) {
    const newPlayer = db.create(data);
    result.name = newPlayer.name;
    result.index = newPlayer.id;

    return result;
  }

  if (existingPlayer.password !== passwordInput) {
    result.error = true;
    result.errorText = 'Password is incorrect!';
  } else {
    result.name = existingPlayer.name;
    result.index = existingPlayer.id;
  }

  return result;
}
