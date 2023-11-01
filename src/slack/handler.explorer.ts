import { Injectable } from '@nestjs/common';
import { Controller } from '@nestjs/common/interfaces';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  SLACK_EVENT_HANDLER,
  SLACK_INTERACTIVITY_HANDLER,
} from './constant/symbol';
import {
  SlackEventHandlerConfig,
  SlackInteractivityHandlerConfig,
} from './interfaces';

@Injectable()
export class SlackHandlerExplorer {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  public explore(): {
    eventHandlers: SlackEventHandlerConfig[];
    interactivityHandlers: SlackInteractivityHandlerConfig[];
  } {
    // find all the controllers
    const modules = [...this.modulesContainer.values()];
    const controllersMap = modules
      .filter(({ controllers }) => controllers.size > 0)
      .map(({ controllers }) => controllers);

    // munge the instance wrappers into a nice format
    const instanceWrappers: InstanceWrapper<Controller>[] = [];
    controllersMap.forEach((map) => {
      const mapKeys = [...map.keys()];
      instanceWrappers.push(
        ...mapKeys.map((key) => {
          return map.get(key);
        }),
      );
    });

    // find the handlers marked with @Subscribe
    return {
      eventHandlers: instanceWrappers
        .map(({ instance }) => {
          const instancePrototype = Object.getPrototypeOf(instance);
          return this.metadataScanner
            .getAllMethodNames(instancePrototype)
            .map((method) => {
              return this.exploreEventHandler(instancePrototype, method);
            });
        })
        .reduce((previous, current) => {
          return previous.concat(current);
        }),
      interactivityHandlers: instanceWrappers
        .map(({ instance }) => {
          const instancePrototype = Object.getPrototypeOf(instance);
          return this.metadataScanner
            .getAllMethodNames(instancePrototype)
            .map((method) => {
              return this.exploreInteractivityHandler(
                instancePrototype,
                method,
              );
            });
        })
        .reduce((previous, current) => {
          return previous.concat(current);
        }),
    };
  }

  public exploreEventHandler(
    instancePrototype: Controller,
    methodKey: string,
  ): SlackEventHandlerConfig | null {
    const targetCallback = instancePrototype[methodKey];
    const handler = Reflect.getMetadata(SLACK_EVENT_HANDLER, targetCallback);
    if (handler == null) {
      return null;
    }
    return handler;
  }

  public exploreInteractivityHandler(
    instancePrototype: Controller,
    methodKey: string,
  ): SlackInteractivityHandlerConfig | null {
    const targetCallback = instancePrototype[methodKey];
    const handler = Reflect.getMetadata(
      SLACK_INTERACTIVITY_HANDLER,
      targetCallback,
    );
    if (handler == null) {
      return null;
    }
    return handler;
  }
}
