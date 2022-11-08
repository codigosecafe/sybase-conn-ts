import { CallBackError } from "./CallBackErrorType";

export type Callback = (err: CallBackError, data?: unknown) => void;