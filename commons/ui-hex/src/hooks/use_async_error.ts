import { useLayoutEffect, useRef } from 'react';
import { ReadonlyObservableValue } from '../observable_value';
import { useUpdate } from './use_update';

export function useAsyncError<TError>(
  observableValue: ReadonlyObservableValue<any, TError>
) {
  const update = useUpdate();
  const versionRef = useRef(observableValue.errorVersion);

  useLayoutEffect(() => {
    const subscription = observableValue.onError(update);
    if (versionRef.current !== observableValue.valueVersion) {
      update();
    }
    return () => subscription();
  }, [observableValue, update]);

  return observableValue.getError();
}

export function useAsyncErrorMessage<TError extends { message?: string }>(
  observableValue: ReadonlyObservableValue<any, TError>
) {
  const error = useAsyncError(observableValue);
  return error?.message || '';
}
