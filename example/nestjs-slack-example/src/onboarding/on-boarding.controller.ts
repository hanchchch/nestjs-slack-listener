import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
  SlackEventHandler,
  SlackEventListener,
  SlackInteractivityHandler,
  SlackInteractivityListener,
  TeamJoinEvent,
} from 'nestjs-slack-listener';
import { ACTION_ID } from './on-boarding.constants';
import { CompleteQuestParams } from './on-boarding.dto';
import { OnBoardingService } from './on-boarding.service';

@Controller('on-boarding')
@SlackEventListener()
@SlackInteractivityListener()
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @Post('complete')
  async completeQuestHTTP(@Body() params: CompleteQuestParams) {
    return this.onboardingService.completeQuest(params);
  }

  @SlackEventHandler('team_join')
  async onTeamJoin({
    event: { user: member },
  }: IncomingSlackEvent<TeamJoinEvent>) {
    return this.onboardingService.startOnBoarding({ member });
  }

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
}
