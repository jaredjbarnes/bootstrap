import { useRef, useState } from 'react';
import {
  ReadonlyAsyncActionRunner,
  Status,
} from '../async_action_runner';
import { StatusHelper } from './use_async_status';
import { useAsyncValueEffect } from './use_async_value_effect';

export function useAsyncStatusEffect(
  callback: (value: StatusHelper) => void,
  runner: ReadonlyAsyncActionRunner<any>
) {
  const callbackRef = useRef(callback);

  // We use the same object to reduce memory churn.
  const [statusObject] = useState<StatusHelper>(() => {
    return {
      status: Status.INITIAL,
      isInitial: true,
      isPending: false,
      isSuccess: false,
      isError: false,
    };
  });

  return useAsyncValueEffect(status => {
    statusObject.status = status;
    statusObject.isInitial = status === Status.INITIAL;
    statusObject.isPending = status === Status.PENDING;
    statusObject.isSuccess = status === Status.SUCCESS;
    statusObject.isError = status === Status.ERROR;

    callbackRef.current(statusObject);
  }, runner.status);
}
