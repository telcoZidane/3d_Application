﻿function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main-view").style.marginLeft = "250px";
    document.getElementById("btn-group-container").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main-view").style.marginLeft = "0";
    document.getElementById("btn-group-container").style.marginLeft = "0";
}
function closeStatusCard() {
    const statusCard = document.getElementById('status-card');
    statusCard.style.display = 'none';
}