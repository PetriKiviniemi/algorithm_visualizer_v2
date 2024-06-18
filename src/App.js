import React, {useState, useEffect, useCallback} from 'react';
import { GRID_COLS, GRID_ROWS, GridNode,
         GridNodeModes, DropdownMenu, CustomButton,
         CustomSlider, CustomTextButton } from './Widgets';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Djikstra } from './Algorithms';

function App() {
  const [grid, setGrid] = useState([])
  const [selectedAlgo, setSelectedAlgo] = useState("Djikstra")
  const [vizSpeed, changeVizSpeed] = useState(100)
  const [currentlyDragging, setCurrentlyDragging] = useState(undefined)
  const [curStart, setCurStart] = useState(undefined)
  const [curEnd, setCurEnd] = useState(undefined)
  const [isVisualizing, setIsVisualizing] = useState(false)

  const handleVisualize = (e) => {
    setIsVisualizing(true)
  }

  useEffect(() => {
    if(isVisualizing)
    {
      if (selectedAlgo === "Djikstra")
      {
        Djikstra(grid, curStart, curEnd, visualization_callback)
      }
    }
    setIsVisualizing(false)
  }, [isVisualizing])

  const visualization_callback = (node_idx, node_dist) => {
    updateGridByIdx(node_idx, GridNodeModes.WEIGHTED, node_dist)
  }

  const handleDragStart = (e, obj) => {
    // Prevent asynchronous bugs where the dragging is resetted
    if(!currentlyDragging)
      setCurrentlyDragging(obj)
  };

  const handleDragEnd = (e, obj) => {
    setCurrentlyDragging(undefined)
  }

  const handleClick = (e, obj) => {
    if(obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
      return

    if(obj.mode === GridNodeModes.WALL)
      updateGridByIdx(obj.idx, GridNodeModes.NEUTRAL);

    if(obj.mode === GridNodeModes.NEUTRAL)
      updateGridByIdx(obj.idx, GridNodeModes.WALL);
  }

  const handleOnMouseEnter = (e, obj) => {
    if(currentlyDragging !== undefined)
    {
      if(currentlyDragging.mode === GridNodeModes.START)
      {
        // If we have landed on end node, skip this
        if(obj.mode === GridNodeModes.END)
          return

        // Take the previous start value and pass it to the updateGridByIdx func
        setCurStart(prevCurStart => {
          updateGridByIdx(obj.idx, GridNodeModes.START, prevCurStart);
          return obj.idx;
        });
      }
      else if(currentlyDragging.mode === GridNodeModes.END)
      {
        // If we have landed on start node, skip this
        if(obj.mode === GridNodeModes.START)
          return

        setCurEnd(prevCurEnd => {
          updateGridByIdx(obj.idx, GridNodeModes.END, prevCurEnd);
          return obj.idx;
        });
      }
      else if(currentlyDragging.mode === GridNodeModes.NEUTRAL)
      {
        if(obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
          return

        updateGridByIdx(obj.idx, GridNodeModes.WALL);
      }
      else if(currentlyDragging.mode === GridNodeModes.WALL)
      {
        if(obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
          return

        updateGridByIdx(obj.idx, GridNodeModes.NEUTRAL);
      }
    }
  }

  const updateGridByIdx = useCallback((idx, newMode, weight = undefined, prevStartOrEnd = undefined) => {
    const row_idx = Math.floor(idx / GRID_COLS);
    const col_idx = idx % GRID_COLS;

    // Take a shallow copy of the grid, and change the node's mode and it's reference
    // To inform react of the state array's change
    setGrid(prevGrid => {
      // Create a shallow copy of the grid
      const newGrid = prevGrid.map(row => [...row]);
      const curWeight = newGrid[row_idx][col_idx].weight

      if (newMode === GridNodeModes.START || newMode === GridNodeModes.END) {
        if (prevStartOrEnd) {
          const prevRowIdx = Math.floor(prevStartOrEnd/ GRID_COLS);
          const prevColIdx = prevStartOrEnd % GRID_COLS;

          newGrid[prevRowIdx][prevColIdx] = {
            ...newGrid[prevRowIdx][prevColIdx],
            mode: GridNodeModes.NEUTRAL,
            weight: weight ? weight : curWeight 
          };
        }
      }

    newGrid[row_idx][col_idx] = {
      ...newGrid[row_idx][col_idx],
      mode: newMode,
      weight: weight ? weight : curWeight 
    };

    return newGrid;
  });

  }, []);

  const initGridDefaultState = () => {
    // Make a 2d grid of JS objects
    let tempGrid = []
    for(let i = 0; i < GRID_ROWS; i++)
    {
      let tempRow = []
      for(let j = 0; j < GRID_COLS; j++)
      {
        let mode = GridNodeModes.NEUTRAL
        if(i === GRID_ROWS/2 && j === 10)
        {
          mode = GridNodeModes.START
          setCurStart(i * GRID_COLS + j)
        }
        else if(i === GRID_ROWS/2 && j === 40)
        {
          mode = GridNodeModes.END
          setCurEnd(i * GRID_COLS + j)
        }

        tempRow.push({
          idx: i * GRID_COLS + j,
          mode: mode,
          weight: 0,
        })
      }
      tempGrid.push(tempRow)
    }

    setGrid(tempGrid)
  }


  useEffect(() => {
    initGridDefaultState()
  }, [])

  return (
    <div className="App">
      <div className="navbar">
        <div style={{'fontSize': '24px', 'color': 'white'}}>Pathfinding visualizer</div>
        <DropdownMenu title={"Algorithms"} items={['Djikstra', 'A*', 'Breadth-first Search', 'Depth-first Search']}/>
        <DropdownMenu title={"Patterns & Mazes"} items={["Prim's algorithm", 'Stair pattern', 'Recursive division']}/>
        <CustomButton title={`Visualize ${selectedAlgo}`} callback={handleVisualize}/>
        <CustomTextButton title={"Reset board"} callback={() => initGridDefaultState()}/>
        <CustomTextButton title={"Clear walls"} callback={() => console.log("Board cleared")}/>
        <CustomTextButton title={"Clear path"} callback={() => console.log("Board cleared")}/>
        <CustomSlider title={"Speed"} range={[0, 100]} callback={changeVizSpeed}/>
      </div>
      <div className="infosection">

        <div className="infosection-item">
          <div className="bi bi-caret-right" style={{'fontSize': '2rem', 'marginRight': '10px'}}/>
          <div style={{'fontSize': '1.1rem'}}>Start</div>
        </div>

        <div className="infosection-item">
          <div className="bi bi-bullseye" style={{'fontSize': '1.5rem', 'marginRight': '10px'}}/>
          <div style={{'fontSize': '1.1rem'}}>End</div>
        </div>

        <div className="infosection-item">
          <div className="wall-node" 
            style={{
              'minWidth': '25px',
              'minHeight': '25px',
              'marginRight': '10px',
              'borderRadius': '2px'
            }}
          />
          <div style={{'fontSize': '1.1rem'}}>Wall</div>
        </div>

        <div className="infosection-item">
          <div className="grid-column-neutral"
            style={{
              'minWidth': '25px',
              'minHeight': '25px',
              'marginRight': '10px',
              'borderRadius': '2px'
            }}
           />
          <div style={{'fontSize': '1.1rem'}}>Unvisited node</div>
        </div>

        <div className="infosection-item">
          <div className="path-node" 
            style={{
              'minWidth': '25px',
              'minHeight': '25px',
              'marginRight': '10px',
              'borderRadius': '2px'
            }}
            />
          <div style={{'fontSize': '1.1rem'}}>Path</div>
        </div>

        <div className="infosection-item">
          <div className="visited-node-info-section" 
            style={{
              'minWidth': '25px',
              'minHeight': '25px',
              'marginRight': '10px',
              'borderRadius': '2px'
            }}
            />
          <div style={{'fontSize': '1.1rem'}}>Visited node</div>
        </div>


      </div>
      <div className="grid-container">
        {grid.map((row, idx) => 
          <div key={idx} className="grid-row">
            {
              row.map((node) => 
                <GridNode 
                  key={node.id}
                  nodeObj={node}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleOnMouseEnter}
                  onClick={handleClick}
                />
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
