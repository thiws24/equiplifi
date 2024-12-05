import { ProcessInputProps } from "./ProcessInputProps"

export interface TaskProps {
  id: number
  process_instance_id: number
  task_id: number
  completed: boolean
  task_title: string
  task_guid: string
  process_instance_status: string
  assigned_user_group_identifier: string | null
  potential_owner_usernames: string | null
  dataObject?: ProcessInputProps
}
