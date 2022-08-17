import { ReadonlyAsyncActionRunner } from 'ui-hex';
import { useAsyncValue } from "./use_async_value";
import { useAsyncError } from "./use_async_error";
import { useAsyncStatus } from "./use_async_status";

export function useAsyncState<TValue, TError>(
  asyncActionRunner: ReadonlyAsyncActionRunner<TValue, TError>
) {
  const value = useAsyncValue<TValue, TError>(asyncActionRunner);
  const error = useAsyncError<TError>(asyncActionRunner);
  const status = useAsyncStatus(asyncActionRunner);

  return {
    value,
    error,
    ...status,
  };
}
