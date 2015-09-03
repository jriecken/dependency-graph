var DepGraph = require('../lib/dep_graph').DepGraph;

describe('DepGraph', function () {

  it('should be able to add/remove nodes', function () {
    var graph = new DepGraph();

    graph.addNode('Foo');
    graph.addNode('Bar');

    expect(graph.hasNode('Foo')).toBe(true);
    expect(graph.hasNode('Bar')).toBe(true);
    expect(graph.hasNode('NotThere')).toBe(false);

    graph.removeNode('Bar');

    expect(graph.hasNode('Bar')).toBe(false);
  });

  it('should do nothing if creating a node that already exists', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');

    graph.addDependency('a','b');

    graph.addNode('a');

    expect(graph.dependenciesOf('a')).toEqual(['b']);
  });

  it('should do nothing if removing a node that does not exist', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    expect(graph.hasNode('a')).toBe(true);

    graph.removeNode('a');
    expect(graph.hasNode('Foo')).toBe(false);

    graph.removeNode('a');
    expect(graph.hasNode('Foo')).toBe(false);
  });

  it('should be able to add dependencies between nodes', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');

    graph.addDependency('a','b');
    graph.addDependency('a','c');

    expect(graph.dependenciesOf('a')).toEqual(['b', 'c']);
  });

  it('should throw an error if a node does not exist and a dependency is added', function () {
    var graph = new DepGraph();

    graph.addNode('a');

    expect(function () {
      graph.addDependency('a','b');
    }).toThrow(new Error('Node does not exist: b'));
  });

  it('should detect cycles', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');

    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');
    graph.addDependency('d', 'a');

    expect(function () {
      graph.dependenciesOf('b');
    }).toThrow(new Error('Dependency Cycle Found: b -> c -> a -> b'));
  });

  it('should detect cycles in overall order', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');

    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');
    graph.addDependency('d', 'a');

    expect(function () {
      graph.overallOrder();
    }).toThrow(new Error('Dependency Cycle Found: d -> a -> b -> c -> a'));
  });

  it('should detect cycles in overall order when all nodes have dependants (incoming edges)', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');

    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');

    expect(function () {
      graph.overallOrder();
    }).toThrow(new Error('Dependency Cycle Found: a -> b -> c -> a'));
  });

  it('should detect cycles in overall order when all nodes have dependants (incoming edges) but not all nodes have dependencies (outgoing edges)', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');

    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'a');

    expect(function () {
      graph.overallOrder();
    }).toThrow(new Error('Dependency Cycle Found: a -> b -> c -> a'));
  });

  it('should retrieve dependencies and dependants in the correct order', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');

    graph.addDependency('a', 'd');
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');
    graph.addDependency('d', 'b');

    expect(graph.dependenciesOf('a')).toEqual(['c', 'b', 'd']);
    expect(graph.dependenciesOf('b')).toEqual(['c']);
    expect(graph.dependenciesOf('c')).toEqual([]);
    expect(graph.dependenciesOf('d')).toEqual(['c', 'b']);

    expect(graph.dependantsOf('a')).toEqual([]);
    expect(graph.dependantsOf('b')).toEqual(['a','d']);
    expect(graph.dependantsOf('c')).toEqual(['a','d','b']);
    expect(graph.dependantsOf('d')).toEqual(['a']);
  });

  it('should be able to resolve the overall order of things', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');
    graph.addNode('e');

    graph.addDependency('a', 'b');
    graph.addDependency('a', 'c');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'd');

    expect(graph.overallOrder()).toEqual(['d', 'c', 'b', 'a', 'e']);
  });

  it('should be able to only retrieve the "leaves" in the overall order', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addNode('d');
    graph.addNode('e');

    graph.addDependency('a', 'b');
    graph.addDependency('a', 'c');
    graph.addDependency('b', 'c');
    graph.addDependency('c', 'd');

    expect(graph.overallOrder(true)).toEqual(['d', 'e']);
  });

  it('should give an empty overall order for an empty graph', function () {
    var graph = new DepGraph();

    expect(graph.overallOrder()).toEqual([]);
  });

  it('should still work after nodes are removed', function () {
    var graph = new DepGraph();

    graph.addNode('a');
    graph.addNode('b');
    graph.addNode('c');
    graph.addDependency('a', 'b');
    graph.addDependency('b', 'c');

    expect(graph.dependenciesOf('a')).toEqual(['c', 'b']);

    graph.removeNode('c');

    expect(graph.dependenciesOf('a')).toEqual(['b']);
  });

});