---
title: "Pokemon Type Quiz"
date: 2026-06-11 00:00:00 -400
categories: [Tools]
tags: [tools,pokemon]
---

<script>
const MAIN_MENU = 0;
const SINGLE = 1;
const DOUBLE = 2;

var gameState = MAIN_MENU;
var score = 0;
var maxScore = 0;
var QAstate = 0;

var currentAttacker = 'normal';
var currentDefender = ['normal'];

const SubMenu = Object.freeze([
        "Main Menu",
        "Mono-Type Quiz",
        "Dual Type Quiz",
]);

const Type = Object.freeze({
  normal: 0,
  fire: 1,
  water: 2,
  electric: 3,
  grass: 4,
  ice: 5,
  fighting: 6,
  poison: 7,
  ground: 8,
  flying: 9,
  psychic: 10,
  bug: 11,
  rock: 12,
  ghost: 13,
  dragon: 14,
  dark: 15,
  steel: 16,
  fairy: 17,
});

var NEUT = 1;
var SUPR = 2;
var RESS = 0.5;
var IMUN = 0;

const TypeEff = Object.freeze([
/*       NORM  FIRE  WATER ELEC  GRASS ICE   FIGHT POIS  GRND  FLY   PSYCH BUG   ROCK  GHOST DRAG  DARK  STEEL FAIRY */
        [NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, RESS, IMUN, NEUT, NEUT, RESS, NEUT], /* NORMAL */
        [NEUT, RESS, RESS, NEUT, SUPR, SUPR, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, RESS, NEUT, RESS, NEUT, SUPR, NEUT], /* FIRE */
        [NEUT, SUPR, RESS, NEUT, RESS, NEUT, NEUT, NEUT, SUPR, NEUT, NEUT, NEUT, SUPR, NEUT, RESS, NEUT, NEUT, NEUT], /* WATER */
        [NEUT, NEUT, SUPR, RESS, RESS, NEUT, NEUT, NEUT, IMUN, SUPR, NEUT, NEUT, NEUT, NEUT, RESS, NEUT, NEUT, NEUT], /* ELECT */
        [NEUT, RESS, SUPR, NEUT, RESS, NEUT, NEUT, RESS, SUPR, RESS, NEUT, RESS, SUPR, NEUT, RESS, NEUT, RESS, NEUT], /* GRASS */
        [NEUT, RESS, RESS, NEUT, SUPR, RESS, NEUT, NEUT, SUPR, SUPR, NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, RESS, NEUT], /* ICE */
        [SUPR, NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, RESS, NEUT, RESS, RESS, RESS, SUPR, IMUN, NEUT, SUPR, SUPR, RESS], /* FIGHT */
        [NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, NEUT, RESS, RESS, NEUT, NEUT, NEUT, RESS, RESS, NEUT, NEUT, IMUN, SUPR], /* POIS */
        [NEUT, SUPR, NEUT, SUPR, RESS, NEUT, NEUT, SUPR, NEUT, IMUN, NEUT, RESS, SUPR, NEUT, NEUT, NEUT, SUPR, NEUT], /* GROUND */
        [NEUT, NEUT, NEUT, RESS, SUPR, NEUT, SUPR, NEUT, NEUT, NEUT, NEUT, SUPR, RESS, NEUT, NEUT, NEUT, RESS, NEUT], /* FLY */
        [NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, SUPR, NEUT, NEUT, RESS, NEUT, NEUT, NEUT, NEUT, IMUN, RESS, NEUT], /* PSYCH */
        [NEUT, RESS, NEUT, NEUT, SUPR, NEUT, RESS, RESS, NEUT, RESS, SUPR, NEUT, NEUT, RESS, NEUT, SUPR, RESS, RESS], /* BUG */
        [NEUT, SUPR, NEUT, NEUT, NEUT, SUPR, RESS, NEUT, RESS, SUPR, NEUT, SUPR, NEUT, NEUT, NEUT, NEUT, RESS, NEUT], /* ROCK */
        [IMUN, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, NEUT, SUPR, NEUT, RESS, NEUT, NEUT], /* GHOST */
        [NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, RESS, IMUN], /* DRAGON */
        [NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, RESS, NEUT, NEUT, NEUT, SUPR, NEUT, NEUT, SUPR, NEUT, RESS, NEUT, RESS], /* DARK */
        [NEUT, RESS, RESS, RESS, NEUT, SUPR, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, NEUT, NEUT, NEUT, RESS, SUPR], /* STEEL */
        [NEUT, RESS, NEUT, NEUT, NEUT, NEUT, SUPR, RESS, NEUT, NEUT, NEUT, NEUT, NEUT, NEUT, SUPR, SUPR, RESS, NEUT], /* FAIRY */
]);

