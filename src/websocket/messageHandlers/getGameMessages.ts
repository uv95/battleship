import Database from '../../db/db';
import { getShipCells } from '../../utils/getShipCells';
import {
  AttackStatus,
  Game,
  Cell,
  Ship,
  WebsocketCommandType,
  AttackResult,
  Store,
  Player,
  MyWebSocket,
} from '../../utils/types';
import { formMessage } from '../../utils/formMessage';
import { getWinnerMessage } from './getWinnerMessage';
import { BOT_NAME } from '../../utils/consts';
import { getRandomPosition } from '../../utils/getRandomPosition';
import { styleText } from 'util';

export function getGameMessages(
  type: WebsocketCommandType,
  store: Store,
  data: any,
  socket?: MyWebSocket
) {
  const game = store.game.findById(data.gameId);

  if (!game) {
    return;
  }

  if (type === WebsocketCommandType.ADD_SHIPS) {
    const updatedGame = store.game.updateOne(game.id, {
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

    const allPlayersAddedShips = updatedGame.players.every(
      (player) => player.ships.length
    );

    if (allPlayersAddedShips) {
      const startGameMessage = formMessage(
        WebsocketCommandType.START_GAME,
        updatedGame
      );
      const turnMessage = formMessage(WebsocketCommandType.TURN, {
        currentPlayer: updatedGame.firstPlayerId,
      });

      return [startGameMessage, turnMessage];
    }

    return updatedGame;
  }

  if (
    type === WebsocketCommandType.ATTACK ||
    type === WebsocketCommandType.RANDOM_ATTACK
  ) {
    const { x, y, indexPlayer } = data;
    console.log('attack again..........');
    const result: AttackResult = {
      position: {
        x,
        y,
      },
      currentPlayer: indexPlayer,
      status: AttackStatus.MISS,
    };
    const messagesForKilledShip: AttackResult[] = [];

    const enemy = game.players.find(
      (player) => player.playerId !== indexPlayer
    );

    console.log(
      styleText(['magenta'], `enemy is ${JSON.stringify(enemy?.playerId)}`)
    );
    console.log(styleText(['magenta'], `currentPlayer is ${indexPlayer}`));
    console.log(
      styleText(['magenta'], `game.firstPlayerId is ${game.firstPlayerId}`)
    );

    if (!enemy || indexPlayer !== game.firstPlayerId) {
      return;
    }

    const updatedEnemyShips = getUpdatedShips(
      enemy.ships,
      messagesForKilledShip,
      result
    );

    const currentPlayer = game.players.find(
      (player) => player.playerId === indexPlayer
    )!;

    const nextPlayerId =
      result.status === AttackStatus.MISS ? enemy.playerId : game.firstPlayerId;

    store.game.updateOne(game.id, {
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
      const attackMessage = formMessage(WebsocketCommandType.ATTACK, result);
      const finishMessage = formMessage(WebsocketCommandType.FINISH, {
        winPlayer: nextPlayerId,
      });
      const winnersMessage = getWinnerMessage(
        WebsocketCommandType.FINISH,
        store.players,
        { index: nextPlayerId }
      );

      return [attackMessage, finishMessage, winnersMessage];
    }

    const turnMessage = formMessage(WebsocketCommandType.TURN, {
      currentPlayer: nextPlayerId,
    });

    if (result.status === AttackStatus.KILLED) {
      return [
        ...messagesForKilledShip.map((msg) =>
          formMessage(WebsocketCommandType.ATTACK, msg)
        ),
        turnMessage,
      ];
    }

    return [formMessage(WebsocketCommandType.ATTACK, result), turnMessage];
  }
}

function getUpdatedShips(
  enemyShips: Ship[],
  messagesForKilledShip: AttackResult[],
  result: AttackResult
) {
  const { x, y } = result.position;

  return enemyShips
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
}
