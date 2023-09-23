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
    column: 0,
    row: 0,
    absoluteEditor: true,
    centimeterPixelRatio: 4,
    lineSize: 4,
    baseX: 10,
    baseY: 10,
    zoomStep: 10
};


export const tailwindCSS = {
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

export function ItemInput({ onAddItem, absoluteEditor }) {
    const [name, setName] = useState(new Date().getTime().toString().substring(6));
    const [type, setType] = useState(inputTypes[0]);
    const [side, setSide] = useState(inputSides[1]);
    const [minLength, setMinLength] = useState(DEFAULTS.min);
    const [maxLength, setMaxLength] = useState(DEFAULTS.max);
    const [column, setColumn] = useState(DEFAULTS.column);
    const [row, setRow] = useState(DEFAULTS.row);
    const inputRef = useRef(null);

    const handleNumeric2Change = (value) => {
        setMaxLength(value);
        if (type === inputTypes[1]) {
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

                <select id={'types'} defaultValue={type}
                        onChange={(e) => setType(e.target.value)}
                        className={tailwindCSS.select} >
                    {inputTypes.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            <div className="flex flex-col ml-2">
                <label htmlFor="sides" className={tailwindCSS.label}>Type</label>

                <select id="sides" defaultValue={side}
                        onChange={(e) => setSide(e.target.value)}
                        className={tailwindCSS.select} >
                    {inputSides.map(type=>(<option key={type}>{type}</option>))}
                </select>
            </div>
            {type !== inputTypes[1] && (
                <div className="flex flex-col ml-2">

                    <label htmlFor="min" className={tailwindCSS.label}>Min</label>

                    <input id="min" type="number" defaultValue={minLength}
                           onChange={(e) => setMinLength(Number(e.target.value))}
                           className={tailwindCSS.number} />
                </div>
            )}

            <div className="flex flex-col ml-2">
                <label htmlFor="max" className={tailwindCSS.label}>{type !== inputTypes[1] ? 'Max' : 'Size'}</label>

                <input id="max" type="number" defaultValue={maxLength}
                       onChange={(e) => handleNumeric2Change(Number(e.target.value))}
                       className={tailwindCSS.number} />
            </div>

            <div className="flex flex-col ml-2">
                <label htmlFor="column" className={tailwindCSS.label}>Offset 1</label>

                <input id="column" type="number" defaultValue={column}
                       onChange={(e) => setColumn(Number(e.target.value))}
                       className={tailwindCSS.number} />
            </div>

            <div className={absoluteEditor ? "flex flex-col ml-2" : "flex flex-col ml-2 hidden"}>
                <label htmlFor="row" className={tailwindCSS.label}>Offset 2</label>

                <input id="row" type="number" defaultValue={row}
                       onChange={(e) => setRow(Number(e.target.value))}
                       className={tailwindCSS.number} />
            </div>

            <button onClick={handleAdd} className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm h-[38px] mt-7 ml-2">Add</button>
        </div>
    );
}
