import { ReadonlyObservableValue } from '../observable_value';
export declare function useAsyncError<TError>(observableValue: ReadonlyObservableValue<any, TError>): TError | null;
export declare function useAsyncErrorMessage<TError extends {
    message?: string;
}>(observableValue: ReadonlyObservableValue<any, TError>): string;
