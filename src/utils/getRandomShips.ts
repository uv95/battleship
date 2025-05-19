import { getShipCells } from './getShipCells';
import { Ship, ShipType } from './types';

const shipOptions = [
  [
    {
      position: { x: 3, y: 6 },
      direction: false,
      type: ShipType.HUGE,
      length: 4,
    },
    {
      position: { x: 4, y: 8 },
      direction: false,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 0, y: 5 },
      direction: true,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 5, y: 2 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 2, y: 2 },
      direction: true,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 8, y: 3 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 8, y: 5 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 5, y: 0 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 2, y: 0 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 8, y: 7 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
  ],
  [
    {
      position: { x: 5, y: 3 },
      direction: true,
      type: ShipType.HUGE,
      length: 4,
    },
    {
      position: { x: 2, y: 4 },
      direction: true,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 7, y: 6 },
      direction: false,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 0, y: 2 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 2, y: 8 },
      direction: true,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 4, y: 0 },
      direction: true,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 7, y: 0 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 0, y: 6 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 0, y: 4 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 7, y: 2 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
  ],
  [
    {
      position: { x: 3, y: 4 },
      direction: false,
      type: ShipType.HUGE,
      length: 4,
    },
    {
      position: { x: 3, y: 2 },
      direction: false,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 7, y: 0 },
      direction: true,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 7, y: 6 },
      direction: true,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 0, y: 3 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 0, y: 1 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 9, y: 2 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 0, y: 7 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 4, y: 8 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 2, y: 7 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
  ],
  [
    {
      position: { x: 4, y: 5 },
      direction: false,
      type: ShipType.HUGE,
      length: 4,
    },
    {
      position: { x: 6, y: 0 },
      direction: true,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 0, y: 5 },
      direction: false,
      type: ShipType.LARGE,
      length: 3,
    },
    {
      position: { x: 2, y: 0 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 0, y: 2 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 8, y: 1 },
      direction: false,
      type: ShipType.MEDIUM,
      length: 2,
    },
    {
      position: { x: 9, y: 4 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 4, y: 2 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 9, y: 6 },
      direction: false,
      type: ShipType.SMALL,
      length: 1,
    },
    {
      position: { x: 2, y: 8 },
      direction: true,
      type: ShipType.SMALL,
      length: 1,
    },
  ],
];

export function getRandomShips() {
  const randomIndex = Math.floor(Math.random() * shipOptions.length);

  return shipOptions[randomIndex].map((ship: Partial<Ship>) => ({
    ...ship,
    cells: getShipCells(ship.position!, ship.length!, ship.direction!),
  }));
}
