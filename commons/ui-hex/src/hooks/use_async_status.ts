import { useState } from "react";
import { useAsyncValue } from "./use_async_value";
import { ReadonlyAsyncActionRunner, Status } from "../async_action_runner";
import { ReadonlyObservableValue } from "../observable_value";

export interface StatusHelper {
  status: Status;
  isInitial: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsyncStatus(
  runner:
    | ReadonlyAsyncActionRunner<any>
    | ReadonlyObservableValue<Status, any>
) {
  const status = useAsyncValue("status" in runner ? runner.status : runner);

  // We use the same object to reduce memory churn.
  const [statusObject] = useState<StatusHelper>(() => ({
    status: status,
    isInitial: status === Status.INITIAL,
    isPending: status === Status.PENDING,
    isSuccess: status === Status.SUCCESS,
    isError: status === Status.ERROR,
  }));

  statusObject.status = status;
  statusObject.isInitial = status === Status.INITIAL;
  statusObject.isPending = status === Status.PENDING;
  statusObject.isSuccess = status === Status.SUCCESS;
  statusObject.isError = status === Status.ERROR;

  return statusObject;
}
