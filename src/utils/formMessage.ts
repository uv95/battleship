import { WebsocketCommandType } from './types';

export function formMessage(type: WebsocketCommandType, message: any) {
  return {
    type,
    data: JSON.stringify(message),
    id: 0,
  };
}
