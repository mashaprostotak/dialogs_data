document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const strategyContainer = document.getElementById('strategy-container');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    const resetBtn = document.getElementById('reset-btn');
    const strategyList = document.getElementById('strategy-list');
    const dialogueContent = document.getElementById('dialogue-content');
    const dialogueMetadata = document.getElementById('dialogue-metadata');
    const dialogueImage = document.getElementById('dialogue-image');
    const storyTitle = document.getElementById('story-title');
    const imageContainer = document.querySelector('.image-container');
    const storyTitleContainer = document.querySelector('.story-title-container');
    const leftPanel = document.querySelector('.left-panel');
    const dialogNumber = document.getElementById('dialog-number');
    const totalDialogs = document.getElementById('total-dialogs');
    const prevDialogBtn = document.getElementById('prev-dialog');
    const nextDialogBtn = document.getElementById('next-dialog');
    const taskSelector = document.getElementById('task-selector');
    
    // Function to adjust dialogue content height
    function adjustDialogueHeight() {
        const leftPanelHeight = leftPanel.offsetHeight;
        const searchButtonsHeight = document.querySelector('.search-buttons').offsetHeight;
        const leftPanelPadding = 40; // Accounting for padding
        
        // Set the dialogue content height to match the left panel's height minus the search buttons area
        const dialogueDisplayHeight = document.getElementById('dialogue-display').offsetHeight;
        const strategiesHeight = document.getElementById('strategies-used').offsetHeight;
        const dialogCounterHeight = document.querySelector('.dialog-counter').offsetHeight;
        
        // Calculate available height for dialogue content
        const availableHeight = leftPanelHeight - searchButtonsHeight - leftPanelPadding;
        const otherElementsHeight = strategiesHeight + dialogCounterHeight + 30; // Adding some margin
        
        // Set the height
        dialogueContent.style.height = `${availableHeight - otherElementsHeight}px`;
    }
    
    // Adjust height initially and on window resize
    window.addEventListener('load', adjustDialogueHeight);
    window.addEventListener('resize', adjustDialogueHeight);
    
    // State variables
    let dialogueData = [];
    let uniqueStrategies = new Set();
    let selectedTraits = {};
    let selectedStrategies = new Set();
    let currentDialogIndex = 0;
    let currentTask = 'image'; // Default task
    
    // Load the data
    loadData();
    
    // Event listeners
    searchBtn.addEventListener('click', searchDialogues);
    randomBtn.addEventListener('click', showRandomDialogue);
    resetBtn.addEventListener('click', resetFilters);
    
    // Add event listeners for navigation buttons
    prevDialogBtn.addEventListener('click', showPreviousDialogue);
    nextDialogBtn.addEventListener('click', showNextDialogue);
    
    // Add event listener for task selector
    taskSelector.addEventListener('change', function() {
        // Clear current display
        dialogueContent.innerHTML = '<div class="dialogue-placeholder"><p>Loading dialogue content...</p></div>';
        strategyList.innerHTML = '';
        imageContainer.style.display = 'none';
        storyTitleContainer.style.display = 'none';
        
        // Update task and reset data
        currentTask = this.value;
        dialogueData = [];
        
        // Reset filters and load appropriate data
        selectedTraits = {};
        document.querySelectorAll('.trait-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        selectedStrategies.clear();
        document.querySelectorAll('.strategy-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Load new data with the current task
        loadData();
    });
    
    // Add event listener for dialog number input
    dialogNumber.addEventListener('change', function() {
        const newIndex = parseInt(this.value) - 1;
        if (!isNaN(newIndex) && newIndex >= 0 && newIndex < dialogueData.length) {
            showDialogue(dialogueData[newIndex], newIndex);
        } else {
            // Reset to current value if invalid
            this.value = currentDialogIndex + 1;
        }
    });
    
    // Add event listeners to trait buttons
    document.querySelectorAll('.trait-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const trait = this.dataset.trait;
            const value = this.dataset.value;
            
            // Toggle selection
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                if (selectedTraits[trait] === value) {
                    delete selectedTraits[trait];
                }
            } else {
                // Deselect other buttons in the same trait group
                document.querySelectorAll(`.trait-btn[data-trait="${trait}"]`).forEach(b => {
                    b.classList.remove('selected');
                });
                
                this.classList.add('selected');
                selectedTraits[trait] = value;
            }
        });
    });
    
    // Helper function to capitalize strategy text
    function capitalizeStrategy(strategy) {
        return strategy.split(/\s+/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
    // Functions
    async function loadData() {
        try {
            // Choose the data source based on the current task
            const dataSource = currentTask === 'image' ? './images_L3.json' : './Stories_L3.json';
            console.log(`Loading data from ${dataSource} for task: ${currentTask}`);
            
            const response = await fetch(dataSource);
            dialogueData = await response.json();
            
            // Update total dialogs count
            totalDialogs.textContent = dialogueData.length;
            
            // Initialize navigation buttons to disabled state
            prevDialogBtn.disabled = true;
            nextDialogBtn.disabled = (dialogueData.length <= 1);
            
            // Extract all strategy strings
            const allStrategies = new Set();
            dialogueData.forEach(item => {
                if (item.record && Array.isArray(item.record)) {
                    item.record.forEach(record => {
                        if (record.strategy) {
                            // Split multi-strategy strings into individual strategies
                            const strategies = record.strategy.split(/,\s*|\s*;\s*|\s+and\s+/);
                            strategies.forEach(s => {
                                if (s.trim()) {
                                    // Capitalize strategy before adding to the set
                                    allStrategies.add(capitalizeStrategy(s.trim()));
                                }
                            });
                        }
                    });
                }
            });
            
            // Populate strategy checkboxes
            populateStrategyFilters(Array.from(allStrategies).sort());
            
            console.log(`Loaded ${dialogueData.length} dialogues with ${allStrategies.size} unique strategies.`);
            
            // Show a random dialogue on initial load
            if (dialogueData.length > 0) {
                const randomIndex = Math.floor(Math.random() * dialogueData.length);
                showDialogue(dialogueData[randomIndex], randomIndex);
            } else {
                console.error('No data loaded');
                dialogueContent.innerHTML = `<div class="error">No data found. Please try refreshing the page.</div>`;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            dialogueContent.innerHTML = `<div class="error">Failed to load data. Please try refreshing the page.</div>`;
        }
    }
    
    function populateStrategyFilters(strategies) {
        strategyContainer.innerHTML = '';
        
        strategies.forEach(strategy => {
            const strategyDiv = document.createElement('div');
            strategyDiv.className = 'strategy-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `strategy-${strategy.replace(/\s+/g, '-').toLowerCase()}`;
            checkbox.value = strategy;
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    selectedStrategies.add(strategy);
                } else {
                    selectedStrategies.delete(strategy);
                }
            });
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = strategy;
            
            strategyDiv.appendChild(checkbox);
            strategyDiv.appendChild(label);
            strategyContainer.appendChild(strategyDiv);
        });
    }
    
    function searchDialogues() {
        const filtered = dialogueData.filter(item => {
            // Filter by personality traits
            let matchesTraits = true;
            for (const [trait, value] of Object.entries(selectedTraits)) {
                const traitValue = item.personality[trait];
                const boolValue = value.toLowerCase() === 'high';
                
                if (traitValue !== boolValue) {
                    matchesTraits = false;
                    break;
                }
            }
            
            // Filter by selected strategies (using AND logic)
            let matchesStrategies = true;
            if (selectedStrategies.size > 0) {
                if (item.record && Array.isArray(item.record)) {
                    // Extract all strategies from the record
                    const itemStrategiesSet = new Set();
                    item.record.forEach(record => {
                        if (record.strategy) {
                            // Split multi-strategy strings into individual strategies
                            const strategies = record.strategy.split(/,\s*|\s*;\s*|\s+and\s+/);
                            strategies.forEach(s => {
                                if (s.trim()) {
                                    // Capitalize strategy before adding to the set
                                    itemStrategiesSet.add(capitalizeStrategy(s.trim()));
                                }
                            });
                        }
                    });
                    
                    // Check if ALL selected strategies are in this item's strategies
                    matchesStrategies = Array.from(selectedStrategies).every(strategy => 
                        itemStrategiesSet.has(strategy)
                    );
                } else {
                    matchesStrategies = false;
                }
            }
            
            return matchesTraits && matchesStrategies;
        });
        
        if (filtered.length === 0) {
            dialogueContent.innerHTML = `<div class="dialogue-placeholder"><p>No matching dialogues</p></div>`;
            strategyList.innerHTML = '';
            // Update dialog counter for no results
            totalDialogs.textContent = '0';
            dialogNumber.value = '0';
            currentDialogIndex = -1;
            
            // Disable navigation buttons
            prevDialogBtn.disabled = true;
            nextDialogBtn.disabled = true;
        } else {
            console.log(`Found ${filtered.length} matching dialogues.`);
            // Update total dialogs with filtered count
            totalDialogs.textContent = filtered.length;
            // Show the first matching dialogue
            const index = dialogueData.indexOf(filtered[0]);
            showDialogue(filtered[0], index);
        }
    }
    
    function showRandomDialogue() {
        if (dialogueData.length > 0) {
            const randomIndex = Math.floor(Math.random() * dialogueData.length);
            showDialogue(dialogueData[randomIndex], randomIndex);
        }
    }
    
    function showDialogue(dialogue, index) {
        console.log('Showing dialogue for task:', currentTask);
        
        // Update current dialog index and input field
        if (index !== undefined) {
            currentDialogIndex = index;
            dialogNumber.value = index + 1;
            
            // Update navigation button states
            prevDialogBtn.disabled = (currentDialogIndex <= 0);
            nextDialogBtn.disabled = (currentDialogIndex >= dialogueData.length - 1);
        }
        
        // Auto-select personality trait buttons based on current dialogue
        if (dialogue.personality) {
            // Remove all previous selections
            selectedTraits = {}; // Reset selected traits
            document.querySelectorAll('.trait-btn').forEach(btn => {
                btn.classList.remove('selected', 'auto-selected');
            });
            
            // Add selected class based on personality traits
            for (const [trait, value] of Object.entries(dialogue.personality)) {
                const traitValue = value ? 'high' : 'low';
                const traitBtn = document.querySelector(`.trait-btn[data-trait="${trait}"][data-value="${traitValue}"]`);
                if (traitBtn) {
                    traitBtn.classList.add('selected');
                    selectedTraits[trait] = traitValue; // Update selectedTraits object
                }
            }
        }
        
        // Show either image or story title based on the current task
        if (currentTask === 'image') {
            // Show image and hide story title
            storyTitleContainer.style.display = 'none';
            
            if (dialogueImage) {
                if (dialogue.image_url) {
                    dialogueImage.src = dialogue.image_url.trim();
                    imageContainer.style.display = 'block';
                } else {
                    dialogueImage.src = '';
                    imageContainer.style.display = 'none';
                }
            }
        } else {
            // Show story title and hide image
            imageContainer.style.display = 'none';
            
            if (dialogue.story_title) {
                storyTitle.textContent = dialogue.story_title;
                storyTitleContainer.style.display = 'block';
                console.log('Displaying story title:', dialogue.story_title);
            } else {
                storyTitle.textContent = '';
                storyTitleContainer.style.display = 'none';
                console.log('No story title available');
            }
        }
        
        // Update strategies list
        strategyList.innerHTML = '';
        if (dialogue.record && Array.isArray(dialogue.record)) {
            // Extract all strategies and split multi-strategy strings
            const strategiesSet = new Set();
            dialogue.record.forEach(record => {
                if (record.strategy) {
                    // Split multi-strategy strings into individual strategies
                    const strategies = record.strategy.split(/,\s*|\s*;\s*|\s+and\s+/);
                    strategies.forEach(s => {
                        if (s.trim()) {
                            // Capitalize strategy before adding to the set
                            strategiesSet.add(capitalizeStrategy(s.trim()));
                        }
                    });
                }
            });
            
            // Create a list item for each unique strategy
            Array.from(strategiesSet).sort().forEach(strategy => {
                const li = document.createElement('li');
                li.textContent = strategy;
                strategyList.appendChild(li);
            });
        }
        
        // Update dialogue content
        dialogueContent.innerHTML = '';
        if (dialogue.dialogue && Array.isArray(dialogue.dialogue)) {
            dialogue.dialogue.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `dialogue-message ${msg[1].toLowerCase()}`;
                
                const roleDiv = document.createElement('div');
                roleDiv.className = 'dialogue-role';
                roleDiv.textContent = msg[1];
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'dialogue-text';
                contentDiv.textContent = msg[0];
                
                messageDiv.appendChild(roleDiv);
                messageDiv.appendChild(contentDiv);
                dialogueContent.appendChild(messageDiv);
            });
        }
        
        // Call adjustDialogueHeight after content is rendered
        setTimeout(adjustDialogueHeight, 100);
    }
    
    function getPersonalityDescription(personality) {
        if (!personality) return 'Personality information not available';
        
        const traits = [];
        for (const [trait, value] of Object.entries(personality)) {
            traits.push(`${value ? 'High' : 'Low'} ${trait}`);
        }
        
        return traits.join(', ');
    }
    
    function resetFilters() {
        // Clear all selected traits
        selectedTraits = {};
        document.querySelectorAll('.trait-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Clear all selected strategies
        selectedStrategies.clear();
        document.querySelectorAll('.strategy-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Show a random dialogue
        if (dialogueData.length > 0) {
            showRandomDialogue();
        } else {
            // If data is not yet loaded, it will be loaded by the loadData function
            console.log("No data available yet. Will load data first.");
        }
    }
    
    // Function to show previous dialogue
    function showPreviousDialogue() {
        if (currentDialogIndex > 0) {
            showDialogue(dialogueData[currentDialogIndex - 1], currentDialogIndex - 1);
        }
    }
    
    // Function to show next dialogue
    function showNextDialogue() {
        if (currentDialogIndex < dialogueData.length - 1) {
            showDialogue(dialogueData[currentDialogIndex + 1], currentDialogIndex + 1);
        }
    }
}); 