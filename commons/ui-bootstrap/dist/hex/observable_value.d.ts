import { Subject, Observer, Observable, Subscription } from "rxjs";
/**
 * ObservableValue class stores a value and notifies interested
 * parties when the value changes.
 *
 * This is often used as a property on a class that other classes
 * may be interested in.
 *
 * If you do not want the value to be changed outside your class make the observable value
 * private and use a getter on the class and cast the observable value as a
 * ReadonlyObservableValue this will not allow developers to change the value outside the
 * class.
 *
 * Here is an example of not allowing developers to change the value outside the class.
 * ```ts
 * class Person {
 *  private _firstName = new ObservableValue("John");
 *  get firstName(): ReadonlyObservableValue {
 *    return this._firstName;
 *  }
 * }
 * ```
 */
export declare class ObservableValue<T, TInitial = T, TError = any> implements ReadonlyObservableValue<T, TInitial, TError> {
    protected key: string | undefined;
    readonly valueSubject: Subject<T>;
    protected _value: T | TInitial;
    readonly errorSubject: Subject<TError | null>;
    protected _error: TError | null;
    private readonly _observer;
    constructor(initialState: T | TInitial);
    getValue(): T | TInitial;
    setValue(value: T): void;
    transformValue(cb: (val: T | TInitial) => T): void;
    setError(e: TError | null): void;
    getError(): TError | null;
    onError(callback: (e: TError | null) => void): Subscription;
    onChange(callback: (value: T) => void): Subscription;
    /**
     * ADVANCED FEATURE
     * Use this when piping values to another existing `ObservableValue` like:
     *
     * ```ts
     * getUserRunner = new AsyncActionRunner<User, null>(null);
     * userName = new ObservableValue<string, null>(null);
     *
     * constructor() {
     *    this.getUserRunner.valueSubject
     *      .pipe(map(user => user.name))
     *      .subscribe(this.userName.getObserver());  <----- You can pipe values to another ObservableValue.
     * }
     * ```
     */
    getObserver(): Observer<T>;
    get observable(): Observable<T>;
    dispose(): void;
    /**
     * Easier way to pipe from one ObservableValue to another through rxjs operators.
     *
     * Example (inside a mediator/class):
     * ```typescript
     *  readonly elapsedThrottledSeconds = ObservableValue.from(
     *    this.elapsedSeconds.valueSubject.pipe(throttleTime(200)),
     *    this.elapsedSeconds.getValue()
     *  );
     * ```
     * @param observable any Observable (generally from a rxjs pipe though)
     * @param initialValue
     */
    static from<T, TInitial>(observable: Observable<T | TInitial>, initialValue: T | TInitial): ObservableValue<T | TInitial, T | TInitial, any>;
}
export interface ReadonlyObservableValue<T, TInitial = T, TError = any> {
    getValue(): T | TInitial;
    getError(): TError | null;
    onError(callback: (e: TError | null) => void): Subscription;
    onChange(callback: (value: T) => void): Subscription;
    observable: Observable<T>;
    /**
     * ADVANCED FEATURE
     * Use this when piping values to another existing `ObservableValue` like:
     *
     * ```ts
     * getUserRunner = new AsyncActionRunner<User, null>(null);
     * userName = new ObservableValue<string, null>(null);
     *
     * constructor() {
     *    this.getUserRunner.valueSubject
     *      .pipe(map(user => user.name))
     *      .subscribe(this.userName.getObserver());  <----- You can pipe values to another ObservableValue.
     * }
     * ```
     */
    getObserver(): Observer<T>;
}
