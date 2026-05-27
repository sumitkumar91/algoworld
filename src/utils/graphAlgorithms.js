// Define a fixed layout graph (e.g. 7 nodes)
export const initialGraph = {
  nodes: [
    { id: '0', x: 100, y: 150 },
    { id: '1', x: 250, y: 80 },
    { id: '2', x: 250, y: 220 },
    { id: '3', x: 400, y: 50 },
    { id: '4', x: 400, y: 150 },
    { id: '5', x: 400, y: 250 },
    { id: '6', x: 550, y: 150 }
  ],
  edges: [
    { u: '0', v: '1', w: 4 },
    { u: '0', v: '2', w: 8 },
    { u: '1', v: '3', w: 2 },
    { u: '1', v: '4', w: 5 },
    { u: '2', v: '4', w: 5 },
    { u: '2', v: '5', w: 9 },
    { u: '3', v: '6', w: 7 },
    { u: '4', v: '6', w: 6 },
    { u: '5', v: '6', w: 3 }
  ]
};

// Build adjacency list for fast traversal
const buildAdjList = (graph) => {
  const adj = {};
  graph.nodes.forEach(n => adj[n.id] = []);
  graph.edges.forEach(e => {
    adj[e.u].push({ node: e.v, weight: e.w });
    adj[e.v].push({ node: e.u, weight: e.w });
  });
  // Sort adjacency list to make traversals deterministic (alphabetical)
  for (let key in adj) {
    adj[key].sort((a, b) => a.node.localeCompare(b.node));
  }
  return adj;
};

// BFS returns frames for animation
export const getBfsFrames = (graph, startId) => {
  const adj = buildAdjList(graph);
  const frames = [];
  const visited = new Set();
  const queue = [];
  
  queue.push(startId);
  visited.add(startId);
  
  frames.push({
    activeNode: null,
    visitedNodes: [...visited],
    dataStructure: [...queue],
    action: 'Initialize'
  });

  while (queue.length > 0) {
    const current = queue.shift();
    
    frames.push({
      activeNode: current,
      visitedNodes: [...visited],
      dataStructure: [...queue],
      action: `Dequeue ${current}`
    });

    for (let neighbor of adj[current]) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        queue.push(neighbor.node);
        
        frames.push({
          activeNode: current,
          visitedNodes: [...visited],
          dataStructure: [...queue],
          action: `Enqueue ${neighbor.node}`
        });
      }
    }
    
    frames.push({
      activeNode: current,
      visitedNodes: [...visited],
      dataStructure: [...queue],
      processedNode: current,
      action: `Done with ${current}`
    });
  }

  return frames;
};

// DFS returns frames for animation
export const getDfsFrames = (graph, startId) => {
  const adj = buildAdjList(graph);
  const frames = [];
  const visited = new Set();
  const stack = [];
  const times = {}; // id -> { discovery, finish }
  let timer = 0;

  const dfs = (u) => {
    timer++;
    visited.add(u);
    stack.push(u);
    times[u] = { discovery: timer, finish: null };

    frames.push({
      activeNode: u,
      visitedNodes: [...visited],
      dataStructure: [...stack],
      times: JSON.parse(JSON.stringify(times)),
      action: `Discover ${u} (t=${timer})`
    });

    for (let neighbor of adj[u]) {
      const v = neighbor.node;
      if (!visited.has(v)) {
        dfs(v);
        frames.push({
          activeNode: u,
          visitedNodes: [...visited],
          dataStructure: [...stack],
          times: JSON.parse(JSON.stringify(times)),
          action: `Backtrack to ${u}`
        });
      }
    }

    timer++;
    times[u].finish = timer;
    stack.pop();

    frames.push({
      activeNode: u,
      visitedNodes: [...visited],
      dataStructure: [...stack],
      times: JSON.parse(JSON.stringify(times)),
      action: `Finish ${u} (t=${timer})`
    });
  };

  dfs(startId);

  return frames;
};

// Kruskal's MST
export const getKruskalFrames = (graph) => {
  const frames = [];
  const mstEdges = [];
  const edges = [...graph.edges].sort((a, b) => a.w - b.w);
  
  const parent = {};
  graph.nodes.forEach(n => parent[n.id] = n.id);

  const find = (i) => {
    if (parent[i] === i) return i;
    return find(parent[i]);
  };

  const union = (i, j) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  };

  frames.push({
    activeEdge: null,
    mstEdges: [],
    dataStructure: edges.map(e => `${e.u}-${e.v} (${e.w})`),
    action: 'Sorted Edges by Weight'
  });

  const dsCopy = [...edges];

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    dsCopy.shift(); // Remove from processing queue

    frames.push({
      activeEdge: edge,
      mstEdges: [...mstEdges],
      dataStructure: dsCopy.map(e => `${e.u}-${e.v} (${e.w})`),
      action: `Check edge ${edge.u}-${edge.v} (w=${edge.w})`
    });

    if (union(edge.u, edge.v)) {
      mstEdges.push(edge);
      frames.push({
        activeEdge: edge,
        mstEdges: [...mstEdges],
        dataStructure: dsCopy.map(e => `${e.u}-${e.v} (${e.w})`),
        action: `Added ${edge.u}-${edge.v} to MST`
      });
    } else {
      frames.push({
        activeEdge: edge,
        mstEdges: [...mstEdges],
        dataStructure: dsCopy.map(e => `${e.u}-${e.v} (${e.w})`),
        action: `Cycle detected. Ignored ${edge.u}-${edge.v}`
      });
    }
  }

  frames.push({
    activeEdge: null,
    mstEdges: [...mstEdges],
    dataStructure: [],
    action: 'Kruskal Complete'
  });

  return frames;
};

