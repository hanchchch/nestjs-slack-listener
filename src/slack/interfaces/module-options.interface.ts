import { ModuleMetadata } from '@nestjs/common';

export interface SlackModuleOptions {
  botToken?: string;
}

export interface SlackModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useFactory?: (
    ...args: any[]
  ) => Promise<SlackModuleOptions> | SlackModuleOptions;
  inject?: any[];
}
