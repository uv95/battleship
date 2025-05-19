import { Position } from './types';

export function getRandomPosition(): Position {
  const NUM_CELLS = 10;

  return {
    x: Math.floor(Math.random() * NUM_CELLS),
    y: Math.floor(Math.random() * NUM_CELLS),
  };
}
