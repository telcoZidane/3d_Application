export class EnumHandler {
    constructor(enumObject) {
        this.enumObject = enumObject;
    }

    getDisplayNameByValue(value) {
        for (const key in this.enumObject) {
            if (this.enumObject[key].value === value) {
                return this.enumObject[key].displayName;
            }
        }
        return null;
    }

    getDisplayNameByKey(key) {
        return this.enumObject[key]?.displayName || null;
    }
}

export const ModelsType = Object.freeze({
    SUPPER_MODEL: { displayName: "Office Model", value: 1 },
    PC_MODEL: { displayName: "PC Model", value: 2 },
    CUBEZONE_MODEL: { displayName: "Cube zone Model", value: 3 },
});

export const ModelStatus = Object.freeze({
    Suppoer: { displayName: "Support Model", value: 0 },
    Working: { displayName: "Working", value: 1 },
    Not_Working: { displayName: "Not Working", value: 2 },
});
