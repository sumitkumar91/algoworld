export const graphSnippets = {
  bfs: `ALGORITHM BFS(G, s)
  Q ← Empty Queue
  visited ← Empty Set
  
  visited.ADD(s)
  ENQUEUE(Q, s)
  
  WHILE Q ≠ ∅ DO
    u ← DEQUEUE(Q)
    FOR EACH v ∈ G.Adj[u] DO
      IF v ∉ visited THEN
        visited.ADD(v)
        ENQUEUE(Q, v)`,
        
  dfs: `ALGORITHM DFS(G, s)
  visited ← Empty Set
  
  PROCEDURE DFS-VISIT(u)
    visited.ADD(u)
    FOR EACH v ∈ G.Adj[u] DO
      IF v ∉ visited THEN
        DFS-VISIT(v)
        
  DFS-VISIT(s)`,
  
  dijkstra: `ALGORITHM DIJKSTRA(G, w, s)
  FOR EACH vertex v ∈ G.V DO
    v.d ← ∞
  s.d ← 0
  
  S ← ∅
  Q ← G.V  // Priority Queue keyed by d
  
  WHILE Q ≠ ∅ DO
    u ← EXTRACT-MIN(Q)
    S ← S ∪ {u}
    FOR EACH v ∈ G.Adj[u] DO
      IF v.d > u.d + w(u, v) THEN
        v.d ← u.d + w(u, v)
        DECREASE-KEY(Q, v, v.d)`,
        
  kruskal: `ALGORITHM KRUSKAL(G, w)
  A ← ∅
  FOR EACH vertex v ∈ G.V DO
    MAKE-SET(v)
    
  sort the edges of G.E into nondecreasing order by weight w
  
  FOR EACH edge (u, v) ∈ G.E, taken in nondecreasing order by weight DO
    IF FIND-SET(u) ≠ FIND-SET(v) THEN
      A ← A ∪ {(u, v)}
      UNION(u, v)
      
  RETURN A`,
  
  prim: `ALGORITHM PRIM(G, w, r)
  FOR EACH u ∈ G.V DO
    u.key ← ∞
    u.π ← NIL
  r.key ← 0
  
  Q ← G.V  // Priority Queue keyed by key
  
  WHILE Q ≠ ∅ DO
    u ← EXTRACT-MIN(Q)
    FOR EACH v ∈ G.Adj[u] DO
      IF v ∈ Q AND w(u, v) < v.key THEN
        v.π ← u
        v.key ← w(u, v)
        DECREASE-KEY(Q, v, v.key)`
};

export const sortingSnippets = {
  bubbleSort: `ALGORITHM BUBBLESORT(A)
  n ← A.length
  FOR i ← 0 TO n - 1 DO
    FOR j ← 0 TO n - i - 2 DO
      IF A[j] > A[j + 1] THEN
        exchange A[j] with A[j + 1]`,
        
  quickSort: `ALGORITHM QUICKSORT(A, p, r)
  IF p < r THEN
    q ← PARTITION(A, p, r)
    QUICKSORT(A, p, q - 1)
    QUICKSORT(A, q + 1, r)

PROCEDURE PARTITION(A, p, r)
  x ← A[r]
  i ← p - 1
  FOR j ← p TO r - 1 DO
    IF A[j] ≤ x THEN
      i ← i + 1
      exchange A[i] with A[j]
  exchange A[i + 1] with A[r]
  RETURN i + 1`,
  
  mergeSort: `ALGORITHM MERGE-SORT(A, p, r)
  IF p < r THEN
    q ← ⌊(p + r) / 2⌋
    MERGE-SORT(A, p, q)
    MERGE-SORT(A, q + 1, r)
    MERGE(A, p, q, r)

PROCEDURE MERGE(A, p, q, r)
  n1 ← q - p + 1
  n2 ← r - q
  let L[1..n1] and R[1..n2] be new arrays
  
  FOR i ← 1 TO n1 DO
    L[i] ← A[p + i - 1]
  FOR j ← 1 TO n2 DO
    R[j] ← A[q + j]
    
  i ← 1
  j ← 1
  k ← p
  
  WHILE i ≤ n1 AND j ≤ n2 DO
    IF L[i] ≤ R[j] THEN
      A[k] ← L[i]
      i ← i + 1
    ELSE
      A[k] ← R[j]
      j ← j + 1
    k ← k + 1
    
  WHILE i ≤ n1 DO
    A[k] ← L[i]
    i ← i + 1
    k ← k + 1
    
  WHILE j ≤ n2 DO
    A[k] ← R[j]
    j ← j + 1
    k ← k + 1`,
  
  insertionSort: `ALGORITHM INSERTION-SORT(A)
  FOR j ← 2 TO A.length DO
    key ← A[j]
    // Insert A[j] into the sorted sequence A[1..j-1]
    i ← j - 1
    WHILE i > 0 AND A[i] > key DO
      A[i + 1] ← A[i]
      i ← i - 1
    A[i + 1] ← key`,
    
  selectionSort: `ALGORITHM SELECTION-SORT(A)
  n ← A.length
  FOR i ← 1 TO n - 1 DO
    min_idx ← i
    FOR j ← i + 1 TO n DO
      IF A[j] < A[min_idx] THEN
        min_idx ← j
    IF min_idx ≠ i THEN
      exchange A[i] with A[min_idx]`
};

