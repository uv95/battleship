export enum WebsocketCommandType {
  REG = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish',
}

export interface Player {
  id: number | string;
  name: string;
  password: string;
}

export interface RoomPlayer {
  name: string;
  index: number | string;
}

export interface Room {
  id: string | number;
  players: RoomPlayer[];
}

export interface Game {
  id: string | number;
  playerIds: number[] | string[];
}

export interface PlayerShips {
  gameId: string | number;
  ships: Ship[];
  player: string | number;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: Boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface MyWebSocket extends WebSocket {
  playerId: string | number;
}

export interface WebsocketMessage {
  type: WebsocketCommandType;
  data: any;
  id: 0;
}
