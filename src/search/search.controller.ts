import { SearchService } from './search.service';
import { Controller, Get, Param } from '@nestjs/common';

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
        return this.service.search(query,+page);
    }

    
}
