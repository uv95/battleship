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
  players: {
    playerId: string | number;
    ships: Ship[];
  }[];
  firstPlayerId: string | number;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: Boolean;
  length: number;
  type: ShipType;
}

enum ShipType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge',
}

export interface ShipCellNumber {
  [ShipType.SMALL]: 1;
  [ShipType.MEDIUM]: 2;
  [ShipType.LARGE]: 3;
  [ShipType.HUGE]: 4;
}

export interface MyWebSocket extends WebSocket {
  playerId: string | number;
}

export interface WebsocketMessage {
  type: WebsocketCommandType;
  data: any;
  id: 0;
}
