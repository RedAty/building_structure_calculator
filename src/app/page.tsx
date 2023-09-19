'use client';
import Image from 'next/image'
import React, {useRef, useState} from "react";
import {DEFAULTS, inputSides, inputTypes, ItemInput, tailwindCSS} from "@/app/itemInput";
import {SVGDesigner} from "@/app/designer";

export default function Home() {
  const [items, setItems] = useState([]);
  const [absoluteEditor, setAbsoluteEditor] = useState(DEFAULTS.absoluteEditor);

  const addItemToList = (item) => {
    setItems([...items, item]);
  };
  const updateItemById = (id, keys) => {
    items.forEach((item, index)=>{
      if (item.id === id) {
        items[index] = Object.assign(item, keys);
      }
    });
    setItems([...items]);
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
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to &nbsp;
          <code className="font-mono font-bold">Building Structure Calculator</code>
        </p>

        <div>
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
            <div className="float-left w-[795px]">
              <div className="overflow-x-auto inline-block" style={{maxHeight:'76vh'}}>
                <table className="min-w-full text-left text-sm font-light max-w-[795px]">
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
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          <div className="overflow-x-auto float-left h-full" style={{width:'calc(100% - 790px)'}}>
            <SVGDesigner items={items} selectItem={selectItem} updateItemById={updateItemById}
                         absoluteEditor={absoluteEditor}/>
          </div>

        </div>

        <ItemInput onAddItem={addItemToList} absoluteEditor={absoluteEditor} />

      <div></div>
    </main>
  )
}
