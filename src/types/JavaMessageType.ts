export type JavaMessage = {
    msgId: number;
    result: any; // Doesn't matter since we only return it without interacting
    error?: string;
    javaEndTime: number;
    javaStartTime: number;
};