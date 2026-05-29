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