export const bstSnippets = {
  insert: `ALGORITHM TREE-INSERT(T, z)
  y ← NIL
  x ← T.root
  WHILE x ≠ NIL DO
    y ← x
    IF z.key < x.key THEN
      x ← x.left
    ELSE
      x ← x.right
  z.p ← y
  IF y == NIL THEN
    T.root ← z    // tree T was empty
  ELSE IF z.key < y.key THEN
    y.left ← z
  ELSE
    y.right ← z`,
  
  search: `ALGORITHM TREE-SEARCH(x, k)
  IF x == NIL OR k == x.key THEN
    RETURN x
  IF k < x.key THEN
    RETURN TREE-SEARCH(x.left, k)
  ELSE
    RETURN TREE-SEARCH(x.right, k)`,
    
  deleteNode: `ALGORITHM TREE-DELETE(T, z)
  IF z.left == NIL THEN
    TRANSPLANT(T, z, z.right)
  ELSE IF z.right == NIL THEN
    TRANSPLANT(T, z, z.left)
  ELSE
    y ← TREE-MINIMUM(z.right)
    IF y.p ≠ z THEN
      TRANSPLANT(T, y, y.right)
      y.right ← z.right
      y.right.p ← y
    TRANSPLANT(T, z, y)
    y.left ← z.left
    y.left.p ← y`,
  
  inOrder: `ALGORITHM INORDER-TREE-WALK(x)
  IF x ≠ NIL THEN
    INORDER-TREE-WALK(x.left)
    print x.key
    INORDER-TREE-WALK(x.right)`,
    
  preOrder: `ALGORITHM PREORDER-TREE-WALK(x)
  IF x ≠ NIL THEN
    print x.key
    PREORDER-TREE-WALK(x.left)
    PREORDER-TREE-WALK(x.right)`,
    
  postOrder: `ALGORITHM POSTORDER-TREE-WALK(x)
  IF x ≠ NIL THEN
    POSTORDER-TREE-WALK(x.left)
    POSTORDER-TREE-WALK(x.right)
    print x.key`
};

