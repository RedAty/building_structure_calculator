'use client';
import Image from 'next/image'
import React, {useRef, useState} from "react";
import {DEFAULTS, inputSides, inputTypes, ItemInput, tailwindCSS} from "@/app/itemInput";
import {SVGDesigner} from "@/app/designer";
import {Commons} from "@/app/lib/commons";
import {CalculationData, ItemBoundary, ItemType} from "@/app/types/Item";
import {areaM, getItemBoundariesInCM, toFixedNumber} from "@/app/lib/calculations";


export default function Home() {
  const [items, setItems] = useState([] as ItemType[]);
  const [name, setName] = useState('');
  const [absoluteEditor, setAbsoluteEditor] = useState(DEFAULTS.absoluteEditor);
  let itemBoundaries = getItemBoundariesInCM(items);
  const [squareMeter, setSquareMeter] = useState(areaM(itemBoundaries.x0, itemBoundaries.y0, itemBoundaries.x1,  itemBoundaries.y1))
  const [calculatedData, setCalculatedData] = useState({
    m2: squareMeter, width: itemBoundaries.width, height: itemBoundaries.height, modified: false, ratio: 1, isOn: false,
    ratioWidth: 1, ratioHeight: 1
  } as CalculationData);
  updateItemCalculations();
  let itemBoundariesCalculated = getItemBoundariesInCM(items, 'calculated', 'calculatedColumn', 'calculatedRow');


  const refreshCalculations = () => {
    itemBoundaries = getItemBoundariesInCM(items);
    updateItemCalculations();
    itemBoundariesCalculated = getItemBoundariesInCM(items, 'calculated', 'calculatedColumn', 'calculatedRow');
    const m2 = areaM(itemBoundaries.x0, itemBoundaries.y0, itemBoundaries.x1,  itemBoundaries.y1);
    setSquareMeter(m2);
    calculatedData.m2 = Number(m2);
    calculatedData.width = itemBoundaries.width;
    calculatedData.height = itemBoundaries.height;
    console.log(itemBoundaries);

    calculatedData.calculatedWidth = itemBoundariesCalculated.width;
    calculatedData.calculatedHeight = itemBoundariesCalculated.height;

    setCalculatedData(calculatedData);
  }
  const addItemToList = (item) => {
    setItems([...items, item]);
    refreshCalculations();
  };
  const updateItemById = (id, keys) => {
    items.forEach((item, index)=>{
      if (item.id === id) {
        items[index] = Object.assign(item, keys);
      }
    });
    setItems([...items]);
    refreshCalculations();
  };
  const selectItem = (i) => {
    items.forEach((item, index)=>{
      items[index].selected = item.id === i.id;
    });
    setItems([...items]);
  }

  const handleChange = () => {
    setAbsoluteEditor(!absoluteEditor)
  };

  const exportData = () => {
    Commons.downloadAsFile(name, JSON.stringify(items), 'application/json');
  }

  const importData = async function () {
    const file = await Commons.readTextFile();
    if (file && typeof file.value === "string") {
      const json = JSON.parse(file.value);

      if (Array.isArray(json)) {
        setItems(json);
        itemBoundaries = getItemBoundariesInCM(json);
        const m2 = areaM(itemBoundaries.x0, itemBoundaries.y0, itemBoundaries.x1,  itemBoundaries.y1);
        setSquareMeter(m2);
        calculatedData.modified = false;
        calculatedData.m2 = Number(m2);
        calculatedData.width = itemBoundaries.width;
        calculatedData.height = itemBoundaries.height;
        setCalculatedData(calculatedData);
      }
    }
  }

  function changeName(e) {
    setName(e.target.value);
  }

  function reset() {
    setItems([]);
  }

  function checkCalculatedHeader () {
    const calcM2 = document.getElementById('calcM2') as HTMLInputElement;
    const calcWidth = document.getElementById('calcWidth') as HTMLInputElement;
    const calcHeight = document.getElementById('calcHeight') as HTMLInputElement;
    if (!calcM2 || !calcHeight || !calcWidth) {
      return false;
    }
    if (calcWidth.value && calcHeight.value) {
      const area = areaM(0,0, Number(calcWidth.value), Number(calcHeight.value));
      if (calcM2.value !== String(area)) {
        calcM2.value = String(area);
        return true
      }
    }
    return false;
  }

  function updateItemCalculations() {
    items.forEach(item => {
      const side = item.side;
      if (side === inputSides[0]) { // Horizontal
        item.calculatedRow = toFixedNumber(item.row * calculatedData.ratioWidth);
        item.calculatedColumn = toFixedNumber(item.column * calculatedData.ratioHeight);
        item.calculated = toFixedNumber(item.minLength * calculatedData.ratioWidth);
      } else if (side === inputSides[1]) { // Vertical
        item.calculatedRow = toFixedNumber(item.row * calculatedData.ratioHeight);
        item.calculatedColumn = toFixedNumber(item.column * calculatedData.ratioWidth);
        item.calculated = toFixedNumber(item.minLength * calculatedData.ratioHeight);
      }
    });
  }

  function changeCalculatedData(e: React.ChangeEvent<HTMLInputElement>, key: string /*'m2'|'width'|'height'*/) {
    let calculate = false;
    if (e && e.target && e.target.value) {
      const numeric = Number(e.target.value);
      if (!Number.isNaN(numeric)) {
        calculatedData[key] = numeric;
        calculate = true;
      } else {
        console.error(e.target.value + ' is not numeric');
      }
    } else if (e && e.target && e.target.value === '') {
      // User deleted the value
      calculatedData[key] = itemBoundaries[key];
      /*if (itemBoundaries.hasOwnProperty(key)) {
        calculatedData[key] = itemBoundaries[key];
      } else if (key === 'm2') {
        calculatedData.m2 = Number(squareMeter);
      }*/
      calculate = true;
    }
    if (key !== "m2") {
      checkCalculatedHeader();
    }

    if (calculate) {
      calculatedData.ratioWidth = (calculatedData.calculatedWidth || calculatedData.width) / itemBoundaries.width;
      calculatedData.ratioHeight = (calculatedData.calculatedHeight || calculatedData.height) / itemBoundaries.height;
      calculatedData.ratio = calculatedData.m2 / Number(squareMeter);
      if (calculatedData.ratioHeight < 1.09 && calculatedData.ratioHeight > 0.91) {
        calculatedData.ratioHeight = 1;
      } else if (calculatedData.ratioWidth < 1.09 && calculatedData.ratioWidth > 0.91) {
        calculatedData.ratioWidth = 1;
      } else if (calculatedData.ratio < 1.09 && calculatedData.ratio > 0.91) {
        calculatedData.ratio = 1;
      }
      const modifiedEarlier = !!calculatedData.modified;
      calculatedData.modified = calculatedData.ratioHeight !== 1 || calculatedData.ratioWidth !== 1 || calculatedData.ratio !== 1;

      updateItemCalculations();

      setCalculatedData(calculatedData);
      if (modifiedEarlier !== calculatedData.modified) {
        // Provoke a new refresh
        setItems([...items]);
      }
    }
  }

  function changeIsCalculatedOn() {
    calculatedData.isOn = !calculatedData.isOn;
    setCalculatedData(Object.assign({}, calculatedData));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <div className="flex h-[30px]">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white w-[50px] p-1">Name:</label>

            <input type="name" id="name"
                   defaultValue={name}
                   className="mr-8 max-w-[200px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="Project Name" onChange={changeName} />

            <input type="m21" id="m21"
                   className="max-w-[80px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={squareMeter.toString()} />
            <label htmlFor="m21" className="block text-sm font-medium text-gray-900 dark:text-white w-[50px] p-1">m2</label>

            <div className="inline-flex rounded-md shadow-sm h-[30px]" role="group">
              <button onClick={()=>reset()} type="button"
                      className="px-2 text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Reset
              </button>
              <button onClick={()=>importData()} type="button"
                      className="px-2 text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Import
              </button>
              <button onClick={()=>exportData()} type="button"
                      className="px-2 text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Export
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-900 dark:text-white p-1">Targets:</label>

            <input type="calcM2" id="calcM2"
                   className="max-w-[65px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={calculatedData.m2.toString()} onChange={(e)=>changeCalculatedData(e, 'm2')} />
            <label htmlFor="calcM2" className="block text-sm font-medium text-gray-900 dark:text-white w-[30px] p-1">m2</label>
            <input type="calcWidth" id="calcWidth"
                   className="max-w-[55px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={calculatedData.width.toString()} onChange={(e)=>changeCalculatedData(e, 'calculatedWidth')} />
            <label htmlFor="calcWidth" className="block text-sm font-medium text-gray-900 dark:text-white w-[70px] p-1">cm with</label>
            <input type="calcHeight" id="calcHeight"
                   className="max-w-[55px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={calculatedData.height.toString()} onChange={(e)=>changeCalculatedData(e, 'calculatedHeight')} />
            <label htmlFor="calcHeight" className="block text-sm font-medium text-gray-900 dark:text-white w-[85px] p-1">cm height</label>

            <div className="flex items-center">
              <input defaultChecked={calculatedData.isOn} onChange={changeIsCalculatedOn} id="checked-checkbox" type="checkbox" value=""
                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="checked-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Calculated</label>
            </div>
          </div>


        </div>
        <div className="block hidden">


          <div className="relative inline-flex items-center cursor-pointer" onClick={handleChange}>
            <input type="checkbox" value="" className="sr-only peer"
                   defaultChecked={absoluteEditor}/>
            <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"/>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Absolute Editor</span>
          </div>


        </div>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/logo.png"
              alt="Reterics Logo"
              className="dark:invert"
              width={64}
              height={68}
              priority
            />
          </a>
        </div>
      </div>


        <div className="overflow-x-auto w-full  h-[76vh]">
            <div className="float-left w-[790px]">
              <div className="overflow-x-auto inline-block" style={{maxHeight:'76vh'}}>
                <table className="min-w-full text-left text-sm font-light max-w-[790px]">
                  <thead className="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 hidden">#</th>
                    <th scope="col" className="px-6 py-4">Name</th>
                    <th scope="col" className="px-6 py-4">Type</th>
                    <th scope="col" className="px-6 py-4">Side</th>
                    <th scope="col" className="px-6 py-4">Offset 1</th>
                    <th scope="col" className={absoluteEditor ? "px-6 py-4" : "px-6 py-4 hidden"}>Offset 2</th>
                    <th scope="col" className="px-6 py-4">Min</th>
                    <th scope="col" className="px-6 py-4">Max</th>
                    <th scope="col" className="px-6 py-4">Calculated</th>

                  </tr>
                  </thead>
                  <tbody>
                  {items.map((item, index) => (
                      <tr key={index} className={item.selected? "bg-sky-500/50"
                          : "border-b dark:border-neutral-500"} onClick={() => selectItem(item)}>
                        <td className="whitespace-nowrap px-6 py-4 font-medium hidden">{index}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.name}</td>
                        <td className="whitespace-nowrap px-6 py-4">{
                          item.selected ?
                              <select defaultValue={item.type}
                                      onChange={(e) => updateItemById(item.id, {
                                        type: e.target.value
                                      })}
                                      className={tailwindCSS.select} >
                                {inputTypes.map(type=>(<option key={type}>{type}</option>))}
                              </select>
                              : item.type.substring(0,3)
                        }</td>
                        <td className="whitespace-nowrap px-6 py-4">{
                          item.selected ?
                              <select defaultValue={item.side}
                                      onChange={(e) => updateItemById(item.id, {
                                        side: e.target.value
                                      })}
                                      className={tailwindCSS.select} >
                                {inputSides.map(type=>(<option key={type}>{type}</option>))}
                              </select>
                              : item.side
                        }</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.column}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.row}</td>
                        <td className="whitespace-nowrap px-6 py-4 min-w-[98px]">{item.minLength} cm</td>
                        <td className="whitespace-nowrap px-6 py-4 min-w-[98px]">{item.type !== inputTypes[1] ?
                            item.maxLength + 'cm' :'-'} </td>
                        <td className="whitespace-nowrap px-6 py-4 min-w-[98px]">{item.calculated || '-'} cm</td>

                      </tr>
                  ))}
                  </tbody>
                </table>

              </div>
            </div>
          <div className="overflow-x-auto float-left h-full" style={{width:'calc(100% - 790px)'}}>
            <SVGDesigner items={items} selectItem={selectItem} updateItemById={updateItemById}
                         absoluteEditor={absoluteEditor} calculatedData={calculatedData} isCalculatedOn={calculatedData.isOn}/>
          </div>

        </div>

        <ItemInput onAddItem={addItemToList} absoluteEditor={absoluteEditor} />

      <div></div>
    </main>
  )
}
