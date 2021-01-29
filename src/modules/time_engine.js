//Don't pass in the game module's function directly else the this syntax will break trust me it is the most painful bug in your life you don't want to end up like me for 3 days trying to get around this while trying to keep nice syntax
!function () {
    const tEngineFactory = function (delta, update) {
        if (!(this instanceof tEngineFactory)) {
            return new tEngineFactory(delta, update);
        }
        else if (!(update instanceof Function && typeof (delta) === "number")) {
            throw Error("Eek! The time_engine factory function can't use those paramets <(;-;)--")
        }
    }
    tEngineFactory.prototype = {
        constructor: tEngineFactory
    }
    module.export({tEngineFactory}, "/src/modules/time_engine.js");
}()