export const linkedListSnippets = {
  sll: `ALGORITHM SLL-INSERT-HEAD(L, x)
  x.next ← L.head
  L.head ← x

ALGORITHM SLL-INSERT-TAIL(L, x)
  IF L.head == NIL THEN
    L.head ← x
  ELSE
    curr ← L.head
    WHILE curr.next ≠ NIL DO
      curr ← curr.next
    curr.next ← x

ALGORITHM SLL-DELETE(L, key)
  curr ← L.head
  prev ← NIL
  WHILE curr ≠ NIL AND curr.key ≠ key DO
    prev ← curr
    curr ← curr.next
  IF curr ≠ NIL THEN
    IF prev == NIL THEN
      L.head ← curr.next
    ELSE
      prev.next ← curr.next

ALGORITHM LIST-SEARCH(L, k)
  curr ← L.head
  WHILE curr ≠ NIL AND curr.key ≠ k DO
    curr ← curr.next
  RETURN curr`,

  dll: `ALGORITHM DLL-INSERT-HEAD(L, x)
  x.next ← L.head
  IF L.head ≠ NIL THEN
    L.head.prev ← x
  L.head ← x
  x.prev ← NIL

ALGORITHM DLL-INSERT-TAIL(L, x)
  IF L.head == NIL THEN
    L.head ← x
    x.prev ← NIL
    x.next ← NIL
  ELSE
    curr ← L.head
    WHILE curr.next ≠ NIL DO
      curr ← curr.next
    curr.next ← x
    x.prev ← curr
    x.next ← NIL

ALGORITHM DLL-DELETE(L, x)
  IF x.prev ≠ NIL THEN
    x.prev.next ← x.next
  ELSE
    L.head ← x.next
  IF x.next ≠ NIL THEN
    x.next.prev ← x.prev`,

  csll: `ALGORITHM CSLL-INSERT-HEAD(L, x)
  IF L.head == NIL THEN
    L.head ← x
    x.next ← L.head
  ELSE
    curr ← L.head
    WHILE curr.next ≠ L.head DO
      curr ← curr.next
    x.next ← L.head
    curr.next ← x
    L.head ← x

ALGORITHM CSLL-INSERT-TAIL(L, x)
  IF L.head == NIL THEN
    L.head ← x
    x.next ← L.head
  ELSE
    curr ← L.head
    WHILE curr.next ≠ L.head DO
      curr ← curr.next
    curr.next ← x
    x.next ← L.head

ALGORITHM CSLL-DELETE(L, key)
  IF L.head == NIL THEN RETURN
  
  curr ← L.head
  prev ← NIL
  
  // Find node
  WHILE curr.key ≠ key DO
    IF curr.next == L.head THEN RETURN  // Not found
    prev ← curr
    curr ← curr.next
    
  IF curr.next == L.head AND prev == NIL THEN
    L.head ← NIL  // Only one node
    RETURN
    
  IF curr == L.head THEN
    // Deleting head
    last ← L.head
    WHILE last.next ≠ L.head DO
      last ← last.next
    L.head ← curr.next
    last.next ← L.head
  ELSE
    // Deleting non-head
    prev.next ← curr.next`
};

export const sqSnippets = {
  stack: `ALGORITHM PUSH(S, x)
    if S.top == S.length
        error "overflow"
    else
        S.top ← S.top + 1
        S[S.top] ← x

ALGORITHM POP(S)
    if S.top == 0
        error "underflow"
    else
        S.top ← S.top - 1
        return S[S.top + 1]`,
        
  queue: `ALGORITHM ENQUEUE(Q, x)
    if Q.tail == Q.length
        error "overflow"
    else
        Q[Q.tail] ← x
        if Q.tail == Q.length
            Q.tail ← 1
        else
            Q.tail ← Q.tail + 1

ALGORITHM DEQUEUE(Q)
    if Q.head == Q.tail
        error "underflow"
    else
        x ← Q[Q.head]
        if Q.head == Q.length
            Q.head ← 1
        else
            Q.head ← Q.head + 1
        return x`
};



export const arraySnippets = {
  array: `ALGORITHM Insert(A, n, index, value)
    if n == A.length
        error "Array Overflow"
    if index < 0 or index > n
        error "Invalid Index"
    for i = n downto index + 1
        A[i] ← A[i-1]
    A[index] ← value
    n ← n + 1

ALGORITHM Delete(A, n, index)
    if index < 0 or index >= n
        error "Invalid Index"
    for i = index to n - 2
        A[i] ← A[i+1]
    n ← n - 1

ALGORITHM Update(A, index, value)
    if index < 0 or index >= n
        error "Invalid Index"
    A[index] ← value`
};

