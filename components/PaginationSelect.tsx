// PaginationSelect.tsx
import { PaginationResponse } from '@/types';
import React from 'react';
import { FaArrowLeft, FaArrowRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

interface PaginationSelectProps {
    params: PaginationResponse;
    setParams: React.Dispatch<React.SetStateAction<PaginationResponse>>;
}

const PaginationSelect: React.FC<PaginationSelectProps> = ({ params, setParams }) => {
    const { page, pageSize, totalPages, totalItems = 0 } = params;

    const handleChange = (field: keyof typeof params, value: string | number) => {
        setParams(prev => ({
            ...prev,
            page: field === 'keyword' ? 1 : prev.page,
            [field]: value,
        }));
    };
    const startIndex = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
    const endIndex = totalItems > 0 ? Math.min(page * pageSize, totalItems) : 0;

    let paginationItems = [];
    let start = page - 2;
    let end = page + 2;

    if (start < 1) {
        end += (1 - start);
        start = 1;
    }
    if (end > totalPages) {
        start -= (end - totalPages);
        end = totalPages;
    }

    // Add skip backward button (...) if there's a gap
    // if (start > 1) {
    //     const skipBackPage = Math.max(1, start - 5);
    //     paginationItems.push(
    //         <li key="skip-back">
    //             <a href="#" onClick={() => handleChange('page', skipBackPage)}
    //                 className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
    //                 ...
    //             </a>
    //         </li>
    //     );
    // }

    for (let i = start; i <= end; i++) {
        if (i > 0) {
            paginationItems.push(
                <li key={'page-' + i} onClick={() => handleChange('page', i)}>
                    <a href="#"
                        className={`flex items-center justify-center px-3 h-8 leading-tight border ${page === i
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
                        {i}
                    </a>
                </li>
            );
        }
    }

    // Add skip forward button (...) if there's a gap
    // if (end < totalPages) {
    //     const skipForwardPage = Math.min(totalPages, end + 5);
    //     paginationItems.push(
    //         <li key="skip-forward">
    //             <a href="#" onClick={() => handleChange('page', skipForwardPage)}
    //                 className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
    //                 ...
    //             </a>
    //         </li>
    //     );
    // }

    return (
        <nav className="relative flex items-center flex-column flex-wrap md:flex-row justify-between" aria-label="Table navigation">
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                Showing
                <span className="font-semibold text-gray-900 mx-2">
                    {startIndex} - {endIndex}
                </span>
                of
                <select
                    value={pageSize}
                    onChange={e => {
                        handleChange('pageSize', Number(e.target.value));
                        handleChange('page', 1);
                    }}
                    className="mx-2 items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                    <option value={8}>8</option>
                    <option value={9}>9</option>
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                </select>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                <li>
                    <a href="#" onClick={() => page > 1 && handleChange('page', 1)} className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <FaAngleDoubleLeft />
                    </a>
                </li>
                <li>
                    <a href="#" onClick={() => page > 1 && handleChange('page', page - 1)} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <FaArrowLeft />
                    </a>
                </li>
                {paginationItems}
                <li>
                    <a href="#" onClick={() => page < totalPages && handleChange('page', page + 1)} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <FaArrowRight />
                    </a>
                </li>
                <li>
                    <a href="#" onClick={() => page < totalPages && handleChange('page', totalPages)} className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <FaAngleDoubleRight />
                    </a>
                </li>
            </ul>
        </nav>
    );
}

export default PaginationSelect;
