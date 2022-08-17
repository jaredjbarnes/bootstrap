'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function noop() { }
class WeakPromise extends Promise {
    constructor(callback) {
        let onCancel = noop;
        let _reject = noop;
        let clean = noop;
        super((resolve, reject) => {
            _reject = reject;
            onCancel = callback((value) => {
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
    cancel(reason) {
        this._onCancel(reason);
        this._reject(reason);
    }
    static resolve(value) {
        const isPromiseLike = value && typeof value.then === "function";
        if (isPromiseLike) {
            return new WeakPromise((resolve, reject) => {
                value.then(resolve, reject);
                return () => { };
            });
        }
        return new WeakPromise((resolve) => {
            resolve(value);
            return noop;
        });
    }
    static reject(reason) {
        return new WeakPromise((_resolve, reject) => {
            reject(reason);
            return noop;
        });
    }
    static from(promise) {
        if (promise instanceof WeakPromise) {
            return promise;
        }
        return new WeakPromise((resolve, reject) => {
            promise.then(resolve).catch(reject);
            return noop;
        });
    }
}

class ObservableValue {
    constructor(initialState) {
        this._valueVersion = 0;
        this._errorVersion = 0;
        this._error = null;
        this.valueCallbacks = [];
        this.errorCallbacks = [];
        this._value = initialState;
    }
    get valueVersion() {
        return this._valueVersion;
    }
    get errorVersion() {
        return this._errorVersion;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        try {
            this._value = value;
            this._valueVersion++;
            this.notify(value);
        }
        catch (e) {
            this.setError(e);
        }
    }
    transformValue(cb) {
        const value = cb(this._value);
        this.setValue(value);
    }
    onChange(callback) {
        const unsubscribe = () => {
            const index = this.valueCallbacks.indexOf(callback);
            if (index > -1) {
                this.valueCallbacks.splice(index, 1);
            }
        };
        this.valueCallbacks.push(callback);
        return unsubscribe;
    }
    setError(e) {
        try {
            this._error = e;
            this._errorVersion++;
            this.notifyError(e);
        }
        catch (e) { }
    }
    getError() {
        return this._error;
    }
    onError(callback) {
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
    notify(value) {
        this.valueCallbacks.forEach((c) => c(value));
    }
    notifyError(error) {
        this.errorCallbacks.forEach((c) => c(error));
    }
    disposeCallbacks() {
        this.valueCallbacks.length = 0;
        this.errorCallbacks.length = 0;
    }
}

const defaultCompareFunction = (o, n) => o === n;
class DistinctValue extends ObservableValue {
    constructor(initialValue, equalityOperator = defaultCompareFunction) {
        super(initialValue);
        this.compareFunction = equalityOperator;
    }
    setValue(value) {
        if (!this.compareFunction(this._value, value)) {
            super.setValue(value);
            return true;
        }
        return false;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var Status;
(function (Status) {
    Status["INITIAL"] = "initial";
    Status["PENDING"] = "pending";
    Status["ERROR"] = "error";
    Status["SUCCESS"] = "success";
})(Status || (Status = {}));
class CancelledError extends Error {
    constructor(message) {
        super(message);
        this.name = "CancelledError";
    }
}
class AsyncActionRunner extends ObservableValue {
    constructor(initialValue) {
        super(initialValue);
        this.changeState = (state) => {
            this._internalState = state;
            this.status.setValue(state.getName());
        };
        this.setValue = this.setValue.bind(this);
        this.setError = this.setError.bind(this);
        this._internalState = new InitialState({
            action: this._action,
            activePromise: this._activePromise,
            changeState: this.changeState,
            setValue: this.setValue,
            setError: this.setError,
        });
        this._initialValue = initialValue;
        this.status = new ObservableValue(Status.INITIAL);
    }
    execute(action) {
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
        this.changeState(new InitialState({
            action: this._action,
            activePromise: this._activePromise,
            changeState: this.changeState,
            setValue: this.setValue,
            setError: this.setError,
        }));
    }
    dispose() {
        super.dispose();
        this.status.dispose();
    }
}
class State {
    constructor(context, key) {
        this.key = key;
        this.context = context;
    }
    execute(_action) {
        return Promise.reject(new Error("Not Yet Implemented"));
    }
    retry() {
        return Promise.reject(new Error("Not Yet Implemented"));
    }
    cancel() { }
}
class InitialState extends State {
    getName() {
        return Status.INITIAL;
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.action = action;
            try {
                this.context.activePromise = WeakPromise.from(action());
                const pendingState = new PendingState(this.context);
                this.context.changeState(pendingState);
            }
            catch (error) {
                this.context.setError(error);
                this.context.changeState(new ErrorState(this.context));
                throw error;
            }
            try {
                const value = yield this.context.activePromise;
                this.context.setValue(value);
                this.context.changeState(new SuccessState(this.context));
                return value;
            }
            catch (error) {
                this.context.setError(error);
                this.context.changeState(new ErrorState(this.context));
                throw error;
            }
        });
    }
    retry() {
        return Promise.reject(new Error("Invalid Action: Cannot retry a runner that hasn't run."));
    }
}
class PendingState extends State {
    constructor(context) {
        super(context);
    }
    cancel() {
        if (this.context.activePromise instanceof WeakPromise) {
            this.context.activePromise.cancel(new CancelledError());
        }
    }
    execute(_action) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Invalid Action: Cannot execute on a pending async action.");
        });
    }
    retry() {
        return Promise.reject(new Error("Invalid Action: Cannot retry a runner that is pending."));
    }
    getName() {
        return Status.PENDING;
    }
}
class SuccessState extends InitialState {
    getName() {
        return Status.SUCCESS;
    }
    retry() {
        return Promise.reject(new Error("Invalid Action: Cannot retry a runner that is successful."));
    }
}
class ErrorState extends InitialState {
    retry() {
        const initialState = new InitialState(this.context);
        this.context.changeState(initialState);
        return initialState.execute(this.context.action);
    }
    getName() {
        return Status.ERROR;
    }
}

function useAsyncErrorEffect(callback, observableValue) {
    const callbackRef = react.useRef(callback);
    const versionRef = react.useRef(observableValue.errorVersion);
    react.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    react.useEffect(() => {
        const unsubscribe = observableValue.onError((error) => {
            callbackRef.current(error);
        });
        if (versionRef.current !== observableValue.errorVersion) {
            callbackRef.current(observableValue.getError());
        }
        return () => {
            unsubscribe();
        };
    }, [observableValue]);
    react.useEffect(() => {
        callbackRef.current(observableValue.getError());
    }, [observableValue]);
}

const updateReducer = (num) => (num + 1) % 1000000;
const useUpdate = () => {
    const [, update] = react.useReducer(updateReducer, 0);
    return update;
};

function useAsyncError(observableValue) {
    const update = useUpdate();
    const versionRef = react.useRef(observableValue.errorVersion);
    react.useLayoutEffect(() => {
        const subscription = observableValue.onError(update);
        if (versionRef.current !== observableValue.valueVersion) {
            update();
        }
        return () => subscription();
    }, [observableValue, update]);
    return observableValue.getError();
}

function useAsyncValue(observableValue) {
    const update = useUpdate();
    const versionRef = react.useRef(observableValue.valueVersion);
    react.useLayoutEffect(() => {
        const unsubscribe = observableValue.onChange(update);
        if (versionRef.current !== observableValue.valueVersion) {
            update();
        }
        return () => unsubscribe();
    }, [observableValue, update]);
    return observableValue.getValue();
}

function useAsyncStatus(runner) {
    const status = useAsyncValue("status" in runner ? runner.status : runner);
    // We use the same object to reduce memory churn.
    const [statusObject] = react.useState(() => ({
        status: status,
        isInitial: status === Status.INITIAL,
        isPending: status === Status.PENDING,
        isSuccess: status === Status.SUCCESS,
        isError: status === Status.ERROR,
    }));
    statusObject.status = status;
    statusObject.isInitial = status === Status.INITIAL;
    statusObject.isPending = status === Status.PENDING;
    statusObject.isSuccess = status === Status.SUCCESS;
    statusObject.isError = status === Status.ERROR;
    return statusObject;
}

function useAsyncState(asyncActionRunner) {
    const value = useAsyncValue(asyncActionRunner);
    const error = useAsyncError(asyncActionRunner);
    const status = useAsyncStatus(asyncActionRunner);
    return Object.assign({ value,
        error }, status);
}

function useAsyncValueEffect(callback, observableValue) {
    const callbackRef = react.useRef(callback);
    const version = react.useRef(observableValue.valueVersion);
    react.useLayoutEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    react.useLayoutEffect(() => {
        const unsubscribe = observableValue.onChange((value) => {
            callbackRef.current(value);
        });
        if (version.current !== observableValue.valueVersion) {
            callbackRef.current(observableValue.getValue());
        }
        return () => {
            unsubscribe();
        };
    }, [observableValue]);
    react.useLayoutEffect(() => {
        callbackRef.current(observableValue.getValue());
    }, [observableValue]);
}

function useAsyncStatusEffect(callback, runner) {
    const callbackRef = react.useRef(callback);
    // We use the same object to reduce memory churn.
    const [statusObject] = react.useState(() => {
        return {
            status: Status.INITIAL,
            isInitial: true,
            isPending: false,
            isSuccess: false,
            isError: false,
        };
    });
    return useAsyncValueEffect(status => {
        statusObject.status = status;
        statusObject.isInitial = status === Status.INITIAL;
        statusObject.isPending = status === Status.PENDING;
        statusObject.isSuccess = status === Status.SUCCESS;
        statusObject.isError = status === Status.ERROR;
        callbackRef.current(statusObject);
    }, runner.status);
}

exports.AsyncActionRunner = AsyncActionRunner;
exports.DistinctValue = DistinctValue;
exports.ObservableValue = ObservableValue;
exports.WeakPromise = WeakPromise;
exports.useAsyncError = useAsyncError;
exports.useAsyncErrorEffect = useAsyncErrorEffect;
exports.useAsyncState = useAsyncState;
exports.useAsyncStatus = useAsyncStatus;
exports.useAsyncStatusEffect = useAsyncStatusEffect;
exports.useAsyncValue = useAsyncValue;
exports.useAsyncValueEffect = useAsyncValueEffect;
exports.useUpdate = useUpdate;
//# sourceMappingURL=index.js.map
