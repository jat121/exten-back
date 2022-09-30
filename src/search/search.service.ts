import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import * as TorrentSearchApi from "torrent-search-api";
import { v4 as generateId } from 'uuid';

@Injectable()
export class SearchService implements OnModuleInit {
    currentProviders: string[] = [];
    curData: TorrentSearchApi.Torrent[] = [];

    limit: number = 10;
    onModuleInit() {
        TorrentSearchApi.enablePublicProviders();
        TorrentSearchApi.disableProvider("TorrentProject")
        this.currentProviders = TorrentSearchApi.getActiveProviders().map((provider: TorrentSearchApi.TorrentProvider) => {
            return provider.name;
        })
        console.log(this.currentProviders);
        
    }

    search = async (query: string, page: number) => {
        const start = (page === 1 || page === undefined) ? 0 : page * this.limit;
        const limit = start + 10;
        let finalSearchResults: TorrentSearchApi.Torrent[] = [];
        const searchPromises = this.currentProviders.map(async (name: string) => {
            try {
                return await TorrentSearchApi.search([name], query, 'All', limit);
            } catch (error) {
                return [];
            }
        })

        const searchResults = (await Promise.all(searchPromises))
            .filter((torrent: TorrentSearchApi.Torrent[]) => {
                return torrent.length > 0;
            })
            .forEach((torrent: TorrentSearchApi.Torrent[]) => {
                finalSearchResults = [...finalSearchResults, ...torrent];
            })

        finalSearchResults = finalSearchResults.map((torrent: TorrentSearchApi.Torrent) => {
            torrent = { id: generateId(), ...torrent }
            return torrent;
        }).filter((torrent: TorrentSearchApi.Torrent) => {
            let title = torrent.title.toLowerCase();
            let q = query.toLowerCase();
            return this.find(title, q);
        });

        console.log({
            data: finalSearchResults.length,
            start, limit
        });
        this.curData = finalSearchResults;
        const data = finalSearchResults.sort((a, b) => parseFloat(b?.seeds.toString()) - parseFloat(a?.seeds.toString())).slice(start, limit);

        return {
            data
        }
    }

    private find = (title: string, query: string): boolean => {
        const queryArray = query.split(" ");
        let doesQueryExist: boolean = false;
        queryArray.forEach(q => {
            if (title.includes(q)) {
                doesQueryExist = true;
            }
        })
        return doesQueryExist;
    }

    generateMagnet = async (id: string) => {
        const torr = this.curData.find((torrent: TorrentSearchApi.Torrent) => torrent.id === id);
        if(!torr) {
            throw new ServiceUnavailableException("Try Again Later");
        }
        const uri = await TorrentSearchApi.getMagnet(torr);
        return {
            downloadUrl: uri
        }
    }
}
