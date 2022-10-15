import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SlackClient, SlackEventListener, SlackModule } from 'src/slack';
import { InjectSlackClient } from 'src/slack/decorators';
import * as request from 'supertest';

describe('Slack Module Initialization', () => {
  describe('forRoot', () => {
    it('should compile only with botToken option', async () => {
      @Controller()
      @SlackEventListener()
      class TestController {
        @Get()
        get() {
          return '';
        }
      }
      @Module({
        imports: [SlackModule.forRoot({ botToken: 'test' })],
        controllers: [TestController],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);
      const server = app.getHttpServer();

      await app.init();
      await request(server).get('/').expect(200);
      await app.close();
    });
    it('should compile including slack client', async () => {
      @Injectable()
      class TestService {
        constructor(@InjectSlackClient() slack: SlackClient) {
          expect(slack).toBeDefined();
        }
        getBotToken() {
          return 'test';
        }
      }
      @Module({
        imports: [
          SlackModule.forRoot({
            botToken: 'test',
          }),
        ],
        providers: [TestService],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);

      await app.init();
      await app.close();
    });
    it('should usable globally', async () => {
      @Injectable()
      class TestLocalService {
        constructor(@InjectSlackClient() slack: SlackClient) {
          expect(slack).toBeDefined();
        }
        getBotToken() {
          return 'test';
        }
      }
      @Module({
        imports: [],
        providers: [TestLocalService],
      })
      class TestLocalModule {}
      @Module({
        imports: [
          SlackModule.forRoot({
            botToken: 'test',
          }),
          TestLocalModule,
        ],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);

      await app.init();
      await app.close();
    });
  });
  describe('forRootAsync', () => {
    it('should compile only with botToken option', async () => {
      @Controller()
      @SlackEventListener()
      class TestController {
        @Get()
        get() {
          return '';
        }
      }
      @Module({
        imports: [
          SlackModule.forRootAsync({
            useFactory: () => ({ botToken: 'test' }),
          }),
        ],
        controllers: [TestController],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);
      const server = app.getHttpServer();

      await app.init();
      await request(server).get('/').expect(200);
      await app.close();
    });

    it('should compile including slack client', async () => {
      @Injectable()
      class TestService {
        constructor(@InjectSlackClient() slack: SlackClient) {
          expect(slack).toBeDefined();
        }
        getBotToken() {
          return 'test';
        }
      }
      @Module({
        imports: [
          SlackModule.forRootAsync({
            useFactory: () => ({ botToken: 'test' }),
          }),
        ],
        providers: [TestService],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);

      await app.init();
      await app.close();
    });
    it('should usable globally', async () => {
      @Injectable()
      class TestLocalService {
        constructor(@InjectSlackClient() slack: SlackClient) {
          expect(slack).toBeDefined();
        }
        getBotToken() {
          return 'test';
        }
      }
      @Module({
        imports: [],
        providers: [TestLocalService],
      })
      class TestLocalModule {}
      @Module({
        imports: [
          SlackModule.forRootAsync({
            useFactory: () => ({ botToken: 'test' }),
          }),
          TestLocalModule,
        ],
      })
      class TestModule {}

      const app = await NestFactory.create(TestModule);

      await app.init();
      await app.close();
    });
  });
});
