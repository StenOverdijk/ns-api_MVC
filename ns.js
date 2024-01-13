// used https://www.taniarascia.com/javascript-mvc-todo-app/ as example

class Model {
    constructor() {

        this.departures = []

        console.log("Model Created");
    }

    clearDepartures() {
        this.departures = [];
    }

    addDepartures(departures) {
        console.log(departures);
        this.departures.push(...departures);
    }

}

class View {
    constructor() {
        console.log("View Created");
    }

    displayDepartures(departures) {
        const departuresTableBody = document.getElementById('departuresTableBody');
        departuresTableBody.innerHTML = ''; // Clear previous content

        if (departures && departures.length > 0) {
            // Sort departures based on planned departure time
            const sortedDepartures = departures.sort((a, b) => {
                const aTime = new Date(a.plannedDateTime).getTime();
                const bTime = new Date(b.plannedDateTime).getTime();
                return aTime - bTime;
            });

            // Create and append rows for each departure
            sortedDepartures.forEach(departure => {
                const plannedDepartureTime = new Date(departure.plannedDateTime);
                const actualDepartureTime = departure.actualDateTime ? new Date(departure.actualDateTime) : null;

                // Format the time in Netherlands timezone with 24-hour clock and shorter format (HH:mm)
                const formattedPlannedDepartureTime = plannedDepartureTime.toLocaleTimeString(undefined, {
                    timeZone: 'Europe/Amsterdam',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });

                let delayInfo = '';
                if (actualDepartureTime) {
                    const delayMinutes = Math.round((actualDepartureTime - plannedDepartureTime) / (1000 * 60));
                    if (delayMinutes > 0) {
                        // Create a red box for the delay information
                        delayInfo = `<span class="bg-danger text-white p-1 rounded">+${delayMinutes} min</span>`;
                    }
                }

                // Create a table row for each departure
                const departureRow = document.createElement('tr');

                // Create and append cells for each departure detail
                const timeCell = document.createElement('td');
                timeCell.className = 'departure-time fs-4 fw-bold';
                timeCell.innerHTML = `${formattedPlannedDepartureTime} ${delayInfo}`;

                const platformCell = document.createElement('td');
                platformCell.className = 'platform fs-4 fw-bold';
                platformCell.textContent = departure.plannedTrack;

                const destinationCell = document.createElement('td');
                destinationCell.className = 'destination';
                destinationCell.innerHTML = `<div class="destination fs-4 fw-bold">${departure.direction}</div><div class="via fs-6"><i>${this.getViaStationsText(departure.routeStations)}</i></div>`;
                const timeUntilDepartureCell = document.createElement('td');
                timeUntilDepartureCell.className = 'time-until-departure fs-4 fw-bold';
                timeUntilDepartureCell.textContent = this.getTimeUntilDeparture(plannedDepartureTime, actualDepartureTime);

                const trainTypeCell = document.createElement('td');
                trainTypeCell.className = 'train-type fs-4 fw-bold';
                trainTypeCell.textContent = this.getTrainTypeText(departure.product);

                // Append cells to the row
                departureRow.appendChild(timeCell);
                departureRow.appendChild(platformCell);
                departureRow.appendChild(destinationCell);
                departureRow.appendChild(timeUntilDepartureCell);
                departureRow.appendChild(trainTypeCell);

                // Append the row to the departures table body
                departuresTableBody.appendChild(departureRow);
            });
        } else {
            // If no departures are available, display a message
            const noDeparturesRow = document.createElement('tr');
            const noDeparturesCell = document.createElement('td');
            noDeparturesCell.colSpan = 5; // Span 5 columns
            noDeparturesCell.className = 'text-center';
            noDeparturesCell.textContent = 'Geen vertrekken beschikbaar.';
            noDeparturesRow.appendChild(noDeparturesCell);
            departuresTableBody.appendChild(noDeparturesRow);
        }
    }

    // Helper function to get the via stations text
    getViaStationsText(routeStations) {
        if (routeStations && routeStations.length > 0) {
            return `Via ${routeStations.map(stop => stop.mediumName).join(', ')}`;
        }
        return '';
    }

    // Helper function to get the train type text
    getTrainTypeText(product) {
        return product ? `${product.shortCategoryName} ${product.number}` : '';
    }

    // Helper function to get the time until departure
    getTimeUntilDeparture(plannedTime, actualTime) {
        if (actualTime) {
            const delayMinutes = Math.round((actualTime - new Date()) / (1000 * 60));
            return delayMinutes > 0 ? `${delayMinutes} min` : '<1 min';
        }
        return '';

    }
}

class Controller {
    constructor(model, view) {
        this.station = "Rm";
        this.maxJourneys = 10;
        this.apiUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?lang=en&station=${this.station}&maxJourneys=${this.maxJourneys}`;
        this.apiKey = "e65d65e7a82b4f2c9c2b5ec34deac34c"
        this.refreshInterval = 10000; // 10 seconds
        this.model = model;
        this.view = view;
        console.log("Controller Created");
        console.log("MVC Ready");
        // Initial load of departures
        this.loadDepartures();
        // Refresh every ten seconds
        setInterval(() => this.loadDepartures(), this.refreshInterval);
    }

    loadDepartures() {
        console.log("loading departures from NS-Api...");

        fetch(this.apiUrl, {
            method: 'GET',
            headers: {
                "Ocp-Apim-Subscription-Key": this.apiKey,
                "Accept": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                console.log("Departures loaded from NS-Api");
                return response.json();
            })
            .then(data => {
                const departures = data.payload.departures;
                this.model.clearDepartures();
                this.model.addDepartures(departures);
                this.view.displayDepartures(this.model.departures);
            })
            .catch(error => {
                console.error('Error:', error);
                this.model.clearDepartures();
                this.view.displayDepartures(this.model.departures);

            });
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const app = new Controller(new Model(), new View());

});