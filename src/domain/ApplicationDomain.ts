export interface ApplicationConfig {
    readonly id: string;
    readonly name: string;
    readonly active: boolean;
}

export interface ApplicationState {
    readonly id: string;
    readonly status: 'idle' | 'running' | 'completed' | 'failed';
}
