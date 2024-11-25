import { ProcessInputProps } from "./ProcessInputProps";

export interface Process {
    id: number
    task_title?: string
    waiting_for?: string
    dataObject?: ProcessInputProps
}