export const searchSnippets = {
  linear: `ALGORITHM LinearSearch(A, n, target)
    for i = 0 to n - 1
        if A[i] == target
            return i
    return -1`,
    
  binary: `ALGORITHM BinarySearch(A, n, target)
    L = 0
    R = n - 1
    
    while L <= R
        M = floor((L + R) / 2)
        if A[M] == target
            return M
        else if A[M] < target
            L = M + 1
        else
            R = M - 1
            
    return -1`
};

export const hashtableSnippets = {
  chaining: {
    put:
`// Separate Chaining — PUT(Key, Value)
// Time: O(1) avg, O(n) worst | Space: O(n)
ALGORITHM PUT(Key, Value)
    index = Hash(Key) % Capacity
    node = Buckets[index]

    while node is not null
        if node.key == Key
            node.value = Value   // update existing
            return
        node = node.next

    // Key not found — prepend to chain
    newNode = CreateNode(Key, Value)
    newNode.next = Buckets[index]
    Buckets[index] = newNode`,

    get:
`// Separate Chaining — GET(Key)
// Time: O(1) avg, O(n) worst
ALGORITHM GET(Key)
    index = Hash(Key) % Capacity
    node = Buckets[index]

    while node is not null
        if node.key == Key
            return node.value
        node = node.next

    return null  // not found`,

    remove:
`// Separate Chaining — REMOVE(Key)
// Time: O(1) avg, O(n) worst
ALGORITHM REMOVE(Key)
    index = Hash(Key) % Capacity
    node = Buckets[index]
    prev = null

    while node is not null
        if node.key == Key
            if prev == null
                Buckets[index] = node.next
            else
                prev.next = node.next
            return true
        prev = node
        node = node.next

    return false  // not found`,
  },

  linear: {
    put:
`// Linear Probing — PUT(Key, Value)
// Time: O(1) avg | Space: O(n)
// Probe sequence: (H + i) % Capacity
ALGORITHM PUT(Key, Value)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step) % Capacity

        if Buckets[i] is EMPTY or TOMBSTONE
            Buckets[i] = { key: Key, value: Value }
            return
        if Buckets[i].key == Key
            Buckets[i].value = Value  // update
            return

        step = step + 1

    error "Hash table is full"`,

    get:
`// Linear Probing — GET(Key)
// Time: O(1) avg
// Probe sequence: (H + i) % Capacity
ALGORITHM GET(Key)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step) % Capacity

        if Buckets[i] is EMPTY
            return null   // stopped at empty slot
        if Buckets[i] is not TOMBSTONE
            if Buckets[i].key == Key
                return Buckets[i].value

        step = step + 1

    return null  // not found`,

    remove:
`// Linear Probing — REMOVE(Key)
// Uses TOMBSTONE to preserve probe chains
// Time: O(1) avg
ALGORITHM REMOVE(Key)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step) % Capacity

        if Buckets[i] is EMPTY
            return false  // not found
        if Buckets[i] is not TOMBSTONE
            if Buckets[i].key == Key
                Buckets[i] = TOMBSTONE
                return true

        step = step + 1

    return false`,
  },

  quadratic: {
    put:
`// Quadratic Probing — PUT(Key, Value)
// Time: O(1) avg | Space: O(n)
// Probe sequence: (H + i²) % Capacity
ALGORITHM PUT(Key, Value)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step*step) % Capacity

        if Buckets[i] is EMPTY or TOMBSTONE
            Buckets[i] = { key: Key, value: Value }
            return
        if Buckets[i].key == Key
            Buckets[i].value = Value  // update
            return

        step = step + 1

    error "Hash table is full"`,

    get:
`// Quadratic Probing — GET(Key)
// Time: O(1) avg
// Probe sequence: (H + i²) % Capacity
ALGORITHM GET(Key)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step*step) % Capacity

        if Buckets[i] is EMPTY
            return null
        if Buckets[i] is not TOMBSTONE
            if Buckets[i].key == Key
                return Buckets[i].value

        step = step + 1

    return null`,

    remove:
`// Quadratic Probing — REMOVE(Key)
// Uses TOMBSTONE to preserve probe chains
// Time: O(1) avg
ALGORITHM REMOVE(Key)
    index = Hash(Key) % Capacity
    step  = 0

    while step < Capacity
        i = (index + step*step) % Capacity

        if Buckets[i] is EMPTY
            return false
        if Buckets[i] is not TOMBSTONE
            if Buckets[i].key == Key
                Buckets[i] = TOMBSTONE
                return true

        step = step + 1

    return false`,
  },
};

