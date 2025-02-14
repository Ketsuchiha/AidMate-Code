let userData = JSON.parse(localStorage.getItem('userData')) || {
    name: 'Guest User',
    age: '',
    emergencyContact: '',
    favorites: []
};

let currentItem = null;

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    document.getElementById('languageSelector').value = savedLanguage;
    applyLanguageChanges(savedLanguage);
    updateProfileDisplay();
});

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    updateNavigation(screenId);
    if (screenId === 'profile-screen') updateProfileDisplay();
}

function getAllTopics() {
    return [
        {
            title: 'Asthma',
            category: 'Medical Conditions',
            description: 'Learn about asthma triggers and emergency response',
            screen: 'conditions-screen'
        },
        {
            title: 'Diabetes',
            category: 'Medical Conditions',
            description: 'Managing blood sugar emergencies',
            screen: 'conditions-screen'
        },
        {
            title: 'Allergies',
            category: 'Medical Conditions',
            description: 'Recognizing and responding to severe allergic reactions',
            screen: 'conditions-screen'
        },
        {
            title: 'Cuts & Bleeding',
            category: 'First-Aid Situations',
            description: 'Steps to handle bleeding emergencies',
            screen: 'situations-screen'
        },
        {
            title: 'Burns',
            category: 'First-Aid Situations',
            description: 'First aid for different types of burns',
            screen: 'situations-screen'
        },
        {
            title: 'CPR',
            category: 'First-Aid Situations',
            description: 'Basic life support guidelines',
            screen: 'situations-screen'
        }
    ];
}

// Create search results container
function createSearchResultsContainer() {
    let container = document.querySelector('.search-results');
    if (!container) {
        container = document.createElement('div');
        container.className = 'search-results';
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            margin-top: 5px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        document.querySelector('.search-container').appendChild(container);
    }
    return container;
}

