'use client';
import Image from 'next/image'
import {useState} from "react";
import {inputTypes, ItemInput} from "@/app/itemInput";
import {SVGDesigner} from "@/app/designer";

export default function Home() {
  const [items, setItems] = useState([]);

  const addItemToList = (item) => {
    console.log(item, items);
    setItems([...items, item]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to &nbsp;
          <code className="font-mono font-bold">Building Structure Calculator</code>
        </p>
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


        <div className="flex flex-row overflow-x-auto w-full justify-around">
            <div className="flex w-half py-2 sm:px-6 lg:px-8">
              <div className="overflow-x-auto inline-block" style={{maxHeight:'50vh'}}>
                <table className="min-w-full text-left text-sm font-light">
                  <thead className="border-b font-medium dark:border-neutral-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 hidden">#</th>
                    <th scope="col" className="px-6 py-4">Name</th>
                    <th scope="col" className="px-6 py-4">Type</th>
                    <th scope="col" className="px-6 py-4">Side</th>
                    <th scope="col" className="px-6 py-4">Column</th>
                    <th scope="col" className="px-6 py-4">Size Range</th>
                  </tr>
                  </thead>
                  <tbody>
                  {items.map((item, index) => (
                      <tr key={index} className="border-b dark:border-neutral-500">
                        <td className="whitespace-nowrap px-6 py-4 font-medium hidden">{index}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.name}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.dropdown1}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.dropdown2}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.column}</td>
                        <td className="whitespace-nowrap px-6 py-4">{item.dropdown1 !== inputTypes[1] ?
                            item.minLength + ' - ' + item.maxLength : item.minLength} cm</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          <div className="flex flex-col overflow-x-auto w-half">
            <SVGDesigner items={items} />
          </div>

        </div>

        <ItemInput onAddItem={addItemToList} />


      <div></div>
    </main>
  )
}
