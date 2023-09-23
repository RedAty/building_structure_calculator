import {ItemBoundary, ItemType, RectBoundary} from "@/app/types/Item";
import {inputSides} from "@/app/itemInput";

export const getItemBoundariesInCM = (items: ItemType[], key : 'calculated'|'minLength'|'maxLength' = 'minLength'): ItemBoundary => {
    const fallbackKey = 'minLength';
    let minX;
    let minY;
    let maxX;
    let maxY;
    items.forEach((item) => {
        const type = item.side;
        let leftX,
            rightX,
            topY,
            bottomY;
        if (type === inputSides[0]) { // Horizontal
            leftX = item.row;
            rightX = item.row + (item[key] === undefined ? item[fallbackKey] : item[key]);
            topY = item.column;
            bottomY = item.column;
        } else if (type === inputSides[1]) { // Vertical
            leftX = item.column;
            rightX = item.column;
            topY = item.row;
            bottomY = item.row + (item[key] === undefined ? item[fallbackKey] : item[key]);
        } else {
            return;
        }

        if (minX === undefined) {
            minX = leftX;
            maxX = rightX;
            minY = topY;
            maxY = bottomY;
        } else {
            if (minX > leftX) {
                minX = leftX;
            }
            if (rightX > maxX) {
                maxX = rightX;
            }
            if (minY > topY) {
                minY = topY;
            }
            if (bottomY > maxY) {
                maxY = bottomY;
            }
        }

    });
    return {
        x0: minX || 0,
        x1: maxX || 0,
        y0: minY || 0,
        y1: maxY || 0,
        width: (maxX || 0) - (minX || 0),
        height: (maxY || 0) - (minY || 0),
    }
}

export const getItemRectDimensions = (items: ItemType[]): RectBoundary => {
    let minX;
    let minY;
    let maxX;
    let maxY;
    items.forEach((item) => {
        const type = item.side;
        let leftX,
            rightX,
            topY,
            bottomY;
        if (type === inputSides[0]) { // Horizontal
            leftX = item.x;
            rightX = item.x + item.width
            topY = item.y;
            bottomY = item.y;
        } else if (type === inputSides[1]) { // Vertical
            leftX = item.x;
            rightX = item.x;
            topY = item.y;
            bottomY = item.y + item.height
        } else {
            return;
        }

        if (minX === undefined) {
            minX = leftX;
            maxX = rightX;
            minY = topY;
            maxY = bottomY;
        } else {
            if (minX > leftX) {
                minX = leftX;
            }
            if (rightX > maxX) {
                maxX = rightX;
            }
            if (minY > topY) {
                minY = topY;
            }
            if (bottomY > maxY) {
                maxY = bottomY;
            }
        }

    });
    return {
        x: minX || 0,
        width: (maxX || 0) - (minX || 0),
        height: (maxY || 0) - (minY || 0),
        y: minY || 0
    }
}

export const groupBy = function(xs: Array<any>, key: string) {
    if (!xs || !Array.isArray(xs)) {
        return [];
    }
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


export const sumArr = function (arr: Array<any>, key: string) {
    return arr.reduce(function(total, element) {
        return total + element[key];
    }, 0);
}


export const getTextAttributesForRect = (x: number, y: number, width: number, height: number, fontSize = 20) => {
    return {
        top: {
            x: x + width / 2,
            y: y - 2,
            transform: ""
        },
        right: {
            x: x + width  + 2,
            y: y + height / 2,
            transform: `rotate(90, ${x + width  + 2}, ${y + height / 2})`
        },
        bottom: {
            x: x + width / 2,
            y: y + height + fontSize,
            transform: ""
        },
        left: {
            x: x -2,
            y: y + height / 2,
            transform: `rotate(-90, ${x-2}, ${y + height / 2})`
        }
    };
}

export const areaM = (x1: number, y1: number, x2: number, y2: number) => {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const area = width * height;
    if (area === Infinity) {
        return 0;
    }
    return ((area/* * DEFAULTS.centimeterPixelRatio*/) / 10000).toFixed(2);
}
