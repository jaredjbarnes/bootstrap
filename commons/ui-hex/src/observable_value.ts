export type Subscription = () => void;

export class ObservableValue<T, TError = any>
  implements ReadonlyObservableValue<T, TError>
{
  protected key: string | undefined;
  protected _valueVersion = 0;
  protected _errorVersion = 0;
  protected _value: T;
  protected _error: TError | null = null;

  readonly valueCallbacks: ((value: T) => void)[] = [];
  readonly errorCallbacks: ((error: TError | null) => void)[] = [];

  get valueVersion() {
    return this._valueVersion;
  }

  get errorVersion() {
    return this._errorVersion;
  }

  constructor(initialState: T) {
    this._value = initialState;
  }

  getValue() {
    return this._value;
  }

  setValue(value: T) {
    try {
      this._value = value;
      this._valueVersion++;
      this.notify(value);
    } catch (e) {
      this.setError(e as any);
    }
  }

  transformValue(cb: (val: T) => T) {
    const value = cb(this._value);
    this.setValue(value);
  }

  onChange(callback: (value: T) => void) {
    const unsubscribe = () => {
      const index = this.valueCallbacks.indexOf(callback);
      if (index > -1) {
        this.valueCallbacks.splice(index, 1);
      }
    };

    this.valueCallbacks.push(callback);
    return unsubscribe;
  }

  setError(e: TError | null) {
    try {
      this._error = e;
      this._errorVersion++;
      this.notifyError(e);
    } catch (e) {}
  }

  getError() {
    return this._error;
  }

  onError(callback: (e: TError | null) => void) {
    const unsubscribe = () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };

    this.errorCallbacks.push(callback);
    return unsubscribe;
  }

  dispose() {
    this.disposeCallbacks();
  }

  private notify(value: T) {
    this.valueCallbacks.forEach((c) => c(value));
  }

  private notifyError(error: TError | null) {
    this.errorCallbacks.forEach((c) => c(error));
  }

  private disposeCallbacks() {
    this.valueCallbacks.length = 0;
    this.errorCallbacks.length = 0;
  }
}

export interface ReadonlyObservableValue<T, TError = any> {
  valueVersion: number;
  errorVersion: number;
  getValue(): T;
  getError(): TError | null;
  onError(callback: (e: TError | null) => void): Subscription;
  onChange(callback: (value: T) => void): Subscription;
}

export default ObservableValue;
