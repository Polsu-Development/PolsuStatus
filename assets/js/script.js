const hamburger = document.querySelector(".hamburger");
const year = document.querySelector("#current-year");
const navMenu = document.querySelectorAll(".nav-links");
const statusInfo = document.querySelector("#status-info");
const statusInfoText = document.querySelector("#status-info-text");
const version = document.querySelector("#version");

var isOpen = false;

// formats the numbers to include commas
function formatNumber(num) {
    return String(new Intl.NumberFormat("en-GB").format(num));
}

// adds a timeout for the API call
function Timeout(time) {
    let controller = new AbortController();
    setTimeout(() => controller.abort(), time * 1000);
    return controller;
}

// updates the data on the header + stat component
function updateStats(data) {
    version.innerHTML = data.data.polsu.version;

    const statsServer = document.querySelector(".stats-servers");
    const statsChannel = document.querySelector(".stats-channels");
    const statsUser = document.querySelector(".stats-users");
    const statsAccounts = document.querySelector(".stats-accounts");
    const statsSessions = document.querySelector(".stats-sessions");
    const statsPlayers = document.querySelector(".stats-players");
    const statsCode = document.querySelector(".stats-code");
    const statsCommands = document.querySelector(".stats-commands");

    statsServer.innerText = formatNumber(data.data.polsu.servers);
    statsChannel.innerText = formatNumber(data.data.polsu.channels);
    statsUser.innerText = formatNumber(data.data.polsu.users);
    statsAccounts.innerText = formatNumber(data.data.polsu.accounts);
    statsSessions.innerText = formatNumber(data.data.polsu.sessions);
    statsPlayers.innerText = formatNumber(data.data.polsu.players);
    statsCode.innerText = formatNumber(data.data.polsu.code.lines + data.data.api.code.lines);
    statsCommands.innerText = formatNumber(data.data.polsu.commands);
}

// updates the shard data
function updateShards(data) {
    const shards = document.querySelector("#shards");
    const shardsClone = shards.innerHTML;
    const headerTotalShards = document.querySelectorAll(".total-shards");
    const headerShardsOnline = document.querySelector("#shards-online");
    let shardsOffline = 0;
    let totalShards = 0;

    for (let i in data.data.polsu.shards) {
        totalShards += 1;
    }

    for (let i = 0; i < totalShards - 1; i++) {
        shards.insertAdjacentHTML("beforeend", shardsClone);
    }

    let shardRemainder = totalShards % 5;
    let lastShardBasis = 100 / shardRemainder;
    const shardCard = document.querySelectorAll(".shard-card");
    const shardId = document.querySelectorAll(".shard-card-id");
    const shardPing = document.querySelectorAll(".shard-ping");
    const shardServer = document.querySelectorAll(".shard-servers");

    for (let i in data.data.polsu.shards) {
        if (data.data.polsu.shards[i].status != "Online") {
            shardsOffline += 1;
            shardCard[i - 1].classList.add("offline");
            shardId[i - 1].innerText = "Shard " + i;
        } else {
            shardCard[i - 1].classList.add("online");
            shardId[i - 1].innerText = "Shard " + i;
            shardPing[i - 1].innerText = formatNumber(data.data.polsu.shards[i].latency);
            shardServer[i - 1].innerText = formatNumber(data.data.polsu.shards[i].servers);
        }
        if (i > totalShards - shardRemainder) {
            shardCard[i - 1].style.cssText = `flex-basis: calc(${lastShardBasis}% - 0.75rem)`;
        }
    }

    shards.classList.remove("hide");
    statusInfo.classList.remove("hide");
    statusInfoText.classList.add("hide");
    headerTotalShards.forEach((data) => (data.innerText = formatNumber(totalShards)));
    headerShardsOnline.innerText = formatNumber(totalShards - shardsOffline);
}

// Update the status text if the API call fails
function updateStatusText() {
    statusInfoText.innerHTML = "Loading failed. Please try again later.";
}

// fetch server stats for description
async function fetchData() {
    try {
        const response = await fetch("https://api.polsu.xyz/services/stats", {
            signal: Timeout(10).signal,
        });
        if (!response.ok) {
            updateStatusText();
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        updateStats(data);
        updateShards(data);
    } catch {
        updateStatusText();
    }
}

// trigger the slide in
hamburger.addEventListener("click", () => {
    if (!isOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "unset";
    }
    isOpen = !isOpen;
    hamburger.classList.toggle("active");
    navMenu.forEach((item) => {
        item.classList.toggle("active");
    });
});

// checks to see if a link has been clicked to hide the nav
document.querySelectorAll(".nav-link").forEach((n) =>
    n.addEventListener("click", () => {
        document.body.style.overflow = "unset";
        isOpen = false;
        hamburger.classList.remove("active");
        navMenu.forEach((item) => {
            item.classList.remove("active");
        });
    })
);

// runs all of the modules once the page has loaded
window.addEventListener("load", () => {
    fetchData();
    year.innerHTML = new Date().getFullYear();
});
