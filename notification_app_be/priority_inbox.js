const axios = require('axios'); // You may need to run 'npm install axios'

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

// Define weights for priority
const PRIORITY_WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

async function getPriorityNotifications(n = 10) {
    try {
        const response = await axios.get(API_URL);
        let notifications = response.data.notifications;

        // Sorting Logic
        notifications.sort((a, b) => {
            const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
            const weightB = PRIORITY_WEIGHTS[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA; // Higher weight first
            }

            // If weights are equal, sort by timestamp (newest first)
            return new Date(b.Timestamp) - new Date(a.Timestamp);
        });

        // Display top 'n'
        console.log(`--- Top ${n} Priority Notifications ---`);
        console.table(notifications.slice(0, n));
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
    }
}

getPriorityNotifications(10);