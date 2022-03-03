import { DynamicModule, Module, OnModuleInit, Provider } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { SLACK_CONFIG_OPTIONS } from './constant/symbol';
import { SlackHandlerExplorer } from './handler.explorer';
import { SlackModuleAsyncOptions, SlackModuleOptions } from './interfaces';
import { SlackEventsController } from './slack-handler.controller';
import { SlackHandler } from './slack-handler.service';

@Module({
  providers: [MetadataScanner, SlackHandlerExplorer],
})
export class SlackHandlerModule implements OnModuleInit {
  static forRoot(options: SlackModuleOptions): DynamicModule {
    const slackServiceProvider = this.createSlackServiceProvider();
    return {
      module: SlackHandlerModule,
      controllers: [SlackEventsController],
      providers: [
        {
          provide: SLACK_CONFIG_OPTIONS,
          useValue: options,
        },
        slackServiceProvider,
      ],
      exports: [SlackHandler],
    };
  }

  static forRootAsync(options: SlackModuleAsyncOptions): DynamicModule {
    const slackServiceProvider = this.createSlackServiceProvider();
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: SlackHandlerModule,
      controllers: [SlackEventsController],
      imports: options.imports || [],
      providers: [...asyncProviders, slackServiceProvider],
      exports: [SlackHandler],
    };
  }

  private static createSlackServiceProvider(): Provider {
    return {
      provide: SlackHandler,
      useFactory: () => new SlackHandler(),
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