// Keep legacy export for backward compat
export const hashmapSnippets = hashtableSnippets.chaining;


export const heapSnippets = {
  min: {
    insert:
`// Min-Heap INSERT
// Time: O(log n) | Space: O(1)
// After inserting, sift up to restore heap property.
ALGORITHM INSERT(value)
    heap.push(value)           // step 1: append to end
    i = heap.length - 1        // start at the new node

    while i > 0
        parent = floor((i - 1) / 2)

        if heap[i] < heap[parent]   // min-heap violation
            swap(heap[i], heap[parent])
            i = parent              // continue upward
        else
            break                   // heap property restored`,

    extract:
`// Min-Heap EXTRACT_MIN
// Time: O(log n) | Space: O(1)
// Remove root, move last to root, sift down.
ALGORITHM EXTRACT_MIN()
    if heap is empty: return null

    min    = heap[0]           // save the minimum (root)
    heap[0] = heap[last]       // move last element to root
    heap.pop()                 // remove the last element

    i = 0
    while true
        left     = 2 * i + 1
        right    = 2 * i + 2
        smallest = i

        if left  < heap.size and heap[left]  < heap[smallest]
            smallest = left
        if right < heap.size and heap[right] < heap[smallest]
            smallest = right

        if smallest == i
            break              // heap property satisfied
        
        swap(heap[i], heap[smallest])
        i = smallest

    return min`,
  },

  max: {
    insert:
`// Max-Heap INSERT
// Time: O(log n) | Space: O(1)
// After inserting, sift up to restore heap property.
ALGORITHM INSERT(value)
    heap.push(value)           // step 1: append to end
    i = heap.length - 1        // start at the new node

    while i > 0
        parent = floor((i - 1) / 2)

        if heap[i] > heap[parent]   // max-heap violation
            swap(heap[i], heap[parent])
            i = parent              // continue upward
        else
            break                   // heap property restored`,

    extract:
`// Max-Heap EXTRACT_MAX
// Time: O(log n) | Space: O(1)
// Remove root, move last to root, sift down.
ALGORITHM EXTRACT_MAX()
    if heap is empty: return null

    max    = heap[0]           // save the maximum (root)
    heap[0] = heap[last]       // move last element to root
    heap.pop()                 // remove the last element

    i = 0
    while true
        left    = 2 * i + 1
        right   = 2 * i + 2
        largest = i

        if left  < heap.size and heap[left]  > heap[largest]
            largest = left
        if right < heap.size and heap[right] > heap[largest]
            largest = right

        if largest == i
            break              // heap property satisfied
        
        swap(heap[i], heap[largest])
        i = largest

    return max`,
  },
};

