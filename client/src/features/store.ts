import { EventEmitter } from '@base/client/features/event-emitter';

import { DESC_EVENTS, type DeskEvents } from '@features/events';

export class Store extends EventEmitter<DeskEvents>
{



}

export const store = new Store();

