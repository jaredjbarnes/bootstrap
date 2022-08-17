import { useLayoutEffect, useRef } from "react";
import { ReadonlyObservableValue } from "../observable_value";
import { useUpdate } from "./use_update";

export function useAsyncValue<TValue, TInitial = TValue>(
  observableValue: ReadonlyObservableValue<TValue, TInitial>
) {
  const update = useUpdate();
  const versionRef = useRef(observableValue.valueVersion);

  useLayoutEffect(() => {
    const unsubscribe = observableValue.onChange(update);
    if (versionRef.current !== observableValue.valueVersion) {
      update();
    }
    return () => unsubscribe();
  }, [observableValue, update]);

  return observableValue.getValue();
}
