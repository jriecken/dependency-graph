# Dependency Graph Changelog

## In development

- No changes yet

## 0.3.0 (July 24, 2015)

- Fix issue where if you call `addNode` twice with the same name, it would clear all edges for that node. Now it will do nothing if a node with the specified name already exists. (Fixes #3)

## 0.2.1 (July 3, 2015)

- Fixed removeNode leaving references in outgoingEdges and reference to non-existent var edges - thanks [juhoha](https://github.com/juhoha)! (Fixes #2)

## 0.2.0 (May 1, 2015)

- Removed dependency on Underscore - thanks [myndzi](https://github.com/myndzi)! (Fixes #1)

## 0.1.0 (May 18, 2013)

- Initial Release - extracted out of asset-smasher