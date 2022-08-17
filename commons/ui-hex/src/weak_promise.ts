function noop() {}

export class WeakPromise<T> extends Promise<T> {
  private _onCancel: (reason: any) => void;
  private _reject: (reason: any) => void;

  constructor(callback: (resolve: any, reject: any) => () => void) {
    let onCancel = noop;
    let _reject = noop;
    let clean = noop;

    super((resolve, reject) => {
      _reject = reject;
      onCancel = callback((value: T) => {
        clean();
        resolve(value);
      }, reject);
    });

    clean = () => {
      this._onCancel = noop;
      this._reject = noop;
    };
    this._onCancel = onCancel;
    this._reject = _reject;
  }

  cancel(reason: any) {
    this._onCancel(reason);
    this._reject(reason);
  }

  static resolve(): WeakPromise<void>;
  static resolve<T>(value: T | PromiseLike<T>): WeakPromise<T>;
  static resolve<T>(value?: unknown): WeakPromise<void> | WeakPromise<T> {
    const isPromiseLike = value && typeof (value as any).then === "function";

    if (isPromiseLike) {
      return new WeakPromise<T>((resolve, reject) => {
        (value as any).then(resolve, reject);
        return () => {};
      });
    }

    return new WeakPromise<T>((resolve) => {
      resolve(value);
      return noop;
    });
  }

  static reject<T = never>(reason?: any): WeakPromise<T> {
    return new WeakPromise((_resolve, reject) => {
      reject(reason);
      return noop;
    });
  }

  static from<T>(promise: Promise<T>) {
    if (promise instanceof WeakPromise) {
      return promise;
    }
    return new WeakPromise((resolve, reject) => {
      promise.then(resolve).catch(reject);
      return noop;
    });
  }
}
