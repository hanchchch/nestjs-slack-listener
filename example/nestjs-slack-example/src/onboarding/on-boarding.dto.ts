import { Member } from '@slack/web-api/dist/response/UsersListResponse';

export interface StartOnBoardingParams {
  member: Member;
}

export interface CompleteQuestParams {
  userSlackId: string;
}
