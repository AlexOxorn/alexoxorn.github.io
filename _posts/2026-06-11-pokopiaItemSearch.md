---
title: "Pokemon Type Quiz"
date: 2026-06-11 00:00:00 -400
categories: [Tools]
tags: [tools,pokemon]
---

<script>
const objectsByType = {}
const typeByObject = {}

function addToObject(ob, key, val) {
    if (!Object.hasOwn(ob, key))
        ob[key] = []
    ob[key].push(val)
}

function parseLines(results) {
    for (let [type, ...objects] of results.data) {
        for (let d of objects) {
            if (d) {
                addToObject(objectsByType, type, d)
                addToObject(typeByObject, d, type)
            }
        }
    }
    
    // lines = []
    // for (let k of Object.keys(objectsByType)) {
    //         lines.push([k, `    <label><input type="checkbox" name="favs" value="${k}"> ${k}</label><br>`])
    // }
    // lines.sort(([a, a2], [b, b2]) => a < b);
    // lines = lines.map(([a, b]) => b)
    // console.log(lines.join('\n'))
}

async function readBundledFile(file) {
    try {
        const response = await fetch(file);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error("Failed to read the file:", error);
        return "";
    }
}

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
    )
    
}

function getResults() {
    const checkedBoxes = document.querySelectorAll('input[name="favs"]:checked');
    const stringArray = Array.from(checkedBoxes).map(checkbox => checkbox.value);

    const results = {}

    for (let type of stringArray) {
        for (let object of objectsByType[type]) {
            addToObject(results, object, type)
        }
    }

    const sortedResults = Array.from(Object.entries(results)).sort(([k1, v1], [k2, v2]) => v2.length - v1.length)
    const firstElements = sortedResults.slice(0, 44);
    
    function toLine([name, types]) {
        return `${name}:\t[${types.join(', ')}]`
    }

    const ordered = document.createElement('ol');
    for (let x of firstElements) {
        const item = document.createElement('li')
        item.innerHTML = toLine(x)
        ordered.appendChild(item);
    }

    const resultsDiv = document.getElementById("results")
    resultsDiv.replaceChildren(ordered)
}
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>

<h1 id="title">Pokopia Favourites Search</h1>
<table>
    <tr>
        <td>
        <form id="hobbyForm">
        <label><input type="checkbox" name="favs" value="Blocky Stuff"> Blocky Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Cleanliness"> Cleanliness</label><br>
        <label><input type="checkbox" name="favs" value="Colorful Stuff"> Colorful Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Complicated Stuff"> Complicated Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Construction"> Construction</label><br>
        <label><input type="checkbox" name="favs" value="Containers"> Containers</label><br>
        <label><input type="checkbox" name="favs" value="Cute Stuff"> Cute Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Electronics"> Electronics</label><br>
        <label><input type="checkbox" name="favs" value="Exercise"> Exercise</label><br>
        <label><input type="checkbox" name="favs" value="Fabric"> Fabric</label><br>
        <label><input type="checkbox" name="favs" value="Garbage"> Garbage</label><br>
        <label><input type="checkbox" name="favs" value="Gatherings"> Gatherings</label><br>
        <label><input type="checkbox" name="favs" value="Glass Stuff"> Glass Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Group Activities"> Group Activities</label><br>
        <label><input type="checkbox" name="favs" value="Hard Stuff"> Hard Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Healing"> Healing</label><br>
        <label><input type="checkbox" name="favs" value="Letters and Words"> Letters and Words</label><br>
        <label><input type="checkbox" name="favs" value="Looks Like food"> Looks Like food</label><br>
        <label><input type="checkbox" name="favs" value="Lots of Dirt"> Lots of Dirt</label><br>
        <label><input type="checkbox" name="favs" value="Lots of Fire"> Lots of Fire</label><br>
        <label><input type="checkbox" name="favs" value="Lots of Nature"> Lots of Nature</label><br>
        <label><input type="checkbox" name="favs" value="Lots of Water"> Lots of Water</label><br>
        <label><input type="checkbox" name="favs" value="Luxury"> Luxury</label><br>
        <label><input type="checkbox" name="favs" value="Metal Stuff"> Metal Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Nice Breezes"> Nice Breezes</label><br>
        <label><input type="checkbox" name="favs" value="Noisy Stuff"> Noisy Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Ocean Vibes"> Ocean Vibes</label><br>
        <label><input type="checkbox" name="favs" value="Play Spaces"> Play Spaces</label><br>
        <label><input type="checkbox" name="favs" value="Pretty Flowers"> Pretty Flowers</label><br>
        <label><input type="checkbox" name="favs" value="Rides"> Rides</label><br>
        <label><input type="checkbox" name="favs" value="Round Stuff"> Round Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Sharp Stuff"> Sharp Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Shiny Stuff"> Shiny Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Slender Objects"> Slender Objects</label><br>
        <label><input type="checkbox" name="favs" value="Soft Stuff"> Soft Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Spinning Stuff"> Spinning Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Spooky Stuff"> Spooky Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Stone Stuff"> Stone Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Strange Stuff"> Strange Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Symbols"> Symbols</label><br>
        <label><input type="checkbox" name="favs" value="Watching Stuff"> Watching Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Wobbly Stuff"> Wobbly Stuff</label><br>
        <label><input type="checkbox" name="favs" value="Wooden Stuff"> Wooden Stuff</label><br>
        
        <button type="button" id="btn" onclick="getResults()">Get Selected</button>
        </form>

        </td>
        <td>
            <div id="results"></div>
        </td>
    </tr>
</table>
<style>
    /* table td { width: 20em; border: 1px solid black; } */
    table td:nth-child(2) { text-align: end; }
    table td:nth-child(1) { width: 30em; }
</style>