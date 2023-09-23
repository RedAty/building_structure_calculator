import {DEFAULTS, inputSides, inputTypes} from "@/app/itemInput";
import {useEffect, useRef, useState} from "react";
import {getItemRectDimensions, groupBy, sumArr} from "@/app/lib/calculations";


export function SVGDesigner({ items, updateItemById, selectItem, absoluteEditor, squareMeterData }) {
    const [controllerSettings, setControllerSettings] = useState({
        maxColumn:100,
        minLength:100,
        maxLength:100,
        column: 0,
        min: 0,
        max: 0,
        row: 0,
        maxRow: 100
    })
    const svgParent = useRef(null);
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(540);

    const range = useRef(null);
    const rangeNumber = useRef(null);
    const min = useRef(null);
    const minNumber = useRef(null);
    const max = useRef(null);
    const maxNumber = useRef(null);
    const row = useRef(null);
    const rowNumber = useRef(null);

    const jsonData = groupBy(items, 'side');
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
    const baseX = DEFAULTS.baseX; // 10;  // start position for columns
    const baseY = DEFAULTS.baseY; //10;  // start position for rows
    const lineSize = DEFAULTS.lineSize; //4; // width of the rectangle representing the line
    const centimeterPixelRatio = DEFAULTS.centimeterPixelRatio;


    const columnSpacingX = Math.floor((height - baseY*2 - (data.vertical.length+1)*lineSize) / (data.vertical.length+1)); // space between columns
    const columnSpacingY = Math.floor((width - baseX*2 - (data.horizontal.length+1)*lineSize) / (data.horizontal.length+1)); // space between columns

    const selected = items.find(i=>i.selected);
    const maximums = Math.floor((Math.max(width, height) * centimeterPixelRatio)) || 1000;
    const refreshController = ()=>{
        setControllerSettings({
            maxColumn: Math.floor(Math.min(Math.max(sumArr(items, 'column') * 1.3, 100), maximums)) || maximums,
            minLength: Math.floor(Math.min(Math.max(sumArr(items, 'minLength') * 1.3, 100), maximums)) || maximums,
            maxLength: Math.floor(Math.min(Math.max(sumArr(items, 'maxLength') * 1.3, 100), maximums)) || maximums,
            min: selected ? selected.minLength : 0,
            max: selected ? selected.maxLength : 0,
            column: selected ? selected.column : 0,
            row: selected ? selected.row : 0,
            maxRow: Math.floor(Math.min(Math.max(sumArr(items, 'row') * 1.3, 100), maximums)) || maximums
        });
    }
    useEffect(() => {
        if (refreshController) {
            refreshController();
        }
        if (svgParent && svgParent.current && typeof svgParent.current.getBoundingClientRect === 'function') {
            const boundingClient = svgParent.current?.parentNode.getBoundingClientRect();
            setWidth(boundingClient.width);
            setHeight(boundingClient.height - 160);
        }
    }, []);


    let currentRowY = baseY;
    const svgData = [];
    if(data.horizontal) {
        for (let row of data.horizontal) {
            let currentX = baseX;
            for (let item of row) {
                if (absoluteEditor) {
                    item.x = (item.row / centimeterPixelRatio) + baseX - lineSize / 2;
                    //item.y = currentRowY - lineSize / 2;
                    item.y = (item.column / centimeterPixelRatio) + baseY - lineSize / 2;
                } else {
                    item.x = currentX;
                    //item.y = currentRowY - lineSize / 2;
                    item.y = (item.column / centimeterPixelRatio) + baseY - lineSize / 2;
                }

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
                if (absoluteEditor) {
                    item.x = (item.column / centimeterPixelRatio)+baseX - lineSize / 2
                    item.y = (item.row / centimeterPixelRatio)+baseY - lineSize / 2
                } else {
                    item.x = (item.column / centimeterPixelRatio)+baseX - lineSize / 2
                    item.y = currentY
                }

                item.width = lineSize;
                item.height = (item.minLength / centimeterPixelRatio);

                currentY += item.minLength / centimeterPixelRatio;
                svgData.push(item);
            }
            currentColumnX += columnSpacingX;
        }
    }

    const boundaryRect = getItemRectDimensions(items);

    function onSelectItem (item) {
        if (item.selected) {
            selectItem({id: null});
        } else {
            range.current.value = item.column;
            rangeNumber.current.value = item.column;
            min.current.value = item.minLength;
            minNumber.current.value = item.minLength;
            max.current.value = item.maxLength;
            maxNumber.current.value = item.maxLength;
            selectItem(item);
            refreshController();
        }

    }

    function changeRange() {
        const selectedItem = items.find(i=>i.selected);
        if (range.current && selectedItem) {
            const value = range.current.value;
            if (value !== rangeNumber.current.value) {
                rangeNumber.current.value = value;
            }
            updateItemById(selectedItem.id, {
                column: Number(value)
            });
            if (Number(value) === controllerSettings.maxColumn) {
                refreshController();
            }
        }
    }

    function changeRow() {
        const selectedItem = items.find(i=>i.selected);
        if (row.current && selectedItem) {
            const value = row.current.value;
            if (value !== rowNumber.current.value) {
                rowNumber.current.value = value;
            }
            updateItemById(selectedItem.id, {
                row: Number(value)
            });
            if (Number(value) === controllerSettings.maxRow) {
                refreshController();
            }
        }
    }

    function changeMin() {
        const selectedItem = items.find(i=>i.selected);
        if (min.current && selectedItem) {
            const value = min.current.value;
            if (value !== minNumber.current.value) {
                minNumber.current.value = value;
            }
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
        if (max.current && selectedItem && selectedItem.type === inputTypes[0]) {
            const value = max.current.value;
            if (value !== maxNumber.current.value) {
                maxNumber.current.value = value;
            }
            updateItemById(selectedItem.id, {
                maxLength: Number(value)
            });
            if (Number(value) === controllerSettings.maxLength) {
                refreshController();
            }
        }
    }

    function changeRangeNumber(e) {
        const selectedItem = items.find(i=>i.selected);
        if (range.current && selectedItem) {
            range.current.value = e.target.value;
            changeRange();
        }
    }

    function changeMinNumber(e) {
        const selectedItem = items.find(i=>i.selected);
        if (min.current && selectedItem) {
            min.current.value = e.target.value;
            changeMin();
        }
    }

    function changeMaxNumber(e) {
        const selectedItem = items.find(i=>i.selected);
        if (max.current && selectedItem) {
            max.current.value = e.target.value;
            changeMax();
        }
    }

    function changeRowNumber(e) {
        const selectedItem = items.find(i=>i.selected);
        if (row.current && selectedItem) {
            row.current.value = e.target.value;
            changeRow();
        }
    }
    return (
        <div ref={svgParent} style={{height: '100%', width: '100%'}}>
            <svg width={width} height={height} style={{height: 'calc(100% - 160px)'}}>
            {svgData.map((item, index)=>
                (<rect key={index} x={item.x} y={item.y} width={item.width} height={item.height}
                       fill={'white'} stroke={item.selected ? 'red' : 'black'} strokeWidth={1} onClick={(e)=>onSelectItem(item)}/>)
            )}
                <rect x={boundaryRect.x-baseX/2} y={boundaryRect.y-baseY/2}
                     width={boundaryRect.width + baseX}
                     height={boundaryRect.height + baseY*2}
                     stroke="lightgray" strokeWidth={1} fill="none"
                />
            </svg>
            <div className="controls flex flex-col">
                <div className="flex flex-row justify-between">Offset <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={rangeNumber} type="number" onChange={changeRangeNumber} defaultValue={controllerSettings.column}/></div>
                <input ref={range} type="range" onChange={changeRange} min={0} max={controllerSettings.maxColumn}
            defaultValue={controllerSettings.column}/>


                <div className={absoluteEditor ? 'flex flex-row justify-between' : 'hidden'}>Offset 2
                    <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={rowNumber} type="number" onChange={changeRowNumber} defaultValue={controllerSettings.row}/></div>
                <input className={absoluteEditor ? '' : 'hidden'} ref={row} type="range" onChange={changeRow} min={0} max={controllerSettings.maxRow}
                       defaultValue={controllerSettings.row}/>

                <div className="flex flex-row justify-between">Min <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={minNumber} type="number" onChange={changeMinNumber} defaultValue={controllerSettings.min}/></div>
                <input ref={min} type="range" onChange={changeMin} min={0} max={controllerSettings.minLength}
            defaultValue={controllerSettings.min}/>
                <div className="flex flex-row justify-between">Max <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={maxNumber} type="number" onChange={changeMaxNumber} defaultValue={controllerSettings.max}/></div>
                <input ref={max} type="range" onChange={changeMax} min={0} max={controllerSettings.maxLength}
            defaultValue={controllerSettings.max}/>
            </div>
        </div>

    )
}
