# Example app for nestjs-slack-listener

## Scenario

This app is a simple example of how to use `nestjs-slack-listener` to build a slack app. It sends a welcome message with instructions to a new user. The user can press the 'Done!' button to complete the onboarding process.

## Subscribe Slack Events and Interactivity

[The controller](/example/nestjs-slack-example/src/onboarding/on-boarding.controller.ts) is decorated with `@SlackEventListener()` and `@SlackInteractivityListener` to subscribe the events and interactivity.

```ts
@Controller('on-boarding')
@SlackEventListener()
@SlackInteractivityListener()
export class OnBoardingController {
  ...
}
```

When the user joins to the team, the method decorated with `@SlackEventHandler('team_join')` is called.

```ts
@SlackEventHandler('team_join')
async onTeamJoin({
  event: { user: member },
}: IncomingSlackEvent<TeamJoinEvent>) {
  return this.onboardingService.startOnBoarding({ member });
}
```

When the user presses the 'Done!' button, the method decorated with `@SlackInteractivityHandler(ACTION_ID.COMPLETE_QUEST)` is called.

```ts
@SlackInteractivityHandler(ACTION_ID.COMPLETE_QUEST)
async completeQuest({
  user: { id: userSlackId },
  actions: [{ value: questUserId }],
}: IncomingSlackInteractivity) {
  if (userSlackId !== questUserId) {
    throw new ForbiddenException();
  }
  return this.onboardingService.completeQuest({
    userSlackId,
  });
}
```

## Send a message to channel with the Slack Client

The `SlackClient` is injected to [the service](/example/nestjs-slack-example/src/onboarding/on-boarding.service.ts) class, enabling it to send a message to the channel.

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

Include a action block in the message so the user can call the controller method decorated with `@SlackInteractivityHandler(ACTION_ID.COMPLETE_QUEST)`.

```ts
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              value: `${user.id}`,
              action_id: ACTION_ID.COMPLETE_QUEST,
              text: { type: 'plain_text', text: ':white_check_mark: Done!' },
            },
          ],
        },
```

The `SlackClient` is identical to the official [Slack Web API Client](https://www.npmjs.com/package/@slack/web-api)

```ts
await this.slack.chat.postMessage(this.buildIntroBlock(user));
```
