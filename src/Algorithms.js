import { useEffect } from "react";
import { GridNode, GridNodeModes, GRID_COLS, GRID_ROWS, sleep } from "./Widgets";

class QElement {
    constructor(idx, priority)
    {
        this.idx = idx;
        this.priority = priority;
    }
}

class PriorityQueue {

    constructor()
    {
        this.items = [];
    }

    enqueue(element, priority) {
        let qElem = new QElement(element, priority)
        let contain = false

        for (let i = 0; i < this.items.lenght; i++)
        {
            if(this.items[i].idx === element)
            {
                if(this.items[i].priority > qElem.priority) {
                    this.items[i].priority = qElem.priority 
                }
                contain = true;
                break;
            }
        }

        if(!contain)
        {
            this.items.push(qElem)
            this.items.sort((a, b) => a.priority - b.priority); // Sort by priority
        }
    }
 
    dequeue()
    {
        if(this.isEmpty())
            return undefined
        return this.items.shift();
    }

    front()
    {
        if(this.isEmpty())
            return undefined
        return this.items[0]
    }

    print_pqueue()
    {
        for(let i = 0; i < this.items.length; i++)
        {
            console.log(this.items[i].priority)
        }
    }

    isEmpty()
    {
        return this.items.length === 0
    }
}

const reconstruct_path = (end_idx, previous) =>
{
    // Find the shortest path
    let shortest_path = []
    let cur_idx = end_idx

    while(cur_idx != null)
    {
        shortest_path.push(cur_idx)
        cur_idx = previous[cur_idx];
    }

    shortest_path.reverse();
    return shortest_path;
}

const manhattan_heuristic = (node_idx, goal_idx) => {

    const n_x = Math.floor(node_idx / GRID_COLS);
    const n_y = node_idx % GRID_COLS;

    const g_x = Math.floor(goal_idx / GRID_COLS);
    const g_y = goal_idx % GRID_COLS;

    return Math.abs(n_x - g_x) + Math.abs(n_y - g_y);
}

const get_neighbours = (row_idx, col_idx, grid) => {
    let neighbours = [];

    if(col_idx - 1 >= 0)
        neighbours.push(grid[row_idx][col_idx - 1])
    if(col_idx + 1 < grid[row_idx].length)
        neighbours.push(grid[row_idx][col_idx + 1])
    if(row_idx - 1 >= 0)
        neighbours.push(grid[row_idx - 1][col_idx])
    if(row_idx + 1 < grid.length)
        neighbours.push(grid[row_idx + 1][col_idx])

    return neighbours;
}

// This implementation takes 2d array for js objects that have following properties:
// idx
// mode (GridNodeModes enum value)
export const Djikstra = async (grid, start_idx, end_idx, viz_callback, isVisualizingRef, viz_speed) => {

    if(!grid || !start_idx || !end_idx)
        return undefined
    
    console.log("Calculating djikstra: ", viz_speed.current)

    let distances = []
    for (let i = 0; i < grid.length * grid[0].length; i++)
    {
        distances.push(Infinity)
    }

    distances[start_idx] = 0

    let previous = []
    let priority_queue = new PriorityQueue();
    priority_queue.enqueue(start_idx, 0)

    let batched_nodes = []
    // Put all the nodes in the queue
    while(!priority_queue.isEmpty())
    {

        if(!isVisualizingRef.current)
            return;

        let min_elem = priority_queue.dequeue();

        // If we found the end
        if(min_elem.idx == end_idx)
            break;

        // Iterate neighbours of the dequeued element
        const row_idx = Math.floor(min_elem.idx / GRID_COLS);
        const col_idx = min_elem.idx % GRID_COLS;

        // Define neighbours
        const neighbours = get_neighbours(row_idx, col_idx, grid)

        for(const neighbour of neighbours)
        {
            // Lets use distance between grid nodes value 1
            if(distances[neighbour.idx] > distances[min_elem.idx] + 1)
            {
                if(neighbour.mode == GridNodeModes.WALL)
                    continue;

                distances[neighbour.idx] = distances[min_elem.idx] + 1
                priority_queue.enqueue(neighbour.idx, distances[neighbour.idx])
                
                // Keep track of the shortest path to the previous element
                // So we don't have to calculate it again for the shortest path between point a and b
                previous[neighbour.idx] = min_elem.idx
                batched_nodes.push(neighbour.idx)

                // For singular nodes
                //viz_callback(neighbour.idx, distances[neighbour.idx])
            }
        }

        if(batched_nodes.length % 10 == 0)
        {
            viz_callback(batched_nodes, distances)
            await sleep(100 - viz_speed.current)
            batched_nodes = []
        }
    }

    //Visualize remaining
    if(batched_nodes.length > 0)
    {
        viz_callback(batched_nodes, distances)
        batched_nodes = [];
    }

    return reconstruct_path(end_idx, previous);
}

