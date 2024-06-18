import { useEffect } from "react";
import { GRID_COLS, GRID_ROWS } from "./Widgets";

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
            if(this.items[i].priority > qElem.priority)
            {
                this.items.splice(i, 0, qElem);
                contain = true;
                break;
            }
        }

        if(!contain)
            this.items.push(qElem)
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

// This implementation takes 2d array for js objects that have following properties:
// idx
// mode (GridNodeModes enum value)
export const Djikstra = (grid, start_idx, end_idx, viz_callback) => {

    if(!grid || !start_idx || !end_idx)
        return undefined
    
    console.log("Calculating djikstra")

    let distances = []
    for (let i = 0; i < grid.length * grid[0].length; i++)
    {
        distances.push(Infinity)
    }

    distances[start_idx] = 0

    let previous = []
    let priority_queue = new PriorityQueue();
    priority_queue.enqueue(start_idx, 0)

    // Put all the nodes in the queue
    while(!priority_queue.isEmpty())
    {
        let min_elem = priority_queue.dequeue();

        // If we found the end
        if(min_elem.idx == end_idx)
            break;

        // Iterate neighbours of the dequeued element
        const row_idx = Math.floor(min_elem.idx / GRID_COLS);
        const col_idx = min_elem.idx % GRID_COLS;

        // Define neighbours
        let neighbours = []

        if(col_idx - 1 >= 0)
            neighbours.push(grid[row_idx][col_idx - 1])
        if(col_idx + 1 < grid[row_idx].length)
            neighbours.push(grid[row_idx][col_idx + 1])
        if(row_idx - 1 >= 0)
            neighbours.push(grid[row_idx - 1][col_idx])
        if(row_idx + 1 < grid.length)
            neighbours.push(grid[row_idx + 1][col_idx])

        for(const neighbour of neighbours)
        {
            // Lets use distance between grid nodes value 1
            if(distances[neighbour.idx] > distances[min_elem.idx] + 1)
            {
                distances[neighbour.idx] = distances[min_elem.idx] + 1
                priority_queue.enqueue(neighbour.idx, distances[neighbour.idx])
                
                // Keep track of the shortest path to the previous element
                // So we don't have to calculate it again for the shortest path between point a and b
                previous[neighbour.idx] = min_elem.idx

                viz_callback(neighbour.idx, distances[neighbour.idx])
            }
        }
    }

    // Find the shortest path
    let shortest_path = []
    let cur_idx = end_idx

    while(cur_idx != null)
    {
        shortest_path.push(cur_idx)
        cur_idx = previous[cur_idx];
    }

    shortest_path.reverse();
    console.log(shortest_path)

    return shortest_path;
}