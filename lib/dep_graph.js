/**
 * A simple dependency graph
 */

/**
 * Helper for creating a Topological Sort using Depth-First-Search on a set of edges.
 *
 * Detects cycles and throws an Error if one is detected (unless the "circular"
 * parameter is "true" in which case it ignores them).
 *
 * @param edges The edges to DFS through (this is a Map of node to Array of nodes)
 * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
 * @param result An array in which the results will be populated
 * @param circular A boolean to allow circular dependencies
 */
function createDFS(edges, leavesOnly, result, circular) {
  var visited = new Set();
  return function (start) {
    if (visited.has(start)) {
      return;
    }
    var inCurrentPath = new Set();
    var currentPath = [];
    var todo = []; // used as a stack
    todo.push({ node: start, processed: false });
    while (todo.length > 0) {
      var current = todo[todo.length - 1]; // peek at the todo stack
      var processed = current.processed;
      var node = current.node;
      if (!processed) {
        // Haven't visited edges yet (visiting phase)
        if (visited.has(node)) {
          todo.pop();
          continue;
        } else if (inCurrentPath.has(node)) {
          // It's not a DAG
          if (circular) {
            todo.pop();
            // If we're tolerating cycles, don't revisit the node
            continue;
          }
          currentPath.push(node);
          throw new DepGraphCycleError(currentPath);
        }

        inCurrentPath.add(node);
        currentPath.push(node);
        var nodeEdges = edges.get(node);
        // (push edges onto the todo stack in reverse order to be order-compatible with the old DFS implementation)
        for (var i = nodeEdges.length - 1; i >= 0; i--) {
          todo.push({ node: nodeEdges[i], processed: false });
        }
        current.processed = true;
      } else {
        // Have visited edges (stack unrolling phase)
        todo.pop();
        currentPath.pop();
        inCurrentPath.delete(node);
        visited.add(node);
        if (!leavesOnly || edges.get(node).length === 0) {
          result.push(node);
        }
      }
    }
  };
}

/**
 * Simple Dependency Graph
 */
