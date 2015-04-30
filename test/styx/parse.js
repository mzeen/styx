var expect = chai.expect;

describe("Styx", function() {
    function controlFlowGraphFor(code) {
        var ast = esprima.parse(code);
        var cfg = Styx.parse(ast);

        return cfg;
    }

    describe("#parse()", function() {
        it("should return a control flow graph", function() {
            var cfg = controlFlowGraphFor("");

            expect(cfg).to.be.an("object");
            expect(cfg).to.have.property("entry");
            expect(cfg.entry).to.be.an("object");
        });
    });

    describe("#parseProgram()", function() {
        it("should return a single node for an empty program", function() {
            var cfg = controlFlowGraphFor("");

            expect(cfg.entry.outgoingEdges).to.be.empty;
        });

        it("should return two nodes for a single empty statement", function() {
            var cfg = controlFlowGraphFor(";");

            var outgoingEdges = cfg.entry.outgoingEdges;
            expect(outgoingEdges).to.have.length(1);

            var singleEdge = outgoingEdges[0];
            expect(singleEdge.outgoingEdges).to.be.empty;
        });

        it("should return three nodes for two empty statements", function() {
            var cfg = controlFlowGraphFor(";;");

            var firstNodeEdges = cfg.entry.outgoingEdges;
            expect(firstNodeEdges).to.have.length(1);

            var secondNode = firstNodeEdges[0].target;
            var secondNodeEdges = secondNode.outgoingEdges;
            expect(secondNodeEdges).to.have.length(1);
            
            var thirdNode = secondNodeEdges[0].target;
            var thirdNodeEdges = thirdNode.outgoingEdges;
            expect(thirdNodeEdges).to.have.length(0);
        });
    });
});
