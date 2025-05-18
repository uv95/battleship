import { Cell, Position } from './types';

export function getShipCells(
  firstCell: Position,
  length: number,
  isVerical: Boolean
) {
  const shipCells: Cell[] = [];
  [...Array(length)].forEach((_, i) => {
    shipCells.push({
      x: isVerical ? firstCell.x : firstCell.x + i,
      y: isVerical ? firstCell.y + i : firstCell.y,
      isShot: false,
    });
  });

  return shipCells;
}
