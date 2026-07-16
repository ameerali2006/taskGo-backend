import {
  Document,
  QueryFilter,
  Model,
  UpdateQuery,
} from "mongoose";
import { IBaseRepository } from "./interface/IBase.repository";


export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async find(filter: QueryFilter<T> = {}): Promise<T[]> {
    return await this.model.find(filter);
  }

  async update(
    id: string,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);

    return !!result;
  }
}