import Database from '../db/db';

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
  players: GamePlayer[];
  firstPlayerId: string | number;
}

export interface GamePlayer {
  playerId: string | number;
  ships: Ship[];
}

export interface Ship {
  position: Position;
  direction: Boolean; //true - vertical
  length: number;
  type: ShipType;
  cells: Cell[];
}

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  x: number;
  y: number;
  isShot: Boolean;
}

export enum ShipType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge',
}

export enum AttackStatus {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
}

export interface MyWebSocket extends WebSocket {
  playerId: string | number;
}

export interface WebsocketMessage {
  type: WebsocketCommandType;
  data: any;
  id: 0;
}

export interface Store {
  players: Database<Player>;
  rooms: Database<Room>;
  game: Database<Game>;
}

export interface AttackResult {
  position: Position;
  currentPlayer: string | number;
  status: AttackStatus;
}
