import path from "path";
import child_process, { ChildProcess } from "child_process";
import { DataConectionProtocols } from "../protocols/DataConectionProtocols";
import {CallBackError , Callback, TSMessage, JavaMessage} from "../types"
import SyBaseConnTsLog from "./SyBaseConnTsLog";
import * as JSONStream from 'JSONStream';

class SyBaseConnTsBase {
    connected: boolean;
    host: string;
    port: number;
    dbname: string;
    username: string;
    password: string;
    encoding: BufferEncoding;
    extraLogs: boolean | undefined;
    pathToJavaBridge: any;
    queryCount: number;
    currentMessages: Map<number, TSMessage>;
    JavaBridge!: ChildProcess;
    showLog: SyBaseConnTsLog;
    jsonParser: any;
    constructor({
        dataConection,
        pathToJavaBridge = undefined,
        encoding = "utf8",
        extraLogs = false,
    }: {
        dataConection: DataConectionProtocols;
        pathToJavaBridge?: string | undefined;
        encoding?: BufferEncoding;
        extraLogs?: boolean | undefined;
    }) {
        this.connected = false;
        this.host = dataConection.host;
        this.port = dataConection.port;
        this.dbname = dataConection.dbname;
        this.username = dataConection.username;
        this.password = dataConection.password;
        this.encoding = encoding;
        this.pathToJavaBridge = pathToJavaBridge;

        this.queryCount = 0;
        this.currentMessages = new Map();
        this.jsonParser = JSONStream.parse();
        
        this.loadJavaBrige();
        this.showLog = new SyBaseConnTsLog({extraLogs});
    }
    loadJavaBrige = (): string => {
        if (this.pathToJavaBridge === undefined) {
            this.pathToJavaBridge = path.resolve(
                __dirname,
                "..",
                "..",
                "JavaSybaseLink",
                "dist",
                "JavaSybaseLink.jar"
            );
        }
        return this.pathToJavaBridge;
    }
   
    onSQLError = (data: string | undefined): any => {
        const error = new Error(data);

        this.currentMessages.forEach((message) => {
            message.callback(error);
        });

        this.currentMessages.clear();
    }

    onSQLResponse = (returnMessage: JavaMessage) => {
        let err: CallBackError = null;
	    const request = this.currentMessages[returnMessage.msgId];
	    delete this.currentMessages[returnMessage.msgId];

	    let result = returnMessage.result;
        if (result.length === 1){
            result = result[0]; //if there is only one just return the first RS not a set of RS's
        }
		
        const currentTime = (new Date()).getTime();
        const sendTimeMS = currentTime - returnMessage.javaEndTime;
        const hrend = process.hrtime(request.hrstart);
        const javaDuration = (returnMessage.javaEndTime - returnMessage.javaStartTime);

        if (returnMessage.error !== undefined){
            err = new Error(returnMessage.error);
        }
        this.showLog.run(
            "Execution time (hr): %ds %dms dbTime: %dms dbSendTime: %d sql=%s", 
            hrend[0], 
            hrend[1]/1000000, 
            javaDuration, 
            sendTimeMS, 
            request.sql
        );
        request.callback(err, result);
    }

    DBconnect = (callback: Callback) => {
        const that = this;
        this.JavaBridge = child_process.spawn("java", [
            "-jar",
            this.pathToJavaBridge,
            this.host,
            this.port,
            this.dbname,
            this.username,
            this.password,
        ]);

        this.JavaBridge.stdout!.once("data", function (data) {
            if ((data + "").trim() != "connected") {
                callback(new Error("Error connecting " + data));
                return;
            }

            that.JavaBridge.stderr!.removeAllListeners("data");
            that.connected = true;

            // set up normal listeners.
            that.JavaBridge.stdout!.setEncoding(that.encoding)
                .pipe(that.jsonParser)
                .on("data", function (returnMessage) {
                    that.onSQLResponse.call(that, returnMessage);
                });
            that.JavaBridge.stderr!.on("data", function (err) {
                that.onSQLError.call(that, err);
            });

            callback(null, data);
        });

        // handle connection issues.
        this.JavaBridge.stderr!.once("data", function (data) {
            that.JavaBridge.stdout!.removeAllListeners("data");
            that.JavaBridge.kill();
            callback(new Error(data));
        });
    };

    DBisConnected = () => this.connected;

    DBquery = (sql: string, callback: Callback) => {
        if (this.DBisConnected() === false) {
          callback(new Error("database isn't connected."));
          return;
        }
        const hrstart = process.hrtime();
        this.queryCount++;
    
        const msg = {
            msgId: this.queryCount,
            sql: sql,
            sentTime: (new Date()).getTime(),
            callback: callback,
            hrstart: hrstart
        };
       
        
        const strMsg = JSON.stringify(msg).replace(/[\n]/g, '\\n');
       // const strMsg = stringify(msg);
    
        this.showLog.run(
            `this: ${this} currentMessages: ${ this.showLog.mapToString(this.currentMessages)} this.queryCount: ${this.queryCount}`
        );
        
        this.currentMessages[msg.msgId] = msg;
        this.JavaBridge.stdin!.write(strMsg + "\n");
        this.showLog.run("sql request written: " + strMsg);
    };
    
      DBdisconnect = () => {
        if (this.DBisConnected() === true) {
            this.JavaBridge.kill();
        }
        this.connected = false;
      };
}

export default SyBaseConnTsBase;

