import {CalculationData, ItemType} from "@/types/Item";
import {GUIType} from "@/types/gui";

export interface Project {
    id: number,
    name: string,
    calculationData: CalculationData,
    gui: GUIType,
    userId: number,
    items: ItemType[],
    lastModified: number,
    created: number
}
