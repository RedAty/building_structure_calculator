import React, {useRef, useState} from 'react';
import {BsPlusCircleFill} from "react-icons/bs";
import {DEFAULTS, INPUT_SIDES, INPUT_TYPES} from "@/lib/constants";


export function ItemInput({ onAddItem }) {
    const [name, setName] = useState(new Date().getTime().toString().substring(6));
    const [type, setType] = useState(INPUT_TYPES[0]);
    const [side, setSide] = useState(INPUT_SIDES[1]);
    const [minLength, setMinLength] = useState(DEFAULTS.min);
    const [maxLength, setMaxLength] = useState(DEFAULTS.max);
    const [column, setColumn] = useState(DEFAULTS.column);
    const [row, setRow] = useState(DEFAULTS.row);
    const inputRef = useRef(null);

    const handleNumeric2Change = (value) => {
        setMaxLength(value);
        if (type === INPUT_TYPES[1]) {
            setMinLength(value);
        }
    };

    const handleAdd = () => {
        if (name) {
            const newItem = {
                id: new Date().getTime(),
                name,
                type,
                side,
                minLength,
                maxLength,
                column,
                row
            };

            onAddItem(newItem);
            setName(new Date().getTime().toString().substring(6));
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } else {
            alert('You need to add a name');
        }
    };

    return (
        <div className="flex flex-row ml-6 bg-gray-100 object-fill	px-2 pb-2 pl-1 rounded-b-lg max-w-[820px]">
            <div className="flex flex-col ml-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white" >Name</label>
                <input
                    id={'name'}
                    type="text"
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    ref={inputRef}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                    focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600
                    dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                    dark:shadow-sm-light"
                />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="types" className="block text-sm font-medium text-gray-900 dark:text-white">Type</label>

                <select id={'types'} defaultValue={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-blue-500 focus:border-blue-500 block w-[90px] dark:bg-gray-700 dark:border-gray-600
                        dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" >
                    {INPUT_TYPES.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            <div className="flex flex-col ml-2">
                <label htmlFor="sides" className="block text-sm font-medium text-gray-900 dark:text-white">Type</label>

                <select id="sides" defaultValue={side}
                        onChange={(e) => setSide(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                        focus:ring-blue-500 focus:border-blue-500 block w-[60px] dark:bg-gray-700 dark:border-gray-600
                        dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" >
                    {INPUT_SIDES.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            {type !== INPUT_TYPES[1] && (
                <div className="flex flex-col ml-2">

                    <label htmlFor="min" className="block text-sm font-medium text-gray-900 dark:text-white">Min</label>

                    <input id="min" type="number" defaultValue={minLength}
                           onChange={(e) => setMinLength(Number(e.target.value))}
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                           focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600
                           dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                           max-w-[100px]" />
                </div>
            )}

            <div className="flex flex-col ml-2">
                <label htmlFor="max" className="block text-sm font-medium text-gray-900 dark:text-white">
                    {type !== INPUT_TYPES[1] ? 'Max' : 'Size'}</label>

                <input id="max" type="number" defaultValue={maxLength}
                       onChange={(e) => handleNumeric2Change(Number(e.target.value))}
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                       focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                       max-w-[100px]" />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="column" className="block text-sm font-medium text-gray-900 dark:text-white">Offset 1
                </label>

                <input id="column" type="number" defaultValue={column}
                       onChange={(e) => setColumn(Number(e.target.value))}
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                       focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                       max-w-[100px]" />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="row" className="block text-sm font-medium text-gray-900 dark:text-white">Offset 2
                </label>

                <input id="row" type="number" defaultValue={row}
                       onChange={(e) => setRow(Number(e.target.value))}
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                       focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600
                       dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                       max-w-[100px]" />
            </div>

            <button onClick={handleAdd} className="px-2 py-1 font-semibold text-sm bg-gray-500 text-white rounded-md
            shadow-sm h-[32px] mt-2 ml-2">
                <BsPlusCircleFill />
            </button>
        </div>
    );
}
