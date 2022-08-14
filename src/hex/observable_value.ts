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
export class ObservableValue<T, TInitial = T, TError = any>
  implements ReadonlyObservableValue<T, TInitial, TError>
{
  protected key: string | undefined;

  readonly valueSubject = new Subject<T>();
  protected _value: T | TInitial;

  readonly errorSubject = new Subject<TError | null>();
  protected _error: TError | null = null;

  private readonly _observer = {
    next: (value: T) => this.setValue(value),
    error: (error: TError | null) => this.setError(error),
    complete: () => {},
  };

  constructor(initialState: T | TInitial) {
    this._value = initialState;
  }

  getValue() {
    return this._value;
  }

  setValue(value: T) {
    try {
      this._value = value;
      this.valueSubject.next(value);
    } catch (e: any) {
      this.setError(e);
    }
  }

  transformValue(cb: (val: T | TInitial) => T) {
    const value = cb(this._value);
    this.setValue(value);
  }

  setError(e: TError | null) {
    try {
      this._error = e;
      this.errorSubject.next(e);
    } catch (e) {
      // Do not fail
    }
  }

  getError() {
    return this._error;
  }

  onError(callback: (e: TError | null) => void) {
    return this.errorSubject.subscribe({ next: callback });
  }

  onChange(callback: (value: T) => void) {
    return this.valueSubject.subscribe({ next: callback });
  }

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

  getObserver(): Observer<T> {
    return this._observer;
  }

  // Create a new observable with the value subject as the source, this will conceal logic of the subject
  get observable() {
    return this.valueSubject.asObservable();
  }

  dispose() {
    this.valueSubject.complete();
    this.errorSubject.complete();
  }

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
  static from<T, TInitial>(
    observable: Observable<T | TInitial>,
    initialValue: T | TInitial
  ) {
    const observableValue = new ObservableValue(initialValue);
    observable.subscribe(observableValue.getObserver());
    return observableValue;
  }
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