export const bitwiseSnippets = {
  basics:
`// BITWISE OPERATIONS BASICS
// Bitwise operators treat their operands as a sequence of 32 bits (zeros and ones).
// AND (&)  : Returns 1 if both bits are 1.
// OR  (|)  : Returns 1 if either bit is 1.
// XOR (^)  : Returns 1 if the bits are different.
// NOT (~)  : Inverts the bits (0 becomes 1, 1 becomes 0).
// L-Shift (<<) : Shifts bits to the left, filling with 0s on the right.
// R-Shift (>>) : Shifts bits to the right, preserving the sign bit on the left.
// Unsigned R-Shift (>>>) : Shifts right, filling with 0s on the left.`,

  evenOdd:
`// TRICK: CHECK EVEN / ODD
// A binary number is odd if and only if its lowest bit (the 1s column) is a 1.
// By performing a bitwise AND with 1 (which is ...00000001 in binary), 
// we mask out all other bits except the lowest one.

bool isOdd(n) {
    return (n & 1) == 1
}

bool isEven(n) {
    return (n & 1) == 0
}`,

  powerOf2:
`// TRICK: CHECK IF POWER OF 2
// A power of 2 (e.g. 2, 4, 8, 16) always has EXACTLY ONE bit set to 1.
// Examples: 4 is 0100, 8 is 1000.
// If you subtract 1 from a power of 2, all bits after the 1 become 1s, 
// and the 1 becomes a 0. (e.g., 8-1 = 7, which is 0111).
// Therefore, (n & (n - 1)) will always be 0 for powers of 2!

bool isPowerOfTwo(n) {
    // Note: n must be > 0. If n=0, n & (n-1) is 0 but it's not a power of 2.
    return n > 0 && (n & (n - 1)) == 0
}`,

  clearLowest:
`// TRICK: CLEAR LOWEST SET BIT
// Want to turn off the lowest '1' in a binary number?
// Subtracting 1 flips all bits up to and including the lowest set bit.
// Bitwise ANDing n with (n-1) will therefore clear exactly that bit!
// Example: n = 12 (1100). n-1 = 11 (1011). 
// 1100 & 1011 = 1000 (8). The lowest '1' was erased.

int clearLowestSetBit(n) {
    return n & (n - 1)
}`,

  getLowest:
`// TRICK: GET LOWEST SET BIT (Isolate the lowest '1')
// Useful in algorithms like Fenwick Trees (Binary Indexed Trees).
// In Two's Complement arithmetic, -n is mathematically equivalent to (~n + 1).
// This operation flips all bits of n, then adds 1, which ripples through 
// and restores exactly the lowest set bit to its original position!
// Therefore, (n & -n) extracts ONLY the lowest set bit.

int getLowestSetBit(n) {
    return n & -n
}`
};

export const logicSnippets = {
  AND:
`// AND GATE
// Outputs 1 ONLY if BOTH inputs are 1.
// 
// Truth Table:
// A | B | Out
// --+---+----
// 0 | 0 |  0
// 0 | 1 |  0
// 1 | 0 |  0
// 1 | 1 |  1`,

  OR:
`// OR GATE
// Outputs 1 if AT LEAST ONE input is 1.
// 
// Truth Table:
// A | B | Out
// --+---+----
// 0 | 0 |  0
// 0 | 1 |  1
// 1 | 0 |  1
// 1 | 1 |  1`,

  XOR:
`// XOR GATE (Exclusive OR)
// Outputs 1 if inputs are DIFFERENT.
// 
// Truth Table:
// A | B | Out
// --+---+----
// 0 | 0 |  0
// 0 | 1 |  1
// 1 | 0 |  1
// 1 | 1 |  0`,

  NOT:
`// NOT GATE (Inverter)
// Outputs the OPPOSITE of the input.
// 
// Truth Table:
// A | Out
// --+----
// 0 |  1
// 1 |  0`,

  HALF_ADDER:
`// HALF ADDER
// Adds two single binary digits (A, B).
// Sum = A XOR B
// Carry = A AND B
// 
// Truth Table:
// A | B | Sum | Carry
// --+---+-----+------
// 0 | 0 |  0  |   0
// 0 | 1 |  1  |   0
// 1 | 0 |  1  |   0
// 1 | 1 |  0  |   1`,

  FULL_ADDER:
`// FULL ADDER
// Adds two bits (A, B) AND a Carry-In (Cin).
// Made by chaining two Half Adders and an OR gate.
// 
// Truth Table:
// A | B | Cin | Sum | Cout
// --+---+-----+-----+-----
// 0 | 0 |  0  |  0  |  0
// 0 | 0 |  1  |  1  |  0
// 0 | 1 |  0  |  1  |  0
// 0 | 1 |  1  |  0  |  1
// 1 | 0 |  0  |  1  |  0
// 1 | 0 |  1  |  0  |  1
// 1 | 1 |  0  |  0  |  1
// 1 | 1 |  1  |  1  |  1`,

  MUX:
`// 2-to-1 MULTIPLEXER (MUX)
// Acts like a digital switch. 
// Uses a Selector (Sel) to choose which input (D0 or D1) flows to Out.
// 
// Out = (D0 AND NOT Sel) OR (D1 AND Sel)
// 
// Truth Table:
// Sel | D0 | D1 | Out
// ----+----+----+----
//  0  |  0 |  X |  0   (D0 is routed)
//  0  |  1 |  X |  1   (D0 is routed)
//  1  |  X |  0 |  0   (D1 is routed)
//  1  |  X |  1 |  1   (D1 is routed)`
};

