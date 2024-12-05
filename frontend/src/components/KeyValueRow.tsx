import * as React from "react"

interface Props {
  label: string | React.ReactNode
  children: React.ReactNode
}

export const KeyValueRow: React.FC<Props> = ({ label, children }) => {
  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
      <dt className="text-sm leading-6 text-customBlack sm:col-span-1">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium leading-6 text-customBlack sm:col-span-3 sm:mt-0 sm:mr-8">
        {children}
      </dd>
    </div>
  )
}
