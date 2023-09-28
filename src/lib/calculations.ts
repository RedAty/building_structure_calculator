import {CalculationData, ItemBoundary, ItemType, RectBoundary, TypeKeys} from "@/types/Item";
import {DEFAULTS, INPUT_SIDES, INPUT_TYPES} from "@/lib/constants";

export const getItemBoundariesInCM = (items: ItemType[], key : 'calculated'|'minLength'|'maxLength' = 'minLength',
                                      column = 'column', row = 'row'): ItemBoundary => {
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
        if (type === INPUT_SIDES[0]) { // Horizontal
            leftX = item[row];
            rightX = item[row] + (item[key] === undefined ? item[fallbackKey] : item[key]);
            topY = item[column];
            bottomY = item[column];
        } else if (type === INPUT_SIDES[1]) { // Vertical
            leftX = item[column];
            rightX = item[column];
            topY = item[row];
            bottomY = item[row] + (item[key] === undefined ? item[fallbackKey] : item[key]);
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
        if (type === INPUT_SIDES[0]) { // Horizontal
            leftX = item.x;
            rightX = item.x + item.width
            topY = item.y;
            bottomY = item.y;
        } else if (type === INPUT_SIDES[1]) { // Vertical
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

export const groupBy = (xs: Array<any>, key: string) => {
    if (!xs || !Array.isArray(xs)) {
        return [];
    }
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

export const sumArr = (arr: Array<any>, key: string) => {
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

export const areaM = (x1: number, y1: number, x2: number, y2: number): Number => {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const area = width * height;
    if (area === Infinity) {
        return 0;
    }
    return Number((area / 10000).toFixed(2));
}

export const convertToCoordinate = (data: number, centimeterPixelRatio = DEFAULTS.centimeterPixelRatio) => {
    const base = DEFAULTS.baseX || 10;
    return Math.round((data / centimeterPixelRatio) + base - DEFAULTS.lineSize / 2);
}

export const convertFromCoordinate = (data: number, centimeterPixelRatio = DEFAULTS.centimeterPixelRatio) => {
    const base = DEFAULTS.baseX || 10;

    return Math.round(((data + DEFAULTS.lineSize / 2) - base) * centimeterPixelRatio);
}

export const toFixedNumber = (num: number) => {
    return Number(num.toFixed(2));
}

export const increaseRunningRatio = (arr: ItemType[], calculatedData: CalculationData, keys: TypeKeys) => {
    // TODO: It handles every vertical and horizontal lines like they are one big line
    const horizontal = arr.filter(item=>item.side === INPUT_SIDES[0]);
    const vertical = arr.filter(item=>item.side === INPUT_SIDES[1]);

    const initialHorizontal = Math.min(...horizontal.map(i => i[keys.row] as number));
    const initialVertical = Math.min(...vertical.map(i => i[keys.column] as number));
console.log(horizontal)
console.log(vertical)
console.log(initialHorizontal)
console.log(initialVertical)
    const currentTotalWidth = horizontal.reduce((acc, obj) => acc + obj[keys.minLength], 0);
    const currentTotalHeight = vertical.reduce((acc, obj) => acc + obj[keys.minLength], 0);

    const totalHorizontalGaps = horizontal.slice(0, -1).reduce((acc, obj, index) => {
        return acc + (arr[index + 1][keys.row] - (obj[keys.row] + obj[keys.minLength]));
    }, 0);
    const totalVerticalGaps = vertical.slice(0, -1).reduce((acc, obj, index) => {
        return acc + (arr[index + 1][keys.column] - (obj[keys.column] + obj[keys.minLength]));
    }, 0);

    const fixedWidthsTotal = horizontal
        .reduce((acc, obj) => obj.type === INPUT_TYPES[1] ? acc + obj[keys.minLength] : acc, 0);
    const fixedHeightsTotal = vertical
        .reduce((acc, obj) => obj.type === INPUT_TYPES[1] ? acc + obj[keys.minLength] : acc, 0);

    const widthScalingRatio = (currentTotalWidth - fixedWidthsTotal) ?
        (calculatedData.calculatedHeight - fixedWidthsTotal - totalHorizontalGaps) / (currentTotalWidth - fixedWidthsTotal) : 1;
    const heightScalingRatio = (currentTotalHeight - fixedHeightsTotal) ?
        (calculatedData.calculatedHeight - fixedHeightsTotal - totalVerticalGaps) / (currentTotalHeight - fixedHeightsTotal) : 1;
console.log(widthScalingRatio, fixedWidthsTotal, totalHorizontalGaps, currentTotalWidth);
console.log(heightScalingRatio, fixedHeightsTotal, totalVerticalGaps, currentTotalHeight, calculatedData.height);
    let runningX = 0;
    let runningY = 0;

    arr.forEach((obj, index) => {
        let length = obj[keys.minLength] as number;
        const fix = obj.type === INPUT_TYPES[1];

        // Scale width if not fixed
        if (obj.side === INPUT_SIDES[0]) {
            if (!fix) {
                length *= widthScalingRatio;
            }
            obj.calculatedRow = runningX;
            obj.calculated = toFixedNumber(length);
            runningX += length;

            // Adjust the position for next object based on gaps
            if (index < arr.length - 1) {
                const currentGap = arr[index + 1][keys.row] - (obj[keys.row] + obj[keys.minLength]);
                runningX += currentGap;
            }
            if (typeof calculatedData.ratioHeight !== 'number') {
                calculatedData.ratioHeight = 1;
            }
            obj.calculatedColumn = toFixedNumber(obj.column * calculatedData.ratioHeight);

        } else {
            if (!fix) {
                length *= heightScalingRatio;
            }
            //obj.calculatedColumn = runningY;
            obj.calculated = toFixedNumber(length);
            runningY += length;

            if (index < arr.length - 1) {
                const currentGap = arr[index + 1][keys.column] - (obj[keys.column] + obj[keys.minLength]);
                runningY += currentGap;
            }
            obj.calculatedRow = toFixedNumber(obj.row * calculatedData.ratioWidth);
        }

        return obj;
    });
    return arr;
}
