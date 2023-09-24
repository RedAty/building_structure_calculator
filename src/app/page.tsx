'use client';
import Image from 'next/image'
import React, {useReducer, useRef, useState} from "react";
import {DEFAULTS, inputSides, inputTypes, ItemInput, tailwindCSS} from "@/app/itemInput";
import {SVGDesigner} from "@/app/designer";
import {Commons} from "@/app/lib/commons";
import {CalculationData, ItemBoundary, ItemType} from "@/app/types/Item";
import {areaM, getItemBoundariesInCM, toFixedNumber} from "@/app/lib/calculations";
import {
  BsCloudDownloadFill,
  BsCloudUploadFill,
  BsEraserFill,
  BsFillGrid1X2Fill, BsFillImageFill,
  BsFillTrashFill, BsLayoutTextWindowReverse
} from "react-icons/bs";
import {GUIType} from "@/app/types/gui";


export default function Home() {
  const [items, setItems] = useState([] as ItemType[]);
  const [name, setName] = useState('');
  const [ui, setUI] = useState({focus: "normal"} as GUIType);

  const maxLengthInput = useRef(null);

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
  const updateItemById = (id, keys): boolean => {
    items.forEach((item, index)=>{
      if (item.id === id) {
        items[index] = Object.assign(item, keys);
      }
    });
    setItems([...items]);
    refreshCalculations();
    return true;
  };
  const selectItem = (i) => {
    if (!i || i.selected) {
      return false;
    }
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

  function deleteItem(itemId) {
    if (itemId && window.confirm('Are you sure you wish to delete this item?')) {
      setItems(items.filter(i=>i.id !== itemId));
    }
  }

  function switchUI() {
    switch (ui.focus) {
      case "normal":
        ui.focus = "table";
        break;
      case "table":
        ui.focus = "designer";
        break;
      case "designer":
        ui.focus = "normal";
        break;
    }
    setUI(Object.assign({}, ui));
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="z-10 w-full justify-between font-mono text-sm lg:flex flex-col">
        <div className="flex border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8
        backdrop-blur-2xl lg:static lg:w-auto dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit
        lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <div className="flex h-[30px]">
            <a
                className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                href="https://reterics.com"
                target="_blank"
                rel="noopener noreferrer"
            >
              <Image
                  src="/logo.png"
                  alt="Reterics Logo"
                  className="dark:invert"
                  width={40}
                  height={42}
                  priority
              />
            </a>


            <input type="name" id="name"
                   defaultValue={name}
                   className="mr-8 max-w-[180px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="Project Name" onChange={changeName} />

            <input type="m21" id="m21"
                   className="max-w-[80px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={squareMeter.toString()} />
            <label htmlFor="m21" className="block text-sm font-medium text-gray-900 dark:text-white w-[50px] p-1">m2</label>

            <div className="inline-flex rounded-md shadow-sm h-[30px]" role="group">
              <button onClick={()=>reset()} type="button"
                      className="px-2 text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                <BsEraserFill />
              </button>
              <button onClick={()=>importData()} type="button"
                      className="px-2 text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">

                <BsCloudUploadFill />
              </button>
              <button onClick={()=>exportData()} type="button"
                      className="px-2 text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">

                <BsCloudDownloadFill />
              </button>
              <button onClick={()=>switchUI()} type="button"
                      className="px-2 text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">

                {ui.focus === "normal" ? (<BsFillGrid1X2Fill />) : ui.focus === "designer" ? (<BsFillImageFill />) : (<BsLayoutTextWindowReverse />)}
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
        <ItemInput onAddItem={addItemToList} absoluteEditor={absoluteEditor} />
      </div>

      <div className="overflow-x-auto w-full  h-[76vh]">
            <div className={
              "float-left " + (
                    ui.focus === 'normal' ? 'w-[730px]' : ui.focus === 'designer' ? 'hidden' : 'w-full'
                )
            }>
              <div className="overflow-x-auto inline-block" style={{maxHeight:'76vh'}}>
                <table className={
                  "text-left mt-2 text-sm font-light text-gray-500 dark:text-gray-400 " + (
                        ui.focus === 'normal' ? 'w-[730px]' : ui.focus === 'designer' ? 'hidden' : 'w-[calc(100vw-2rem)]'
                    )
                }>
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-3 py-2 hidden">#</th>
                    <th scope="col" className="px-3 py-2">Name</th>
                    <th scope="col" className="px-3 py-2">Type</th>
                    <th scope="col" className="px-3 py-2">Side</th>
                    <th scope="col" className="px-3 py-2 min-w-[80px]">Offset 1</th>
                    <th scope="col" className={absoluteEditor ? "px-3 py-2 min-w-[81px]" : "px-3 py-2 hidden"}>Offset 2</th>
                    <th scope="col" className="px-2 py-2">Min (cm)</th>
                    <th scope="col" className="px-3 py-2">Max (cm)</th>
                    <th scope="col" className="px-3 py-2">Calculated</th>
                    <th scope="col" className="px-3 py-2" />

                  </tr>
                  </thead>
                  <tbody>
                  {items.map((item, index) => (
                      <tr key={index} className={item.selected ? "bg-sky-500/50"
                          : (index % 2 ? "bg-white" : "")  + " border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700"}
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-medium hidden" onClick={() => selectItem(item)}>{index}</td>
                        <td className="whitespace-nowrap px-3 py-2" onClick={() => selectItem(item)}>{item.name}</td>
                        <td className="whitespace-nowrap px-3 py-2" onClick={() => selectItem(item)}>{
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
                        <td className="whitespace-nowrap px-3 py-2" onClick={() => selectItem(item)}>{
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
                        <td className="whitespace-nowrap px-3 py-2" onClick={() => selectItem(item)}>{
                          item.selected ?
                              <input type="number" defaultValue={item.column} className="bg-gray-50 border
                              border-gray-300 text-gray-900 text-sm rounded-md
                              focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700
                              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                              dark:focus:border-blue-500"
                              onChange={(e) => updateItemById(item.id, {
                                column: Number(e.target.value || '0')
                              })} />
                              : item.column
                        }</td>
                        <td className="whitespace-nowrap px-3 py-2" onClick={() => selectItem(item)}>{
                          item.selected ?
                              <input type="number" defaultValue={item.row} className="bg-gray-50 border
                              border-gray-300 text-gray-900 text-sm rounded-md
                              focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700
                              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                              dark:focus:border-blue-500"
                                     onChange={(e) => updateItemById(item.id, {
                                       row: Number(e.target.value || '0')
                                     })} />
                              : item.row
                        }</td>
                        <td className="whitespace-nowrap px-3 py-2 min-w-[98px" onClick={() => selectItem(item)}>
                          {
                            item.selected ?
                                <input type="number" defaultValue={item.minLength} className="bg-gray-50 border
                              border-gray-300 text-gray-900 text-sm rounded-md
                              focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[50px] dark:bg-gray-700
                              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                              dark:focus:border-blue-500"
                                       onChange={(e) => updateItemById(item.id, {
                                         minLength: Number(e.target.value || '0'),
                                         maxLength: Math.max(Number(e.target.value || '0'), Number(item.maxLength))
                                       })} />
                                : item.minLength
                          }
                          </td>
                        <td className="whitespace-nowrap px-3 py-2 min-w-[98px]" onClick={() => selectItem(item)}>
                          {
                              item.type !== inputTypes[1] && item.selected ?
                                <input type="number" defaultValue={item.maxLength} className="bg-gray-50 border
                              border-gray-300 text-gray-900 text-sm rounded-md
                              focus:ring-blue-500 focus:border-blue-500 block w-full min-w-[50px] dark:bg-gray-700
                              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                              dark:focus:border-blue-500" ref={maxLengthInput}
                                       onChange={(e) => updateItemById(item.id, {
                                         maxLength: Number(e.target.value || '0')
                                       })} />
                                : item.type !== inputTypes[1] ?
                                    item.maxLength + ' cm' : '-'
                          }
                           </td>
                        <td className="whitespace-nowrap px-3 py-2 min-w-[98px]">{item.calculated || '-'} cm</td>
                        <td className="whitespace-nowrap px-3 py-2">
                            <BsFillTrashFill className="cursor-pointer" onClick={(e)=>deleteItem(item.id)}/>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>

              </div>
            </div>
        {ui.focus !== 'table' &&
          <div className="overflow-y-hidden overflow-x-hidden float-left h-full" style={{width:ui.focus === 'normal' ? 'calc(100% - 730px)' : ui.focus === 'designer' ? '100%' : '0%'}}>
            <SVGDesigner items={items} selectItem={selectItem} updateItemById={updateItemById}
                         absoluteEditor={absoluteEditor} calculatedData={calculatedData}
                         isCalculatedOn={calculatedData.isOn}
                         deleteItem={deleteItem} />
          </div>
        }
        </div>
    </main>
  )
}
