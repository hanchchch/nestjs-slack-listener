import { PlainTextElement } from '@slack/web-api';

export type KnownAction = {
  type: string;
  action_id: string;
  block_id: string;
  text: PlainTextElement[];
  value: string;
  style: string;
  action_ts: string;
  selected_option?: any;
  selected_user?: string;
  initial_option?: any;
}; // TODO