function getFileName(type) {
        return `/assets/pkmnTypeIcons/${type}.svg`;
};

function addIcon(tp, div, width=100) {
        const img = document.createElement('img');
        img.src = getFileName(tp);
        img.alt = tp;
        img.width = width;

        div.appendChild(img);
};

function showTypeChart() {
        /* Selects the element with id "myHeading" and changes its text */
        document.getElementById("myHeading").innerHTML = "JavaScript is Working!";

        const container = document.getElementById('iconsTest');

        const table = document.createElement('table');
        container.replaceChildren(table);
        const row1 = document.createElement('tr');
        table.appendChild(row1);
        row1.appendChild(document.createElement('th'));
        
        for(const [k,t] of Object.entries(Type)) {
                const cell = document.createElement('th');
                addIcon(k, cell, 35);
                row1.appendChild(cell);
        }

        for(const [k,t1] of Object.entries(Type)) {
                const row = document.createElement('tr');
                table.appendChild(row);
                const cell = document.createElement('th');
                addIcon(k, cell, 35);
                row.appendChild(cell,);

                for(const [k,t2] of Object.entries(Type)) {
                        const cell = document.createElement('th');
                        row.appendChild(cell);
                        cell.innerHTML = `${TypeEff[t1][t2]}`;
                }
        }
};

var randomKey = function (obj) {
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
};

function updateScore() {
        document.getElementById("currentScore").innerHTML = 
                `score: ${score}/${maxScore}: ${Math.round(maxScore ? 100 * score/maxScore : 0)}%`;
};

function updateTypeIcons() {
        const qT = document.getElementById("questionTable");
        qT.replaceChildren();

        /* Header Row */
        const headerRow = document.createElement('tr');
        qT.appendChild(headerRow);
        
        const atkHead = document.createElement('th');
        headerRow.appendChild(atkHead);
        atkHead.textContent = "Attacking Type";

        headerRow.appendChild(document.createElement('th'));

        const defHead = document.createElement('th');
        defHead.colSpan = 2;
        headerRow.appendChild(defHead);
        defHead.textContent = "Defending Type";
        
        /* Icon Row */
        const iconRow = document.createElement('tr');
        qT.appendChild(iconRow);

        const atkCell1 = document.createElement('td');
        iconRow.appendChild(atkCell1);
        addIcon(currentAttacker, atkCell1, 100);
        
        const arrowCell = document.createElement('td');
        iconRow.appendChild(arrowCell);
        arrowCell.innerText = "\u2192";
        arrowCell.style="font-size: 64px;"

        const defCell1 = document.createElement('td');
        iconRow.appendChild(defCell1);
        addIcon(currentDefender[0], defCell1, 100);
        if (gameState === SINGLE) {
                defCell1.colSpan = 2;
        } else {
                const defCell2 = document.createElement('td');
                iconRow.appendChild(defCell2);
                addIcon(currentDefender[1], defCell2, 100);
        }

        /* Text Row */
        const textRow = document.createElement('tr');
        textRow.style ="font-size: 24px;"
        qT.appendChild(textRow);

        const atkCellTXT = document.createElement('td');
        textRow.appendChild(atkCellTXT);
        atkCellTXT.textContent = `A ${currentAttacker} type attack`;

        const arrCellTXT = document.createElement('td');
        textRow.appendChild(arrCellTXT);
        arrCellTXT.textContent = `targets a`;

        const defCellTXT = document.createElement('td');
        textRow.appendChild(defCellTXT);
        defCellTXT.colSpan = 2;

        if (gameState === SINGLE) {
                defCellTXT.textContent = `${currentDefender[0]} type pokemon`;
        } else {
                defCellTXT.textContent = `${currentDefender[0]}/${currentDefender[1]} type pokemon`;
        }
};

function getNewTypes() {
        for (let btn of getAnswerButtons()) {
                btn.hidden = false;
                btn.disabled = false;
                btn.classList.remove(...btn.classList);
                while (btn.childElementCount)  {
                        btn.removeChild(btn.lastElementChild);
                }
        }
        document.getElementById(`nextQuestion`).disabled = true;

        currentAttacker = randomKey(Type);
        currentDefender = [randomKey(Type)];
        if (gameState == DOUBLE) {
                var type2 = randomKey(Type);
                while (type2 == currentDefender[0])
                        type2 = randomKey(Type);
                currentDefender[1] = type2;
        }
        updateTypeIcons();
};

function startQuiz() {
        score = 0;
        maxScore = 0;
        QAstate = 0;
        document.getElementById("mainMenuContent").hidden = true;
        document.getElementById("quizContent").hidden = false;
        updateScore();
        getNewTypes();
};

