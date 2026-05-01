document.addEventListener('DOMContentLoaded', () => {
    // 1. UI SELECTORS
    const container = document.querySelector(".container");
    const registerbtn = document.querySelector(".signupbtn");
    const loginbtn = document.querySelector(".loginbtn");
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // --- PANEL TOGGLE ANIMATION ---
    if (registerbtn && loginbtn && container) {
        registerbtn.addEventListener('click', () => {
            container.classList.add('active');
        });

        loginbtn.addEventListener('click', () => {
            container.classList.remove('active');
        });
    }

    // URL Hash Handling (e.g., index.html#signup)
    const checkHash = () => {
        if (window.location.hash === '#signup') {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    };
    window.addEventListener('load', checkHash);
    window.addEventListener('hashchange', checkHash);


    // --- FIREBASE AUTH LOGIC ---

    // Sign Up Function
    const signUp = async (email, password) => {
        try {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            console.log("User registered successfully!");
        } catch (error) {
            alert("Registration Error: " + error.message);
        }
    };

    // Sign In Function
    const signIn = async (email, password) => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log("User signed in successfully!");
        } catch (error) {
            alert("Login Error: " + error.message);
        }
    };


    // --- FORM LISTENERS ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            signIn(email, pass);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const pass = document.getElementById('regPassword').value;
            signUp(email, pass);
        });
    }


    // --- AUTH OBSERVER ---
    // This watches for changes in login status
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("Logged in as:", user.email);
            
            // Get current file name
            const path = window.location.pathname;
            const page = path.split("/").pop();

            // Only redirect if the user is on the login/landing page
            // Adjust 'login.html' or 'index.html' to match your actual file names
            if (page === 'login.html') {
                window.location.href = 'dashboard.html';
            }
        }
    });
});