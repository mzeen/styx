/// <reference path="../../definitions/knockout.d.ts" />

(function() {
    var visualization = document.getElementById("visualization");
    var container = document.getElementById("graph");
    
    var sessionStorageKeys = {
        code: "code",
        options: "options",
        selectedTabId: "selectedTabId"
    };
    
    var mainTabId = 0;
    var viewModel = {
        activeTabId: ko.observable(mainTabId),
        functions: ko.observableArray([]),
        program: ko.observable(),
        
        passes: {
            removeTransitNodes: ko.observable(true),
            rewriteConstantConditionalEdges: ko.observable(true)
        },
        
        selectTab: function(tabId) {
            viewModel.activeTabId(tabId);
        },
        
        selectMainTab: function() {
            viewModel.selectTab(mainTabId);
        }
    };
    
    viewModel.options = ko.computed(function() {
        return {
            passes: {
                removeTransitNodes: viewModel.passes.removeTransitNodes(),
                rewriteConstantConditionalEdges: viewModel.passes.rewriteConstantConditionalEdges()
            }
        };
    });
    
    viewModel.isTabActive = function(tabName) {
        return viewModel.activeTabId() === tabName;
    };
       
    viewModel.isMainTabActive = ko.computed(function() {
        return viewModel.isTabActive(mainTabId);
    });
    
    var previousCode;    
    var debouncedParseAndVisualize = _.debounce(parseAndVisualize, 200);
    
    var $input = $("#input")
        .on("keydown", keydown)
        .on("keyup", keyup);
    
    initializeFormFromSessionStorage();
    parseAndVisualize();
    
    viewModel.options.subscribe(parseAndVisualize);    
    viewModel.activeTabId.subscribe(function(tabId) {
        visualizeFlowGraph();
        sessionStorage.setItem(sessionStorageKeys.selectedTabId, tabId);
    });
    
    ko.applyBindings(viewModel, visualization);
    
    var selectedTabId = +sessionStorage.getItem(sessionStorageKeys.selectedTabId) || 0;
    viewModel.selectTab(selectedTabId);
    
    function parseAndVisualize() {
        parseProgram();
        visualizeFlowGraph();
    }
    
    function parseProgram() {
        var code = $input.val();
        var options = viewModel.options();
        
        previousCode = code;
        
        sessionStorage.setItem(sessionStorageKeys.code, code);
        sessionStorage.setItem(sessionStorageKeys.options, JSON.stringify(options));
        
        var program = window.cfgVisualization.parseProgram(code, options);
        viewModel.program(program);
        
        var functions = _(program.functions)
            .map(function(f) { return _.pick(f, "id", "name"); })
            .sortBy("name")
            .value();
        
        viewModel.functions(functions);
    }
    
    function visualizeFlowGraph() {
        var activeTabId = viewModel.activeTabId();
        var program = viewModel.program();
        
        var selectedFunction = _.findWhere(program.functions, { id: activeTabId });
        var flowGraph = selectedFunction
            ? selectedFunction.flowGraph
            : program.flowGraph;
        
        window.cfgVisualization.renderControlFlowGraph(container, flowGraph);
    }
    
    function keydown(e) {
        if (e.keyCode === 9 /* tab */) {
            e.preventDefault();
            
            var cursorPos = $input.prop("selectionStart");
            var input = $input.val();
            var textBefore = input.substring(0, cursorPos);
            var textAfter  = input.substring(cursorPos, input.length);
            
            $input.val(textBefore + "    " + textAfter);
            $input.setCaretPosition(cursorPos + 4);
        }
    }
    
    function keyup() {
        if ($input.val() !== previousCode) {
            debouncedParseAndVisualize();
        }
    }
    
    function initializeFormFromSessionStorage() {
        var code = sessionStorage.getItem(sessionStorageKeys.code) || "";
        $input.val(code);
        
        var optionsString = sessionStorage.getItem(sessionStorageKeys.options);
        
        if (optionsString) {
            var options = JSON.parse(optionsString) || {};
            var passes = options.passes || {};
            
            viewModel.passes.removeTransitNodes(passes.removeTransitNodes);
            viewModel.passes.rewriteConstantConditionalEdges(passes.rewriteConstantConditionalEdges);            
        } else {
            viewModel.passes.removeTransitNodes(true);
            viewModel.passes.rewriteConstantConditionalEdges(true);
        }
    }
}());
