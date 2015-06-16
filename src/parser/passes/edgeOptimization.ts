/// <reference path="../../collections/set.ts" />
/// <reference path="../../flow.ts" />

namespace Styx.Passes {
    export function optimizeEdges(graph: ControlFlowGraph) {
        let optimizedNodes = new Collections.Set<number>();
        optimizeNode(graph.entry, optimizedNodes);
    }
    
    function optimizeNode(node: FlowNode, optimizedNodes: Collections.Set<number>) {
        if (optimizedNodes.contains(node.id)) {
            return;
        }
        
        optimizedNodes.add(node.id);
        
        let hasSingleOutgoingEpsilonEdge = node.outgoingEdges.length === 1 &&
            node.outgoingEdges[0].type === EdgeType.Epsilon;
            
        let isEntryNode = node.id === 1;
        let isTransitNode = node.incomingEdges.length === 1 && hasSingleOutgoingEpsilonEdge; 
        
        if (!isEntryNode && isTransitNode) {
            optimizeTransitNode(node, optimizedNodes);
        }
        
        for (let edge of node.outgoingEdges) {
            optimizeNode(edge.target, optimizedNodes);
        }
    }
    
    function optimizeTransitNode(transitNode: FlowNode, optimizedNodes: Collections.Set<number>) {
        // Remember the transit node's original target
        let originalTarget = transitNode.outgoingEdges[0].target;
        
        if (shouldTransitNodeBeFlattened(transitNode)) {
            mergeIncomingAndOutgoingEdgeOf(transitNode);
        }
        
        // Recursively optimize, starting with the original target
        optimizeNode(originalTarget, optimizedNodes);
    }
    
    function shouldTransitNodeBeFlattened(node: FlowNode): boolean {
        let sourceId = node.incomingEdges[0].source.id;
        let target = node.outgoingEdges[0].target;
        
        for (let incomingTargetEdges of target.incomingEdges) {
            // We only simplify transit nodes if their removal doesn't lead
            // to a node being directly connected to another node by 2 edges
            if (incomingTargetEdges.source.id === sourceId) {
                return false;
            }
        }
        
        return true;
    }
    
    function mergeIncomingAndOutgoingEdgeOf(transitNode: FlowNode) {
        let incomingEdge = transitNode.incomingEdges[0];
        let outgoingEdge = transitNode.outgoingEdges[0];
        let target = outgoingEdge.target;
        
        // Redirect edge
        incomingEdge.target = target;
        target.incomingEdges = [incomingEdge];
        
        // Clear node
        transitNode.incomingEdges = [];
        transitNode.outgoingEdges = [];
    }
}