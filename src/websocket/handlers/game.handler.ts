import { styleText } from 'util';
import Database from '../../db/db';
import { getShipCells } from '../../utils/getShipCells';
import {
  AttackStatus,
  Game,
  Cell,
  Position,
  Ship,
  WebsocketCommandType,
} from '../../utils/types';

export function handleGame(
  type: WebsocketCommandType,
  db: Database<Game>,
  data: any
) {
  if (type === WebsocketCommandType.ADD_SHIPS) {
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

  if (
    type === WebsocketCommandType.ATTACK ||
    type === WebsocketCommandType.RANDOM_ATTACK
  ) {
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
    let messagesForKilledShip: (typeof result)[] = [];

    const enemy = game.players.find(
      (player) => player.playerId !== indexPlayer
    );

    if (!enemy || indexPlayer !== game.firstPlayerId) {
      return;
    }

    const updatedEnemyShips = enemy.ships
      .map((ship: Ship) => {
        const shotCell = ship.cells.find(
          (cell: Cell) => cell.x === x && cell.y === y && !cell.isShot
        );

        if (!shotCell) {
          return ship;
        }

        shotCell.isShot = true;
        const isShipKilled = ship.cells.every((cell: Cell) => cell.isShot);

        if (isShipKilled) {
          ship.cells.forEach((cell: Cell) => {
            messagesForKilledShip.push({
              ...result,
              position: {
                x: cell.x,
                y: cell.y,
              },
              status: AttackStatus.KILLED,
            });
          });

          result.status = AttackStatus.KILLED;

          return null;
        }

        result.status = AttackStatus.SHOT;

        return ship;
      })
      .filter(Boolean) as Ship[];

    const currentPlayer = game.players.find(
      (player) => player.playerId === indexPlayer
    )!;

    const nextPlayerId =
      result.status === AttackStatus.MISS ? enemy.playerId : game.firstPlayerId;

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

    if (!updatedEnemyShips.length) {
      return [{ winPlayer: nextPlayerId }];
    }
    if (result.status === AttackStatus.KILLED) {
      return [...messagesForKilledShip, { currentPlayer: nextPlayerId }];
    }

    return [result, { currentPlayer: nextPlayerId }];
  }
}
