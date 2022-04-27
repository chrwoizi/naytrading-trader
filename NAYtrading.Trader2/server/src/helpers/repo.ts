import { AnyEntity, EntityRepository, wrap } from '@mikro-orm/core';

export class Repo<T extends AnyEntity<T>> extends EntityRepository<T> {
  async upsert(data, where) {
    let e = await this.findOne(where);

    if (e) {
      wrap(e).assign(data);
    } else {
      e = this.create(data);
    }

    await this.persistAndFlush(e);

    return e;
  }
}
