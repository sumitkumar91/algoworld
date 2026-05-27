# AlgoWorld 🌌

AlgoWorld is an interactive web-based simulation platform designed to help you visualize and understand classic algorithms, data structures, and mathematical puzzles. 


## 🚀 Live Demo
*https://algoworld.vercel.app/*

---

## 🎮 Features & Simulations

### 1. Towers of Hanoi 🗼
A mathematical puzzle where the objective is to move a stack of disks from one rod to another, following specific rules (you cannot place a larger disk onto a smaller disk).
- Interactive drag-and-drop / click-to-move mechanics.
- Dynamically adjustable disk counts (3-8 disks).
- **Auto-Simulate** feature that visually plays out the optimal recursive solution step-by-step.

### 2. Monty Hall Problem 🐐🚗
A famous probability brain teaser based on a game show. Does swapping your choice increase your chances of winning?
- Interactive 3D flipping doors.
- Step-by-step gameplay phases (Pick -> Host Reveals -> Swap/Stay -> Result).
- **Fast Auto-Simulate** engine to run the game 100 or 1,000 times instantly, proving the statistical probability converge (66% win rate for swapping vs 33% for staying).

### 3. Sorting Algorithms 📊
Visualize how fundamental sorting algorithms organize randomized array data in real-time.
- **Supported Algorithms**: Insertion Sort, Selection Sort, Merge Sort, and Quick Sort.
- Dynamic bar chart rendering that scales up to 200 elements.
- Real-time color coding: Default (Cyan), Comparing (Red), Sorted (Green).
- Interactive sliders to control **Array Size** and **Animation Speed** on the fly.
- **Race All Mode:** Watch all 4 algorithms compete against each other simultaneously in a 2x2 grid.

### 4. Binary Search Tree (BST) 🌳
A custom-built SVG visualization engine to watch node operations occur in a standard Binary Search Tree without structural overlap.
- **Insert**: Watch values trace their path down the tree to their correct BST location.
- **Delete**: Visualize complex node replacement logic when deleting nodes (including leaf, single-child, and two-child replacements).
- **Search**: Trace the path to find a node, highlighting neon green on success or red on failure.
- **Traversals**: Animate and track In-Order, Pre-Order, and Post-Order traversals.

### 5. Interactive Graph Builder & Traversals 🕸️
A powerful point-and-click engine to build custom networks and trace pathfinding algorithms.
- **Builder Mode:** Click empty space to drop custom nodes. Click two nodes to draw an edge. The engine automatically assigns random weights to edges. (Users can also click an edge to manually overwrite the weight).
- **Step-by-Step Playback:** Fully manual playback controls (Auto Play, Pause, Step Forward, Reset) to meticulously trace algorithm execution frames.
- **Supported Algorithms:**
  - **Breadth-First Search (BFS):** Utilizes a Queue (FIFO).
  - **Depth-First Search (DFS):** Utilizes a Stack (LIFO) and tracks discovery/finish times.
  - **Dijkstra's Shortest Path:** Utilizes a Min-Heap (Priority Queue) to relax edge weights and find the absolute shortest paths.
  - **Kruskal's Algorithm:** Sorts edges and builds a Minimum Spanning Tree while checking a Disjoint Set for cycles.
  - **Prim's Algorithm:** Greedily expands the Minimum Spanning Tree using a Priority Queue.

### 6. Collatz Conjecture (3n + 1 Problem) 📈
Visualize the chaotic mathematical "hailstone sequence" that always seems to crash into the 4-2-1 loop.
- Input any positive integer.
- Uses a custom native SVG renderer to draw a dynamic, scaling line chart tracing the massive mathematical fluctuations before resolving.

### 7. Kaprekar's Routine (6174 Mystery) 🔢
A mathematical anomaly where taking any 4-digit number (with at least two distinct digits) and subtracting its sorted ascending digits from its descending digits will invariably lead to 6174.
- Input a valid 4-digit number.
- Visually breaks down the sequential arithmetic steps (`A - B = C`) until Kaprekar's Constant is reached.

