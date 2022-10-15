import { SetMetadata } from '@nestjs/common';
import {
  SLACK_EVENT_HANDLER,
  SLACK_INTERACTIVITY_HANDLER,
} from '../constant/symbol';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
  SlackEventHandlerConfig,
  SlackInteractivityHandlerConfig,
} from '../interfaces';
import { SlackEventType } from '../types/event';

const SUB_SLACK_EVENT_HANDLER = Symbol('SUB_SLACK_EVENT_HANDLER'); // just to be sure there won't be collisions
const SUB_SLACK_INTERACTIVITY_HANDLER = Symbol(
  'SUB_SLACK_INTERACTIVITY_HANDLER',
); // just to be sure there won't be collisions

type DecoratorParams = {
  target: any;
  propertyKey: string;
  descriptor: PropertyDescriptor;
};

type SlackEventHandlerSubMethodConfig = Omit<
  SlackEventHandlerConfig,
  'handler'
> &
  DecoratorParams;
type SlackInteractivityHandlerSubMethodConfig = Omit<
  SlackInteractivityHandlerConfig,
  'handler'
> &
  DecoratorParams;

export function SlackEventHandler(
  params:
    | {
        eventType?: SlackEventType;
        filter?: (event: IncomingSlackEvent) => boolean;
      }
    | SlackEventType,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let eventType;
    let filter;
    if (typeof params === 'object') {
      eventType = params.eventType;
      filter = params.filter;
    } else {
      eventType = params;
    }

    target[SUB_SLACK_EVENT_HANDLER] =
      target[SUB_SLACK_EVENT_HANDLER] || new Map();
    target[SUB_SLACK_EVENT_HANDLER].set(propertyKey, {
      eventType,
      filter,
      target,
      propertyKey,
      descriptor,
    });
  };
}

export function SlackEventListener(
  listenerFilter: (event: IncomingSlackEvent) => boolean = () => true,
) {
  return function _<T extends { new (...args: any[]): any }>(Base: T) {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args);
        const subMethods = Base.prototype[SUB_SLACK_EVENT_HANDLER];
        if (subMethods) {
          subMethods.forEach(
            (config: SlackEventHandlerSubMethodConfig, method: string) => {
              SetMetadata<string, SlackEventHandlerConfig>(
                SLACK_EVENT_HANDLER,
                {
                  eventType: config.eventType,
                  filter: (event: IncomingSlackEvent) =>
                    listenerFilter(event) &&
                    (config.filter ? config.filter(event) : true),
                  handler: (...args: any[]) => (this as any)[method](...args),
                },
              )(config.target, config.propertyKey, config.descriptor);
            },
          );
        }
      }
    };
  };
}

export function SlackInteractivityHandler(
  params:
    | {
        actionId?: string;
        filter?: (event: IncomingSlackInteractivity) => boolean;
      }
    | string,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let actionId;
    let filter;
    if (typeof params === 'object') {
      actionId = params.actionId;
      filter = params.filter;
    } else {
      actionId = params;
    }

    target[SUB_SLACK_INTERACTIVITY_HANDLER] =
      target[SUB_SLACK_INTERACTIVITY_HANDLER] || new Map();
    target[SUB_SLACK_INTERACTIVITY_HANDLER].set(propertyKey, {
      actionId,
      filter,
      target,
      propertyKey,
      descriptor,
    });
  };
}

export function SlackInteractivityListener() {
  return function _<T extends { new (...args: any[]): any }>(Base: T) {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args);
        const subMethods = Base.prototype[SUB_SLACK_INTERACTIVITY_HANDLER];
        if (subMethods) {
          subMethods.forEach(
            (
              config: SlackInteractivityHandlerSubMethodConfig,
              method: string,
            ) => {
              SetMetadata<string, SlackInteractivityHandlerConfig>(
                SLACK_INTERACTIVITY_HANDLER,
                {
                  actionId: config.actionId,
                  filter: config.filter,
                  handler: (...args: any[]) => (this as any)[method](...args),
                },
              )(config.target, config.propertyKey, config.descriptor);
            },
          );
        }
      }
    };
  };
}
