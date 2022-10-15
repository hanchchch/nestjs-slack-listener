import { Module } from '@nestjs/common';
import { SlackModule } from 'nestjs-slack-listener';
import { OnBoardingModule } from './onboarding/on-boarding.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SlackModule.forRoot({
      botToken: '',
    }),
    UserModule,
    OnBoardingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
