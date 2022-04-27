import { Entity, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { BaseEntity } from '../base-entity.entity';

@Entity({ collection: 'users' })
export class User extends BaseEntity {
  @ApiProperty()
  @Property()
  username: string;

  @Exclude()
  @Property()
  password: string;

  @ApiProperty()
  @Expose({ groups: ['admin'] })
  isAdmin?: boolean;

  @IsNotEmpty()
  @ApiProperty()
  @Property()
  name: string;
}
