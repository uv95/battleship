import Database from '../../db/db';
import { formMessage } from '../../utils/formMessage';
import {
  MyWebSocket,
  Player,
  RoomPlayer,
  WebsocketCommandType,
} from '../../utils/types';

export function getRegMessage(
  db: Database<Player>,
  data: Omit<Player, 'id'>,
  socket: MyWebSocket
) {
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
  }

  if (existingPlayer) {
    if (existingPlayer.password !== passwordInput) {
      result.error = true;
      result.errorText = 'Password is incorrect!';
    } else {
      result.name = existingPlayer.name;
      result.index = existingPlayer.id;
    }
  }

  socket.playerId = result.index;

  return formMessage(WebsocketCommandType.REG, result);
}
