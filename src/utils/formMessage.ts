import { WebsocketCommandType } from './types';

export function formMessage(type: WebsocketCommandType, message: any): string {
  return JSON.stringify({
    type,
    data: JSON.stringify(message),
    id: 0,
  });
}
