import * as React from 'react';

interface Props {
    label: string
    value: any
}

export const KeyValueRow: React.FC<Props> = ({ label, value}) => {
    return (
        <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-customBlack">{label}</dt>
            <dd className="mt-1 text-sm leading-6 text-customBlack sm:col-span-2 sm:mt-0">{value}</dd>
        </div>
    );
};
