import { useLayoutEffect, useRef } from "react";
import { ReadonlyObservableValue } from "ui-hex";

export function useAsyncValueEffect<T>(
  callback: (value: T) => void,
  observableValue: ReadonlyObservableValue<T>
) {
  const callbackRef = useRef(callback);
  const version = useRef(observableValue.valueVersion);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    callbackRef.current(observableValue.getValue());
  }, [observableValue]);
}
