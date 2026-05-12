export const MessageDirection = {
  IN: 1,
  OUT: 2,
  SYSTEM: 3,
} as const;

export type MessageDirection =
  (typeof MessageDirection)[keyof typeof MessageDirection];

export interface IMessage {
  _id?: string;
  chatId: number;
  text: string;
  direction: MessageDirection;
  tgMessageId?: number;
  createdAt: Date;
  read: boolean;
}
