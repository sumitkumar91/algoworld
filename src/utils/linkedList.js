export class LLNode {
  constructor(value, id) {
    this.value = value;
    this.id = id || Math.random().toString(36).substr(2, 9);
    // Generate a pseudo-random memory address like 0x4F2A
    this.address = '0x' + Math.floor(Math.random() * 65536).toString(16).toUpperCase().padStart(4, '0');
    this.x = 0;
    this.y = 0;
  }
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 400;
const NODE_SPACING = 140;
const Y_POS = SVG_HEIGHT / 2;

// Helper to assign base coordinates to a list of nodes
export const calculateListPositions = (nodes) => {
  const totalWidth = (nodes.length - 1) * NODE_SPACING;
  let startX = (SVG_WIDTH - totalWidth) / 2;
  if (startX < 80) startX = 80;

  return nodes.map((node, i) => ({
    ...node,
    x: startX + i * NODE_SPACING,
    y: Y_POS
  }));
};

// Generates explicit pointers for a given node arrangement
export const generatePointers = (nodes, mode, activeNodes = new Set()) => {
  const pointers = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nextNode = nodes[i + 1];
    const isHighlighted = activeNodes.has(node.id) || (nextNode && activeNodes.has(nextNode.id));

    if (nextNode) {
      // Forward pointer
      let yOffset = mode === 'dll' ? -10 : 0;
      pointers.push({
        id: `fwd-${node.id}`,
        x1: node.x + 30, // From right edge of next compartment
        y1: node.y + yOffset,
        x2: nextNode.x - 40, // To left edge of data compartment
        y2: nextNode.y + yOffset,
        isHighlighted,
        type: 'straight'
      });

      if (mode === 'dll') {
        // Backward pointer
        pointers.push({
          id: `bwd-${node.id}`,
          x1: nextNode.x - 40,
          y1: nextNode.y + 10,
          x2: node.x + 30,
          y2: node.y + 10,
          isHighlighted,
          type: 'straight'
        });
      }
    } else {
      // Last node
      if (mode === 'csll' && nodes.length > 1) {
        const headNode = nodes[0];
        const isLoopHighlighted = activeNodes.has(node.id) || activeNodes.has(headNode.id);
        pointers.push({
          id: 'csll-loop',
          x1: node.x + 30,
          y1: node.y,
          x2: headNode.x - 40,
          y2: headNode.y,
          cx: (node.x + headNode.x) / 2,
          cy: node.y + 100,
          isHighlighted: isLoopHighlighted,
          type: 'curve'
        });
      } else if (mode === 'sll' || mode === 'dll') {
        // Point to NIL
        let yOffset = mode === 'dll' ? -10 : 0;
        pointers.push({
          id: `nil-${node.id}`,
          x1: node.x + 30,
          y1: node.y + yOffset,
          x2: node.x + 70,
          y2: node.y + yOffset + 40,
          isHighlighted: activeNodes.has(node.id),
          type: 'null'
        });
      }
    }

    // DLL Head prev points to NIL
    if (i === 0 && mode === 'dll') {
      pointers.push({
        id: `nil-head-${node.id}`,
        x1: node.x - 40,
        y1: node.y + 10,
        x2: node.x - 80,
        y2: node.y + 50,
        isHighlighted: activeNodes.has(node.id),
        type: 'null'
      });
    }
  }
  
  return pointers;
};

