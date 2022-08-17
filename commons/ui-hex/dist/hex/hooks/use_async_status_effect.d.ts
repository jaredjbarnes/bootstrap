import { ReadonlyAsyncActionRunner } from '../async_action_runner';
import { StatusHelper } from './use_async_status';
export declare function useAsyncStatusEffect(callback: (value: StatusHelper) => void, runner: ReadonlyAsyncActionRunner<any>): void;
