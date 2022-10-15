import { Inject, Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { SLACK_CONFIG_OPTIONS } from './constant/symbol';
import { SlackModuleOptions } from './interfaces';

@Injectable()
export class SlackClientService {
  public readonly client: WebClient;

  constructor(@Inject(SLACK_CONFIG_OPTIONS) options: SlackModuleOptions) {
    this.client = new WebClient(options.botToken);
  }
}
