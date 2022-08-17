import { ObservableValue } from "./observable_value";
export declare class DistinctValue<T, TError = unknown> extends ObservableValue<T, TError> {
    private compareFunction;
    constructor(initialValue: T, equalityOperator?: (oldValue: T, newValue: T) => boolean);
    setValue(value: T): boolean;
}