export const getInsertFrames = (initialNodes, value, type = 'tail', mode = 'sll', index = 0) => {
  const frames = [];
  const newNode = new LLNode(value);
  let currentNodes = calculateListPositions([...initialNodes]);
  
  // Step 1: Instantiate new node floating below the list
  newNode.x = (SVG_WIDTH / 2);
  newNode.y = Y_POS + 100;
  
  let tempNodes = [...currentNodes, newNode];
  
  frames.push({
    nodes: tempNodes,
    pointers: generatePointers(currentNodes, mode),
    activeNodes: [newNode.id],
    action: `Create new node ${value} at ${newNode.address}`
  });

  let resultNodes = [...initialNodes];

  if (type === 'head') {
    // Float under head
    if (currentNodes.length > 0) {
      newNode.x = currentNodes[0].x;
      frames.push({
        nodes: tempNodes,
        pointers: generatePointers(currentNodes, mode),
        activeNodes: [newNode.id],
        action: 'Positioning new head'
      });
    }

    resultNodes.unshift(newNode);
    const finalPositions = calculateListPositions(resultNodes);
    
    // Draw explicit connection before shifting
    if (currentNodes.length > 0) {
       let tempPointers = generatePointers(currentNodes, mode);
       tempPointers.push({
         id: 'temp-insert',
         x1: newNode.x + 30,
         y1: newNode.y,
         x2: currentNodes[0].x - 40,
         y2: currentNodes[0].y,
         isHighlighted: true,
         type: 'straight'
       });
       frames.push({
         nodes: tempNodes,
         pointers: tempPointers,
         activeNodes: [newNode.id, currentNodes[0].id],
         action: `Point new node to ${currentNodes[0].address}`
       });
    }

    // Final layout
    frames.push({
      nodes: finalPositions,
      pointers: generatePointers(finalPositions, mode, new Set([newNode.id])),
      activeNodes: [newNode.id],
      action: 'Update head and recalculate layout'
    });

  } else if (type === 'tail') {
    // Traverse
    for (let i = 0; i < currentNodes.length; i++) {
      frames.push({
        nodes: tempNodes,
        pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
        activeNodes: [currentNodes[i].id],
        action: `Traversing... checking ${currentNodes[i].address}`
      });
    }
    
    if (currentNodes.length > 0) {
      const tail = currentNodes[currentNodes.length - 1];
      newNode.x = tail.x + NODE_SPACING;
      newNode.y = tail.y + 80;
      
      frames.push({
        nodes: tempNodes,
        pointers: generatePointers(currentNodes, mode, new Set([tail.id])),
        activeNodes: [tail.id, newNode.id],
        action: 'Found tail node'
      });

      let tempPointers = generatePointers(currentNodes, mode);
      // Remove old null pointer if sll/dll
      tempPointers = tempPointers.filter(p => !p.id.startsWith(`nil-${tail.id}`));
      
      tempPointers.push({
        id: 'temp-insert',
        x1: tail.x + 30,
        y1: tail.y,
        x2: newNode.x - 40,
        y2: newNode.y,
        isHighlighted: true,
        type: 'straight'
      });

      frames.push({
        nodes: tempNodes,
        pointers: tempPointers,
        activeNodes: [tail.id, newNode.id],
        action: `Update tail pointer to ${newNode.address}`
      });
    }

    resultNodes.push(newNode);
    const finalPositions = calculateListPositions(resultNodes);
    
    frames.push({
      nodes: finalPositions,
      pointers: generatePointers(finalPositions, mode, new Set([newNode.id])),
      activeNodes: [newNode.id],
      action: 'Recalculate list layout'
    });
    
  } else if (type === 'index') {
    let targetIdx = Math.min(index, currentNodes.length);
    
    for (let i = 0; i < targetIdx; i++) {
      frames.push({
        nodes: tempNodes,
        pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
        activeNodes: [currentNodes[i].id],
        action: `Traversing to index ${index}...`
      });
    }

    if (targetIdx > 0 && targetIdx < currentNodes.length) {
      const prev = currentNodes[targetIdx - 1];
      const curr = currentNodes[targetIdx];
      
      newNode.x = prev.x + (NODE_SPACING / 2);
      newNode.y = prev.y + 80;

      let tempPointers = generatePointers(currentNodes, mode);
      
      // Point new node to current
      tempPointers.push({
        id: 'temp-new-to-curr',
        x1: newNode.x + 30,
        y1: newNode.y,
        x2: curr.x - 40,
        y2: curr.y,
        isHighlighted: true,
        type: 'straight'
      });

      frames.push({
        nodes: tempNodes,
        pointers: tempPointers,
        activeNodes: [newNode.id, curr.id],
        action: `Point new node to ${curr.address}`
      });

      // Break prev to current, point prev to new
      tempPointers = tempPointers.filter(p => p.id !== `fwd-${prev.id}`);
      tempPointers.push({
        id: 'temp-prev-to-new',
        x1: prev.x + 30,
        y1: prev.y,
        x2: newNode.x - 40,
        y2: newNode.y,
        isHighlighted: true,
        type: 'straight'
      });

      frames.push({
        nodes: tempNodes,
        pointers: tempPointers,
        activeNodes: [prev.id, newNode.id],
        action: `Break old link, point ${prev.address} to ${newNode.address}`
      });
    }

    resultNodes.splice(targetIdx, 0, newNode);
    const finalPositions = calculateListPositions(resultNodes);
    frames.push({
      nodes: finalPositions,
      pointers: generatePointers(finalPositions, mode, new Set([newNode.id])),
      activeNodes: [newNode.id],
      action: 'Recalculate list layout'
    });
  }

  return { frames, finalNodes: resultNodes };
};