// Search functionality
function searchTopics() {
    const searchInput = document.querySelector('.search-bar');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const resultsContainer = createSearchResultsContainer();
    
    if (searchTerm === '') {
        resultsContainer.style.display = 'none';
        return;
    }

    const topics = getAllTopics();
    const filteredTopics = topics.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm) ||
        topic.description.toLowerCase().includes(searchTerm) ||
        topic.category.toLowerCase().includes(searchTerm)
    );

    if (filteredTopics.length > 0) {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = filteredTopics.map(topic => `
            <div class="search-result-item" onclick="showTopicDetails('${topic.title}', '${topic.screen}')">
                <div class="search-result-content" style="
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                    transition: background-color 0.3s;
                ">
                    <h4 style="color: #2c3e50; margin-bottom: 0.25rem;">${topic.title}</h4>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.25rem;">${topic.description}</p>
                    <span style="color: #e74c3c; font-size: 0.8rem;">${topic.category}</span>
                </div>
            </div>
        `).join('');
    } else {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: #666;">
                No results found for "${searchTerm}"
            </div>
        `;
    }
}

// Show topic details
function showTopicDetails(title, screen) {
    const topics = getAllTopics();
    const topic = topics.find(t => t.title === title);
    
    if (topic) {
        showScreen(screen);
        showDetailsModal(title, topic.description);
    }
}

// Close search results when clicking outside
document.addEventListener('click', (event) => {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchContainer.contains(event.target) && searchResults) {
        searchResults.style.display = 'none';
    }
});

// Navigation Management
function updateNavigation(screenId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(screenId)) item.classList.add('active');
    });
}

// Profile Management
function updateProfileDisplay() {
    document.getElementById('profileName').textContent = `Name: ${userData.name}`;
    document.getElementById('profileAge').textContent = `Age: ${userData.age || 'Not set'}`;
    document.getElementById('profileEmergency').textContent = `Emergency Contact: ${userData.emergencyContact || 'Not set'}`;
}

function showEditProfile() {
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-edit').style.display = 'block';
    document.getElementById('editName').value = userData.name;
    document.getElementById('editAge').value = userData.age;
    document.getElementById('editEmergency').value = userData.emergencyContact;
}

function cancelEdit() {
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('profile-edit').style.display = 'none';
}

function saveProfile() {
    userData.name = document.getElementById('editName').value;
    userData.age = document.getElementById('editAge').value;
    userData.emergencyContact = document.getElementById('editEmergency').value;
    localStorage.setItem('userData', JSON.stringify(userData));
    updateProfileDisplay();
    cancelEdit();
    showAlert('Profile updated successfully!');
}

// Favorites Management
function toggleFavorites() {
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = userData.favorites.length ? userData.favorites.map(item => `
        <div class="condition-card">
            <h3>${item}</h3>
            <button class="button" onclick="removeFavorite('${item}')">Remove</button>
        </div>
    `).join('') : '<p>No favorites added yet.</p>';
    favoritesModal.classList.toggle('active');
}

function toggleFavorite(item, event) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    const index = userData.favorites.indexOf(item);
    if (index > -1) {
        userData.favorites.splice(index, 1);
        showAlert(`${item} removed from favorites.`);
    } else {
        userData.favorites.push(item);
        showAlert(`${item} added to favorites.`);
    }
    localStorage.setItem('userData', JSON.stringify(userData));
}

function removeFavorite(item) {
    userData.favorites = userData.favorites.filter(fav => fav !== item);
    localStorage.setItem('userData', JSON.stringify(userData));
    toggleFavorites();
}

function hideFavoritesModal() {
    document.getElementById("favoritesModal").style.display = "none";
}

// Enhanced Emergency Modal
function showEmergencyModal() {
    const currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
    const t = translations[currentLanguage];
    
    const modal = document.getElementById('emergencyModal');
    modal.querySelector('.modal-content').innerHTML = `
        <h2>${t.emergencyContacts.title}</h2>
        <div class="emergency-contacts" style="margin: 20px 0;">
            <div class="emergency-contact-item" style="margin: 10px 0;">
                <a href="tel:911" class="emergency-link" style="
                    display: block;
                    padding: 15px;
                    background: #e74c3c;
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    text-align: center;
                    margin: 5px 0;
                ">${t.emergencyContacts.ambulance}</a>
            </div>
            <div class="emergency-contact-item" style="margin: 10px 0;">
                <a href="tel:911" class="emergency-link" style="
                    display: block;
                    padding: 15px;
                    background: #3498db;
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    text-align: center;
                    margin: 5px 0;
                ">${t.emergencyContacts.police}</a>
            </div>
            <div class="emergency-contact-item" style="margin: 10px 0;">
                <a href="tel:911" class="emergency-link" style="
                    display: block;
                    padding: 15px;
                    background: #e67e22;
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    text-align: center;
                    margin: 5px 0;
                ">${t.emergencyContacts.fire}</a>
            </div>
            <div class="emergency-contact-item" style="margin: 10px 0;">
                <a href="tel:18002221222" class="emergency-link" style="
                    display: block;
                    padding: 15px;
                    background: #2ecc71;
                    color: white;
                    text-decoration: none;
                    border-radius: 10px;
                    text-align: center;
                    margin: 5px 0;
                ">${t.emergencyContacts.poison}</a>
            </div>
        </div>
        <button class="button" onclick="hideEmergencyModal()" style="width: 100%;">Cancel</button>
    `;
    modal.classList.add('active');
    
    // Notify emergency contact if set
    if (userData.emergencyContact) {
        showAlert(`Notifying emergency contact: ${userData.emergencyContact}`);
    }
}

function hideEmergencyModal() {
    document.getElementById('emergencyModal').classList.remove('active');
}

// Alert System
function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Condition & Situation Details
function showConditionDetails(condition) {
    const content = {
        'Asthma': 'Triggers: Dust, pollen, exercise, stress. Response: Help sit upright, use inhaler, call emergency.',
        'Diabetes': 'Signs of Low Blood Sugar: Shakiness, confusion, weakness. Response: Provide sugar, check levels, call emergency.',
        'Allergies': 'Common Allergens: Nuts, shellfish, bee stings. Response: Use EpiPen, call emergency.'
    };
    showModal(condition, content[condition]);
}

function showSituationDetails(situation) {
    const content = {
        'Cuts & Bleeding': 'Apply direct pressure with a clean cloth. Elevate injured area. Clean wound when bleeding stops. Apply sterile dressing. Seek medical attention if severe.',
        'Burns': 'Cool burn under running water. Remove jewelry. Cover with sterile bandage. Don’t break blisters. Seek medical attention if severe.',
        'CPR': 'Check scene safety. Check responsiveness. Call emergency services. Check breathing. Begin chest compressions. Give rescue breaths if trained. Continue until help arrives.'
    };
    showModal(situation, content[situation]);
}

// Modal System
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${content}</p>
            <button class="button" onclick="this.closest('.modal').remove()">Close</button>
        </div>`;
    document.body.appendChild(modal);
}

