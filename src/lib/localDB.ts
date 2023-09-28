'use client';
import {Project} from "@/types/project";

export class LocalDB {
    private _projects: Project[];
    private readonly _userId: number;
    private _timeout: number | undefined;

    constructor() {
        this._userId = 0;
        this._projects = this.loadProjectsForUser();
    }

    loadProjectsForUser():Project[] {
        let items = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('projects_' + this._userId) : '[]';
        if (!items) {
            return [];
        }
        try {
            return JSON.parse(items) as Project[];
        } catch (e) {
            console.error(e);
        }
        return [];
    }

    get projects(): Project[] {
        if (!this._projects || !this._projects.length) {
            this.loadProjectsForUser();
        }
        return this._projects;
    }

    getProjectById (id: number): Project|undefined {
        return this.projects.find(p=>p.id === id);
    }

    addProject (project: Project): Project {
        if (!project.id) {
            project.id = this.projects.length ? Math.max(...this.projects.map(p => p.id)) + 1 : 1;
        }
        if (!project.name) {
            project.name = "Untitled Project";
        }
        if (!project.gui) {
            project.gui = {
                focus: "normal"
            };
        }
        if (!project.items) {
            project.items = [];
        }
        project.userId = this._userId;
        project.lastModified = new Date().getTime();
        project.created = new Date().getTime();

        this._projects.push(project);
        this.syncProjects();
        return project;
    }

    updateProject (project: Project) {
        const index = this.projects.findIndex(p=>p.id === project.id);
        if (index === -1) {
            return this.addProject(project);
        }
        project.lastModified = new Date().getTime();
        this._projects[index] = project;
        this.syncProjects();
    }

    deleteProject (id) {
        this._projects = this._projects.filter(p => p.id !== id);
        this.syncProjects();
    }

    saveProjects() {
        localStorage.setItem('projects_' + this._userId, JSON.stringify(this._projects));
    }

    syncProjects() {
        if (this._timeout) {
            window.clearTimeout(this._timeout);
        }
        this._timeout = window.setTimeout(() => {
            this.saveProjects();
        }, 1000);
    }
}
