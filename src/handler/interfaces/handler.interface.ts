import { SlackEventType } from '../types/event';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
} from './incoming.interface';

export type SlackEventHandlerConfig = {
  eventType?: SlackEventType;
  filter?: (event: IncomingSlackEvent) => boolean;
  handler: (event: IncomingSlackEvent) => Promise<unknown>;
};

export type SlackInteractivityHandlerConfig = {
  actionId?: string;
  filter?: (event: IncomingSlackInteractivity) => boolean;
  handler: (event: IncomingSlackInteractivity) => Promise<unknown>;
};
