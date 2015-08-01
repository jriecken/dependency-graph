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
 */
function createDFS(edges, leavesOnly, result) {
  var currentPath = [];
  var visited = {};
  return function DFS(name) {
    visited[name] = true;
    currentPath.push(name);
    edges[name].forEach(function (edgeName) {
      if (!visited[edgeName]) {
        DFS(edgeName);
      } else if (currentPath.indexOf(edgeName) >= 0) {
        currentPath.push(edgeName);
        throw new Error('Dependency Cycle Found: ' + currentPath.join(' -> '));
      }
    });
    currentPath.pop();
    if ((!leavesOnly || edges[name].length === 0) && result.indexOf(name) === -1) {
      result.push(name);
    }
  };
}

/**
 * Simple Dependency Graph
 */
var DepGraph = exports.DepGraph = function DepGraph() {
  this.nodes = {};
  this.outgoingEdges = {}; // Node name -> [Dependency Node name]
  this.incomingEdges = {}; // Node name -> [Dependant Node name]
};
DepGraph.prototype = {
  /**
   * Add a node to the dependency graph. If a node with the specified
   * name already exists, this method will do nothing.
   */
  addNode:function (name) {
    if (!this.hasNode(name)) {
      this.nodes[name] = name;
      this.outgoingEdges[name] = [];
      this.incomingEdges[name] = [];
    }
  },
  /**
   * Remove a node from the dependency graph. If a node with the specified
   * name does not exist, this method will do nothing.
   */
  removeNode:function (name) {
    if (this.hasNode(name)) {
      delete this.nodes[name];
      delete this.outgoingEdges[name];
      delete this.incomingEdges[name];
      [this.incomingEdges, this.outgoingEdges].forEach(function (edgeList) {
        Object.keys(edgeList).forEach(function (key) {
          var idx = edgeList[key].indexOf(name);
          if (idx >= 0) {
            edgeList[key].splice(idx, 1);
          }
        }, this);
      });
    }
  },
  /**
   * Check if a node exists in the graph
   */
  hasNode:function (name) {
    return !!this.nodes[name];
  },
  /**
   * Add a dependency between two nodes. If either of the nodes does not exist,
   * an Error will be thrown.
   */
  addDependency:function (from, to) {
    if (!this.hasNode(from)) {
      throw new Error('Node does not exist: ' + from);
    }
    if (!this.hasNode(to)) {
      throw new Error('Node does not exist: ' + to);
    }
    if (this.outgoingEdges[from].indexOf(to) === -1) {
      this.outgoingEdges[from].push(to);
    }
    if (this.incomingEdges[to].indexOf(from) === -1) {
      this.incomingEdges[to].push(from);
    }
    return true;
  },
  /**
   * Remove a dependency between two nodes.
   */
  removeDependency:function (from, to) {
    var idx;
    if (this.hasNode(from)) {
      idx = this.outgoingEdges[from].indexOf(to);
      if (idx >= 0) {
        this.outgoingEdges[from].splice(idx, 1);
      }
    }

    if (this.hasNode(to)) {
      idx = this.incomingEdges[to].indexOf(from);
      if (idx >= 0) {
        this.incomingEdges[to].splice(idx, 1);
      }
    }
  },
  /**
   * Get an array containing the nodes that the specified node depends on (transitively).
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
   * in the array.
   */
  dependenciesOf:function (name, leavesOnly) {
    if (this.hasNode(name)) {
      var result = [];
      var DFS = createDFS(this.outgoingEdges, leavesOnly, result);
      DFS(name);
      var idx = result.indexOf(name);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    }
    else {
      throw new Error('Node does not exist: ' + name);
    }
  },
  /**
   * get an array containing the nodes that depend on the specified node (transitively).
   * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
   */
  dependantsOf:function (name, leavesOnly) {
    if (this.hasNode(name)) {
      var result = [];
      var DFS = createDFS(this.incomingEdges, leavesOnly, result);
      DFS(name);
      var idx = result.indexOf(name);
      if (idx >= 0) {
        result.splice(idx, 1);
      }
      return result;
    } else {
      throw new Error('Node does not exist: ' + name);
    }
  },
  /**
   * Construct the overall processing order for the dependency graph.
   * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
   */
  overallOrder:function (leavesOnly) {
    var self = this;
    var result = [];
    var DFS = createDFS(this.outgoingEdges, leavesOnly, result);
    var keys = Object.keys(this.nodes);
    if (keys.length === 0) {
      return result; // Empty graph
    } else {
      keys.filter(function (node) {
        return self.incomingEdges[node].length === 0;
      }).forEach(function (n) {
        DFS(n);
      });
      if (result.length === 0) {
        // There's definitely a cycle somewhere - run the DFS on the first node
        // so that it constructs the cycle and reports it.
        DFS(keys[0]);
      }
      return result;
    }
  }
};
