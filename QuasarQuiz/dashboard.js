// Function to handle Sign Out
const signOutUser = () => {
    firebase.auth().signOut()
        .then(() => {
            console.log("User signed out successfully.");
            window.location.href = 'loginpage.html'; // Redirect to login page
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
};
