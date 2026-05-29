# AlgoVerse 🌌

AlgoVerse is an interactive web-based learning platform designed to help you visualize and understand classic algorithms, data structures, and mathematical puzzles through beautiful, step-by-step animations.

## 🚀 Live Demo
*https://algoworld.vercel.app/*

---

## 🎮 Features & Simulations

### 🗂️ Data Structures

#### Linked List 🔗
A visual walkthrough of dynamic memory allocation via a singly linked list.
- **Insert at Head / Tail / Index**: Watch pointer reassignments animate in real-time.
- **Delete**: See how nodes are surgically removed and adjacent pointers are rewired.
- **Search**: Trace a sequential scan through the chain, node by node.
- **Pseudocode modal** included for each operation.

#### Array 📦
Demonstrates the contiguous, fixed-capacity nature of arrays as opposed to dynamic structures.
- A static grid of **10 memory slots** always visible, labeled 0–9 (0-based indexing).
- **Insert**: Watch all elements to the right shift one position to make room (O(n) shift).
- **Delete**: Watch elements shift left to patch the gap and maintain contiguity.
- **Update**: Demonstrates true **O(1) random access** — instantly highlights the target index.
- **Custom array input**: Pre-populate the visualizer with your own values.

#### Stacks & Queues 📥
Side-by-side live visualization of a Stack (LIFO) and a Queue (FIFO).
- Push / Pop / Enqueue / Dequeue operations with animated transitions.
- Real-time **LIFO vs FIFO** comparison.

#### Binary Search Tree (BST) 🌳
A custom-built SVG visualization engine for node operations in a BST.
- **Insert**: Trace values down the tree to their correct BST position.
- **Delete**: Visualize complex replacement logic (leaf, single-child, and two-child cases).
- **Search**: Highlight the search path; neon green on success, red on failure.
- **Traversals**: Animate In-Order, Pre-Order, and Post-Order traversals.

#### Hash Table #️⃣
A deep-dive into how hash tables work internally — not just the map API.
- **Hash Computation Banner**: Watch the key get mathematically converted into a bucket index character-by-character in real-time.
- **Configurable Capacity**: Set any bucket count from 1 to 32.
- **Configurable Hash Functions**: Sum of ASCII, Integer Value, First Char, String Length, or a fully **custom JavaScript expression** using `k` (string) and `x` (integer) variables.
- **Three Collision Resolution Strategies**:
  - **Separate Chaining**: Collisions build horizontal linked-list chains out of the bucket.
  - **Linear Probing**: `(H + i) % Cap` — probe the next slot sequentially.
  - **Quadratic Probing**: `(H + i²) % Cap` — probe with exponentially increasing offsets.
- **Tombstones**: Deletions in Open Addressing mode place a `DEL` tombstone to preserve probe chain integrity.
- **Strategy-specific pseudocode** for every operation (Put, Get, Remove).

---

### ⚡ Algorithms

#### Sorting Algorithms 📊
Visualize how fundamental sorting algorithms organize randomized data.
- **Supported**: Bubble Sort, Insertion Sort, Selection Sort, Merge Sort, Quick Sort.
- Dynamic bar chart scaling up to 200 elements.
- Real-time color coding: Default (Cyan), Comparing (Red), Sorted (Green).
- Interactive sliders for **Array Size** and **Animation Speed**.
- **Race All Mode:** All 5 algorithms compete simultaneously in a 2×2 grid.

#### Graph Traversals & Pathfinding 🕸️
A powerful point-and-click graph builder with step-by-step algorithm playback.
- **Builder Mode:** Drop nodes, draw edges, assign weights.
- **Step-by-Step Playback:** Manual controls (Auto Play, Pause, Step Forward, Reset).
- **Supported Algorithms:**
  - **BFS** — Queue-based level-order traversal.
  - **DFS** — Stack-based with discovery/finish time tracking.
  - **Dijkstra's** — Min-Heap Priority Queue for shortest paths.
  - **Kruskal's** — Minimum Spanning Tree via Union-Find.
  - **Prim's** — Greedy MST expansion with a Priority Queue.

#### Search Algorithms 🔍
Visualize how search algorithms probe an array.
- **Binary Search**: Watch the search window halve on every comparison.
- **Linear Search**: Sequential scan from left to right.

---

### 🧩 Math Puzzles

#### Towers of Hanoi 🗼
- Adjustable disk counts (3–8).
- **Auto-Simulate** plays out the optimal recursive solution step-by-step.

#### Monty Hall Problem 🐐🚗
- Interactive 3D flipping doors.
- **Auto-Simulate** engine — run 100 or 1,000 trials and watch win-rate converge to the 66%/33% split.

#### Collatz Conjecture 📈
- Input any positive integer, visualize the hailstone sequence crashing into the 4-2-1 loop via a dynamic SVG line chart.

#### Kaprekar's Routine 🔢
- Input any 4-digit number, watch sequential subtraction steps converge to the constant **6174**.

---

