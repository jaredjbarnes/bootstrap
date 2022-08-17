import ObservableValue, { ReadonlyObservableValue } from "./observable_value";
import { WeakPromise } from "./weak_promise";
export declare enum Status {
    INITIAL = "initial",
    PENDING = "pending",
    ERROR = "error",
    SUCCESS = "success"
}
export declare type Action<T> = () => WeakPromise<T>;
export interface ReadonlyAsyncActionRunner<T, TError = any> extends ReadonlyObservableValue<T, TError> {
    readonly status: ReadonlyObservableValue<Status>;
    execute(action: Action<T>): Promise<T>;
    retry(): Promise<T>;
    cancel(): void;
    reset(): void;
}
export declare class CancelledError extends Error {
    constructor(message?: string);
}
interface ActiveContext<T> {
    action: () => WeakPromise<T>;
    activePromise: WeakPromise<T>;
    changeState(state: State<T>): void;
    setValue(value: T): void;
    setError(error: unknown): void;
}
export declare class AsyncActionRunner<T, TError = any> extends ObservableValue<T, TError> implements ReadonlyAsyncActionRunner<T, TError> {
    private _internalState;
    private _action;
    private _activePromise;
    private _initialValue;
    readonly status: ObservableValue<Status>;
    constructor(initialValue: T);
    private changeState;
    execute(action: Action<T>): Promise<T>;
    cancel(): void;
    retry(): Promise<T>;
    reset(): void;
    dispose(): void;
}
declare abstract class State<T> {
    protected context: ActiveContext<T>;
    protected key: string | undefined;
    constructor(context: ActiveContext<T>, key?: string);
    abstract getName(): Status;
    execute(_action: Action<T>): Promise<T>;
    retry(): Promise<T>;
    cancel(): void;
}
export declare class InitialState<T> extends State<T> {
    getName(): Status;
    execute(action: Action<T>): Promise<T>;
}
export declare class PendingState<T> extends State<T> {
    constructor(context: ActiveContext<T>);
    cancel(): void;
    execute(_action: Action<T>): Promise<T>;
    getName(): Status;
}
export declare class SuccessState<T> extends InitialState<T> {
    getName(): Status;
}
export declare class ErrorState<T> extends InitialState<T> {
    retry(): Promise<T>;
    getName(): Status;
}
export {};
