// Create an EventSource object to listen for server-sent events
const eventSource = new EventSource('/updatescore');

// Event listener for incoming messages
const score = document.getElementById('score');
eventSource.onmessage = (event) => {
    score.innerHTML = event.data;
}

eventSource.addEventListener("update", (e) => {
    score.innerHTML = e.data;
});

eventSource.onerror = (err) => {
    console.error("EventSource failed:", err);
};

// Function to call api to update scores
function updateScore(person, value) {
    fetch('/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: person, change: value })
    })
        .then(response => response.text())
        .then(result => {
          console.log('Message sent:', result);
          // Display a success message or update UI as needed
    })
        .catch(error => {
          console.error('Error sending message:', error);
          // Display an error message or update UI as needed
    });
}