export const floatSnippets = {
  IEEE754:
`// IEEE-754 Single Precision (32-bit Float)
// 
// Floating point numbers are effectively "Scientific Notation" for computers.
// Example: -3.14 x 10^2
// 
// A 32-bit float breaks this into 3 parts:
// 1. Sign Bit (1 bit): 0 for positive, 1 for negative.
// 2. Exponent (8 bits): The power of 2, shifted by a "Bias" of 127.
// 3. Mantissa / Fraction (23 bits): The precision / digits after the decimal.
// 
// The Formula:
// Value = (-1)^Sign * 2^(Exponent - 127) * (1.Mantissa)
// 
// Special Cases:
// - Exponent = 255, Mantissa = 0  -> Infinity (or -Infinity)
// - Exponent = 255, Mantissa != 0 -> NaN (Not a Number)
// - Exponent = 0,   Mantissa = 0  -> 0 (or -0)
// - Exponent = 0,   Mantissa != 0 -> Denormalized (super tiny numbers)`
};

export const assemblySnippets = {
  ISA:
`// Mini Assembly Instruction Set Architecture (ISA)

// Registers available: R0, R1, R2, R3 (8-bit, values 0-255)
// Memory available: Slots 0 to 15
// PC: Program Counter (current line number)

// ----------------------------------------------------
// COMMANDS:
// ----------------------------------------------------

MOV dest, src    // Move value from src to dest
                 // E.g., MOV R0, 5    (Sets R0 to 5)
                 // E.g., MOV R1, R0   (Copies R0 to R1)

ADD dest, src    // Add src to dest
                 // E.g., ADD R0, 1    (R0 = R0 + 1)
                 // E.g., ADD R0, R1   (R0 = R0 + R1)

SUB dest, src    // Subtract src from dest
                 // E.g., SUB R0, 1    (R0 = R0 - 1)

LOAD dest, addr  // Load from Memory at addr into dest
                 // E.g., LOAD R0, 10  (R0 = Memory[10])

STORE src, addr  // Store src into Memory at addr
                 // E.g., STORE R0, 10 (Memory[10] = R0)

JMP line         // Jump PC to line number
                 // E.g., JMP 5        (Goto Line 5)

// JNZ reg, line    // Jump Not Zero
//                  // E.g., JNZ R0, 5    (If R0 != 0, Goto Line 5)`
};

export const cacheSnippets = {
  LRU:
`// Memory & Caching Architecture Concepts

// 1. Spatial Locality:
// When the CPU requests Address X, it usually wants Address X+1 soon after.
// Therefore, the CPU doesn't just fetch Address X from RAM. It fetches 
// an entire "Block" (e.g., Addresses X, X+1, X+2, X+3) and stores the 
// whole block in the ultra-fast L1 Cache.

// 2. Cache Hits vs Misses:
// Hit: The requested data is already in the Cache. (Super fast!)
// Miss: The data isn't in the Cache. The CPU must wait for RAM. (Slow!)

// 3. LRU Eviction Policy (Least Recently Used):
// Caches are tiny. When the Cache is full and a new block needs to be 
// loaded from RAM, which old block gets kicked out?
// LRU looks at the timestamps of all cache lines and kicks out the one 
// that hasn't been accessed in the longest time.`
};
