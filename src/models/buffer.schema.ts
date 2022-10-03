import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatDocument = Buff & Document;

@Schema()
export class Buff {
  @Prop()
  id: string;

  @Prop()
  buff: Buffer;
}

export const BufferSchema = SchemaFactory.createForClass(Buff);