import { ProcessDataValueProps } from "./ProcessDataValueProps"

export interface Process {
    id: number
    task_id?: string
    task_title?: string
    last_milestone_bpmn_name?: string
    waiting_for?: string
    dataObject?: ProcessDataValueProps[]
}
