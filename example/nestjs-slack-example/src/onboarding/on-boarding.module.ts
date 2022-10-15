import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/user.repository';
import { OnBoardingController } from './on-boarding.controller';
import { OnBoardingService } from './on-boarding.service';

@Module({
  imports: [],
  providers: [UserRepository, OnBoardingService],
  controllers: [OnBoardingController],
})
export class OnBoardingModule {}
