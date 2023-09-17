import {inputSides, inputTypes} from "@/app/itemInput";
import {useCallback, useEffect, useRef, useState} from "react";

const groupBy = function(xs, key) {
    if (!xs || !Array.isArray(xs)) {
        return [];
    }
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


const sumArr = function (arr, key) {
    return arr.reduce(function(total, element) {
        return total + element[key];
    }, 0);
}

export function SVGDesigner({ items, updateItemById, selectItem }) {
    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const [controllerSettings, setControllerSettings] = useState({
        maxColumn:0,
        minLength:0,
        maxLength:0,
        column: 0,
        min: 0,
        max: 0
    })
    const svg = useCallback(node => {
        if (node !== null) {
            setHeight(node.getBoundingClientRect().height);
            setWidth(node.getBoundingClientRect().width);
        }
    }, []);
    const range = useRef(null);
    const min = useRef(null);
    const max = useRef(null);

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
    const centimeterPixelRatio = 4;

    const columnSpacingX = Math.floor((height - baseY*2 - (data.vertical.length+1)*lineSize) / (data.vertical.length+1)); // space between columns
    const columnSpacingY = Math.floor((width - baseX*2 - (data.horizontal.length+1)*lineSize) / (data.horizontal.length+1)); // space between columns

    const selected = items.find(i=>i.selected);
    const refreshController = ()=>{
        setControllerSettings({
            maxColumn: Math.floor(Math.min(Math.max(sumArr(items, 'column') * 1.3, 100), 2000)),
            minLength: Math.floor(Math.min(Math.max(sumArr(items, 'minLength') * 1.3, 100), 2000)),
            maxLength: Math.floor(Math.min(Math.max(sumArr(items, 'maxLength') * 1.3, 100), 2000)),
            min: selected ? selected.minLength : 0,
            max: selected ? selected.maxLength : 0,
            column: selected ? selected.column : 0
        });
    }
    useEffect(()=>{
        refreshController();
    }, []);

    let currentRowY = baseY;
    const svgData = [];
    if(data.horizontal) {
        for (let row of data.horizontal) {
            let currentX = baseX;
            for (let item of row) {
                item.x = currentX;
                //item.y = currentRowY - lineSize / 2;
                item.y = (item.column / centimeterPixelRatio) + baseY - lineSize / 2;
                item.width =  (item.minLength / centimeterPixelRatio);
                item.height = lineSize;

                currentX += item.minLength / centimeterPixelRatio;
                svgData.push(item);
            }
            currentRowY += columnSpacingY;
        }
    }


    let currentColumnX = baseX;

    if (data.vertical) {
        for (let column of data.vertical) {
            let currentY = baseY; // start vertical lines below the horizontal ones
            for (let item of column) {
                //item.x = currentColumnX - lineSize / 2
                item.x = (item.column / centimeterPixelRatio)+baseX - lineSize / 2
                item.y = currentY
                item.width = lineSize;
                item.height = (item.minLength / centimeterPixelRatio);

                currentY += item.minLength / centimeterPixelRatio;
                svgData.push(item);
            }
            currentColumnX += columnSpacingX;
        }
    }

    function onSelectItem (item, index, event) {
        if (item.selected) {
            //setSelectedItem(null);
            selectItem({id: null});
        } else {
            range.current.value = item.column;
            min.current.value = item.minLength;
            max.current.value = item.maxLength;
            //setSelectedItem(item);
            selectItem(item);
        }

    }

    function changeRange() {
        const selectedItem = items.find(i=>i.selected);
        if (range.current && selectedItem) {
            const value = range.current.value;
            updateItemById(selectedItem.id, {
                column: Number(value)
            });
            if (Number(value) === controllerSettings.maxColumn) {
                refreshController();
            }
        }
    }
    function changeMin() {
        const selectedItem = items.find(i=>i.selected);
        if (min.current && selectedItem) {
            const value = min.current.value;
            updateItemById(selectedItem.id, {
                minLength: Number(value)
            });
            if (Number(value) === controllerSettings.minLength) {
                refreshController();
            }
        }
    }

    function changeMax() {
        const selectedItem = items.find(i=>i.selected);
        if (max.current && selectedItem && selectedItem.dropdown1 === inputTypes[0]) {
            const value = max.current.value;
            updateItemById(selectedItem.id, {
                maxLength: Number(value)
            });
            if (Number(value) === controllerSettings.maxLength) {
                refreshController();
            }
        }
    }

    return (
        <div style={{height: '100%', width: '100%'}}>
            <svg ref={svg} width={width} height={height} style={{height: 'calc(100% - 120px)'}}>
            {svgData.map((item, index)=>
                (<rect key={index} x={item.x} y={item.y} width={item.width} height={item.height}
                       fill={'white'} stroke={item.selected ? 'red' : 'black'} strokeWidth={1} onClick={(e)=>onSelectItem(item, index, e)}/>)
            )}
            </svg>
            <div className="controls flex flex-col">
                Offset <input ref={range} type="range" id="temp" name="temp" onChange={changeRange} min={0} max={controllerSettings.maxColumn}
            defaultValue={controllerSettings.column}/>
                Min <input ref={min} type="range" id="temp" name="temp" onChange={changeMin} min={0} max={controllerSettings.minLength}
            defaultValue={controllerSettings.min}/>
                Max <input ref={max} type="range" id="temp" name="temp" onChange={changeMax} min={0} max={controllerSettings.maxLength}
            defaultValue={controllerSettings.max}/>
            </div>
        </div>

    )
}
