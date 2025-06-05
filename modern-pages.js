// Configuration moderne avec des constantes
const CONFIG = {
    pixelsPerInch: 96,
    pageHeightInCm: 29.7,
    pageMarginBottomInCm: 2,
    debounceDelay: 300
};

const EDIT_CREDENTIALS = { username: 'admin', password: 'secret' };
let editMode = false;

// Utilitaires modernes
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    cmToPixels(cm) {
        return Math.ceil(cm * CONFIG.pixelsPerInch / 2.54);
    },

    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }
};

// Gestionnaire de pages moderne
class PageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyPageBreaks();
    }

    setupEventListeners() {
        // Gestionnaire d'événements avec délégation
        document.addEventListener('input', utils.debounce(() => {
            this.applyPageBreaks();
        }, CONFIG.debounceDelay));

        document.addEventListener('blur', (e) => {
            if (e.target.classList.contains('page')) {
                this.applyPageBreaks();
            }
        }, true);

        // Gestion du redimensionnement
        window.addEventListener('resize', utils.debounce(() => {
            this.applyPageBreaks();
        }, CONFIG.debounceDelay));
    }

    applyPageBreaks() {
        this.applyManualPageBreaks();
        this.applyAutomaticPageBreaks();
    }

    applyManualPageBreaks() {
        const documents = document.querySelectorAll('.document');
        
        documents.forEach(doc => {
            const pages = Array.from(doc.querySelectorAll('.page'));
            
            pages.forEach(page => {
                const pageBreaks = Array.from(page.querySelectorAll('.page-break'));
                
                pageBreaks.forEach(pageBreak => {
                    // Créer une nouvelle page
                    const newPage = utils.createElement('div', 'page');
                    newPage.contentEditable = 'true';
                    
                    // Insérer la nouvelle page après la page actuelle
                    page.insertAdjacentElement('afterend', newPage);
                    
                    // Déplacer tout le contenu après le saut de page
                    let nextSibling = pageBreak.nextSibling;
                    while (nextSibling) {
                        const current = nextSibling;
                        nextSibling = nextSibling.nextSibling;
                        newPage.appendChild(current);
                    }
                    
                    // Supprimer l'élément de saut de page
                    pageBreak.remove();
                });
            });
        });
    }

    applyAutomaticPageBreaks() {
        const pageHeightInPixels = utils.cmToPixels(CONFIG.pageHeightInCm);
        const pageMarginBottomInPixels = utils.cmToPixels(CONFIG.pageMarginBottomInCm);
        
        const documents = document.querySelectorAll('.document');
        
        documents.forEach(doc => {
            const pages = Array.from(doc.querySelectorAll('.page'));
            
            pages.forEach(page => {
                if (page.scrollHeight > pageHeightInPixels) {
                    const newPage = utils.createElement('div', 'page');
                    newPage.contentEditable = 'true';
                    page.insertAdjacentElement('afterend', newPage);
                    
                    const pageRect = page.getBoundingClientRect();
                    const elements = page.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre');
                    
                    Array.from(elements).reverse().forEach(element => {
                        const elementRect = element.getBoundingClientRect();
                        
                        if ((elementRect.bottom - pageRect.top + pageMarginBottomInPixels) > pageHeightInPixels) {
                            newPage.insertBefore(element, newPage.firstChild);
                        }
                    });
                }
            });
        });
    }
}

// Fonctions utilitaires globales
function addPage() {
    const docElement = document.getElementById('document');
    const newPage = utils.createElement('div', 'page');
    newPage.contentEditable = editMode ? 'true' : 'false';
    newPage.innerHTML = '<h1>New Page</h1><p>Start typing here...</p>';
    docElement.appendChild(newPage);
    newPage.focus();
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark-mode");
}

function toggleEditMode() {
    if (!editMode) {
        const user = prompt('Username:');
        const pass = prompt('Password:');
        if (user !== EDIT_CREDENTIALS.username || pass !== EDIT_CREDENTIALS.password) {
            alert('Invalid credentials');
            return;
        }
    }
    editMode = !editMode;
    document.querySelectorAll('.page').forEach(pg => {
        pg.contentEditable = editMode;
    });
    const btn = document.getElementById('edit-toggle');
    if (btn) btn.textContent = editMode ? '✅' : '✏️';
}

async function pasteHtml() {
    if (!editMode) {
        alert('Enable edit mode first.');
        return;
    }
    try {
        const html = await navigator.clipboard.readText();
        if (html) {
            document.execCommand('insertHTML', false, html);
        }
    } catch (err) {
        const html = prompt('Paste your HTML here:');
        if (html) {
            document.execCommand('insertHTML', false, html);
        }
    }
}
function saveDocument() {
    const docElement = document.getElementById("document");
    localStorage.setItem("modern-doc-content", docElement.innerHTML);
    const darkMode = document.documentElement.classList.contains("dark-mode");
    localStorage.setItem("modern-dark-mode", darkMode ? "1" : "0");
}

function loadDocument() {
    const savedContent = localStorage.getItem("modern-doc-content");
    if (savedContent) {
        document.getElementById("document").innerHTML = savedContent;
    }
    const darkMode = localStorage.getItem("modern-dark-mode");
    if (darkMode === "1") {
        document.documentElement.classList.add("dark-mode");
    }
}

// Initialisation moderne avec DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadDocument();
    new PageManager();
    document.querySelectorAll('.page').forEach(pg => {
        pg.contentEditable = editMode;
    });
});

// Support des raccourcis clavier
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'p':
                e.preventDefault();
                window.print();
                break;
            case 'n':
                e.preventDefault();
                addPage();
                break;
            case 's':
                e.preventDefault();
                saveDocument();
                break;
        }
    }
});


