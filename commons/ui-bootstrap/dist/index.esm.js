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
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function isFunction(value) {
    return typeof value === 'function';
}

function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}

var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError) {
                                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
}
function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

var timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = timeoutProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
            return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};

function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function () {
        {
            throw err;
        }
    });
}

function noop$1() { }

var context = null;
function errorContext(cb) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}

var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) ;
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) ;
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
function handleUnhandledError(error) {
    {
        reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
var EMPTY_OBSERVER = {
    closed: true,
    next: noop$1,
    error: defaultErrorHandler,
    complete: noop$1,
};

var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

function identity(x) {
    return x;
}

function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
        errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}

var ObjectUnsubscribedError = createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription(function () {
            _this.currentObservers = null;
            arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));

class CancelledError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CancelledError';
    }
}
class TimeoutError extends CancelledError {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}
/**
 * For narrowing type in the retry method.
 * @param it number | RecoverStrategy
 */
function isNumber(it) {
    return typeof it === 'number';
}
/**
 * A function that does absolutely nothing. :)
 */
function noop() { }
/**
 * The new and improved PromiseBuilder. Tighter, cleaner, sleeker, faster.
 * @param action Action<T> - Method that returns a promise which resolves to T.
 */
class AsyncAction {
    constructor(action) {
        this.executingPromise = null;
        this.rejectExecutingPromise = noop;
        this.retryLimit = 0;
        this.useExponentialBackoff = true;
        this.timeout = null;
        this.timeoutTimer = null;
        this.cancelSubject = new Subject();
        this._recoverCount = 0;
        this.action = action;
    }
    getExecutingPromise() {
        return this.executingPromise;
    }
    retry() {
        if (this.executingPromise == null) {
            this.cancelSubject = new Subject();
            this._recoverCount = 0;
        }
        return this.execute();
    }
    /**
     * Just a simple getter for the private retryCount value.
     */
    get retryCount() {
        return this._recoverCount;
    }
    /**
     * Execute the stored action and return the promise.
     */
    execute() {
        if (this.executingPromise == null) {
            // Setup the wrapper promise. This is mainly so we can facilitate retries.
            // We dont resolve this until the action is resolved or retry limit is reached.
            this.executingPromise = new Promise((resolve, reject) => {
                // Start the timer if needed.
                this.startTimer();
                // We need to store this on the class so we can cancel the promise.
                this.rejectExecutingPromise = reject;
                this.action()
                    .catch((error) => {
                    // Will attempt to recover if it should. If it exhausts recover attempts it will
                    // reject the executingAction. if it succeeds then it will resolve the executingAction
                    return this.retryWithRecovery(error);
                })
                    .then(value => {
                    this.reset();
                    resolve(value);
                })
                    .catch(error => {
                    // This catch block will be reached if all recovery attempts failed.
                    // So reset the action and throw.
                    this.reset();
                    this.rejectExecutingPromise(error);
                });
            });
        }
        return this.executingPromise;
    }
    /**
     * Starts a time if necessary.
     */
    startTimer() {
        if (this.timeout != null) {
            const time = this.timeout;
            this.timeoutTimer = window.setTimeout(() => {
                this.cancelExecution(new TimeoutError(`Promise timed out after ${time}`));
            }, time);
        }
    }
    /**
     * Stops timer if necessary.
     */
    endTimer() {
        if (this.timeoutTimer != null) {
            window.clearTimeout(Number(this.timeoutTimer));
            this.timeoutTimer = null;
        }
    }
    /**
     * Resets the state of the action.
     */
    reset() {
        this.executingPromise = null;
        this.endTimer();
    }
    /**
     * Handles retry attempts. If it enounters a CancelledError or TimeoutError it will stop.
     * If it fails the shouldRecover check, it will stop.
     * @param error Error | CancelledError | TimeoutError
     */
    retryWithRecovery(error) {
        return __awaiter(this, void 0, void 0, function* () {
            let shouldRecover = 
            // Only if AsyncAction hasn't been cancelled.
            // `value` is a private variable... which is stupid, and I do what I want.
            this.cancelSubject.thrownError === null &&
                // User definable recovery strategy
                (yield this.shouldRecover(error, this._recoverCount, this.retryLimit));
            if (!shouldRecover)
                throw error;
            // It is now officially retrying.
            this._recoverCount++;
            yield this.maybeDelay();
            try {
                return yield this.action();
            }
            catch (err) {
                return this.retryWithRecovery(err);
            }
        });
    }
    /**
     * The default recovery strategy.
     */
    shouldRecover(_error, retryCount, retryLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            return retryLimit != null ? retryCount < retryLimit : false;
        });
    }
    /**
     * Handles exponential backoff if its set, otherwise resolves immediately (no delay);
     */
    maybeDelay() {
        if (this.useExponentialBackoff) {
            return new Promise(resolve => {
                const time = ((Math.pow(2, this._recoverCount) - 1) / 2) * 100;
                window.setTimeout(resolve, time);
            });
        }
        return Promise.resolve();
    }
    /**
     * Cancel the current executing action if there is one.
     * This method is also used internally by timeout to cancel with a TimeoutError.
     */
    cancelExecution(reason = 'Cancelled') {
        if (this.executingPromise == null)
            return;
        const error = typeof reason === 'string' ? new CancelledError(reason) : reason;
        this.rejectExecutingPromise(error);
        this.cancelSubject.error(error);
    }
    /**
     * Subscribe to cancellation event and execute your own logic when cancellation happens.
     * @param callback onCancel handler. This method will be invoked when cancel is called.
     * @returns Subscription
     */
    onCancel(callback) {
        return this.cancelSubject.subscribe({ error: callback });
    }
    /**
     * Attach a timeout in milliseconds. This timeout is inclusive of retries. This means
     * that an action execution can timeout even though it may be in the middle of retrying.
     */
    timeoutIn(time) {
        this.timeout = time;
        return this;
    }
    /**
     * Enable retries. Disabled by default. You can pass either a simple number to define number
     * of retry attempts, or you can use your own custom recovery strategy to fit any scenario.
     * Enable exponential backoff to gradually increase the time between retry attempts.
     */
    setRecoverStrategy(amountOrRecoveryStrategy, useExponentialBackoff = true) {
        this.useExponentialBackoff = useExponentialBackoff;
        if (isNumber(amountOrRecoveryStrategy)) {
            this.retryLimit = amountOrRecoveryStrategy;
        }
        else {
            this.shouldRecover = (...args) => __awaiter(this, void 0, void 0, function* () { return yield amountOrRecoveryStrategy(...args); });
        }
        return this;
    }
    /**
     * Works almost just like `Promise.resolve()`.
     * AsyncAction.resolve(VALUE).execute()
     * @param value Resolved value
     */
    static resolve(value) {
        return new AsyncAction(() => {
            return Promise.resolve(value);
        });
    }
    /**
     * Works almost just like `Promise.reject()`
     * AsyncAction.reject(ERROR).execute()
     * @param error The rejection reason.
     */
    static reject(error) {
        return new AsyncAction(() => {
            return Promise.reject(error);
        });
    }
}

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
class ObservableValue {
    constructor(initialState) {
        this.valueSubject = new Subject();
        this.errorSubject = new Subject();
        this._error = null;
        this._observer = {
            next: (value) => this.setValue(value),
            error: (error) => this.setError(error),
            complete: () => { },
        };
        this._value = initialState;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        try {
            this._value = value;
            this.valueSubject.next(value);
        }
        catch (e) {
            this.setError(e);
        }
    }
    transformValue(cb) {
        const value = cb(this._value);
        this.setValue(value);
    }
    setError(e) {
        try {
            this._error = e;
            this.errorSubject.next(e);
        }
        catch (e) {
            // Do not fail
        }
    }
    getError() {
        return this._error;
    }
    onError(callback) {
        return this.errorSubject.subscribe({ next: callback });
    }
    onChange(callback) {
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
    getObserver() {
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
    static from(observable, initialValue) {
        const observableValue = new ObservableValue(initialValue);
        observable.subscribe(observableValue.getObserver());
        return observableValue;
    }
}

var Status;
(function (Status) {
    Status["INITIAL"] = "initial";
    Status["PENDING"] = "pending";
    Status["ERROR"] = "error";
    Status["SUCCESS"] = "success";
    Status["DISABLED"] = "disabled";
})(Status || (Status = {}));
class AsyncActionRunner extends ObservableValue {
    constructor(initialState) {
        super(initialState);
        this.action = null;
        this._internalState = new InitialState(this);
        this._initialState = initialState;
        this.status = new ObservableValue(Status.INITIAL);
    }
    changeState(state) {
        this._internalState = state;
        this.status.setValue(state.getName());
    }
    disable() {
        return this._internalState.disable();
    }
    enable() {
        return this._internalState.enable();
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
        this.setValue(this._initialState);
        this.changeState(new InitialState(this));
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
    enable() {
        // Do Nothing.
    }
    disable() {
        // Do Nothing.
    }
    execute(_action) {
        // disabled linter per defining an interface that needs to be followed on other states
        // Throw because this should never be hit.
        return Promise.reject(new Error("Not Yet Implemented"));
    }
    retry() {
        return Promise.reject(new Error("Not Yet Implemented"));
    }
    cancel() {
        // Do nothing.
    }
}
class ReadyState extends State {
    getName() {
        throw new Error("Not Yet Implemented");
    }
    disable() {
        this.context.changeState(new DisabledState(this.context));
    }
    execute(action) {
        this.context.action = action;
        const pendingState = new PendingState(this.context, this.key);
        this.context.changeState(pendingState);
        return pendingState.executingPromise;
    }
}
class InitialState extends ReadyState {
    getName() {
        return Status.INITIAL;
    }
}
class PendingState extends State {
    constructor(context, key) {
        super(context, key);
        this.isEnabled = true;
        const action = this.context.action;
        if (action == null) {
            throw new Error("Cannot switch to pending state without an action set to the context.");
        }
        this.executingPromise = action
            .execute()
            .then((nextValue) => {
            this.context.setValue(nextValue);
            this.context.changeState(new SuccessState(this.context));
            return nextValue;
        })
            .catch((error) => {
            if (!(error instanceof CancelledError)) {
                this.context.setError(error);
                this.context.changeState(new ErrorState(this.context));
            }
            throw error;
        })
            .finally(() => {
            if (!this.isEnabled) {
                this.context.changeState(new DisabledState(this.context));
            }
        });
    }
    cancel() {
        var _a;
        (_a = this.context.action) === null || _a === void 0 ? void 0 : _a.cancelExecution();
    }
    disable() {
        this.isEnabled = false;
    }
    enable() {
        this.isEnabled = true;
    }
    execute() {
        return this.executingPromise;
    }
    getName() {
        return Status.PENDING;
    }
}
class SuccessState extends ReadyState {
    getName() {
        return Status.SUCCESS;
    }
}
class ErrorState extends ReadyState {
    retry() {
        const pendingState = new PendingState(this.context, this.key);
        this.context.changeState(pendingState);
        return pendingState.executingPromise;
    }
    getName() {
        return Status.ERROR;
    }
}
class DisabledState extends State {
    execute() {
        return Promise.reject(new Error("Cannot execute while runner is disabled."));
    }
    getName() {
        return Status.DISABLED;
    }
    enable() {
        this.context.changeState(new InitialState(this.context));
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
        const action = new AsyncAction(() => {
            return new Promise((resolve, reject) => {
                this._iframe = this.createIframe();
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
        });
        return this._mountingBroadcastRunner.execute(action);
    }
    unmount() {
        return __awaiter(this, void 0, void 0, function* () {
            const appModule = this._appModule;
            this._iframe = null;
            if (appModule != null) {
                this._appModule = null;
                yield appModule.onUnmount();
            }
        });
    }
    createIframe() {
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
        return __awaiter(this, void 0, void 0, function* () {
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
        const action = new AsyncAction(() => this._currentEnvironment.mount(app, window));
        return this._moduleBroadcast.execute(action);
    }
    unmount() {
        return __awaiter(this, void 0, void 0, function* () {
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
        return __awaiter(this, void 0, void 0, function* () {
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
