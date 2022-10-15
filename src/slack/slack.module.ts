import {
  DynamicModule,
  Global,
  Module,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { SLACK_CLIENT, SLACK_CONFIG_OPTIONS } from './constant/symbol';
import { SlackHandlerExplorer } from './handler.explorer';
import { SlackModuleAsyncOptions, SlackModuleOptions } from './interfaces';
import { SlackClientService } from './slack-client.service';
import { SlackEventsController } from './slack-handler.controller';
import { SlackHandler } from './slack-handler.service';

@Global()
@Module({
  providers: [MetadataScanner, SlackHandlerExplorer],
})
export class SlackModule implements OnModuleInit {
  static forRoot(options: SlackModuleOptions): DynamicModule {
    const slackServiceProvider = this.createSlackServiceProvider();
    const slackClientProvider = this.createSlackClientProvider();
    return {
      module: SlackModule,
      controllers: [SlackEventsController],
      providers: [
        {
          provide: SLACK_CONFIG_OPTIONS,
          useValue: options,
        },
        slackServiceProvider,
        slackClientProvider,
      ],
      exports: [SlackHandler, SLACK_CLIENT],
    };
  }

  static forRootAsync(options: SlackModuleAsyncOptions): DynamicModule {
    const slackServiceProvider = this.createSlackServiceProvider();
    const slackClientProvider = this.createSlackClientProvider();
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: SlackModule,
      controllers: [SlackEventsController],
      imports: options.imports || [],
      providers: [...asyncProviders, slackServiceProvider, slackClientProvider],
      exports: [SlackHandler, SLACK_CLIENT],
    };
  }

  private static createSlackServiceProvider(): Provider {
    return {
      provide: SlackHandler,
      useFactory: () => new SlackHandler(),
      inject: [SLACK_CONFIG_OPTIONS],
    };
  }

  private static createSlackClientProvider(): Provider {
    return {
      provide: SLACK_CLIENT,
      useFactory: (options: SlackModuleOptions) =>
        new SlackClientService(options).client,
      inject: [SLACK_CONFIG_OPTIONS],
    };
  }

  private static createAsyncProviders(
    options: SlackModuleAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: SLACK_CONFIG_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }

  constructor(
    private readonly explorer: SlackHandlerExplorer,
    private readonly slackHandler: SlackHandler,
  ) {}

  onModuleInit() {
    const { eventHandlers, interactivityHandlers } = this.explorer.explore();

    for (const eventHandler of eventHandlers) {
      this.slackHandler.addEventHandler(eventHandler);
    }

    for (const interactivityHandler of interactivityHandlers) {
      this.slackHandler.addInteractivityHandler(interactivityHandler);
    }
  }
}
