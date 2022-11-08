import { Callback } from "./CallbackType";

export type TSMessage = {
    id: number;
    sql: string;
    callback: Callback;
    sentTime: number;
    hrstart: [number, number];
};