var DepGraph = (exports.DepGraph = function DepGraph(opts) {
  this.nodes = new Map(); // Node -> Node/Data
  this.outgoingEdges = new Map(); // Node -> [Dependency Node]
  this.incomingEdges = new Map(); // Node -> [Dependant Node]
  this.circular = opts && !!opts.circular; // Allows circular deps
});
DepGraph.prototype = {
  /**
   * The number of nodes in the graph.
   */
  size: function () {
    return this.nodes.size;
  },
  /**
   * Add a node to the dependency graph. If a node already exists, this method will do nothing.
   */
  addNode: function (node, data) {
    if (!this.hasNode(node)) {
      // Checking the arguments length allows the user to add a node with undefined data
      if (arguments.length === 2) {
        this.nodes.set(node, data);
      } else {
        this.nodes.set(node, node);
      }
      this.outgoingEdges.set(node, []);
      this.incomingEdges.set(node, []);
    }
  },
  /**
   * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
   */
  removeNode: function (node) {
    if (this.hasNode(node)) {
      this.nodes.delete(node);
      this.outgoingEdges.delete(node);
      this.incomingEdges.delete(node);
      [this.incomingEdges, this.outgoingEdges].forEach(function (edgeList) {
        edgeList.forEach(function (v) {
          var idx = v.indexOf(node);
          if (idx >= 0) {
            v.splice(idx, 1);
          }
        });
      });
    }
  },
  /**
   * Check if a node exists in the graph
   */
  hasNode: function (node) {
    return this.nodes.has(node);
  },
  /**
   * Get the data associated with a node name
   */
  getNodeData: function (node) {
    if (this.hasNode(node)) {
      return this.nodes.get(node);
    } else {
      throw new Error("Node does not exist: " + node);
    }
  },
  /**
   * Set the associated data for a given node name. If the node does not exist, this method will throw an error
   */
  setNodeData: function (node, data) {
    if (this.hasNode(node)) {
      this.nodes.set(node, data);
    } else {
      throw new Error("Node does not exist: " + node);
    }
  },
  /**
   * Add a dependency between two nodes. If either of the nodes does not exist,
   * an Error will be thrown.
   */
  addDependency: function (from, to) {
    if (!this.hasNode(from)) {
      throw new Error("Node does not exist: " + from);
    }
    if (!this.hasNode(to)) {
      throw new Error("Node does not exist: " + to);
    }
    if (this.outgoingEdges.get(from).indexOf(to) === -1) {
      this.outgoingEdges.get(from).push(to);
    }
    if (this.incomingEdges.get(to).indexOf(from) === -1) {
      this.incomingEdges.get(to).push(from);
    }
    return true;
  },
  /**
   * Remove a dependency between two nodes.
   */
  removeDependency: function (from, to) {
    var idx;
    if (this.hasNode(from)) {
      idx = this.outgoingEdges.get(from).indexOf(to);
      if (idx >= 0) {
        this.outgoingEdges.get(from).splice(idx, 1);
      }
    }

    if (this.hasNode(to)) {
      idx = this.incomingEdges.get(to).indexOf(from);
      if (idx >= 0) {
        this.incomingEdges.get(to).splice(idx, 1);
      }
    }
  },
  /**
   * Return a clone of the dependency graph. If any custom data is attached
   * to the nodes, it will only be shallow copied.
   */
  clone: function () {
    var source = this;
    var result = new DepGraph();
    source.nodes.forEach(function (v, n) {
      result.nodes.set(n, v);
      result.outgoingEdges.set(n, source.outgoingEdges.get(n).slice(0));
      result.incomingEdges.set(n, source.incomingEdges.get(n).slice(0));
    });
    result.circular = source.circular;
    return result;
  },
  /**
   * Get an array containing the direct dependencies of the specified node.
   *
   * Throws an Error if the specified node does not exist.
   */
  directDependenciesOf: function (node) {
    if (this.hasNode(node)) {
      return this.outgoingEdges.get(node).slice(0);
    } else {
      throw new Error("Node does not exist: " + node);
    }
  },
  /**
   * Get an array containing the nodes that directly depend on the specified node.
   *
   * Throws an Error if the specified node does not exist.
   */
  directDependantsOf: function (node) {
    if (this.hasNode(node)) {
      return this.incomingEdges.get(node).slice(0);
    } else {
      throw new Error("Node does not exist: " + node);
    }
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
      var DFS = createDFS(
        this.outgoingEdges,
        leavesOnly,
        result,
        this.circular
      );
      DFS(node);
      var idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error("Node does not exist: " + node);
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
      var DFS = createDFS(
        this.incomingEdges,
        leavesOnly,
        result,
        this.circular
      );
      DFS(node);
      var idx = result.indexOf(node);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error("Node does not exist: " + node);
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
    var keys = Array.from(this.nodes.keys());
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

      var DFS = createDFS(
        this.outgoingEdges,
        leavesOnly,
        result,
        this.circular
      );
      // Find all potential starting points (nodes with nothing depending on them) an
      // run a DFS starting at these points to get the order
      keys
        .filter(function (node) {
          return self.incomingEdges.get(node).length === 0;
        })
        .forEach(function (n) {
          DFS(n);
        });

      // If we're allowing cycles - we need to run the DFS against any remaining
      // nodes that did not end up in the initial result (as they are part of a
      // subgraph that does not have a clear starting point)
      if (this.circular) {
        keys
          .filter(function (node) {
            return result.indexOf(node) === -1;
          })
          .forEach(function (n) {
            DFS(n);
          });
      }

      return result;
    }
  },
  /**
   * Get an array of nodes that have no dependants (i.e. nothing depends on them).
   */
  entryNodes: function () {
    var self = this;
    return Array.from(this.nodes.keys()).filter(function (node) {
      return self.incomingEdges.get(node).length === 0;
    });
  },
};

// Create some aliases
DepGraph.prototype.directDependentsOf = DepGraph.prototype.directDependantsOf;
DepGraph.prototype.dependentsOf = DepGraph.prototype.dependantsOf;

/**
 * Cycle error, including the path of the cycle.
 */
var DepGraphCycleError = (exports.DepGraphCycleError = function (cyclePath) {
  var message = "Dependency Cycle Found: " + cyclePath.join(" -> ");
  var instance = new Error(message);
  instance.cyclePath = cyclePath;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, DepGraphCycleError);
  }
  return instance;
});
DepGraphCycleError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true,
  },
});
Object.setPrototypeOf(DepGraphCycleError, Error);
