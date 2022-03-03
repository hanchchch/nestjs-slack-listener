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

# Usage

## Settings

Import the module at your app module.

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SlackHandlerModule.forRootAsync({
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
