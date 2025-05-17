import Database from '../../db/db';
import { Game, WebsocketCommandType } from '../../utils/types';

export function handleGame(
  type: WebsocketCommandType,
  db: Database<Game>,
  data: any
) {
  switch (type) {
    case WebsocketCommandType.ADD_SHIPS: {
      const game = db.findById(data.gameId);

      if (!game) {
        break;
      }

      const updatedGame = db.updateOne(game.id, {
        players: game.players.map((player) => {
          if (player.playerId === data.indexPlayer) {
            return {
              ...player,
              ships: data.ships,
            };
          }

          return player;
        }),
        firstPlayerId: game.firstPlayerId || data.indexPlayer,
      });

      return updatedGame;
    }

    default:
      break;
  }
}
