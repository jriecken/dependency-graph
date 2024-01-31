declare module 'dependency-graph' {
  export interface Options {
    circular?: boolean;
  }

  /**
   * @template K
   */
  export class DepGraph<T, K = string> {
    /**
     * Creates an instance of DepGraph with optional Options.
     */
    constructor(opts?: Options);

    /**
     * The number of nodes in the graph.
     */
    size(): number;

    /**
     * Add a node in the graph with optional data. If data is not given, name will be used as data.
     * @param {K} name
     * @param data
     */
    addNode(name: K, data?: T): void;

    /**
     * Remove a node from the graph.
     * @param {K} name
     */
    removeNode(name: K): void;

    /**
     * Check if a node exists in the graph.
     * @param {K} name
     */
    hasNode(name: K): boolean;

    /**
     * Get the data associated with a node (will throw an Error if the node does not exist).
     * @param {K} name
     */
    getNodeData(name: K): T;

    /**
     * Set the data for an existing node (will throw an Error if the node does not exist).
     * @param {K} name
     * @param data
     */
    setNodeData(name: K, data?: T): void;

    /**
     * Add a dependency between two nodes (will throw an Error if one of the nodes does not exist).
     * @param {K} from
     * @param {K} to
     */
    addDependency(from: K, to: K): void;

    /**
     * Remove a dependency between two nodes.
     * @param {K} from
     * @param {K} to
     */
    removeDependency(from: K, to: K): void;

    /**
     * Return a clone of the dependency graph (If any custom data is attached
     * to the nodes, it will only be shallow copied).
     */
    clone(): DepGraph<T>;

    /**
     * Get an array containing the direct dependency nodes of the specified node.
     * @param name
     */
    directDependenciesOf(name: K): K[];

    /**
     * Get an array containing the nodes that directly depend on the specified node.
     * @param name
     */
    directDependantsOf(name: K): K[];

    /**
     * Alias of `directDependantsOf`
     *
     * @see directDependantsOf
     * @param {K} name
     */
    directDependentsOf(name: K): K[];

    /**
     * Get an array containing the nodes that the specified node depends on (transitively). If leavesOnly is true, only nodes that do not depend on any other nodes will be returned in the array.
     * @param {K} name
     * @param {boolean} leavesOnly
     */
    dependenciesOf(name: K, leavesOnly?: boolean): K[];

    /**
     * Get an array containing the nodes that depend on the specified node (transitively). If leavesOnly is true, only nodes that do not have any dependants will be returned in the array.
     * @param {K} name
     * @param {boolean} leavesOnly
     */
    dependantsOf(name: K, leavesOnly?: boolean): K[];

    /**
     * Alias of `dependantsOf`
     *
     * @see dependantsOf
     * @param name
     * @param leavesOnly
     */
    dependentsOf(name: K, leavesOnly?: boolean): K[];

    /**
     * Get an array of nodes that have no dependants (i.e. nothing depends on them).
     */
    entryNodes(): K[];

    /**
     * Construct the overall processing order for the dependency graph. If leavesOnly is true, only nodes that do not depend on any other nodes will be returned.
     * @param {boolean} leavesOnly
     */
    overallOrder(leavesOnly?: boolean): K[];
  }

  export class DepGraphCycleError<K = string> extends Error {
    cyclePath: K[];
  }
}
