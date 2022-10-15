import { Inject } from '@nestjs/common';
import { SLACK_CLIENT } from './constant/symbol';

export const InjectSlackClient = () => Inject(SLACK_CLIENT);
