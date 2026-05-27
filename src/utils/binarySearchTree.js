export class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.id = Math.random().toString(36).substr(2, 9); // unique id for React keys
  }
}

// Clone tree to trigger React re-renders
export function cloneTree(root) {
  if (!root) return null;
  const newNode = new TreeNode(root.value);
  newNode.id = root.id;
  newNode.x = root.x;
  newNode.y = root.y;
  newNode.left = cloneTree(root.left);
  newNode.right = cloneTree(root.right);
  return newNode;
}

// Calculate X and Y coordinates for SVG rendering
export function calculateNodePositions(root, svgWidth, svgHeight) {
  if (!root) return null;
  
  const levelHeight = 60;
  const startY = 40;
  
  const setPosition = (node, level, leftBound, rightBound) => {
    if (!node) return;
    const x = leftBound + (rightBound - leftBound) / 2;
    const y = startY + level * levelHeight;
    node.x = x;
    node.y = y;
    
    setPosition(node.left, level + 1, leftBound, x);
    setPosition(node.right, level + 1, x, rightBound);
  };
  
  setPosition(root, 0, 0, svgWidth);
  return root;
}

export function insertNode(root, value, path = []) {
  if (!root) {
    return new TreeNode(value);
  }
  
  path.push(root.id); // track path for animation
  
  if (value < root.value) {
    root.left = insertNode(root.left, value, path);
  } else if (value > root.value) {
    root.right = insertNode(root.right, value, path);
  }
  // If value exists, do nothing (standard BST behavior)
  return root;
}

export function searchNode(root, value, path = []) {
  if (!root) return { found: false, path };
  
  path.push(root.id);
  
  if (root.value === value) {
    return { found: true, path, targetId: root.id };
  }
  
  if (value < root.value) {
    return searchNode(root.left, value, path);
  } else {
    return searchNode(root.right, value, path);
  }
}

export function getMinNode(node) {
  let current = node;
  while (current.left !== null) {
    current = current.left;
  }
  return current;
}

export function deleteNode(root, value, path = []) {
  if (!root) return root;

  path.push(root.id);

  if (value < root.value) {
    root.left = deleteNode(root.left, value, path);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value, path);
  } else {
    // Node found
    if (!root.left && !root.right) {
      // Leaf node
      return null;
    }
    if (!root.left) {
      // One child (right)
      return root.right;
    }
    if (!root.right) {
      // One child (left)
      return root.left;
    }
    
    // Two children
    const minNode = getMinNode(root.right);
    root.value = minNode.value;
    root.right = deleteNode(root.right, minNode.value, path);
  }
  return root;
}

// Traversals return array of node IDs in order
export function inOrderTraversal(root, result = []) {
  if (root) {
    inOrderTraversal(root.left, result);
    result.push(root.id);
    inOrderTraversal(root.right, result);
  }
  return result;
}

export function preOrderTraversal(root, result = []) {
  if (root) {
    result.push(root.id);
    preOrderTraversal(root.left, result);
    preOrderTraversal(root.right, result);
  }
  return result;
}

export function postOrderTraversal(root, result = []) {
  if (root) {
    postOrderTraversal(root.left, result);
    postOrderTraversal(root.right, result);
    result.push(root.id);
  }
  return result;
}
