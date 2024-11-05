import * as React from 'react';

interface Props {
    children: React.ReactNode
}

export const Layout: React.FC<Props> = ({children}) => {
    return (
        <div>
            <div className='bg-white p-2.5 flex items-center shadow-md'>
                <img src='/equipli-logo.svg' className='w-16 h-auto' alt={'equipli logo'}/>
                <header className='ml-2 text-lg font-semibold'>equipli</header>
            </div>
            {children}
        </div>
    );
};