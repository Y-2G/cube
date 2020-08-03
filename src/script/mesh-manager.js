export class MeshManager {
    constructor() {
        this.list = [];
    }

    add(item) {
        this.list.push(item);
    }

    remove(item) {
        this.list = this.list.filter(e => e !== item);
    }

    getMeshGroup(item) {
        const result = [];
        for(const e of this.list) {
            if(e.list.includes(item) === false) continue;
            result.push(e);
        }
        return result;
    }
}
