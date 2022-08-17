/******************************************************************************
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

function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

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

/******************************************************************************
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

const html = `<!DOCTYPE html>
<html>
    <head></head>
    <body></body>
</html>
`;
class IsolatedEnvironment {
    constructor(slot, config) {
        this._mountingBroadcastRunner = new AsyncActionRunner(undefined);
        this._iframe = null;
        this._appModule = null;
        this._slot = slot;
        this.config = config;
    }
    get mountingBroadcast() {
        return this._mountingBroadcastRunner;
    }
    mount(app, window) {
        const action = () => {
            return new Promise((resolve, reject) => {
                this._iframe = this.createIframe(window);
                this._iframe.onload = () => {
                    var _a;
                    const contentWindow = (_a = this._iframe) === null || _a === void 0 ? void 0 : _a.contentWindow;
                    if (contentWindow != null) {
                        const body = contentWindow.document.body;
                        const html = contentWindow.document.querySelector("html");
                        if (body != null && html != null) {
                            this.prepareElementToBeAContainer(html);
                            this.prepareElementToBeAContainer(body);
                        }
                        const importScript = new contentWindow.Function("url", "return import(url);");
                        importScript(app.scriptUrl)
                            .then((appModule) => {
                            this._appModule = appModule;
                            return appModule.onMount(body, this.config);
                        })
                            .then(resolve)
                            .catch(reject);
                    }
                    else {
                        reject(new Error("Couldn't find the body element."));
                    }
                };
                this._slot.appendChild(this._iframe);
                this._iframe.srcdoc = html;
            });
        };
        return this._mountingBroadcastRunner.execute(action);
    }
    unmount() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const appModule = this._appModule;
            this._iframe = null;
            if (appModule != null) {
                this._appModule = null;
                yield appModule.onUnmount();
            }
        });
    }
    createIframe(window) {
        const iframe = window.document.createElement("iframe");
        iframe.style.padding = "0";
        iframe.style.margin = "0";
        iframe.style.border = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        return iframe;
    }
    prepareElementToBeAContainer(element) {
        element.style.padding = "0";
        element.style.margin = "0";
        element.style.width = "100%";
        element.style.height = "100%";
    }
}

class DefaultEnvironment {
    constructor(slot, config) {
        this._appModule = null;
        this._slot = slot;
        this.config = config;
    }
    mount(app) {
        return import(app.scriptUrl).then((appModule) => {
            this._appModule = appModule;
            appModule.onMount(this._slot, this.config);
        });
    }
    unmount() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const appModule = this._appModule;
            if (appModule != null) {
                this._appModule = null;
                yield appModule.onUnmount();
            }
        });
    }
}

class Environment {
    constructor(slot, config) {
        this._moduleBroadcast = new AsyncActionRunner(undefined);
        this.app = null;
        this._slot = slot;
        this._defaultEnvironment = new DefaultEnvironment(slot, config);
        this._isolatedEnvironment = new IsolatedEnvironment(slot, config);
        this._currentEnvironment = this._defaultEnvironment;
    }
    get moduleBroadcast() {
        return this._moduleBroadcast;
    }
    mount(app, window) {
        this.app = app;
        if (app.runInIsolation) {
            this._currentEnvironment = this._isolatedEnvironment;
        }
        else {
            this._currentEnvironment = this._defaultEnvironment;
        }
        return this._moduleBroadcast.execute(() => this._currentEnvironment.mount(app, window));
    }
    unmount() {
        return __awaiter$1(this, void 0, void 0, function* () {
            try {
                yield this._currentEnvironment.unmount();
            }
            catch (e) { }
            while (this._slot.firstChild) {
                this._slot.removeChild(this._slot.firstChild);
            }
            this.app = null;
        });
    }
    cancel() {
        return this._moduleBroadcast.cancel();
    }
}

class Bootstrap {
    constructor(config, hashSlot, window) {
        this.slots = new WeakMap();
        this._appsByPath = new Map();
        this._appsByName = new Map();
        this._defaultPath = "";
        this.loadHash = () => {
            const { path, parameters } = this.parseRootHash(this._window.location.hash);
            const slot = this.getSlot(parameters.get("slot"));
            this.loadByPath(path, slot);
        };
        this._config = config;
        this._hashSlot = hashSlot;
        this._window = window;
        this._window.addEventListener("hashchange", this.loadHash);
    }
    registerApp(app) {
        if (!this._appsByPath.has(app.path)) {
            this._appsByPath.set(app.path, app);
            this._appsByName.set(app.name, app);
        }
    }
    unregisterApp(appConfig) {
        if (this._appsByPath.has(appConfig.path)) {
            this._appsByPath.delete(appConfig.path);
        }
    }
    initialize(defaultPath) {
        this._defaultPath = defaultPath;
        const { path, parameters } = this.parseRootHash(this._window.location.hash);
        const slot = this.getSlot(parameters.get("slot"));
        if (path == null) {
            this.loadByPath(defaultPath, slot);
        }
        else {
            this.loadByPath(path, slot);
        }
    }
    loadByPath(path, slot) {
        const { path: rootPath } = this.parseRootPath(path);
        const app = this._appsByPath.get(rootPath);
        if (app != null) {
            this.syncPath(app.path);
            this.load(app.name, slot, this._window);
        }
    }
    load(name, slotElement, window) {
        return __awaiter$1(this, void 0, void 0, function* () {
            const app = this._appsByName.get(name);
            let environment = this.slots.get(slotElement);
            if (app == null) {
                throw new Error(`Unregistered app with name: ${name}.`);
            }
            if (environment == null) {
                environment = new Environment(slotElement, this._config);
                this.slots.set(slotElement, environment);
            }
            if (environment.app === app) {
                return;
            }
            try {
                environment.cancel();
                yield environment.unmount();
                yield environment.mount(app, window);
            }
            catch (e) { }
        });
    }
    getEnvironment(slot) {
        return this.slots.get(slot);
    }
    getSlot(selector) {
        if (selector == null) {
            return this._hashSlot;
        }
        else {
            return (this._window.document.querySelector(selector) ||
                this._hashSlot);
        }
    }
    parseRootHash(hash) {
        return this.parseRootPath(hash.slice(1));
    }
    parseRootPath(path) {
        const parts = path.split("?");
        const rootPath = parts[0].split("/")[1];
        const search = parts[1];
        const searchParams = new URLSearchParams(search);
        return {
            fullPath: path,
            path: rootPath == null ? this._defaultPath : `/${rootPath}`,
            parameters: searchParams,
        };
    }
    syncPath(path) {
        const hash = this._window.location.hash;
        const { path: currentRootPath } = this.parseRootHash(hash);
        const { path: newPath } = this.parseRootPath(path);
        if (newPath !== currentRootPath || hash.length === 0) {
            this._window.location = `#${path}`;
        }
    }
    dispose() {
        this._window.removeEventListener("hashchange", this.loadHash);
    }
}

export { Bootstrap };
//# sourceMappingURL=index.esm.js.map
