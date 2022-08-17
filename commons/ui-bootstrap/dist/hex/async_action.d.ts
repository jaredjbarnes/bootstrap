export declare type OnCancelCallback = (reason: CancelledError | TimeoutError) => void;
export declare type Action<T> = () => Promise<T>;
export declare type PromiseResult<T> = T extends () => Promise<infer U> ? U : never;
/**
 * Describes the custom recovery strategy function that can be passed to retry.
 */
export declare type RecoverStrategy<E = Error | string> = (error: E | TimeoutError | CancelledError, retryCount: number) => boolean | Promise<boolean>;
export declare class CancelledError extends Error {
    constructor(message: string);
}
export declare class TimeoutError extends CancelledError {
    constructor(message: string);
}
/**
 * The new and improved PromiseBuilder. Tighter, cleaner, sleeker, faster.
 * @param action Action<T> - Method that returns a promise which resolves to T.
 */
export declare class AsyncAction<TResult, TError = Error | string> {
    private action;
    private executingPromise;
    private rejectExecutingPromise;
    private retryLimit;
    private useExponentialBackoff;
    private timeout;
    private timeoutTimer;
    private cancelSubject;
    private _recoverCount;
    constructor(action: Action<TResult>);
    getExecutingPromise(): Promise<TResult> | null;
    retry(): Promise<TResult>;
    /**
     * Just a simple getter for the private retryCount value.
     */
    get retryCount(): number;
    /**
     * Execute the stored action and return the promise.
     */
    execute(): Promise<TResult>;
    /**
     * Starts a time if necessary.
     */
    private startTimer;
    /**
     * Stops timer if necessary.
     */
    private endTimer;
    /**
     * Resets the state of the action.
     */
    private reset;
    /**
     * Handles retry attempts. If it enounters a CancelledError or TimeoutError it will stop.
     * If it fails the shouldRecover check, it will stop.
     * @param error Error | CancelledError | TimeoutError
     */
    private retryWithRecovery;
    /**
     * The default recovery strategy.
     */
    private shouldRecover;
    /**
     * Handles exponential backoff if its set, otherwise resolves immediately (no delay);
     */
    private maybeDelay;
    /**
     * Cancel the current executing action if there is one.
     * This method is also used internally by timeout to cancel with a TimeoutError.
     */
    cancelExecution<E extends CancelledError>(reason?: string | E): void;
    /**
     * Subscribe to cancellation event and execute your own logic when cancellation happens.
     * @param callback onCancel handler. This method will be invoked when cancel is called.
     * @returns Subscription
     */
    onCancel(callback: OnCancelCallback): import("rxjs").Subscription;
    /**
     * Attach a timeout in milliseconds. This timeout is inclusive of retries. This means
     * that an action execution can timeout even though it may be in the middle of retrying.
     */
    timeoutIn(time: number): this;
    /**
     * Enable retries. Disabled by default. You can pass either a simple number to define number
     * of retry attempts, or you can use your own custom recovery strategy to fit any scenario.
     * Enable exponential backoff to gradually increase the time between retry attempts.
     */
    setRecoverStrategy(amountOrRecoveryStrategy: number | RecoverStrategy<TError>, useExponentialBackoff?: boolean): this;
    /**
     * Works almost just like `Promise.resolve()`.
     * AsyncAction.resolve(VALUE).execute()
     * @param value Resolved value
     */
    static resolve<T>(value: T): AsyncAction<T, string | Error>;
    /**
     * Works almost just like `Promise.reject()`
     * AsyncAction.reject(ERROR).execute()
     * @param error The rejection reason.
     */
    static reject<TResult, E>(error: E): AsyncAction<TResult, E>;
}
