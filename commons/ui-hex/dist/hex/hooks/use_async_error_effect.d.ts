import { ReadonlyObservableValue } from "../observable_value";
export declare function useAsyncErrorEffect<TError>(callback: (error: TError | null) => void, observableValue: ReadonlyObservableValue<any, TError>): void;
