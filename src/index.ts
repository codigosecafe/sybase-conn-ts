import SyBaseConnTsBase from "./domain/SyBaseConnTsBase";
import { OperationReturnProtocols } from "./protocols/OperationReturnProtocols";

class SyBaseConnTs extends SyBaseConnTsBase {
    isConnected = () => this.DBisConnected();
    connect = () =>
        new Promise<OperationReturnProtocols>((resolve, reject) => {
            if (this.DBisConnected()) {
                this.DBdisconnect();
            }
            this.DBconnect((err: any) => {
                if (err) {
                    reject(err);
                }
                resolve({ success: true });
            });
        });
    disconnect = () =>
        new Promise<OperationReturnProtocols>((resolve, reject) => {
            if (this.DBisConnected()) {
                this.DBdisconnect();
                resolve({ success: true });
            }
            reject({ success: false });
        });
    query = (queryStr: string) =>
        new Promise<any>((resolve, reject) => {
            this.DBquery(queryStr, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
}

export default SyBaseConnTs;
