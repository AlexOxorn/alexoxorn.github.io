---
title: "Pokopia Favourites Finder"
date: 2026-06-11 00:00:00 -400
categories: [Tools]
tags: [tools,pokemon]
---

<script src="/scripts/PokopiaItemSearch.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>

<h1 id="title">Pokopia Favourites Search</h1>
<form id="hobbyForm">
    <h3>Loading Types</h3>
    <div id="hobbyInputs" class="input-container"></div>
    <button type="button" id="btn" onclick="getResults()">Get Selected</button>
    <button type="button" id="btn" onclick="clearResults()">Clear Selected</button>
</form>
<table id="results" style="width: 100%"></table>
<style>
    /* table td { width: 20em; border: 1px solid black; } */
    table td:nth-child(3) { text-align: end; }
    table td:nth-child(2) { text-align: center; }
    /* table td:nth-child(1) { width: 10em; } */
    table {
        margin-top: 12px;
        border-collapse: collapse;
        border: 2px solid rgb(140 140 140);
        font-family: sans-serif;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }
    td {
        border: 1px solid rgb(160 160 160);
        padding: 8px 10px;
    }
    .input-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        /* gap: 16px; */
    }
</style>