import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import * as TorrentSearchApi from "torrent-search-api";
import { v4 as generateId } from 'uuid';
import * as WebTorrent from 'webtorrent';
import { threadId } from 'worker_threads';
import { BufferRepo } from './buffer.repo';


@Injectable()
export class SearchService implements OnModuleInit {

    constructor(public repo: BufferRepo) { }
    currentProviders: string[] = [];
    curData: TorrentSearchApi.Torrent[] | any[] = [];
    Buffer;
    limit: number = 5;
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
        const limit = start + 5;
        let finalSearchResults: TorrentSearchApi.Torrent[] | any[] = [];
        const searchPromises: Promise<any[]>[] = this.currentProviders.map(async (name: string) => {
            try {
                return await TorrentSearchApi.search([name], query, 'All', limit);
            } catch (error) {
                return [];
            }
        })

        const searchResults = (await Promise.all(searchPromises))
            .filter((torrent: TorrentSearchApi.Torrent[] | any[]) => {
                return torrent.length > 0;
            })
            .forEach((torrent: TorrentSearchApi.Torrent[] | any[]) => {
                finalSearchResults = [...finalSearchResults, ...torrent];
            })

        finalSearchResults = finalSearchResults.map((torrent: TorrentSearchApi.Torrent | any) => {
            torrent = { id: generateId(), ...torrent }
            return torrent;
        }).filter((torrent: TorrentSearchApi.Torrent | any) => {
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
            searchResults: data,
            totalPages: finalSearchResults.length
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
        const torr: any = this.curData.find((torrent) => torrent.id === id);
        if (!torr) {
            throw new ServiceUnavailableException("Try Again Later");
        }
        const uri = await TorrentSearchApi.getMagnet(torr);
        const buffer = await TorrentSearchApi.downloadTorrent(torr);
        // this.init(uri, id);
        return {
            downloadMagnet: uri,
            BufferNode: buffer
        }
    }

    // init(uri: any, id: string) {
    //     var self = this;
    //     const magnetURI = "magnet:?xt=urn:btih:B9F0A8BAF8B647D4754BE630A91401F2EB678E69&dn=House.of.the.Dragon.S01E06.WEB.x264-PHOENiX&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.birkenwald.de%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fopentor.org%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.me%3A2970%2Fannounce&tr=https%3A%2F%2Ftracker.foreverpirates.co%3A443%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce"
    //     const client = new WebTorrent();
    //     client.add(magnetURI, function (torrent) {

    //         // console.log(torrent);

    //         // el.innerHTML = torrent;
    //         // console.log(torrent.torrentFileBlobURL); 

    //         torrent.on("download", (s) => {
    //             let res = downloadSpeed(torrent.downloadSpeed);
    //             let speed = `${res}/s`;
    //             let name = torrent.name
    //             let progress = torrent.progress

    //             // console.log({
    //             //     speed, name, progress
    //             // });
    //         })
    //         torrent.on('done', function () {

    //             console.log('torrent download finished')
    //             console.log(torrent.files);

    //             var file = torrent.files.find(file => file.name.endsWith('.mkv'))
    //             // console.log(file);
    //             self.Buffer = file;
    //             // file.getBlob(()=>{})
    //             // file.getBuffer((err, buff) => {

    //             //     if (!err) {
    //             //         console.log(buff);
    //             //         //  self.repo.add(id, buff) 
    //             //         self.Buffer = buff;
    //             //         return {
    //             //             buffer: buff
    //             //         }
    //             //     }
    //             //     else console.log(err); 
    //             // })


    //             // torrent.files[0].getBlobURL(function (err, url) {
    //             //      ;
    //             //     console.log(url);
    //             //     console.log(err);
    //             // })
    //         })


    //     })

    //     client.on("error", () => {
    //         console.log("error");
    //     })

    //     client.on("torrent", (torrent) => {

    //         console.log("ready");

    //         // saveByteArray("Sample Report.mp4", buffer);
    //         // Display the file by adding it to the DOM.
    //         // Supports video, audio, image files, and more!
    //     })
    // }




}

// const downloadSpeed = (num: any) => {
//     const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
//     const neg = num < 0
//     if (neg) num = -num
//     if (num < 1) return (neg ? '-' : '') + num + ' B'
//     const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
//     const unit = units[exponent]
//     num = Number((num / Math.pow(1000, exponent)).toFixed(2))
//     return (neg ? '-' : '') + num + ' ' + unit
// }