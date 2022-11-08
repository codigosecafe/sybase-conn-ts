
class SyBaseConnTsLog {
    extraLogs: boolean | undefined;
    
    constructor({extraLogs = false}: {extraLogs?: boolean | undefined}){
        this.extraLogs = extraLogs;
    };

    run = (...msg: (string | number)[]): void => {
        if (this.extraLogs) {
            console.log(msg);
        }
    };
    mapToString(map: Map<any, any>): string {
        let str: string = "";
        map.forEach((value, key) => {
            str += "\t" + key + "> " + value + ";\n";
        });
        return str;
    };

   }

export default SyBaseConnTsLog;

