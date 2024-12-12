import OneOffTask from "@src/shared/utils/oneOffTask";

/**
 * convert all SimpleDropdown fieldtypes to Dropdown and
 * convert those answer values from [string] to string
 */
const simpleDropdownToDropdownMigration = new OneOffTask(
    "simpleDropdownToDropdownMigration2.1.3",
    async () => {
        const { answers1010 } = await chrome.storage.local.get("answers1010")
        if (!answers1010) {
            return
        }
        answers1010.store = answers1010.store.map(performConversion)
        await chrome.storage.local.set({ answers1010 })
    }
)
export default simpleDropdownToDropdownMigration


// HELPERS
const performConversion = (item: any) => {
    if (!isDropdown(item)) {
        return item
    }
    item[1].fieldType = "Dropdown"
    if (isStringArray(item[1].answer)) {
        item[1].answer = item[1].answer[0]
    }
    return item
}

const isDropdown = (item: { fieldType: string; }[]): boolean => {
    return ["SimpleDropdown", "Dropdown"].includes(item[1].fieldType)
}

const isStringArray = (answerValue: string | [string]): boolean => {
    return (
        Array.isArray(answerValue) &&
        answerValue.length === 1 &&
        typeof answerValue[0] === "string"
    )
}


