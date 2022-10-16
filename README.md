<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS Slack Listeners and Handlers</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

<p align="center">🥰 Any kinds of contributions are welcome! 🥰</p>

---

# Features

- Class decorator `@SlackEventListener`
  - Decorate the class to use it as a Slack event listener, just like decorating HTTP listeners with `@Controller`.
- Method decorator `@SlackEventHandler`
  - Decorate the method to use it as a Slack event handler, just like decorating HTTP handlers with `@Get`, `@Post`, etc.
  - You can filter events by event type, or your custom filtering function.
- Slack Web API Client
  - Inject the Slack Web API client to your service class with `@InjectSlackClient` decorator.
  - You can use the client to send messages to Slack, or whatever you want to do.

# Installation

```
yarn add nestjs-slack-listener
```

# Usage

Please refer to the [example](/example/nestjs-slack-example/) for more details.

## Settings

### Import `SlackModule`

Import the module at your app module.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SlackModule.forRootAsync({
      useFactory: async (config: ConfigService<EnvVars>) => ({
        botToken: config.get('SLACK_BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

### Event and Interactivity Subscription

You need to set event and interactivity subscriptions URL of your slack app so that the app can receive events and interactivity from slack.

- Event subscription
  - https://api.slack.com/apps/your-app-id/event-subscriptions
  - `http://<hostname>/slack/events`
- Interactivity subscription
  - https://api.slack.com/apps/your-app-id/interactive-messages
  - `http://<hostname>/slack/interactivity`

## Decorators

### Slack Event

Decorate the controller to use it as slack event listener.

```typescript
@Controller('on-boarding')
@SlackEventListener()
export class OnBoardingController {}
```

Decorate the method of the controller to use it as slack event handler.

```typescript
@Controller('on-boarding')
@SlackEventListener()
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @SlackEventHandler('team_join')
  async onTeamJoin({ event: { user } }: IncomingSlackEvent<TeamJoinEvent>) {
    this.onboardingService.startOnBoarding({ user });
  }
}
```

### Slack Interactivity

You can also decorate the listeners and handlers for slack-interactivity.

```typescript
@Controller('on-boarding')
@SlackEventListener()
@SlackInteractivityListener()
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @SlackEventHandler('team_join')
  async onTeamJoin({ event: { user } }: IncomingSlackEvent<TeamJoinEvent>) {
    this.onboardingService.startOnBoarding({ user });
  }

  @SlackInteractivityHandler(ACTION_ID.COMPLETE_QUEST)
  async completeOnBoarding({
    user: { id: userSlackId },
    actions: [{ value }],
  }: IncomingSlackInteractivity) {
    return this.onboardingService.completeOnBoarding({ userSlackId, value });
  }
}
```

### Filters

Filter the events with function argument `filter` and string argument `eventType` of the decorator `SlackEventHandler`.

```typescript
@Controller('memo')
@SlackEventListener()
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('write this down!'),
  })
  async takeMemo({ event: { message } }: IncomingSlackEvent<MessageEvent>) {
    this.memoService.takeMemo({ message });
  }
}
```

You can also filter the events at the decorator `SlackEventListener`

```typescript
@Controller('memo')
@SlackEventListener(({ event }) => event.channel === MEMO_CHANNEL)
export class OnBoardingController {
  constructor(private readonly memoService: MemoService) {}

  @SlackEventHandler({
    eventType: 'message',
    filter: ({ event }) => event.text.includes('write this down!'),
  })
  async onTeamJoin({ event: { user } }: IncomingSlackEvent<MessageEvent>) {
    this.memoService.takeMemo({ message });
  }
}
```

## Slack Client

Use `InjectSlackClient` to use the slack web api client.

```ts
@Injectable()
export class OnBoardingService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectSlackClient()
    private readonly slack: SlackClient,
  ) {}
  ...
}
```

The injected `SlackClient` is identical to the official [Slack Web API Client](https://www.npmjs.com/package/@slack/web-api)

```ts
await this.slack.chat.postMessage({
  channel: user.id,
  text: 'Hi there! 👋🏻',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Hi there! 👋🏻',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hello! Nice to meet you, ${user.name}! I'm *hanch*, a slack bot that helps you with onboarding process.`,
      },
    },
  ],
});
```
