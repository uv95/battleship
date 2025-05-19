import { MyWebSocket, Ship } from './types';

export function getIndividualDataForAllPlayers() {
  return {
    createGameData: (data: any, client: MyWebSocket) => {
      return data.find(
        (playerData: { idGame: string | number; idPlayer: string | number }) =>
          playerData.idPlayer === client.playerId
      );
    },

    startGameData: (data: any, client: MyWebSocket) => {
      return {
        ships: data.players
          .find(
            ({ playerId }: { playerId: string | number }) =>
              playerId === client.playerId
          )
          .ships.map((ship: Ship) => ({
            position: ship.position,
            direction: ship.direction,
            length: ship.length,
            type: ship.type,
          })),
        currentPlayerIndex: data.firstPlayerId,
      };
    },
  };
}
