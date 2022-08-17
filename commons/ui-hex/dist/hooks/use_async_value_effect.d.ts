import { ReadonlyObservableValue } from "../observable_value";
export declare function useAsyncValueEffect<T>(callback: (value: T) => void, observableValue: ReadonlyObservableValue<T>): void;
