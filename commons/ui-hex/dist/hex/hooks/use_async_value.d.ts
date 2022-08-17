import { ReadonlyObservableValue } from "../observable_value";
export declare function useAsyncValue<TValue, TInitial = TValue>(observableValue: ReadonlyObservableValue<TValue, TInitial>): TValue;
