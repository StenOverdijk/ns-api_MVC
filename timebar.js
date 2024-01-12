 // Update the time in the time bar
 function updateTime() {
    const timeBar = document.getElementById('timeBar');
    const currentTime = new Date();
    const formattedCurrentTime = currentTime.toLocaleTimeString('en-US', {
        timeZone: 'Europe/Amsterdam',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    timeBar.textContent = formattedCurrentTime;
}

// Update the time every second
setInterval(updateTime, 1000);

// Initial call to set the time when the page loads
updateTime();