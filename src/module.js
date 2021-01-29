const moduleFactory = function ()
{
    return new Proxy(
        {
            exports: {},
            export: function (data, path)
            {
                this.export[path] = data;
            },
            import: function (path)
            {
                return this.exports[path];
            },
            terminate: function (path)
            {
                delete this.exports[path];
            }
        },
        {
            get: function (tar, prop)
            {
                if (prop == "exports")
                {
                    return "private data >:)";
                }
                return Reflect.get(...arguments);
            }
        }
    );
}
window.module = moduleFactory();
window.addEventListener("DOMContentLoaded", function () {
  delete window["module"];
});