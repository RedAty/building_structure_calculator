import React, {useRef, useState} from 'react';
export const inputTypes = [
    "Dinamikus",
    'Fix'
];
export const inputSides = [
    'Északi/Déli',
    "Keleti/Nyugat"
];

export function ItemInput({ onAddItem }) {
    const [name, setName] = useState('');
    const [dropdown1, setDropdown1] = useState(inputTypes[0]);
    const [dropdown2, setDropdown2] = useState(inputSides[1]);
    const [minLength, setMinLength] = useState(0);
    const [maxLength, setMaxLength] = useState(0);
    const [column, setColumn] = useState(0);
    const inputRef = useRef(null);

    const handleNumeric2Change = (value) => {
        setMaxLength(value);
        if (dropdown1 === inputTypes[1]) {
            setMinLength(value);
        }
    };

    const handleAdd = () => {
        console.log('Add', name);
        if (name) {
            const newItem = {
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
            //setDropdown1('Option 1');
            //setDropdown2('Option 1');
            //setNumeric1(0);
            //setNumeric2(0);
        } else {
            alert('You need to add a name');
        }
    };

    return (
        <div>
            <input
                type="text"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                ref={inputRef}
            />
            <select defaultValue={dropdown1} onChange={(e) => setDropdown1(e.target.value)}>
                {inputTypes.map(type=>(<option key={type}>{type}</option>))}
            </select>
            <select defaultValue={dropdown2} onChange={(e) => setDropdown2(e.target.value)}>
                {inputSides.map(type=>(<option key={type}>{type}</option>))}
            </select>

            {dropdown1 !== inputTypes[1] && (
                <input type="number" defaultValue={minLength} onChange={(e) => setMinLength(Number(e.target.value))} />
            )}
            <input type="number" defaultValue={maxLength} onChange={(e) => handleNumeric2Change(Number(e.target.value))} />
            <input type="number" defaultValue={column} onChange={(e) => setColumn(Number(e.target.value))} />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
}
