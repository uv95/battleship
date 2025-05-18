import Database from '../../db/db';
import { commandsForAllClients } from '../../utils/consts';
import { formMessage } from '../../utils/formMessage';
import { isRoomReadyForGame } from '../../utils/isRoomReadyForGame';
import {
  MyWebSocket,
  Player,
  Game,
  Room,
  WebsocketCommandType,
  WebsocketMessage,
  RoomPlayer,
  Ship,
} from '../../utils/types';
import { handleGame } from './game.handler';
import { handlePlayers } from './player.handler';
import { handleRooms } from './room.handler';

const players = new Database<Player>();
const rooms = new Database<Room>();
const game = new Database<Game>();

function getMessages(
  type: WebsocketCommandType,
  data: any,
  socket: MyWebSocket
) {
  const messages = [];

  switch (type) {
    case WebsocketCommandType.REG: {
      const player = handlePlayers(players, data);
      socket.playerId = player.index;

      messages.push(
        formMessage(type, player),
        formMessage(WebsocketCommandType.UPDATE_ROOM, handleRooms(type, rooms))
      );

      break;
    }

    case WebsocketCommandType.CREATE_ROOM: {
      messages.push(
        formMessage(WebsocketCommandType.UPDATE_ROOM, handleRooms(type, rooms))
      );

      break;
    }

    case WebsocketCommandType.ADD_USER_TO_ROOM: {
      const player = players.findById(socket.playerId);

      if (!player) {
        break;
      }

      const roomId = data.indexRoom;
      const room = rooms.findById(roomId);

      if (!room) {
        break;
      }

      if (isRoomReadyForGame(room.players, socket.playerId)) {
        const allPlayerIds = [room.players[0].index, socket.playerId];
        const newGame = game.create({
          players: allPlayerIds.map((playerId: string | number) => ({
            playerId,
            ships: [],
          })),
          firstPlayerId: '',
        });

        messages.push(
          formMessage(
            WebsocketCommandType.CREATE_GAME,
            allPlayerIds.map((playerId) => ({
              idGame: newGame.id,
              idPlayer: playerId,
            }))
          )
        );
      }

      messages.push(
        formMessage(
          WebsocketCommandType.UPDATE_ROOM,
          handleRooms(type, rooms, roomId, {
            name: player.name,
            index: player.id,
          })
        )
      );

      break;
    }

    case WebsocketCommandType.ADD_SHIPS: {
      const updatedGame = handleGame(type, game, data) as Game;

      if (updatedGame) {
        const allPlayersAddedShips = updatedGame.players.every(
          (player) => player.ships.length
        );

        if (allPlayersAddedShips) {
          messages.push(
            formMessage(WebsocketCommandType.START_GAME, updatedGame),
            formMessage(WebsocketCommandType.TURN, {
              currentPlayer: updatedGame.firstPlayerId,
            })
          );
        }
      }

      break;
    }

    case WebsocketCommandType.ATTACK: {
      const gameMessages = handleGame(type, game, data) as any;

      if (gameMessages) {
        const attackMessages = gameMessages
          .slice(0, -1)
          .map((msg: Object) => formMessage(WebsocketCommandType.ATTACK, msg));
        const turnMessage = formMessage(
          WebsocketCommandType.TURN,
          gameMessages[gameMessages.length - 1]
        );
        messages.push(...attackMessages, turnMessage);
      }

      break;
    }

    default:
      break;
  }

  return messages;
}

export function handleMessage({
  incomingMessage,
  client,
  allClients,
}: {
  incomingMessage: WebsocketMessage;
  client: MyWebSocket | WebSocket;
  allClients: WebSocket[] | MyWebSocket[];
}) {
  const { type, data } = incomingMessage;

  // console.log(messages);
  const messages = getMessages(
    type,
    data ? JSON.parse(data) : '',
    client as MyWebSocket
  );

  messages.forEach((message) => {
    if (commandsForAllClients.includes(message.type)) {
      const data = JSON.parse(message.data);

      allClients.forEach((client) => {
        if (message.type === WebsocketCommandType.CREATE_GAME) {
          message.data = JSON.stringify(
            data.find(
              (playerData: {
                idGame: string | number;
                idPlayer: string | number;
              }) => playerData.idPlayer === (client as MyWebSocket).playerId
            )
          );
        }

        if (message.type === WebsocketCommandType.START_GAME) {
          message.data = JSON.stringify({
            ships: data.players
              .find(
                ({ playerId }: { playerId: string | number }) =>
                  playerId === (client as MyWebSocket).playerId
              )
              .ships.map((ship: Ship) => ({
                position: ship.position,
                direction: ship.direction,
                length: ship.length,
                type: ship.type,
              })),
            currentPlayerIndex: data.firstPlayerId,
          });
        }

        client.hasOwnProperty('playerId') &&
          client.send(JSON.stringify(message));
      });

      return;
    }

    client.send(JSON.stringify(message));
  });
}
