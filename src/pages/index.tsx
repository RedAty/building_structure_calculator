'use client';
import AppContainer from "@/components/appContainer";
import {LocalDB} from "@/lib/localDB";
import Link from "next/link";
import {BsFileArrowDown, BsFillTrashFill, BsFolder2} from "react-icons/bs";
import React, {useState} from "react";
import {downloadAsFile} from "@/lib/commons";

export default function IndexPage() {
    const storage = new LocalDB();
    const [projects, setProjects] = useState(storage.projects);

    function downloadProject(id: number) {
        const project = storage.getProjectById(id);
        if (project) {
            downloadAsFile(project.name, JSON.stringify(project.items), 'application/json');
        } else {
            alert('Project is not found. Refresh the page');
        }
    }

    function deleteProject(id: number) {
        if (id && window.confirm('Are you sure you wish to delete this Project?')) {
            storage.deleteProject(id);
            setProjects(storage.projects);
        }
    }

    return (
        <AppContainer>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-w-screen-xl w-full mt-4">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Project Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Modified
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Created
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {projects.map((project) =>
                        <tr key={project.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">

                            <th scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {project.id}
                            </th>
                            <th scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {project.name}
                            </th>
                            <td className="px-6 py-4">
                                You
                            </td>
                            <td className="px-6 py-4">
                                {project.lastModified ? new Date(project.lastModified).toISOString() :  '-'}
                            </td>
                            <td className="px-6 py-4">
                                {project.created ? new Date(project.created).toISOString() : '-'}
                            </td>
                            <td className="px-6 py-4 flex flex-row text-lg">
                                <Link href={{
                                    pathname: '/editor',
                                    query: {
                                        id: project.id
                                    }
                                }}
                                   className="font-medium text-black-600 dark:text-blue-500 hover:underline">
                                    <BsFolder2 className="cursor-pointer ml-2" /></Link>

                                <BsFileArrowDown className="cursor-pointer ml-2" onClick={() => downloadProject(project.id)}/>
                                <BsFillTrashFill className="cursor-pointer ml-2" onClick={() => deleteProject(project.id)}/>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </AppContainer>
    )
}