export const getDeleteFrames = (initialNodes, value, mode = 'sll') => {
  const frames = [];
  let resultNodes = [...initialNodes];
  let currentNodes = calculateListPositions([...initialNodes]);
  
  let foundIdx = -1;
  for (let i = 0; i < currentNodes.length; i++) {
    frames.push({
      nodes: currentNodes,
      pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
      activeNodes: [currentNodes[i].id],
      action: `Comparing node ${currentNodes[i].value} with ${value}`
    });
    if (currentNodes[i].value === value) {
      foundIdx = i;
      frames.push({
        nodes: currentNodes,
        pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
        activeNodes: [currentNodes[i].id],
        isFound: true,
        action: 'Node found!'
      });
      break;
    }
  }

  if (foundIdx !== -1) {
    const target = currentNodes[foundIdx];
    
    // Animate dropping out of list
    target.y += 60;
    
    let tempPointers = generatePointers(currentNodes, mode);
    
    if (foundIdx > 0 && foundIdx < currentNodes.length - 1) {
      const prev = currentNodes[foundIdx - 1];
      const next = currentNodes[foundIdx + 1];
      
      // Draw bypass pointer
      tempPointers.push({
        id: 'temp-bypass',
        x1: prev.x + 30,
        y1: prev.y,
        x2: next.x - 40,
        y2: next.y,
        isHighlighted: true,
        type: 'curve',
        cx: target.x,
        cy: prev.y - 80
      });
      
      frames.push({
        nodes: currentNodes,
        pointers: tempPointers,
        activeNodes: [prev.id, next.id],
        action: `Bypass node, point ${prev.address} to ${next.address}`
      });
    }
    
    resultNodes.splice(foundIdx, 1);
    const finalPositions = calculateListPositions(resultNodes);
    frames.push({
      nodes: finalPositions,
      pointers: generatePointers(finalPositions, mode),
      activeNodes: [],
      action: 'Node deleted, memory freed'
    });
  } else {
    frames.push({
      nodes: currentNodes,
      pointers: generatePointers(currentNodes, mode),
      activeNodes: [],
      action: 'Node not found'
    });
  }

  return { frames, finalNodes: resultNodes };
};

export const getSearchFrames = (initialNodes, value, mode = 'sll') => {
  const frames = [];
  let currentNodes = calculateListPositions([...initialNodes]);
  
  let found = false;
  for (let i = 0; i < currentNodes.length; i++) {
    frames.push({
      nodes: currentNodes,
      pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
      activeNodes: [currentNodes[i].id],
      action: `Comparing ${currentNodes[i].value} with ${value}`
    });
    if (currentNodes[i].value === value) {
      frames.push({
        nodes: currentNodes,
        pointers: generatePointers(currentNodes, mode, new Set([currentNodes[i].id])),
        activeNodes: [currentNodes[i].id],
        isFound: true,
        action: 'Node found!'
      });
      found = true;
      break;
    }
  }
  
  if (!found) {
    frames.push({
      nodes: currentNodes,
      pointers: generatePointers(currentNodes, mode),
      activeNodes: [],
      action: 'Node not found'
    });
  }
  
  return { frames };
};
