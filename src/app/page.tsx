'use client';
import Image from 'next/image'
import React, {useRef, useState} from "react";
import {DEFAULTS, inputSides, inputTypes, ItemInput, tailwindCSS} from "@/app/itemInput";
import {SVGDesigner} from "@/app/designer";
import {Commons} from "@/app/lib/commons";
import {ItemBoundary, ItemType} from "@/app/types/Item";
import {getItemBoundariesInCM} from "@/app/lib/calculations";


const area = (x1: number, y1: number, x2: number, y2: number) => {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const area = width * height;
  if (area === Infinity) {
    return 0;
  }
  return ((area/* * DEFAULTS.centimeterPixelRatio*/) / 10000).toFixed(2);
}



export default function Home() {
  const [items, setItems] = useState([] as ItemType[]);
  const [name, setName] = useState('');
  const [absoluteEditor, setAbsoluteEditor] = useState(DEFAULTS.absoluteEditor);
  let itemBoundaries = getItemBoundariesInCM(items);
  const [squareMeter, setSquareMeter] = useState(area(itemBoundaries.x0, itemBoundaries.y0, itemBoundaries.x1,  itemBoundaries.y1))
  const [squareMeterCalculated, setSquareMeterCalculated] = useState(0)

  const refreshCalculations = ()=>{
    itemBoundaries = getItemBoundariesInCM(items);
    console.log(itemBoundaries)
    setSquareMeter(area(itemBoundaries.x0, itemBoundaries.y0, itemBoundaries.x1,  itemBoundaries.y1))

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
      console.log(json);

      if (Array.isArray(json)) {
        setItems(json);
      }
    }
  }

  function changeName(e) {
    setName(e.target.value);
  }

  function reset() {
    setItems([]);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <div className="flex h-[40px]">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-[50px] p-2">Name:</label>

            <input type="name" id="name"
                   defaultValue={name}
                   className="mr-8 max-w-[200px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="Project Name" onChange={changeName} />

            <input type="m21" id="m21"
                   className="max-w-[100px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={squareMeter.toString()} />
            <label htmlFor="m21" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-[60px] p-2">m2 ></label>

            <input type="m22" id="m22"
                   className="max-w-[100px] bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder={squareMeterCalculated.toString()} />
            <label htmlFor="m22" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white w-[40px] p-2">m2</label>


            <div className="inline-flex rounded-md shadow-sm h-[40px]" role="group">
              <button onClick={()=>reset()} type="button"
                      className="px-4 text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Reset
              </button>
              <button onClick={()=>importData()} type="button"
                      className="px-4 text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Import
              </button>
              <button onClick={()=>exportData()} type="button"
                      className="px-4 text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
                Export
              </button>
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
                        <td className="whitespace-nowrap px-6 py-4 min-w-[98px]">{item.calculated || item.minLength} cm</td>

                      </tr>
                  ))}
                  </tbody>
                </table>

              </div>
            </div>
          <div className="overflow-x-auto float-left h-full" style={{width:'calc(100% - 790px)'}}>
            <SVGDesigner items={items} selectItem={selectItem} updateItemById={updateItemById}
                         absoluteEditor={absoluteEditor} squareMeterData={{
                           squareMeter:squareMeter, minX:itemBoundaries.x0,
                            minY:itemBoundaries.y0,
                            maxX:itemBoundaries.x1,
                            maxY:itemBoundaries.y1
            }}/>
          </div>

        </div>

        <ItemInput onAddItem={addItemToList} absoluteEditor={absoluteEditor} />

      <div></div>
    </main>
  )
}