function startMonoQuiz() {
        gameState = SINGLE;
        startQuiz();
        document.getElementById("subSection").innerHTML = SubMenu[1];
};

function startDualQuiz() {
        gameState = DOUBLE;
        startQuiz();
        document.getElementById("subSection").innerHTML = SubMenu[2];
};

function scoreSingle(answer, correct) {
        if (answer === correct) {
                return [2, 2];
        }

        if (correct === 0 && answer === 0.5) {
                return [1, 2];
        }
        return [0, 2];
};

function scoreDouble(answer, correct) {
        if (answer === correct) {
                return [2, 2];
        }
        
        if (correct === 0 && answer === 0.25) {
                return [1, 2]
        }
        return [0, 2];
};

function makeGuess(arg) {
        for (let btn of getAnswerButtons()) {
                btn.disabled = true;
                btn.classList.add("incorrect");
        }
        document.getElementById(`nextQuestion`).disabled = false;

        let correct = 1;
        
        for (let target of currentDefender) {
                let mod =  TypeEff[Type[currentAttacker]][Type[target]];
                correct *= mod;
                addIcon(target, document.getElementById(`guess${mod}`), 15);
                console.log(document.getElementById(`guess${mod}`).children)
        }

        document.getElementById(`guess${correct}`).classList.replace("incorrect", "correct");



        let [points, maxPoints] = ((gameState == SINGLE) ? scoreSingle : scoreDouble)(arg, correct);
        score += points;
        maxScore += maxPoints;
        updateScore();
};

function* getAnswerButtons() {
        let range = gameState == SINGLE ? [2, 1, 0.5, 0] : [4, 2, 1, 0.5, 0.25, 0];
        for (let i of range) {
                yield document.getElementById(`guess${i}`);
        }
};

function returnToMenu() {
        document.getElementById("mainMenuContent").hidden = false;
        document.getElementById("quizContent").hidden = true;
        document.getElementById("subSection").innerHTML = SubMenu[0];
        for (let i of [4, 2, 1, 0.5, 0.25, 0]) {
                document.getElementById(`guess${i}`).hidden = true;
        }
};
</script>

<h1 id="title">POKEMON TYPE MATCHUP QUIZ</h1>
<h2 id="subSection"> Main Menu </h2>

<!-- <div id="iconsTest"></div> -->

<div id="mainMenuContent">
<table class="mainMenu">
        <thead>
                <tr>
                        <th colspan="1"> Quiz Type </th>
                        <th colspan="1"> <button onclick="startMonoQuiz()">MonoType Quiz</button> </th>
                        <th colspan="1"> <button onclick="startDualQuiz()">DualType Quiz</button> </th>
                </tr>
        </thead>
        <tr>
                <td> Correctly Guessing Effectiveness </td> 
                <td> 2 points </td>
                <td> 2 points </td>
        </tr>
        <tr>
                <td> Guessing Not Very Effective<br>when answer is Immune </td> 
                <td> 1 point </td>
                <td> 1 point </td>
        </tr>
        <tr>
                <td> Everything Else </td> 
                <td> 0 point </td>
                <td> 0 point </td>
        </tr>
</table>
</div>

<div id="quizContent" class="quizKlass" hidden>
<button id="backToMain" onclick="returnToMenu()">Return To Main Menu</button>
<div id="currentScore"></div>
<table id="questionTable" class="gameBoard">
        <tr id="questionTableHeader">
                <th>Attacking Type</th>
                <th></th>
                <th colspan="2">Defending Type</th>
        </tr>
</table>

<button id="guess4" hidden onclick="makeGuess(4)">Extremely Effective (4x)</button>
<button id="guess2" hidden onclick="makeGuess(2)">Super Effective (2x)</button>
<button id="guess1" hidden onclick="makeGuess(1)">Neutral Damage (1x)</button>
<br>
<button id="guess0.5" hidden onclick="makeGuess(0.5)">Not Very Effective (0.5x)</button>
<button id="guess0.25" hidden onclick="makeGuess(0.25)">Mostly Ineffective (0.25x)</button>
<button id="guess0" hidden onclick="makeGuess(0)">No Damage (0x)</button>
<br>
<button id="nextQuestion" disabled onclick="getNewTypes()">Next Question</button>
</div>
<style>
.mainMenu table, 
.mainMenu th,
.mainMenu td {
  border: 1px solid;
}
.gameBoard th {
  border: 1px solid;
}
.gameBoard td {
  font-size: 24px;
  text-align: center;
}
.quizKlass button {
        height: auto;
        line-height: 30px;
        font-size: 16px;
}
.correct {color: #04AA6D;}
.incorrect {color: #f44336;}
</style>

</html>