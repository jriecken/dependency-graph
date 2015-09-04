# Dependency Graph Changelog

## In development

- No changes yet

## 0.4.1 (Sept 3, 2015)

- Check all nodes for potential cycles when calculating overall order. (Fixes #8)

## 0.4.0 (Aug 1, 2015)

- Better error messages
    - When a cycle is detected, the error message will now include the cycle in it. E.g `Dependency Cycle Found: a -> b -> c -> a` (Fixes #7)
    - When calling `addDependency` if one of the nodes does not exist, the error will say which one it was (instead of saying that "one" of the two nodes did not exist and making you manually determine which one)
- Calling `overallOrder` on an empty graph will no longer throw an error about a dependency cycle. It will return an empty array.

## 0.3.0 (July 24, 2015)

- Fix issue where if you call `addNode` twice with the same name, it would clear all edges for that node. Now it will do nothing if a node with the specified name already exists. (Fixes #3)

## 0.2.1 (July 3, 2015)

- Fixed removeNode leaving references in outgoingEdges and reference to non-existent var edges - thanks [juhoha](https://github.com/juhoha)! (Fixes #2)

## 0.2.0 (May 1, 2015)

- Removed dependency on Underscore - thanks [myndzi](https://github.com/myndzi)! (Fixes #1)

## 0.1.0 (May 18, 2013)

- Initial Release - extracted out of asset-smasher