import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  private users: User[] = [];

  async findOne(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async save(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
}
