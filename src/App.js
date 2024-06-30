import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GRID_COLS,
  GRID_ROWS,
  GridNode,
  GridNodeModes,
  DropdownMenu,
  CustomButton,
  CustomSlider,
  CustomTextButton,
} from "./Widgets";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Djikstra, AStar, DFS, PrimsAlgorithm, BellmanFord } from "./Algorithms";

function App() {
  const [grid, setGrid] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState("Djikstra");
  const [currentlyDragging, setCurrentlyDragging] = useState(undefined);
  const [curStart, setCurStart] = useState(undefined);
  const [curEnd, setCurEnd] = useState(undefined);

  // We have to use refs since we are using these values
  // inside the algorithms and they change from the parent component
  const [isVisualizing, setIsVisualizing] = useState(false);
  const isVisualizingRef = useRef(isVisualizing);

  const [vizSpeed, changeVizSpeed] = useState(100);
  const vizSpeedRef = useRef(vizSpeed);

  const [hasPathNodes, setHasPathNodes] = useState(false);

  const handleVisualize = async (e) => {
    if (isVisualizingRef.current) {
      setIsVisualizing(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (hasPathNodes) {
      initGridDefaultState();
      setHasPathNodes(false);
      // Small sleep for state waiting for state update
      // This is annoying way to do this, but other way would be to use
      // Another ref as abort signal
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsVisualizing(true);
  };

  useEffect(() => {
    isVisualizingRef.current = isVisualizing;
    const visualize = async () => {
      if (isVisualizing) {
        setHasPathNodes(true);
        if(selectedAlgo === "Djikstra")
        {
          await Djikstra(
            grid, curStart, curEnd,
            visualization_callback_batch, isVisualizingRef, vizSpeedRef
          ).then(
            (shortest_path) => {
              if(shortest_path != curEnd)
                visualize_shortest_path(shortest_path);
          });
        }
        else if(selectedAlgo === "A*")
        {
          await AStar(
            grid, curStart, curEnd,
            visualization_callback_batch, isVisualizingRef, vizSpeedRef
          ).then(
            (shortest_path) => {
              if(shortest_path != curEnd)
                visualize_shortest_path(shortest_path);
          });
        }
        else if(selectedAlgo === "Depth-First Search")
        {
          await DFS(
            grid, curStart, curEnd,
            visualization_callback_batch, isVisualizingRef, vizSpeedRef
          ).then(
            (path) => {
              if(path && path[path.length - 1] == curEnd)
                visualize_shortest_path(path);
          });
        }
        else if(selectedAlgo === "Prim's Algorithm")
        {
          // Wall generation algo
          await PrimsAlgorithm(
            grid, curStart, curEnd,
            visualization_callback_batch, isVisualizingRef, vizSpeedRef
          );
        }
        //TODO:: Implement negative weights (POWER-UPS)
        else if(selectedAlgo === "Bellman-Ford")
        {
          await BellmanFord(
            grid, curStart, curEnd,
            visualization_callback_batch, isVisualizingRef, vizSpeedRef
          ).then(
            (shortest_path) => {
              if(shortest_path != curEnd)
                visualize_shortest_path(shortest_path);
          });
        }
      }
      setIsVisualizing(false);
    };

    visualize();
  }, [isVisualizing]);

  useEffect(() => {
    vizSpeedRef.current = vizSpeed;
  }, [vizSpeed]);

  const visualization_callback_batch = async (node_indices, node_distances) => {
    let node_modes = [];

    for (let i = 0; i < node_indices.length; i++)
      node_modes.push(GridNodeModes.WEIGHTED);

    updateGridByIdx(node_indices, node_modes, node_distances);
  };

  const visualize_shortest_path = (shortest_path) => {
      if (!shortest_path)
        return;

      // Visualize the shortest path
      let node_modes = new Array(shortest_path.length).fill(
        GridNodeModes.PATH
      );

      for (const [i, node] of shortest_path.entries()) {
          if (node == curStart)
            node_modes[i] = GridNodeModes.PATH_START;
          else if (node == curEnd)
            node_modes[i] = GridNodeModes.PATH_END;
      }
    updateGridByIdx(shortest_path, node_modes);
  }

  const handleDragStart = (e, obj) => {
    if (isVisualizing || hasPathNodes) initGridDefaultState();

    if (!currentlyDragging) setCurrentlyDragging(obj);
  };

  const handleDragEnd = (e, obj) => {
    setCurrentlyDragging(undefined);
  };

  const handleClick = (e, obj) => {
    if (isVisualizing || hasPathNodes) initGridDefaultState();

    if (obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
      return;

    if (obj.mode === GridNodeModes.WALL)
      updateGridByIdx(obj.idx, GridNodeModes.NEUTRAL);

    if (obj.mode === GridNodeModes.NEUTRAL)
      updateGridByIdx(obj.idx, GridNodeModes.WALL);
  };

  const handleOnMouseEnter = (e, obj) => {
    if (currentlyDragging !== undefined) {
      if (
        currentlyDragging.mode === GridNodeModes.START ||
        currentlyDragging.mode === GridNodeModes.PATH_START
      ) {
        // If we have landed on end node, skip this
        if (obj.mode === GridNodeModes.END) return;

        // Take the previous start value and pass it to the updateGridByIdx func
        setCurStart((prevCurStart) => {
          updateGridByIdx(
            obj.idx,
            GridNodeModes.START,
            undefined,
            prevCurStart
          );
          return obj.idx;
        });
      } else if (
        currentlyDragging.mode === GridNodeModes.END ||
        currentlyDragging.mode === GridNodeModes.PATH_END
      ) {
        // If we have landed on start node, skip this
        if (obj.mode === GridNodeModes.START) return;

        setCurEnd((prevCurEnd) => {
          updateGridByIdx(obj.idx, GridNodeModes.END, undefined, prevCurEnd);
          return obj.idx;
        });
      } else if (
        currentlyDragging.mode === GridNodeModes.NEUTRAL ||
        currentlyDragging.mode === GridNodeModes.WEIGHTED ||
        currentlyDragging.mode === GridNodeModes.PATH
      ) {
        if (obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
          return;

        updateGridByIdx(obj.idx, GridNodeModes.WALL);
      } else if (currentlyDragging.mode === GridNodeModes.WALL) {
        if (obj.mode === GridNodeModes.START || obj.mode === GridNodeModes.END)
          return;

        updateGridByIdx(obj.idx, GridNodeModes.NEUTRAL);
      }
    }
  };

  // NOTE:: The weights are the distances array, and it is expected to be length GRID_ROWS * GRID_COLS
  // It wastes more space but its more speed efficient
  const updateGridByIdx = useCallback(
    (indices, modes, weights = undefined, prevStartOrEnd = undefined) => {
      if (!Array.isArray(indices) && !Array.isArray(modes)) {
        indices = [indices];
        modes = [modes];
        if (weights && !Array.isArray(weights)) weights = [weights];
      }

      // Take a shallow copy of the grid, and change the node's mode and it's reference
      // To inform react of the state array's change
      setGrid((prevGrid) => {
        // Create a shallow copy of the grid
        const newGrid = prevGrid.map((row) => [...row]);
        for (const [i, node_idx] of indices.entries()) {
          const row_idx = Math.floor(node_idx / GRID_COLS);
          const col_idx = node_idx % GRID_COLS;

          const curWeight = newGrid[row_idx][col_idx].weight;

          const newMode = modes[i];

          if (
            newMode === GridNodeModes.START ||
            newMode === GridNodeModes.END
          ) {
            if (prevStartOrEnd) {
              const prevRowIdx = Math.floor(prevStartOrEnd / GRID_COLS);
              const prevColIdx = prevStartOrEnd % GRID_COLS;

              newGrid[prevRowIdx][prevColIdx] = {
                ...newGrid[prevRowIdx][prevColIdx],
                mode: GridNodeModes.NEUTRAL,
                weight: weights ? weights[prevStartOrEnd] : curWeight,
              };
            }
          }

          newGrid[row_idx][col_idx] = {
            ...newGrid[row_idx][col_idx],
            mode: newMode,
            weight: weights ? weights[node_idx] : curWeight,
          };
        }

        return newGrid;
      });
    },
    []
  );

  const initGridDefaultState = (reset = false) => {
    setIsVisualizing(false);
    setHasPathNodes(false);
    // Make a 2d grid of JS objects
    let tempGrid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
      let tempRow = [];
      for (let j = 0; j < GRID_COLS; j++) {
        let mode = GridNodeModes.NEUTRAL;

        const curIdx = i * GRID_COLS + j;

        if (!reset) {
          if (curStart == curIdx) {
            mode = GridNodeModes.START;
          } else if (curEnd == curIdx) {
            mode = GridNodeModes.END;
          } else if (
            i < grid.length &&
            j < grid[i].length &&
            grid[i][j].mode == GridNodeModes.WALL
          ) {
            mode = GridNodeModes.WALL;
          }
        } else {
          if (i === GRID_ROWS / 2 && j === 10) {
            mode = GridNodeModes.START;
            setCurStart(i * GRID_COLS + j);
          } else if (i === GRID_ROWS / 2 && j === 40) {
            mode = GridNodeModes.END;
            setCurEnd(i * GRID_COLS + j);
          }
        }

        tempRow.push({
          idx: i * GRID_COLS + j,
          mode: mode,
          weight: 0,
        });
      }
      tempGrid.push(tempRow);
    }

    setGrid(tempGrid);
  };

  useEffect(() => {
    initGridDefaultState(true);
  }, []);

  return (
    <div className="App">
      <div className="navbar">
        <div style={{ fontSize: "24px", color: "white" }}>
          Pathfinding visualizer
        </div>
        <DropdownMenu
          title={"Algorithms"}
          items={[
            "Djikstra",
            "A*",
            "Depth-First Search",
          ]}
          selectItemCallback={setSelectedAlgo}
        />
        <DropdownMenu
          title={"Patterns & Mazes"}
          items={["Prim's Algorithm", "Stair pattern", "Recursive division"]}
          selectItemCallback={setSelectedAlgo}
        />
        <CustomButton
          title={`Visualize ${selectedAlgo}`}
          callback={handleVisualize}
        />
        <CustomTextButton
          title={"Reset board"}
          callback={() => initGridDefaultState(true)}
        />
        <CustomTextButton
          title={"Clear walls"}
          callback={() => console.log("Board cleared")}
        />
        <CustomSlider
          title={"Speed"}
          range={[1, 100]}
          callback={changeVizSpeed}
        />
      </div>
      <div className="infosection">
        <div className="infosection-item">
          <div
            className="bi bi-caret-right"
            style={{ fontSize: "2rem", marginRight: "10px" }}
          />
          <div style={{ fontSize: "1.1rem" }}>Start</div>
        </div>

        <div className="infosection-item">
          <div
            className="bi bi-bullseye"
            style={{ fontSize: "1.5rem", marginRight: "10px" }}
          />
          <div style={{ fontSize: "1.1rem" }}>End</div>
        </div>

        <div className="infosection-item">
          <div
            className="wall-node"
            style={{
              minWidth: "25px",
              minHeight: "25px",
              marginRight: "10px",
              borderRadius: "2px",
            }}
          />
          <div style={{ fontSize: "1.1rem" }}>Wall</div>
        </div>

        <div className="infosection-item">
          <div
            className="grid-column-neutral"
            style={{
              minWidth: "25px",
              minHeight: "25px",
              marginRight: "10px",
              borderRadius: "2px",
            }}
          />
          <div style={{ fontSize: "1.1rem" }}>Unvisited node</div>
        </div>

        <div className="infosection-item">
          <div
            className="path-node"
            style={{
              minWidth: "25px",
              minHeight: "25px",
              marginRight: "10px",
              borderRadius: "2px",
            }}
          />
          <div style={{ fontSize: "1.1rem" }}>Path</div>
        </div>

        <div className="infosection-item">
          <div
            className="visited-node-info-section"
            style={{
              minWidth: "25px",
              minHeight: "25px",
              marginRight: "10px",
              borderRadius: "2px",
            }}
          />
          <div style={{ fontSize: "1.1rem" }}>Visited node</div>
        </div>
      </div>
      <div className="grid-container" onMouseLeave={handleDragEnd}>
        {grid.map((row, idx) => (
          <div key={idx} className="grid-row">
            {row.map((node) => (
              <GridNode
                key={node.id}
                nodeObj={node}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onMouseEnter={handleOnMouseEnter}
                onClick={handleClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
