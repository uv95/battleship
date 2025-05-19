import Database from '../../db/db';
import { formMessage } from '../../utils/formMessage';
import { Player, RoomPlayer, WebsocketCommandType } from '../../utils/types';

export function getWinnerMessage(
  type: WebsocketCommandType,
  db: Database<Player>,
  player: Partial<RoomPlayer>
) {
  if (type === WebsocketCommandType.REG) {
    const winners = db.getAll().map((player: Player) => ({
      name: player.name,
      wins: player.wins,
    }));
    const isLoggedUserInWinnersList = winners.find(
      (winner) => winner.name === player.name
    );

    if (!isLoggedUserInWinnersList && player.name) {
      winners.push({
        name: player.name,
        wins: 0,
      });
    }

    return formMessage(WebsocketCommandType.UPDATE_WINNERS, winners);
  }

  if (type === WebsocketCommandType.FINISH) {
    if (!player.index) {
      return;
    }

    const winner = db.findById(player.index);

    if (winner) {
      db.updateOne(winner.id, {
        wins: winner.wins + 1,
      });

      const winners = db.getAll().map((player: Player) => ({
        name: player.name,
        wins: player.wins,
      }));

      return formMessage(WebsocketCommandType.UPDATE_WINNERS, winners);
    }
  }
}
