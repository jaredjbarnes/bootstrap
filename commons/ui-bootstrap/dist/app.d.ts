export interface App {
    name: string;
    scriptUrl: string;
    path: string;
    runInIsolation?: boolean;
}
export interface AppModule<TConfig> {
    onMount(element: HTMLElement, config: TConfig): Promise<void> | void;
    onUnmount(): Promise<void> | void;
}