// Prim's MST
export const getPrimFrames = (graph, startId) => {
  const adj = buildAdjList(graph);
  const frames = [];
  const mstEdges = [];
  const visited = new Set();
  
  // Custom simple priority queue for edges: { u, v, weight }
  const pq = [];

  visited.add(startId);

  // Add initial edges from start node
  adj[startId].forEach(neighbor => {
    pq.push({ u: startId, v: neighbor.node, weight: neighbor.weight });
  });
  pq.sort((a, b) => a.weight - b.weight);

  frames.push({
    activeNode: startId,
    visitedNodes: [...visited],
    mstEdges: [],
    dataStructure: pq.map(e => `${e.u}-${e.v} (${e.weight})`),
    action: `Start at ${startId}`
  });

  while (pq.length > 0) {
    const edge = pq.shift(); // Extract min
    
    frames.push({
      activeEdge: { u: edge.u, v: edge.v, w: edge.weight },
      visitedNodes: [...visited],
      mstEdges: [...mstEdges],
      dataStructure: pq.map(e => `${e.u}-${e.v} (${e.weight})`),
      action: `Extract min edge ${edge.u}-${edge.v} (${edge.weight})`
    });

    if (!visited.has(edge.v)) {
      visited.add(edge.v);
      mstEdges.push({ u: edge.u, v: edge.v, w: edge.weight });
      
      frames.push({
        activeEdge: { u: edge.u, v: edge.v, w: edge.weight },
        activeNode: edge.v,
        visitedNodes: [...visited],
        mstEdges: [...mstEdges],
        dataStructure: pq.map(e => `${e.u}-${e.v} (${e.weight})`),
        action: `Added ${edge.v} to MST`
      });

      // Add new edges to PQ
      adj[edge.v].forEach(neighbor => {
        if (!visited.has(neighbor.node)) {
          pq.push({ u: edge.v, v: neighbor.node, weight: neighbor.weight });
        }
      });
      pq.sort((a, b) => a.weight - b.weight);
      
      frames.push({
        activeNode: edge.v,
        visitedNodes: [...visited],
        mstEdges: [...mstEdges],
        dataStructure: pq.map(e => `${e.u}-${e.v} (${e.weight})`),
        action: `Updated Priority Queue`
      });
    } else {
      frames.push({
        activeEdge: { u: edge.u, v: edge.v, w: edge.weight },
        visitedNodes: [...visited],
        mstEdges: [...mstEdges],
        dataStructure: pq.map(e => `${e.u}-${e.v} (${e.weight})`),
        action: `${edge.v} already in MST. Ignored.`
      });
    }
  }

  frames.push({
    activeEdge: null,
    activeNode: null,
    visitedNodes: [...visited],
    mstEdges: [...mstEdges],
    dataStructure: [],
    action: 'Prim Complete'
  });

  return frames;
};

// Dijkstra's Shortest Path
export const getDijkstraFrames = (graph, startId) => {
  const adj = buildAdjList(graph);
  const frames = [];
  
  const dist = {};
  graph.nodes.forEach(n => dist[n.id] = Infinity);
  dist[startId] = 0;
  
  const processed = new Set();
  const pq = [{ node: startId, d: 0 }]; // { node, d }

  frames.push({
    activeNode: null,
    processedNodes: [],
    distances: { ...dist },
    dataStructure: pq.map(x => `${x.node} (${x.d})`),
    action: `Initialize Dijkstra from ${startId}`
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { node: u, d } = pq.shift();

    if (processed.has(u)) continue;

    frames.push({
      activeNode: u,
      processedNodes: [...processed],
      distances: { ...dist },
      dataStructure: pq.map(x => `${x.node} (${x.d})`),
      action: `Extract min ${u} (dist=${d})`
    });

    processed.add(u);

    for (let neighbor of adj[u]) {
      const v = neighbor.node;
      const weight = neighbor.weight;
      
      if (!processed.has(v)) {
        const alt = dist[u] + weight;
        
        frames.push({
          activeNode: u,
          activeEdge: { u, v, w: weight },
          processedNodes: [...processed],
          distances: { ...dist },
          dataStructure: pq.map(x => `${x.node} (${x.d})`),
          action: `Evaluate edge ${u}-${v} (w=${weight})`
        });

        if (alt < dist[v]) {
          dist[v] = alt;
          pq.push({ node: v, d: alt });
          
          frames.push({
            activeNode: v,
            processedNodes: [...processed],
            distances: { ...dist },
            dataStructure: pq.map(x => `${x.node} (${x.d})`),
            action: `Relaxed ${v}: new shortest distance ${alt}`
          });
        }
      }
    }
  }

  frames.push({
    activeNode: null,
    processedNodes: [...processed],
    distances: { ...dist },
    dataStructure: [],
    action: 'Dijkstra Complete'
  });

  return frames;
};
