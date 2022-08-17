import { useEffect, useRef } from "react";
import { ReadonlyObservableValue } from "../observable_value";

export function useAsyncErrorEffect<TError>(
  callback: (error: TError | null) => void,
  observableValue: ReadonlyObservableValue<any, TError>
) {
  const callbackRef = useRef(callback);
  const versionRef = useRef(observableValue.errorVersion);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
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

  useEffect(() => {
    callbackRef.current(observableValue.getError());
  }, [observableValue]);
}
