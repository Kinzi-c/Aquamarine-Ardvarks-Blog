// Makes the given input into an array, no matter what it is to begin with.
function makeArray(input) {
    if (input === undefined) {
        return [];
    }
    else if (Array.isArray(input)) {
        return input;
    }
    else {
        return [input];
    }
}

module.exports = makeArray;