export const AStar = async (grid, start_idx, end_idx, viz_callback, isVisualizingRef, viz_speed) => {

    if(!grid || !start_idx || !end_idx)
        return undefined
    
    console.log("Calculating A*: ", viz_speed.current);

    let previous = [];
    const distances = Array(grid.length * grid[0].length).fill(Infinity);
    distances[start_idx] = 0;

    let pq = new PriorityQueue();
    pq.enqueue(start_idx, 0);

    let batched_nodes = []
    while(!pq.isEmpty())
    {
        if(!isVisualizingRef.current)
            return;

        let min_elem = pq.dequeue();

        if(min_elem.idx == end_idx)
            break;
        
        const row_idx = Math.floor(min_elem.idx / GRID_COLS);
        const col_idx = min_elem.idx % GRID_COLS;
        const neighbours = get_neighbours(row_idx, col_idx, grid);

        for(const neighbour of neighbours)
        {
            if (neighbour.mode === GridNodeModes.WALL)
                continue;

            const new_cost = distances[min_elem.idx] + 1;

            if (new_cost < distances[neighbour.idx]) {
                distances[neighbour.idx] = new_cost;
                const priority = new_cost + manhattan_heuristic(neighbour.idx, end_idx);
                pq.enqueue(neighbour.idx, priority);
                previous[neighbour.idx] = min_elem.idx;

                batched_nodes.push(neighbour.idx);
            }
        }

        // Some visualizing speed tricks
        // Since the await sleep calls are really
        // slowing the rendering
        if(batched_nodes.length % 5 == 0)
        {
            if(viz_speed.current == "100")
            {
                // Visualize all 5 of them at once
                viz_callback(batched_nodes, distances)
                await sleep(20)
            }
            else
            {
                //Iterate through the nodes, sleep in between
                for(const node of batched_nodes)
                {
                    viz_callback([node], distances)
                    await sleep(100 - viz_speed.current)
                }
            }
            batched_nodes = [];
        }
    }

    //Visualize remaining
    if(batched_nodes.length > 0)
    {
        viz_callback(batched_nodes, distances)
        batched_nodes = [];
    }

    return reconstruct_path(end_idx, previous);
}

export const DFS = async (grid, start_idx, end_idx, viz_callback, isVisualizingRef, viz_speed) => {
    let stack = [new QElement(start_idx, 0)];
    let visited = new Set();

    // For visualizer
    const distances = Array(grid.length * grid[0].length).fill(Infinity);
    let order_of_visited = [];
    let batched_nodes = [];

    while(stack.length > 0)
    {
        if(!isVisualizingRef.current)
            return;

        let node = stack.pop();
        const row_idx = Math.floor(node.idx / GRID_COLS);
        const col_idx = node.idx % GRID_COLS;

        if(node.mode == GridNodeModes.WALL)
            continue;

        if(!visited.has(node.idx))
        {
            visited.add(node.idx)

            order_of_visited.push(node.idx)

            if(node.idx == end_idx)
                break;

            distances[node.idx] = manhattan_heuristic(node.idx, start_idx);
            if(node.idx != start_idx && node.idx != end_idx)
            {
                batched_nodes.push(node.idx)
            }

            let neighbours = get_neighbours(row_idx, col_idx, grid)
            for(const neighbour of neighbours)
            {
                if(!visited.has(neighbour.idx))
                {
                    stack.push(neighbour)
                }
            }
        }

        if(batched_nodes.length % 5 == 0)
        {
            if(viz_speed.current == "100")
            {
                // Visualize all 5 of them at once
                viz_callback(batched_nodes, distances)
                await sleep(20)
            }
            else
            {
                //Iterate through the nodes, sleep in between
                for(const node of batched_nodes)
                {
                    viz_callback([node], distances)
                    await sleep(100 - viz_speed.current)
                }
            }
            batched_nodes = [];
        }
    }

    //Visualize remaining
    if(batched_nodes.length > 0)
    {
        viz_callback(batched_nodes, distances)
        batched_nodes = [];
    }

    return order_of_visited;
}

export const PrimsAlgorithm = async (grid, start_idx, end_idx, viz_callback, isVisualizingRef, viz_speed) => 
{
    pq = new PriorityQueue();
    const visited = new Set(); 
    const wall_nodes = Array(grid.length * grid[0].length).fill(Infinity);
    
    let random_start = start_idx
    while(random_start == start_idx || random_start == end_idx)
        random_start = Math.floor(Math.random() * grid.length * grid[0].length)
    
    const rs_row = Math.floor(random_start / GRID_COLS);
    const rs_col = random_start % GRID_COLS;

    visited[rs_row][rs_col] = true;
    removeWalls(random_start, visited, pq);
}

const removeWalls = (idx, visited, pq) => {
    const neighbours = get_neighbours(idx)
    for(const neighbour of neighbours)
    {
        if(!visited.has(neighbour.idx))
        {
            pq.enqueue(neighbour.idx, Math.random());
        }
    }
}

//TODO:: Implement with negative weights
export const BellmanFord = async (grid, start_idx, end_idx, viz_callback, isVisualizingRef, viz_speed) => 
{

}