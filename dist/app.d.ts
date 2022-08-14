import { ReadonlyAsyncActionRunner } from "./hex/async_action_runner";
export interface AppConfig {
    name: string;
    scriptUrl: string;
    path: string;
}
export interface AppModule<TConfig> {
    onMount(element: HTMLElement, config: TConfig): Promise<void> | void;
    onUnmount(): Promise<void> | void;
}
export declare class App {
    private config;
    private module;
    get moduleBroadcast(): ReadonlyAsyncActionRunner<AppModule<unknown> | null>;
    get name(): string;
    get path(): string;
    get scriptUrl(): string;
    constructor(config: AppConfig);
    load(): Promise<AppModule<unknown> | null>;
}
