import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectSlackClient, SlackClient } from 'nestjs-slack-listener';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { ACTION_ID } from './on-boarding.constants';
import { CompleteQuestParams, StartOnBoardingParams } from './on-boarding.dto';

@Injectable()
export class OnBoardingService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectSlackClient()
    private readonly slack: SlackClient,
  ) {}

  buildIntroBlock(user: User) {
    return {
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
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              `Don't know where to start on your first day at work? Don't worry! Just follow me. 😘 ` +
              `After completing all the tasks below, click the complete button! 👍🏻`,
          },
        },
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
      ],
    };
  }

  async startOnBoarding(params: StartOnBoardingParams): Promise<User> {
    const { member } = params;
    const user = await this.userRepository.save({
      id: member.id,
      name: member.profile.display_name || member.profile.real_name_normalized,
      image: member.profile.image_original,
      email: member.profile.email,
    });

    try {
      await this.slack.chat.postMessage(this.buildIntroBlock(user));
    } catch (e) {
      console.error(e);
    }

    return user;
  }

  async completeQuest(params: CompleteQuestParams): Promise<User> {
    const { userSlackId } = params;
    const user = await this.userRepository.findOne(userSlackId);
    if (!user) {
      throw new BadRequestException();
    }

    return user;
  }
}
