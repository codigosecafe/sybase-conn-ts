import {expect, describe, it, jest} from '@jest/globals';

import * as dotenv from 'dotenv';
import SyBaseConnTs from './';

dotenv.config();

const makeDataConection = () => {
    return { 
        host: process.env.DB_SYBASE_HOST,
        port: process.env.DB_SYBASE_PORT, 
        dbname: process.env.DB_SYBASE_DATABASE,
        username:process.env.DB_SYBASE_USERNAME,
        password: process.env.DB_SYBASE_PASSWORD
    };
}

const makeReturnSuccess = () =>{
    return new Promise<any>(resolve => resolve({ susses: true }));
}


describe("SyBaseConnTs", () => {
    it("test isConnected", async () => {

        const dataConection = makeDataConection();
        const sut = new SyBaseConnTs({ dataConection });

        jest.spyOn(sut, 'connect').mockResolvedValueOnce(await makeReturnSuccess());
        jest.spyOn(sut, 'isConnected').mockReturnValue(true)
        jest.spyOn(sut, 'disconnect').mockResolvedValueOnce(await makeReturnSuccess());
        
        await sut.connect();
        expect(sut.isConnected()).toBe(true)
        await sut.disconnect();     
    });

    it("test query", async () => {
        const dataConection = makeDataConection();
        const sut = new SyBaseConnTs({ dataConection });

        jest.spyOn(sut, 'connect').mockResolvedValueOnce(await makeReturnSuccess());
        jest.spyOn(sut, 'disconnect').mockResolvedValueOnce(await makeReturnSuccess());
        jest.spyOn(sut, 'query').mockResolvedValueOnce(await makeReturnSuccess());

        const dataQuery = await sut.query("SELECT * FROM TbFundo WHERE CdDrive = '42'");
        expect(dataQuery).toBeTruthy();
        await sut.disconnect();     
    });

    
  });