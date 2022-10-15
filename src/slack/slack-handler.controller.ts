import { Body, Controller, Post } from '@nestjs/common';
import { IncomingSlackEvent } from './interfaces';
import { SlackHandler } from './slack-handler.service';

@Controller('slack')
export class SlackEventsController {
  constructor(private readonly slackHandler: SlackHandler) {}

  @Post(`events`)
  async handleEvent(@Body() event: IncomingSlackEvent) {
    if (event.challenge) {
      return {
        challenge: event.challenge,
      };
    }
    return this.slackHandler.handleEvent(event);
  }

  @Post(`interactivity`)
  async handleInteractivity(@Body() params: { payload: string }) {
    return this.slackHandler.handleInteractivity(JSON.parse(params.payload));
  }
}
