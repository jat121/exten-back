import { Buff } from './../models/buffer.schema';
import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BufferRepo {
    constructor(@InjectModel(Buff.name) private buffModel: Model<Buff>) { }


    add = async (id: string, buff: Buffer) => {
        debugger
        const data = new this.buffModel({ id, buff });
        return data.save();
    }
}