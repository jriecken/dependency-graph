/**
 * A simple dependency graph
 */

/**
 * Helper for creating a Depth-First-Search on
 * a set of edges.
 *
 * Detects cycles and throws an Error if one is detected.
 *
 * @param edges The set of edges to DFS through
 * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
 * @param result An array in which the results will be populated
 * @param circular A boolean to allow circular dependencies
 */
function createDFS(edges, leavesOnly, result, circular) {
  var currentPath = [];
  var currentPathSet = {};
  var visited = {};
  var resultSet = {};
  return function DFS(currentNode) {
    visited[currentNode] = true;
    currentPath.push(currentNode);
    currentPathSet[currentNode] = true;
    for (const node of edges[currentNode]) {
      if (!visited[node]) {
        DFS(node);
      } else if (!currentPathSet[node]) {
        currentPath.push(node);
        if (!circular) {
          throw new DepGraphCycleError(currentPath);
        }
      }
    }
    delete currentPath[currentPath.pop()]
    if ((!leavesOnly || edges[currentNode].size === 0) && !resultSet[currentNode]) {
      result.push(currentNode);
      resultSet[currentNode] = true;
    }
  };
}

/**
 * Simple Dependency Graph
 */
var DepGraph = exports.DepGraph = function DepGraph(opts) {
  this.nodes = {}; // Node -> Node/Data (treated like a Set)
  this.outgoingEdges = {}; // Node -> [Dependency Node]
  this.incomingEdges = {}; // Node -> [Dependant Node]
  this.circular = opts && !!opts.circular; // Allows circular deps
};
DepGraph.prototype = {
  /**
   * The number of nodes in the graph.
   */
  size: function () {
    return Object.keys(this.nodes).length;
  },
  /**
   * Add a node to the dependency graph. If a node already exists, this method will do nothing.
   */
  addNode: function (node, data) {
    if (!this.hasNode(node)) {
      // Checking the arguments length allows the user to add a node with undefined data
      if (arguments.length === 2) {
        this.nodes[node] = data;
      } else {
        this.nodes[node] = node;
      }
      this.outgoingEdges[node] = new Set()
      this.incomingEdges[node] = new Set()
    }
  },
  /**
   * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
   */
  removeNode: function (node) {
    if (this.hasNode(node)) {
      const children = this.outgoingEdges[node]
      const parents = this.incomingEdges[node]
      for (const child of children) {
        this.incomingEdges[child].delete(node)
      }
      for (const parent of parents) {
        this.outgoingEdges[parent].delete(node)
      }

      delete this.nodes[node];
      delete this.outgoingEdges[node]
      delete this.incomingEdges[node]
    }
  },
  /**
   * Check if a node exists in the graph
   */
  hasNode: (() => {
    const hasOwnProperty = Object.prototype.hasOwnProperty

    return function (node) {
      return hasOwnProperty.call(this.nodes, node);
    }
  })(),
  /**
   * Get the data associated with a node name
   */
  getNodeData: function (node) {
    if (this.hasNode(node)) {
      return this.nodes[node];
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  },
  /**
   * Set the associated data for a given node name. If the node does not exist, this method will throw an error
   */
  setNodeData: function (node, data) {
    if (this.hasNode(node)) {
      this.nodes[node] = data;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  },
  /**
   * Add a dependency between two nodes. If either of the nodes does not exist,
   * an Error will be thrown.
   */
  addDependency: function (from, to) {
    if (!this.hasNode(from)) {
      throw new Error('Node does not exist: ' + from);
    }
    if (!this.hasNode(to)) {
      throw new Error('Node does not exist: ' + to);
    }
    this.outgoingEdges[from].add(to);
    this.incomingEdges[to].add(from);
  },
  /**
   * Remove a dependency between two nodes.
   */
  removeDependency: function (from, to) {
    if (this.hasNode(from)) {
      this.outgoingEdges[from].delete(to);
    }

    if (this.hasNode(to)) {
      this.incomingEdges[to].delete(from)
    }
  },
  /**
   * Return a clone of the dependency graph. If any custom data is attached
   * to the nodes, it will only be shallow copied.
   */
  clone: function () {
    var source = this;
    var result = new DepGraph();
    var keys = Object.keys(source.nodes);
    keys.forEach(function (n) {
      result.nodes[n] = source.nodes[n];
      result.outgoingEdges[n] = new Set(source.outgoingEdges[n])
      result.incomingEdges[n] = new Set(source.incomingEdges[n])
    });
    return result;
  },
  /**
   * Get an array containing the nodes that the specified node depends on (transitively).
   *
   * Throws an Error if the graph has a cycle, or the specified node does not exist.
   *
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
   * in the array.
   */
  dependenciesOf: function (node, leavesOnly) {
    if (this.hasNode(node)) {
      var result = [];
      var DFS = createDFS(this.outgoingEdges, leavesOnly, result, this.circular);
      DFS(node);
      var idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    }
    else {
      throw new Error('Node does not exist: ' + node);
    }
  },
  /**
   * get an array containing the nodes that depend on the specified node (transitively).
   *
   * Throws an Error if the graph has a cycle, or the specified node does not exist.
   *
   * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
   */
  dependantsOf: function (node, leavesOnly) {
    if (this.hasNode(node)) {
      var result = [];
      var DFS = createDFS(this.incomingEdges, leavesOnly, result, this.circular);
      DFS(node);
      var idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error('Node does not exist: ' + node);
    }
  },
  /**
   * Construct the overall processing order for the dependency graph.
   *
   * Throws an Error if the graph has a cycle.
   *
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
   */
  overallOrder: function (leavesOnly) {
    var self = this;
    var result = [];
    var keys = Object.keys(this.nodes);
    if (keys.length === 0) {
      return result; // Empty graph
    } else {
      if (!this.circular) {
        // Look for cycles - we run the DFS starting at all the nodes in case there
        // are several disconnected subgraphs inside this dependency graph.
        var CycleDFS = createDFS(this.outgoingEdges, false, [], this.circular);
        keys.forEach(function (n) {
          CycleDFS(n);
        });
      }

      var DFS = createDFS(this.outgoingEdges, leavesOnly, result, this.circular);
      // Find all potential starting points (nodes with nothing depending on them) an
      // run a DFS starting at these points to get the order
      keys.filter(function (node) {
        return self.incomingEdges[node].length === 0;
      }).forEach(function (n) {
        DFS(n);
      });

      // If we're allowing cycles - we need to run the DFS against any remaining
      // nodes that did not end up in the initial result (as they are part of a
      // subgraph that does not have a clear starting point)
      if (this.circular) {
        keys.filter(function (node) {
          return result.indexOf(node) === -1;
        }).forEach(function (n) {
          DFS(n);
        });
      }

      return result;
    }
  }
};

/**
 * Cycle error, including the path of the cycle.
 */
var DepGraphCycleError = exports.DepGraphCycleError = function (cyclePath) {
  var message = 'Dependency Cycle Found: ' + cyclePath.join(' -> ')
  var instance = new Error(message);
  instance.cyclePath = cyclePath;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, DepGraphCycleError);
  }
  return instance;
}
DepGraphCycleError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});
Object.setPrototypeOf(DepGraphCycleError, Error);