// Language translations
const translations = {
    en: {
        dashboard: 'Dashboard',
        profile: 'Profile',
        emergency: 'Emergency',
        medicalConditions: 'Medical Conditions',
        firstAidSituations: 'First-Aid Situations',
        favorites: 'Favorites',
        searchPlaceholder: 'Search for First Aid Topics',
        emergencyContacts: {
            title: 'Emergency Services',
            police: 'Police: 911',
            ambulance: 'Ambulance: 911',
            fire: 'Fire Department: 911',
            poison: 'Poison Control: 1-800-222-1222'
        },
        savedGuides: 'Your saved guides',
        commonConditions: 'Learn about common conditions',
        emergencyGuides: 'Emergency response guides'
    },
    es: {
        dashboard: 'Tablero',
        profile: 'Perfil',
        emergency: 'Emergencia',
        medicalConditions: 'Condiciones Médicas',
        firstAidSituations: 'Situaciones de Primeros Auxilios',
        favorites: 'Favoritos',
        searchPlaceholder: 'Buscar temas de primeros auxilios',
        emergencyContacts: {
            title: 'Servicios de Emergencia',
            police: 'Policía: 911',
            ambulance: 'Ambulancia: 911',
            fire: 'Bomberos: 911',
            poison: 'Control de Envenenamiento: 1-800-222-1222'
        },
        savedGuides: 'Tus guías guardadas',
        commonConditions: 'Aprende sobre condiciones comunes',
        emergencyGuides: 'Guías de respuesta a emergencias'
    },
    fr: {
        dashboard: 'Tableau de Bord',
        profile: 'Profil',
        emergency: 'Urgence',
        medicalConditions: 'Conditions Médicales',
        firstAidSituations: 'Situations de Premiers Secours',
        favorites: 'Favoris',
        searchPlaceholder: 'Rechercher des sujets de premiers secours',
        emergencyContacts: {
            title: 'Services d\'Urgence',
            police: 'Police: 112',
            ambulance: 'Ambulance: 112',
            fire: 'Pompiers: 112',
            poison: 'Centre Antipoison: 112'
        },
        savedGuides: 'Vos guides sauvegardés',
        commonConditions: 'En savoir plus sur les conditions courantes',
        emergencyGuides: 'Guides de réponse d\'urgence'
    },
    de: {
        dashboard: 'Dashboard',
        profile: 'Profil',
        emergency: 'Notfall',
        medicalConditions: 'Medizinische Bedingungen',
        firstAidSituations: 'Erste-Hilfe-Situationen',
        favorites: 'Favoriten',
        searchPlaceholder: 'Nach Erste-Hilfe-Themen suchen',
        emergencyContacts: {
            title: 'Notdienste',
            police: 'Polizei: 110',
            ambulance: 'Rettungsdienst: 112',
            fire: 'Feuerwehr: 112',
            poison: 'Giftnotruf: 112'
        },
        savedGuides: 'Deine gespeicherten Anleitungen',
        commonConditions: 'Erfahre mehr über häufige Erkrankungen',
        emergencyGuides: 'Notfall-Leitfäden'
    }
};

// Update language settings
function changeLanguage() {
    const selectedLanguage = document.getElementById("languageSelector").value;
    localStorage.setItem('selectedLanguage', selectedLanguage);
    applyLanguageChanges(selectedLanguage);
}

function applyLanguageChanges(language) {
    const t = translations[language];
    
    // Update all text content
    document.querySelector('.subtitle').textContent = t.commonConditions;
    document.querySelector('.search-bar').placeholder = t.searchPlaceholder;
    
    // Update dashboard items
    const dashboardItems = document.querySelectorAll('.dashboard-item h3');
    dashboardItems[0].textContent = t.medicalConditions;
    dashboardItems[1].textContent = t.firstAidSituations;
    dashboardItems[2].textContent = t.favorites;
    dashboardItems[3].textContent = t.profile;
    
    // Update descriptions
    const descriptions = document.querySelectorAll('.dashboard-item p');
    descriptions[0].textContent = t.commonConditions;
    descriptions[1].textContent = t.emergencyGuides;
    descriptions[2].textContent = t.savedGuides;
    
    // Update emergency button
    document.querySelector('.emergency-btn').textContent = t.emergency;
}