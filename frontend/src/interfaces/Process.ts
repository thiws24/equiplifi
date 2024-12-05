import { ProcessInputProps } from "./ProcessInputProps"

export interface Process {
  id: number
  last_milestone_bpmn_name?: string
  waiting_for?: string
  dataObject?: ProcessInputProps
}
