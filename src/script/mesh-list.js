export class MeshList {
    constructor(name) {
        this.name = name;
        this.list = [];
    }

    add(item) {
        this.list.push(item);
    }

    remove(item) {
        this.list = this.list.filter(e => e !== item);
    }
}
