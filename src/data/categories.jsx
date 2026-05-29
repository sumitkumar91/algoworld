import { Layers, DoorOpen, BarChart2, GitMerge, TrendingUp, Hash, Network, Link2, Box, Grid, Search } from 'lucide-react';

export const categories = [
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Visualizations focused on step-by-step computational procedures and problem-solving.',
    color: 'orange',
    icon: <Box size={32} className="sim-icon" style={{color: '#ff7f50'}} />,
    modules: [
      {
        id: 'sorting',
        title: 'Sorting Algorithms',
        description: 'Visualize Bubble, Insertion, Selection, Merge, and Quick Sort as they organize randomized array data in real-time.',
        icon: <BarChart2 size={32} className="sim-icon sorting-icon" style={{color: '#ff7f50'}} />,
        path: '/sorting',
        color: 'orange'
      },
      {
        id: 'search',
        title: 'Search Algorithms',
        description: 'Visualize Linear Search and Binary Search to contrast O(N) vs O(log N) efficiency.',
        icon: <Search size={32} className="sim-icon search-icon" style={{color: '#facc15'}} />,
        path: '/search',
        color: 'yellow'
      },
      {
        id: 'graph',
        title: 'Graph Algorithms',
        description: 'Visualize BFS, DFS, Dijkstra\'s, Prim\'s, and Kruskal\'s algorithms on an interactive network of nodes.',
        icon: <Network size={32} className="sim-icon graph-icon" style={{color: '#00e5ff'}} />,
        path: '/graph',
        color: 'blue'
      }
    ]
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Visualizations focused on memory organization, pointers, and fundamental structural operations.',
    color: 'green',
    icon: <Layers size={32} className="sim-icon" style={{color: '#4ade80'}} />,
    modules: [
      {
        id: 'array',
        title: 'Arrays',
        description: 'Visualize static arrays and contiguous memory operations.',
        icon: <Grid size={32} className="sim-icon array-icon" style={{color: '#3b82f6'}} />,
        path: '/array',
        color: 'blue'
      },
      {
        id: 'linked-list',
        title: 'Linked Lists',
        description: 'Visualize insertions, deletions, and pointers for Singly, Doubly, and Circular Linked Lists.',
        icon: <Link2 size={32} className="sim-icon list-icon" style={{color: '#4ade80'}} />,
        path: '/linked-list',
        color: 'green'
      },
      {
        id: 'stacks-queues',
        title: 'Stacks & Queues',
        description: 'Visualize Last-In-First-Out and First-In-First-Out data structures.',
        icon: <Layers size={32} className="sim-icon list-icon" style={{color: '#c084fc'}} />,
        path: '/stacks-queues',
        color: 'purple'
      },
      {
        id: 'tree',
        title: 'Binary Search Tree',
        description: 'Build a BST by inserting and deleting nodes, and watch In-Order, Pre-Order, and Post-Order traversals.',
        icon: <GitMerge size={32} className="sim-icon tree-icon" style={{color: '#cddc39'}} />,
        path: '/tree',
        color: 'yellow'
      },
      {
        id: 'hashmap',
        title: 'Hash Table',
        description: 'Visualize Hash Functions, Buckets, Separate Chaining, and Open Addressing (Linear & Quadratic Probing).',
        icon: <Hash size={32} className="sim-icon hashmap-icon" style={{color: '#c084fc'}} />,
        path: '/hashmap',
        color: 'purple'
      }
    ]
  },
  {
    id: 'puzzles',
    title: 'Math & Logic Puzzles',
    description: 'Interactive explorations of mathematical curiosities and game theory.',
    color: 'purple',
    icon: <Hash size={32} className="sim-icon" style={{color: '#e040fb'}} />,
    modules: [
      {
        id: 'hanoi',
        title: 'Towers of Hanoi',
        description: 'A mathematical puzzle where you move a stack of disks from one rod to another, following specific rules.',
        icon: <Layers size={32} className="sim-icon hanoi-icon" />,
        path: '/hanoi',
        color: 'cyan'
      },
      {
        id: 'monty-hall',
        title: 'Monty Hall Problem',
        description: 'A probability brain teaser based on a game show. Does swapping your choice increase your chances of winning?',
        icon: <DoorOpen size={32} className="sim-icon monty-icon" />,
        path: '/monty-hall',
        color: 'purple'
      },
      {
        id: 'collatz',
        title: 'Collatz Conjecture',
        description: 'The "3n + 1" problem: Visualize the wild fluctuations of the hailstone sequence as it charts its path to 1.',
        icon: <TrendingUp size={32} className="sim-icon collatz-icon" style={{color: '#e040fb'}} />,
        path: '/collatz',
        color: 'pink'
      },
      {
        id: 'kaprekar',
        title: 'Kaprekar\'s Routine',
        description: 'The mystery of 6174: Sort, subtract, and repeat to watch any 4-digit number fall into Kaprekar\'s black hole.',
        icon: <Hash size={32} className="sim-icon kaprekar-icon" style={{color: '#ffb300'}} />,
        path: '/kaprekar',
        color: 'gold'
      }
    ]
  }
];
