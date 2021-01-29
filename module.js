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
            get: function (target, prop)
            {
                if (!(prop == "exports"))
                {
                    return "private data >:)";
                }
                return target[prop]();
            },
            set: function (){}
        }
    );
}