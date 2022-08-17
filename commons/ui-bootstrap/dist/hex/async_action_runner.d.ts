import { ObservableValue, ReadonlyObservableValue } from "./observable_value";
import { AsyncAction } from "./async_action";
export declare enum Status {
    INITIAL = "initial",
    PENDING = "pending",
    ERROR = "error",
    SUCCESS = "success",
    DISABLED = "disabled"
}
export declare class AsyncActionRunner<TResult, TInitial = TResult, TError = any> extends ObservableValue<TResult, TInitial, TError> implements ReadonlyAsyncActionRunner<TResult, TInitial, TError> {
    private readonly _initialState;
    private _internalState;
    readonly status: ObservableValue<Status>;
    constructor(initialState: TInitial);
    action: AsyncAction<TResult> | null;
    changeState(state: State<TResult, TInitial, TError>): void;
    disable(): void;
    enable(): void;
    execute(action: AsyncAction<TResult>): Promise<TResult>;
    cancel(): void;
    retry(): Promise<TResult>;
    reset(): void;
    dispose(): void;
}
declare abstract class State<TResult, TInitial, TError> {
    protected context: AsyncActionRunner<TResult, TInitial, TError>;
    protected key: string | undefined;
    constructor(context: AsyncActionRunner<TResult, TInitial, TError>, key?: string);
    abstract getName(): Status;
    enable(): void;
    disable(): void;
    execute(_action: AsyncAction<TResult>): Promise<TResult>;
    retry(): Promise<TResult>;
    cancel(): void;
}
declare class ReadyState<TResult, TInitial, TError> extends State<TResult, TInitial, TError> {
    getName(): Status;
    disable(): void;
    execute(action: AsyncAction<TResult>): Promise<TResult>;
}
export declare class InitialState<TResult, TInitial, TError> extends ReadyState<TResult, TInitial, TError> {
    getName(): Status;
}
export declare class PendingState<TResult, TInitial, TError> extends State<TResult, TInitial, TError> {
    private isEnabled;
    readonly executingPromise: Promise<TResult>;
    constructor(context: AsyncActionRunner<TResult, TInitial, TError>, key?: string);
    cancel(): void;
    disable(): void;
    enable(): void;
    execute(): Promise<TResult>;
    getName(): Status;
}
export declare class SuccessState<TResult, TInitial, TError> extends ReadyState<TResult, TInitial, TError> {
    getName(): Status;
}
export declare class ErrorState<TResult, TInitial, TError> extends ReadyState<TResult, TInitial, TError> {
    retry(): Promise<TResult>;
    getName(): Status;
}
export declare class DisabledState<TResult, TInitial, TError> extends State<TResult, TInitial, TError> {
    execute(): Promise<never>;
    getName(): Status;
    enable(): void;
}
export interface ReadonlyAsyncActionRunner<TResult, TInitial = TResult, TError = any> extends ReadonlyObservableValue<TResult, TInitial, TError> {
    readonly status: ReadonlyObservableValue<Status>;
    disable(): void;
    enable(): void;
    cancel(): void;
    retry(): Promise<TResult>;
    reset(): void;
}
export {};
