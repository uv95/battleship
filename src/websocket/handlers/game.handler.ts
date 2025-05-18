import { styleText } from 'util';
import Database from '../../db/db';
import { getShipCells } from '../../utils/getShipCells';
import {
  AttackStatus,
  Game,
  GamePlayer,
  Position,
  Ship,
  WebsocketCommandType,
} from '../../utils/types';

export function handleGame(
  type: WebsocketCommandType,
  db: Database<Game>,
  data: any
) {
  switch (type) {
    case WebsocketCommandType.ADD_SHIPS: {
      const game = db.findById(data.gameId);

      if (!game) {
        return;
      }

      const updatedGame = db.updateOne(game.id, {
        players: game.players.map((player) => {
          if (player.playerId === data.indexPlayer) {
            return {
              ...player,
              ships: data.ships.map((ship: Omit<Ship, 'life'>) => ({
                ...ship,
                cells: getShipCells(ship.position, ship.length, ship.direction),
              })),
            };
          }

          return player;
        }),
        firstPlayerId: game.firstPlayerId || data.indexPlayer,
      });

      return updatedGame;
    }

    case WebsocketCommandType.ATTACK: {
      const game = db.findById(data.gameId);

      if (!game) {
        return;
      }

      const { x, y, indexPlayer } = data;
      const result: {
        position: Position;
        currentPlayer: string | number;
        status: AttackStatus;
      } = {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status: AttackStatus.MISS,
      };

      const enemy = game.players.find(
        (player) => player.playerId !== indexPlayer
      );

      if (!enemy || indexPlayer !== game.firstPlayerId) {
        return;
      }

      const updatedEnemyShips = enemy.ships
        .map((ship: Ship) => {
          const shotCell = ship.cells.find(
            (cell: Position) => cell.x === x && cell.y === y
          );

          if (!shotCell) {
            return ship;
          }

          if (shotCell && ship.length === 1) {
            result.status = AttackStatus.KILLED;

            return null;
          }

          const updatedCells = ship.cells.filter(
            (cell: Position) => !(cell.x === x && cell.y === y)
          );

          result.status = updatedCells.length
            ? AttackStatus.SHOT
            : AttackStatus.KILLED;

          return {
            ...ship,
            cells: updatedCells,
          };
        })
        .filter(Boolean) as Ship[];

      const currentPlayer = game.players.find(
        (player) => player.playerId === indexPlayer
      )!;

      const nextPlayerId =
        result.status === AttackStatus.MISS
          ? enemy.playerId
          : game.firstPlayerId;

      db.updateOne(game.id, {
        firstPlayerId: nextPlayerId,
        players: [
          currentPlayer,
          {
            ...enemy,
            ships: updatedEnemyShips,
          },
        ],
      });

      return [result, { currentPlayer: nextPlayerId }];
    }

    default:
      break;
  }
}
