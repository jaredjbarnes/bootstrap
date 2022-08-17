import { ReadonlyAsyncActionRunner } from "../async_action_runner";
export declare function useAsyncState<TValue, TError>(asyncActionRunner: ReadonlyAsyncActionRunner<TValue, TError>): {
    status: import("../async_action_runner").Status;
    isInitial: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    value: TValue;
    error: TError | null;
};
