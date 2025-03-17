export default class Registry {
    private dependencies: { [name: string]: any };
    private static instance: Registry; 

    private constructor () {
        this.dependencies = {};
    }

    provide (name: string, dependency: any) {
        this.dependencies[name] = dependency;
    }

    inject (name: string) {
        if (!this.dependencies[name]) throw new Error('Dependency not found');
        return this.dependencies[name];
    }

    static getInstance() {
        if (!Registry.instance) {
            Registry.instance = new Registry();
        }

        return Registry.instance;
    }
}

export function inject(name: string) {
    return function (target: any, prototypeKey: string) {
        target[prototypeKey] = new Proxy({}, {
            get (_: any, prototypeKey: string) {
                const dependency = Registry.getInstance().inject(name);
                return dependency[prototypeKey];
            }
        });
    }
}