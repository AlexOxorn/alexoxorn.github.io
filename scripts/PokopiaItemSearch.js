const objectsByType = {};
const typeByObject = {};

function addToObject(ob, key, val) {
    if (!Object.hasOwn(ob, key))
        ob[key] = [];
    ob[key].push(val);
};

function parseLines(results) {
    for (let [type, ...objects] of results.data) {
        for (let d of objects) {
            if (d) {
                addToObject(objectsByType, type, d);
                addToObject(typeByObject, d, type);
            }
        }
    }

    const form = document.getElementById('hobbyForm');
    const inputs = document.getElementById('hobbyInputs');
    let types = Array.from(Object.keys(objectsByType));
    types = types.sort();
    form.removeChild(form.firstElementChild);
    for (let type of types) {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'favs';
        input.value = type;
        label.replaceChildren(input);
        label.innerHTML += ' ' + type;
        inputs.appendChild(label);
    }
};

async function readBundledFile(file) {
    try {
        const response = await fetch(file);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error("Failed to read the file:", error);
        return "";
    }
};

window.onload = function() {
    readBundledFile('/assets/PokopiaFavourites.csv')
    .then(contents => 
        Papa.parse(contents, {
                header: false,
                complete: parseLines,
                error: function(error) {
                    console.error('Error parsing CSV:', error);
                }
            })
    );
};

function clearResults() {
    const checkedBoxes = document.querySelectorAll('input[name="favs"]:checked');
    for (let check of checkedBoxes) {
        check.checked = false;
    }
    let results = document.getElementById('results');
    results.replaceChildren();
}

function getResults() {
    const checkedBoxes = document.querySelectorAll('input[name="favs"]:checked');
    const stringArray = Array.from(checkedBoxes).map(checkbox => checkbox.value);

    const results = {};

    for (let type of stringArray) {
        for (let object of objectsByType[type]) {
            addToObject(results, object, type);
        }
    }

    const sortedResults = Array.from(Object.entries(results)).sort(([k1, v1], [k2, v2]) => v2.length - v1.length);
    const firstElements = sortedResults.slice(0, 50);
    
    function toLine([name, types]) {
        const NameElm = document.createElement('td');
        const TypesElm = document.createElement('td');
        const countElm = document.createElement('td');
        NameElm.innerText = name;
        TypesElm.innerText = types.join(', ');
        countElm.innerText = types.length;

        return [NameElm, countElm, TypesElm];
    }
    const resultsDiv = document.getElementById("results");
    resultsDiv.replaceChildren();

    for (let x of firstElements) {
        const item = document.createElement('tr');
        item.replaceChildren(...toLine(x));
        resultsDiv.appendChild(item);
    }

    // resultsDiv.replaceChildren(ordered);
};