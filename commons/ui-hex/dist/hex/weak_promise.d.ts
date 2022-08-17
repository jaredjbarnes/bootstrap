export declare class WeakPromise<T> extends Promise<T> {
    private _onCancel;
    private _reject;
    constructor(callback: (resolve: any, reject: any) => () => void);
    cancel(reason: any): void;
    static tryUntil(callback: (resolve: any, reject: any) => () => void, time: number): WeakPromise<unknown>;
    static resolve(): WeakPromise<void>;
    static resolve<T>(value: T | PromiseLike<T>): WeakPromise<T>;
    static reject<T = never>(reason?: any): WeakPromise<T>;
    static from<T>(promise: Promise<T>): WeakPromise<unknown>;
}
