import {inputSides} from "@/app/itemInput";
import {useCallback, useState} from "react";

const groupBy = function(xs, key) {
    if (!xs || !Array.isArray(xs)) {
        return [];
    }
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

export function SVGDesigner({ items }) {
    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const svg = useCallback(node => {
        if (node !== null) {
            setHeight(node.getBoundingClientRect().height);
            setWidth(node.getBoundingClientRect().width);
        }
    }, []);

    const jsonData = groupBy(items, 'dropdown2');
    const data= {
        horizontal: [],
        vertical: []
    }
    let groupedColumns = groupBy(jsonData[inputSides[0]], 'column');
    for(const item in groupedColumns) {
        data.horizontal.push(groupedColumns[item]);
    }
    groupedColumns = groupBy(jsonData[inputSides[1]], 'column');
    for(const item in groupedColumns) {
        data.vertical.push(groupedColumns[item]);
    }
    const baseX = 10;  // start position for columns
    const baseY = 10;  // start position for rows
    const lineSize = 4; // width of the rectangle representing the line

    const columnSpacingX = Math.floor((height - baseY*2 - (data.vertical.length+1)*lineSize) / (data.vertical.length+1)); // space between columns
    const columnSpacingY = Math.floor((width - baseX*2 - (data.horizontal.length+1)*lineSize) / (data.horizontal.length+1)); // space between columns

    let currentRowY = baseY;
    console.log(data);
    console.log(columnSpacingX);
    console.log(columnSpacingY);
    const svgData = [];
    if(data.horizontal) {
        for (let row of data.horizontal) {
            let currentX = baseX;
            for (let item of row) {
                item.x = currentX;
                item.y = currentRowY - lineSize / 2;
                item.width =  item.minLength;
                item.height = lineSize;

                currentX += item.minLength;
                svgData.push(item);
            }
            currentRowY += columnSpacingY;
        }
    }


    let currentColumnX = baseX;

    if (data.vertical) {
        for (let column of data.vertical) {
            let currentY = baseY; // start vertical lines below the horizontal ones
            console.log(column);
            for (let item of column) {
                item.x = currentColumnX - lineSize / 2
                item.y = currentY
                item.width = lineSize;
                item.height = item.minLength;

                currentY += item.minLength;
                svgData.push(item);
            }
            currentColumnX += columnSpacingX;
        }
    }

    return (
        <svg ref={svg} width={width} height={height} style={{height: '100%'}}>
            {svgData.map(item=>
                (<rect x={item.x} y={item.y} width={item.width} height={item.height}
                fill={'white'} stroke={'black'} strokeWidth={1}/>)
            )}
        </svg>
    )
}
