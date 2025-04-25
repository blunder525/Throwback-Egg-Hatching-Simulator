const pets = [
    { name: "Bow Bunny", baseChance: 64.0, rarity: "common" },
    { name: "Easter Egg", baseChance: 30.0, rarity: "unique" },
    { name: "Flying Bunny", baseChance: 3.0, rarity: "epic" },
    { name: "Easter Serpent", baseChance: 1 / 2500 * 100, rarity: "legendary" },
    { name: "Dualcorn", baseChance: 1 / 50000 * 100, rarity: "legendary" },
    { name: "Holy Egg", baseChance: 1 / 500000 * 100, rarity: "legendary" },
    { name: "Godly Gem", baseChance: 1 / 250000000 * 100, rarity: "secret" },
    { name: "Dementor", baseChance: 1 / 1000000000 * 100, rarity: "secret" },
];

const shinyChance = 1 / 26;
const mythicChance = 1 / 40;
const mythicRarities = new Set(["legendary", "secret"]);

let luckPercent = 100;

function applyLuck(pets, luckMultiplier) {
    for (const pet of pets) {
        if (mythicRarities.has(pet.rarity)) {
            pet.adjustedChance = pet.baseChance * luckMultiplier;
        } else {
            pet.adjustedChance = pet.baseChance;
        }
    }
    const total = pets.reduce((sum, pet) => sum + pet.adjustedChance, 0);
    for (const pet of pets) {
        pet.normalizedChance = pet.adjustedChance / total;
    }
}

function choosePet() {
    const roll = Math.random();
    let cumulative = 0;
    for (const pet of pets) {
        cumulative += pet.normalizedChance;
        if (roll <= cumulative) {
            return pet;
        }
    }
    return pets[pets.length - 1];
}

function getFinalOdds(petBaseChance, shiny, mythic) {
    let chance = petBaseChance / 100;
    if (shiny) {
        chance *= shinyChance;
    }
    if (mythic) {
        chance *= mythicChance;
    }
    return chance;
}

function hatchEggs(numEggs) {
    const results = {};
    for (let i = 0; i < numEggs; i++) {
        const pet = choosePet();
        const isShiny = Math.random() < shinyChance;
        const isMythic = mythicRarities.has(pet.rarity) && Math.random() < mythicChance;

        let finalName = pet.name;
        if (isShiny && isMythic) {
            finalName = `Shiny Mythic ${finalName}`;
        } else if (isShiny) {
            finalName = `Shiny ${finalName}`;
        } else if (isMythic) {
            finalName = `Mythic ${finalName}`;
        }

        if (!results[finalName]) {
            results[finalName] = {
                count: 0,
                baseChance: pet.adjustedChance,
                shiny: isShiny,
                mythic: isMythic,
            };
        }

        results[finalName].count += 1;
    }
    return results;
}

function printResults(results) {
    let formattedResults = [];
    for (const [name, data] of Object.entries(results)) {
        const odds = getFinalOdds(data.baseChance, data.shiny, data.mythic);
        const oddsStr = odds > 0 ? `1 in ${Math.round(1 / odds).toLocaleString()}` : "N/A";
        formattedResults.push({ name, count: data.count, odds, oddsStr });
    }

    formattedResults.sort((a, b) => b.odds - a.odds);

    let resultHtml = "<h3>🎉 Hatch Results:</h3><ul>";
    formattedResults.forEach(({ name, count, oddsStr }) => {
        resultHtml += `<li>${name}: ${count} (Odds: ${oddsStr})</li>`;
    });
    resultHtml += "</ul>";

    document.getElementById("results").innerHTML = resultHtml;
}

document.getElementById("hatch-button").addEventListener("click", () => {
    const numEggs = parseInt(document.getElementById("num-eggs").value);
    if (isNaN(numEggs) || numEggs <= 0) {
        alert("Please enter a valid number of eggs.");
        return;
    }
    applyLuck(pets, luckPercent / 100);
    const results = hatchEggs(numEggs);
    printResults(results);
});

document.getElementById("change-luck-button").addEventListener("click", () => {
    const newLuck = parseFloat(document.getElementById("luck-input").value);
    if (isNaN(newLuck) || newLuck <= 0) {
        alert("Please enter a valid luck percentage.");
        return;
    }
    luckPercent = newLuck;
    document.getElementById("luck").textContent = `${luckPercent}%`;
});
