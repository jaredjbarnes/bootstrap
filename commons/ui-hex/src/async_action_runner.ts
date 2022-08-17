import ObservableValue, { ReadonlyObservableValue } from "./observable_value";
import { WeakPromise } from "./weak_promise";

export enum Status {
  INITIAL = "initial",
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "success",
}

export type Action<T> = () => WeakPromise<T> | Promise<T>;

export interface ReadonlyAsyncActionRunner<T, TError = any>
  extends ReadonlyObservableValue<T, TError> {
  readonly status: ReadonlyObservableValue<Status>;
  execute(action: Action<T>): Promise<T>;
  retry(): Promise<T>;
  cancel(): void;
  reset(): void;
}

export class CancelledError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "CancelledError";
  }
}

interface Context<T> {
  action: Action<T>;
  activePromise: WeakPromise<T>;
  changeState(state: State<T>): void;
  setValue(value: T): void;
  setError(error: unknown): void;
}

export class AsyncActionRunner<T, TError = any>
  extends ObservableValue<T, TError>
  implements ReadonlyAsyncActionRunner<T, TError>
{
  private _internalState: State<T>;
  private _action!: () => WeakPromise<T>;
  private _activePromise!: WeakPromise<T>;
  private _initialValue: T;
  readonly status: ObservableValue<Status>;

  constructor(initialValue: T) {
    super(initialValue);

    this.setValue = this.setValue.bind(this);
    this.setError = this.setError.bind(this);

    this._internalState = new InitialState<T>({
      action: this._action,
      activePromise: this._activePromise,
      changeState: this.changeState,
      setValue: this.setValue,
      setError: this.setError,
    });

    this._initialValue = initialValue;
    this.status = new ObservableValue<Status>(Status.INITIAL);
  }

  private changeState = (state: State<T>) => {
    this._internalState = state;
    this.status.setValue(state.getName());
  };

  execute(action: Action<T>) {
    return this._internalState.execute(action);
  }

  cancel() {
    this.reset();
  }

  retry() {
    return this._internalState.retry();
  }

  reset() {
    this._internalState.cancel();
    this.setError(null);
    this.setValue(this._initialValue);
    this.changeState(
      new InitialState<T>({
        action: this._action,
        activePromise: this._activePromise,
        changeState: this.changeState,
        setValue: this.setValue,
        setError: this.setError,
      })
    );
  }

  dispose() {
    super.dispose();
    this.status.dispose();
  }
}

abstract class State<T> {
  protected context: Context<T>;
  protected key: string | undefined;

  constructor(context: Context<T>, key?: string) {
    this.key = key;
    this.context = context;
  }

  abstract getName(): Status;

  execute(_action: Action<T>): Promise<T> {
    return Promise.reject(new Error("Not Yet Implemented"));
  }

  retry(): Promise<T> {
    return Promise.reject(new Error("Not Yet Implemented"));
  }

  cancel() {}
}

export class InitialState<T> extends State<T> {
  getName() {
    return Status.INITIAL;
  }

  async execute(action: Action<T>) {
    this.context.action = action;

    try {
      this.context.activePromise = WeakPromise.from(action());
      const pendingState = new PendingState<T>(this.context);
      this.context.changeState(pendingState);
    } catch (error) {
      this.context.setError(error as any);
      this.context.changeState(new ErrorState<T>(this.context));
      throw error;
    }

    try {
      const value = await this.context.activePromise;
      this.context.setValue(value);
      this.context.changeState(new SuccessState<T>(this.context));
      return value;
    } catch (error) {
      this.context.setError(error as any);
      this.context.changeState(new ErrorState<T>(this.context));
      throw error;
    }
  }

  retry(): Promise<T> {
    return Promise.reject(
      new Error("Invalid Action: Cannot retry a runner that hasn't run.")
    );
  }
}

export class PendingState<T> extends State<T> {
  constructor(context: Context<T>) {
    super(context);
  }

  cancel() {
    if (this.context.activePromise instanceof WeakPromise) {
      this.context.activePromise.cancel(new CancelledError());
    }
  }

  async execute(_action: Action<T>): Promise<T> {
    throw new Error(
      "Invalid Action: Cannot execute on a pending async action."
    );
  }

  retry(): Promise<T> {
    return Promise.reject(
      new Error("Invalid Action: Cannot retry a runner that is pending.")
    );
  }

  getName() {
    return Status.PENDING;
  }
}

export class SuccessState<T> extends InitialState<T> {
  getName() {
    return Status.SUCCESS;
  }

  retry(): Promise<T> {
    return Promise.reject(
      new Error("Invalid Action: Cannot retry a runner that is successful.")
    );
  }
}

export class ErrorState<T> extends InitialState<T> {
  retry() {
    const initialState = new InitialState(this.context);
    this.context.changeState(initialState);
    return initialState.execute(this.context.action);
  }

  getName() {
    return Status.ERROR;
  }
}
