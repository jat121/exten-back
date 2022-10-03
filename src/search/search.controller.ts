import { SearchService } from './search.service';
import { Controller, Get, Param, Res } from '@nestjs/common';
import stream, { PassThrough } from 'stream';
import { Response } from 'express';

@Controller('search')
export class SearchController {

    constructor(private service: SearchService) { }

    @Get("getMagnet/:id")
    async getMagnetURI(@Param("id") id: string) {
        console.log("magnet");

        return this.service.generateMagnet(id);
    }

    @Get("/:query/:page")
    async searchQuery(@Param("query") query: string, @Param("page") page: string) {
        return this.service.search(query, +page);
    }
    @Get("/buffer")
    async fetchBuffer(@Res() response: Response) {
        debugger
        console.log(this.service.Buffer);
        // var fileContents = Buffer.from(this.service.Buffer, "base64");
        // var st = new stream();
        
        return {
            buff: this.service.Buffer
        }

    }


}
