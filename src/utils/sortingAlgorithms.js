// Selection Sort
export function getSelectionSortAnimations(array) {
  const animations = [];
  const arr = array.slice();
  
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      animations.push(['compare', minIdx, j]);
      animations.push(['revert', minIdx, j]);
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    animations.push(['overwrite', i, arr[minIdx]]);
    animations.push(['overwrite', minIdx, arr[i]]);
    // Swap in auxiliary array
    let temp = arr[i];
    arr[i] = arr[minIdx];
    arr[minIdx] = temp;
  }
  return animations;
}

// Insertion Sort
export function getInsertionSortAnimations(array) {
  const animations = [];
  const arr = array.slice();
  
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    animations.push(['compare', i, j]);
    animations.push(['revert', i, j]);
    
    while (j >= 0 && arr[j] > key) {
      animations.push(['compare', j, j + 1]);
      animations.push(['revert', j, j + 1]);
      
      animations.push(['overwrite', j + 1, arr[j]]);
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    animations.push(['overwrite', j + 1, key]);
    arr[j + 1] = key;
  }
  return animations;
}

// Merge Sort
export function getMergeSortAnimations(array) {
  const animations = [];
  if (array.length <= 1) return animations;
  const auxiliaryArray = array.slice();
  mergeSortHelper(array.slice(), 0, array.length - 1, auxiliaryArray, animations);
  return animations;
}

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
  if (startIdx === endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  while (i <= middleIdx && j <= endIdx) {
    animations.push(['compare', i, j]);
    animations.push(['revert', i, j]);
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      animations.push(['overwrite', k, auxiliaryArray[i]]);
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      animations.push(['overwrite', k, auxiliaryArray[j]]);
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  while (i <= middleIdx) {
    animations.push(['compare', i, i]);
    animations.push(['revert', i, i]);
    animations.push(['overwrite', k, auxiliaryArray[i]]);
    mainArray[k++] = auxiliaryArray[i++];
  }
  while (j <= endIdx) {
    animations.push(['compare', j, j]);
    animations.push(['revert', j, j]);
    animations.push(['overwrite', k, auxiliaryArray[j]]);
    mainArray[k++] = auxiliaryArray[j++];
  }
}

// Quick Sort
export function getQuickSortAnimations(array) {
  const animations = [];
  const arr = array.slice();
  quickSortHelper(arr, 0, arr.length - 1, animations);
  return animations;
}

function quickSortHelper(arr, startIdx, endIdx, animations) {
  if (startIdx < endIdx) {
    const pivotIdx = partition(arr, startIdx, endIdx, animations);
    quickSortHelper(arr, startIdx, pivotIdx - 1, animations);
    quickSortHelper(arr, pivotIdx + 1, endIdx, animations);
  }
}

function partition(arr, startIdx, endIdx, animations) {
  const pivotValue = arr[endIdx];
  let pivotIdx = startIdx;
  for (let i = startIdx; i < endIdx; i++) {
    animations.push(['compare', i, endIdx]);
    animations.push(['revert', i, endIdx]);
    if (arr[i] < pivotValue) {
      animations.push(['overwrite', i, arr[pivotIdx]]);
      animations.push(['overwrite', pivotIdx, arr[i]]);
      let temp = arr[i];
      arr[i] = arr[pivotIdx];
      arr[pivotIdx] = temp;
      pivotIdx++;
    }
  }
  animations.push(['overwrite', pivotIdx, arr[endIdx]]);
  animations.push(['overwrite', endIdx, arr[pivotIdx]]);
  let temp = arr[pivotIdx];
  arr[pivotIdx] = arr[endIdx];
  arr[endIdx] = temp;
  return pivotIdx;
}
