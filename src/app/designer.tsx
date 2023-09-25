import {DEFAULTS, inputSides, inputTypes} from "@/app/itemInput";
import {useEffect, useRef, useState} from "react";
import {
    convertFromCoordinate, convertToCoordinate,
    getItemRectDimensions,
    getTextAttributesForRect,
    groupBy,
    sumArr
} from "@/app/lib/calculations";
import {ItemType} from "@/app/types/Item";
import {
    BsDashSquare,
    BsFillArrowDownSquareFill,
    BsFillArrowLeftSquareFill, BsFillArrowRightSquareFill, BsFillArrowUpSquareFill,
    BsPlusSquare,
    BsXSquare, BsZoomIn, BsZoomOut
} from "react-icons/bs";

var selectedElement, offset, dragStarted, timeout;


export function SVGDesigner({ items, updateItemById, selectItem, calculatedData, isCalculatedOn,
                                deleteItem }) {
    const [controllerSettings, setControllerSettings] = useState({
        maxColumn:100,
        minLength:100,
        maxLength:100,
        column: 0,
        min: 0,
        max: 0,
        row: 0,
        maxRow: 100
    });
    const svgParent = useRef(null);
    const svg = useRef(null);
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(540);
    const [centimeterPixelRatio, setCentimeterPixelRatio] = useState(DEFAULTS.centimeterPixelRatio);

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
    const keys = {
        row: isCalculatedOn ? 'calculatedRow' : 'row',
        column: isCalculatedOn ? 'calculatedColumn' : 'column',
        minLength: isCalculatedOn ? 'calculated' : 'minLength',
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


    const columnSpacingX = Math.floor((height - baseY*2 - (data.vertical.length+1)*lineSize) / (data.vertical.length+1)); // space between columns
    const columnSpacingY = Math.floor((width - baseX*2 - (data.horizontal.length+1)*lineSize) / (data.horizontal.length+1)); // space between columns

    const selected = items.find(i=>i.selected);
    const maximums = Math.floor((Math.max(width, height) * centimeterPixelRatio)) || 1000;
    const refreshController = ()=>{
        setControllerSettings({
            maxColumn: Math.floor(Math.min(Math.max(sumArr(items, keys.column) * 1.3, 100), maximums)) || maximums,
            minLength: Math.floor(Math.min(Math.max(sumArr(items, keys.minLength) * 1.3, 100), maximums)) || maximums,
            maxLength: Math.floor(Math.min(Math.max(sumArr(items, 'maxLength') * 1.3, 100), maximums)) || maximums,
            min: selected ? selected.minLength : 0,
            max: selected ? selected.maxLength : 0,
            column: selected ? selected.column : 0,
            row: selected ? selected[keys.row] : 0,
            maxRow: Math.floor(Math.min(Math.max(sumArr(items, keys.row) * 1.3, 100), maximums)) || maximums
        });
    }
    useEffect(() => {
        if (refreshController) {
            refreshController();
        }
        if (svgParent && svgParent.current && typeof svgParent.current.getBoundingClientRect === 'function') {
            const boundingClient = svgParent.current?.getBoundingClientRect();
            setWidth(boundingClient.width - 10);
            setHeight(boundingClient.height - 10);
        }
    }, []);


    let currentRowY = baseY;
    const svgData = [];
    if(data.horizontal) {
        for (let row of data.horizontal) {
            let currentX = baseX;
            for (let item of row) {
                item.x = convertToCoordinate(item[keys.row], centimeterPixelRatio);
                item.y = convertToCoordinate(item[keys.column], centimeterPixelRatio);

                item.width =  (item[keys.minLength] / centimeterPixelRatio);
                item.height = lineSize;

                currentX += item[keys.minLength] / centimeterPixelRatio;
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
                item.x = convertToCoordinate(item[keys.column], centimeterPixelRatio);
                item.y = convertToCoordinate(item[keys.row], centimeterPixelRatio);

                item.width = lineSize;
                item.height = (item[keys.minLength] / centimeterPixelRatio);

                currentY += item[keys.minLength] / centimeterPixelRatio;
                svgData.push(item);
            }
            currentColumnX += columnSpacingX;
        }
    }

    const boundaryRect = getItemRectDimensions(items);
    const boundarySVGTexts = getTextAttributesForRect(
        boundaryRect.x-baseX/2,
        boundaryRect.y-baseY/2,
        boundaryRect.width + baseX,
        boundaryRect.height + baseY*2
    );

    function getMousePosition(evt) {
        const CTM = svg.current.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function startDrag(evt) {
        if (!isCalculatedOn && evt.target.classList.contains('draggable')) {
            const id = evt.target.getAttribute('id');
            if (timeout){
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                dragStarted = true;
                console.log('DragStarted');
            }, 350);
            selectedElement = items.find(i=>String(i.id) === String(id)) ? evt.target : null;
            if (selectedElement) {
                offset = getMousePosition(evt);
                offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
                offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
            }
        }
    }

    function drag(evt) {
        if (!isCalculatedOn && selectedElement && dragStarted) {
            evt.preventDefault();
            const coord = getMousePosition(evt);
            selectedElement.setAttributeNS(null, "x",  coord.x - offset.x);
            selectedElement.setAttributeNS(null, "y", coord.y - offset.y);
        }
    }

    function endDrag(evt) {
        if (timeout){
            clearTimeout(timeout);
        }
        timeout = setTimeout(()=>{
            dragStarted = false;
        }, 1000);
        if (!isCalculatedOn && selectedElement) {
            const id = selectedElement.getAttribute('id');
            const item = items.find(i=>String(i.id) === String(id)) as ItemType | null;
            if (item) {
                const x = parseInt(selectedElement.getAttributeNS(null, "x"));
                const y = parseInt(selectedElement.getAttributeNS(null, "y"));
                item.x = x;
                item.y = y;
                if (item.side === inputSides[0]) { // Horizontal
                    item.row = convertFromCoordinate(item.x, centimeterPixelRatio);
                    item.column = convertFromCoordinate(item.y, centimeterPixelRatio);
                } else if (item.side === inputSides[1]) { // Vertical
                    item.column = convertFromCoordinate(item.x, centimeterPixelRatio);
                    item.row = convertFromCoordinate(item.y, centimeterPixelRatio);
                }
                updateItemById(item.id, {
                    x: x,
                    y: y,
                    row: item.row,
                    column: item.column
                });
            }

        }
        selectedElement = null;
    }

    function onSelectItem (item) {
        if (dragStarted) {
            return;
        }
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

    function rotateItem(item, e) {
        if (e) {
            e.preventDefault();
        }
        if (item.selected) {
            updateItemById(item.id, {
                column: item.row,
                row: item.column,
                side: item.side === inputSides[0] ? inputSides[1] : inputSides[0],
            });
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

    function scaleItem(event) {
        const selectedItem = items.find(i=>i.selected);
        if (selectedItem) {
            if (event.deltaY > 0) {
                // Scrolling down
                updateItemById(selectedItem.id, {
                    minLength: selectedItem.minLength - DEFAULTS.zoomStep
                })
            } else if (event.deltaY < 0) {
                // Scrolling up
                updateItemById(selectedItem.id, {
                    minLength: selectedItem.minLength + DEFAULTS.zoomStep
                })
            }
        } else {
            // If no item selected we modify SVG Zooming
            if (event.deltaY > 0) {
                // Scrolling down
                setCentimeterPixelRatio(centimeterPixelRatio-1);
            } else if (event.deltaY < 0) {
                // Scrolling up
                setCentimeterPixelRatio(centimeterPixelRatio+1);
            }
        }
    }

    function deselectOnBackground(e) {
        if (e.target.tagName.toUpperCase() === 'SVG') {
            const selectedItem = items.find(i=>i.selected);
            if (selectedItem) {
                selectItem({id: null});
            }
        }
    }

    function deleteSelected() {
        const selectedItem = items.find(i=>i.selected);
        if (selectedItem) {
            deleteItem(selectedItem.id);
        }
    }

    function moveSelected(type: string) {
        const item = items.find(i=>i.selected);
        if (item) {
            switch (type) {
                case 'up':
                    if (item.side === inputSides[0]) { // Horizontal
                        item.column -= centimeterPixelRatio;
                    } else if (item.side === inputSides[1]) { // Vertical
                        item.row -= centimeterPixelRatio
                    }
                    updateItemById(item.id, {
                        column: item.column,
                        row: item.row
                    });
                    break;
                case 'down':
                    if (item.side === inputSides[0]) { // Horizontal
                        item.column += centimeterPixelRatio;
                    } else if (item.side === inputSides[1]) { // Vertical
                        item.row += centimeterPixelRatio
                    }
                    updateItemById(item.id, {
                        column: item.column,
                        row: item.row
                    });
                    break;
                case 'left':
                    if (item.side === inputSides[0]) { // Horizontal
                        item.row -= centimeterPixelRatio;
                    } else if (item.side === inputSides[1]) { // Vertical
                        item.column -= centimeterPixelRatio
                    }
                    updateItemById(item.id, {
                        column: item.column,
                        row: item.row
                    });
                    break;
                case 'right':
                    if (item.side === inputSides[0]) { // Horizontal
                        item.row += centimeterPixelRatio;
                    } else if (item.side === inputSides[1]) { // Vertical
                        item.column += centimeterPixelRatio
                    }
                    updateItemById(item.id, {
                        column: item.column,
                        row: item.row
                    });
                    break;
            }
        }
    }

    return (
        <div ref={svgParent} className="ml-2 mt-2 h-full w-full ">
            <div className="absolute flex flex-col right-0 mr-4 pr-1 pt-1 items-center">
                <button className={selected ? "mb-2 text-lg" : "mb-2 text-lg text-gray-200"}
                        onClick={()=>deleteSelected()}>
                    <BsXSquare />
                </button>

                <button className="mb-1 text-lg"
                        onClick={()=>setCentimeterPixelRatio(centimeterPixelRatio-1)}>
                    <BsZoomIn />
                </button>
                <button className="mb-1 text-lg"
                        onClick={()=>setCentimeterPixelRatio(centimeterPixelRatio+1)}>
                    <BsZoomOut />
                </button>

                <button className={selected ? "mb-1 text-lg mt-2" : "mb-1 text-lg mt-2 text-gray-200"}
                        onClick={()=>selected && scaleItem({deltaY: -1})}>
                    <BsPlusSquare />
                </button>
                <button className={selected ? "mb-1 text-lg" : "mb-1 text-lg text-gray-200"}
                        onClick={()=>selected && scaleItem({deltaY: 1})}>
                    <BsDashSquare />
                </button>
                <button className={selected ? "mb-1 text-lg" : "mb-1 text-lg text-gray-200"}
                        onClick={()=>moveSelected('up')}>
                    <BsFillArrowUpSquareFill />
                </button>
                <div className="button-group flex-row">
                    <button className={selected ? "mb-1 text-lg mr-0.5" : "mb-1 text-lg mr-0.5 text-gray-200"}
                            onClick={()=>moveSelected('left')}>
                        <BsFillArrowLeftSquareFill />
                    </button>
                    <button className={selected ? "mb-1 text-lg mr-0.5" : "mb-1 text-lg mr-0.5 text-gray-200"}
                            onClick={()=>moveSelected('down')}>
                        <BsFillArrowDownSquareFill />
                    </button>
                    <button className={selected ? "mb-1 text-lg" : "mb-1 text-lg text-gray-200"}
                            onClick={()=>moveSelected('right')}>
                        <BsFillArrowRightSquareFill />
                    </button>
                </div>
            </div>
            <svg ref={svg} width={width} height={height} className="h-full bg-gray-50 w-full" style={{/*height: 'calc(100% - 160px)'*/}}
            onMouseDown={startDrag}
            onMouseMove={drag}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onWheel={scaleItem}
            onClick={deselectOnBackground}
            >
                <g transform={'translate(19,19)'}>
                    {svgData.map((item, index)=>
                        (<rect id={item.id} className="draggable" key={index} x={item.x} y={item.y} width={item.width} height={item.height}
                               fill={'white'} stroke={item.selected ? 'red' : 'black'} strokeWidth={1}
                               onClick={()=>onSelectItem(item)}
                                onContextMenu={(e)=>rotateItem(item, e)}
                        />)
                    )}
                    {svgData.length > 1 && (<rect x={boundaryRect.x-baseX/2} y={boundaryRect.y-baseY/2}
                                             width={boundaryRect.width + baseX}
                                             height={boundaryRect.height + baseY}
                                             stroke="#bebebe" strokeWidth={1} fill="none"
                    />)}

                    {svgData.length > 1 ? (
                        <g className="pointer-events-none" style={{userSelect: "none"}}>
                            <text className="pointer-events-none" style={{userSelect: "none"}}
                                x={boundarySVGTexts.top.x}
                                y={boundarySVGTexts.top.y}
                                transform={boundarySVGTexts.top.transform}
                                fill="#bebebe"
                            >{isCalculatedOn ? calculatedData.calculatedWidth || calculatedData.width : calculatedData.width}</text>
                            <text className="pointer-events-none" style={{userSelect: "none"}}
                                x={boundarySVGTexts.bottom.x}
                                y={boundarySVGTexts.bottom.y}
                                transform={boundarySVGTexts.bottom.transform} fill="#bebebe"
                            >{isCalculatedOn ? calculatedData.calculatedWidth || calculatedData.width : calculatedData.width}</text>
                            <text className="pointer-events-none" style={{userSelect: "none"}}
                                x={boundarySVGTexts.right.x}
                                y={boundarySVGTexts.right.y}
                                transform={boundarySVGTexts.right.transform} fill="#bebebe"
                            >{isCalculatedOn ? calculatedData.calculatedHeight || calculatedData.height : calculatedData.height}</text>
                            <text className="pointer-events-none" style={{userSelect: "none"}}
                                x={boundarySVGTexts.left.x}
                                y={boundarySVGTexts.left.y}
                                transform={boundarySVGTexts.left.transform} fill="#bebebe"
                            >{isCalculatedOn ? calculatedData.calculatedHeight || calculatedData.height : calculatedData.height}</text>
                        </g>
                    ): (<g />)}

                </g>

            </svg>
            <div className={isCalculatedOn ? "hidden" : "controls flex flex-col"} style={{display: 'none'}}>
                <div className="flex flex-row justify-between">Offset <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={rangeNumber} type="number" onChange={changeRangeNumber} defaultValue={controllerSettings.column}/></div>
                <input ref={range} type="range" onChange={changeRange} min={0} max={controllerSettings.maxColumn}
            defaultValue={controllerSettings.column}/>


                <div className="flex flex-row justify-between">Offset 2
                    <input className="max-w-[100px] border border-gray-300 text-gray-900 text-sm rounded-lg" ref={rowNumber} type="number" onChange={changeRowNumber} defaultValue={controllerSettings.row}/></div>
                <input ref={row} type="range" onChange={changeRow} min={0} max={controllerSettings.maxRow}
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
