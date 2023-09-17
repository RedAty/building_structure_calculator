import React, {useRef, useState} from 'react';

export const inputTypes = [
    "Dinamikus",
    'Fix'
];
export const inputSides = [
    'É/D',
    "K/Ny"
];

export const DEFAULTS = {
    min: 50,
    max: 50,
    column: 0
};

const tailwindCSS = {
    label: "block mb-2 text-sm font-medium text-gray-900 dark:text-white",
    text: "shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg " +
        "focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600" +
        " dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" +
        " dark:shadow-sm-light",
    select: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 " +
        "focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 " +
        "dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
    number: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 " +
        "focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 " +
        "dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 max-w-[100px]"

}

export function ItemInput({ onAddItem }) {
    const [name, setName] = useState('');
    const [dropdown1, setDropdown1] = useState(inputTypes[0]);
    const [dropdown2, setDropdown2] = useState(inputSides[1]);
    const [minLength, setMinLength] = useState(DEFAULTS.min);
    const [maxLength, setMaxLength] = useState(DEFAULTS.max);
    const [column, setColumn] = useState(DEFAULTS.column);
    const inputRef = useRef(null);

    const handleNumeric2Change = (value) => {
        setMaxLength(value);
        if (dropdown1 === inputTypes[1]) {
            setMinLength(value);
        }
    };

    const handleAdd = () => {
        if (name) {
            const newItem = {
                id: new Date().getTime(),
                name,
                dropdown1,
                dropdown2,
                minLength,
                maxLength,
                column
            };

            onAddItem(newItem);
            setName('');
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } else {
            alert('You need to add a name');
        }
    };

    return (
        <div className="flex flex-row">
            <div className="flex flex-col ml-2">
                <label htmlFor="name" className={tailwindCSS.label} >Name</label>
                <input
                    id={'name'}
                    type="text"
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    ref={inputRef}
                    className={tailwindCSS.text}
                />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="types" className={tailwindCSS.label}>Type</label>

                <select id={'types'} defaultValue={dropdown1}
                        onChange={(e) => setDropdown1(e.target.value)}
                        className={tailwindCSS.select} >
                    {inputTypes.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            <div className="flex flex-col ml-2">
                <label htmlFor="sides" className={tailwindCSS.label}>Type</label>

                <select id="sides" defaultValue={dropdown2}
                        onChange={(e) => setDropdown2(e.target.value)}
                        className={tailwindCSS.select} >
                    {inputSides.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            {dropdown1 !== inputTypes[1] && (
                <div className="flex flex-col ml-2">

                    <label htmlFor="min" className={tailwindCSS.label}>Min</label>

                    <input id="min" type="number" defaultValue={minLength}
                           onChange={(e) => setMinLength(Number(e.target.value))}
                           className={tailwindCSS.number} />
                </div>
            )}

            <div className="flex flex-col ml-2">
                <label htmlFor="max" className={tailwindCSS.label}>{dropdown1 !== inputTypes[1] ? 'Max' : 'Size'}</label>

                <input id="max" type="number" defaultValue={maxLength}
                       onChange={(e) => handleNumeric2Change(Number(e.target.value))}
                       className={tailwindCSS.number} />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="column" className={tailwindCSS.label}>Column</label>

                <input id="column" type="number" defaultValue={column}
                       onChange={(e) => setColumn(Number(e.target.value))}
                       className={tailwindCSS.number} />
            </div>

            <button onClick={handleAdd} className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm h-[38px] mt-7 ml-2">Add</button>
        </div>
    );
}
