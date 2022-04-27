import {
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  Entity
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import * as moment from 'moment';

@Entity()
export abstract class BaseEntity {
  @PrimaryKey()
  @Exclude()
  _id!: ObjectId;

  @ApiProperty()
  @Expose()
  @SerializedPrimaryKey()
  id!: string;

  @ApiProperty({ type: Date })
  @Property()
  createdAt = moment.utc().toDate();

  @ApiProperty({ type: Date })
  @Property({
    onUpdate: () => moment.utc().toDate()
  })
  updatedAt = moment.utc().toDate();
}
