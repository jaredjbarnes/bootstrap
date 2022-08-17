export declare type Subscription = () => void;
export declare class ObservableValue<T, TError = any> implements ReadonlyObservableValue<T, TError> {
    protected key: string | undefined;
    protected _valueVersion: number;
    protected _errorVersion: number;
    readonly valueCallbacks: ((value: T) => void)[];
    protected _value: T;
    readonly errorCallbacks: ((error: TError | null) => void)[];
    protected _error: TError | null;
    get valueVersion(): number;
    get errorVersion(): number;
    constructor(initialState: T);
    getValue(): T;
    setValue(value: T): void;
    transformValue(cb: (val: T) => T): void;
    onChange(callback: (value: T) => void): () => void;
    setError(e: TError | null): void;
    getError(): TError | null;
    onError(callback: (e: TError | null) => void): () => void;
    dispose(): void;
    private notify;
    private notifyError;
    private disposeCallbacks;
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
