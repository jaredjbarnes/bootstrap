import { ReadonlyAsyncActionRunner, Status } from "../async_action_runner";
import { ReadonlyObservableValue } from "../observable_value";
export interface StatusHelper {
    status: Status;
    isInitial: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
}
export declare function useAsyncStatus(runner: ReadonlyAsyncActionRunner<any> | ReadonlyObservableValue<Status, any>): StatusHelper;
