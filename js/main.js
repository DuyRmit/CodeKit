document.addEventListener('DOMContentLoaded', () => {
 
    const sidebarLinks = document.querySelectorAll('#sidebar .tool-link');
    const controlPanel = document.getElementById('control-panel');
    const previewPanel = document.getElementById('preview-panel');
 
    // --- TOOL DEFINITIONS ---
    const tools = {
        layoutGen: {
            getControlPanelHTML: () => `<h2>Layout Generator</h2><p>Controls for the Layout Generator will go here.</p>`,
            getPreviewPanelHTML: () => `<h3>Live Preview</h3><p>The resulting layout preview will be here.</p>`,
            init: () => {
                console.log('Layout Generator initialized!');
            }
        },
        // --- Color Replacer Tool (Coldate) ---
        colorReplacer: {
            getControlPanelHTML: () => `
                <div id="coldate-tool-container">
                    <h1>Coldate</h1>
                    <p>Paste your HTML/CSS code below and replace color codes easily</p>
                    
                    <div class="coldate-bento-grid">
                        <div class="coldate-bento-card coldate-input-section">
                            <h2>Input Code</h2>
                            <textarea id="coldate-inputCode" placeholder="Paste your HTML/CSS code here..."></textarea>
                            
                            <h3>Color Replacements</h3>
                            <div id="coldate-colorPairsContainer">
                                <!-- Color pairs will be added here -->
                            </div>
                            
                            <button id="coldate-addColorBtn" class="coldate-add-btn">Add Color Replacement</button>
                            <button id="coldate-processBtn">Update Colors</button>
                        </div>
                        
                        <div class="coldate-bento-card">
                            <h3>Detected Colors</h3>
                            <div id="coldate-colorList" class="coldate-color-list">
                                <!-- Detected colors will appear here -->
                            </div>
                            <div class="coldate-stats">
                                <span id="coldate-colorCount">0 colors detected</span>
                                <button id="coldate-scanColorsBtn">Scan Colors</button>
                            </div>
                        </div>
                        
                        <div class="coldate-bento-card coldate-output-section">
                            <h2>Output Code</h2>
                            <textarea id="coldate-outputCode" readonly placeholder="Your updated code will appear here..."></textarea>
                            <button id="coldate-copyBtn" class="coldate-copy-btn">Copy to Clipboard</button>
                            <div class="coldate-stats">
                                <span id="coldate-replaceCount">0 replacements made</span>
                                <span id="coldate-timeInfo">Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            getPreviewPanelHTML: () => `
                <h3>Color Replacer Tool Output</h3>
                <p>The "Color Replacer" (Coldate) tool operates within its own display area. All input, detected colors, and output are shown directly there.</p>
            `,
            init: () => {
                console.log('Color Replacer (Coldate) initialized!');
                // DOM elements - prefixed with 'coldate-' to avoid conflicts
                const inputCode = document.getElementById('coldate-inputCode');
                const outputCode = document.getElementById('coldate-outputCode');
                const colorPairsContainer = document.getElementById('coldate-colorPairsContainer');
                const colorList = document.getElementById('coldate-colorList');
                const addColorBtn = document.getElementById('coldate-addColorBtn');
                const processBtn = document.getElementById('coldate-processBtn');
                const scanColorsBtn = document.getElementById('coldate-scanColorsBtn');
                const copyBtn = document.getElementById('coldate-copyBtn');
                const colorCount = document.getElementById('coldate-colorCount');
                const replaceCount = document.getElementById('coldate-replaceCount');
                const timeInfo = document.getElementById('coldate-timeInfo');
                
                // Add new color replacement pair
                addColorBtn.addEventListener('click', function() {
                    addColorPair('', '');
                });
                
                // Process the code
                processBtn.addEventListener('click', function() {
                    const code = inputCode.value;
                    if (!code.trim()) {
                        alert('Please enter some code first');
                        return;
                    }
                    
                    const startTime = performance.now();
                    const replacements = getReplacements();
                    let updatedCode = code;
                    let replacementCount = 0;
                    
                    replacements.forEach(pair => {
                        // Create a regex that only matches full color codes to avoid replacing parts of other text
                        // This regex is a bit more robust but still simple enough for common cases
                        // It ensures the color is followed by a non-alphanumeric character or end of string
                        const regex = new RegExp(`\\b${escapeRegExp(pair.oldColor)}(?![-a-zA-Z0-9])`, 'gi');
                        
                        // Count matches before replacing for accurate count
                        const currentMatches = (updatedCode.match(regex) || []).length;
                        updatedCode = updatedCode.replace(regex, pair.newColor);
                        replacementCount += currentMatches;
                    });
                    
                    outputCode.value = updatedCode;
                    const endTime = performance.now();
                    const duration = ((endTime - startTime) / 1000).toFixed(2);
                    
                    replaceCount.textContent = `${replacementCount} replacements made`;
                    timeInfo.textContent = `Processed in ${duration}s`;
                });
                
                // Scan for colors in the code
                scanColorsBtn.addEventListener('click', function() {
                    const code = inputCode.value;
                    if (!code.trim()) {
                        alert('Please enter some code first');
                        return;
                    }
                    
                    const colors = detectColors(code);
                    displayDetectedColors(colors);
                });
                
                // Copy to clipboard
                copyBtn.addEventListener('click', function() {
                    outputCode.select();
                    document.execCommand('copy');
                    
                    // Visual feedback
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    copyBtn.style.backgroundColor = '#4CAF50';
                    
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.backgroundColor = '#4cc9f0'; // Revert to original, assuming this is --success
                    }, 2000);
                });
                
                // Helper functions
                function addColorPair(oldColor = '', newColor = '') {
                    const pairId = Date.now();
                    const pairElement = document.createElement('div');
                    pairElement.className = 'coldate-color-pair'; // Renamed class
                    pairElement.innerHTML = `
                        <input type="text" class="coldate-color-input old-color" value="${oldColor}" placeholder="#RRGGBB or rgb()" data-preview="old-${pairId}">
                        <div class="coldate-color-preview" id="old-${pairId}" style="background-color: ${oldColor || 'transparent'}"></div>
                        <span>→</span>
                        <input type="text" class="coldate-color-input new-color" value="${newColor}" placeholder="New color" data-preview="new-${pairId}">
                        <div class="coldate-color-preview" id="new-${pairId}" style="background-color: ${newColor || 'transparent'}"></div>
                        <button class="coldate-remove-btn" data-pair="${pairId}">×</button>
                    `;
                    
                    colorPairsContainer.appendChild(pairElement);
                    
                    // Add event listeners for color preview and removal
                    pairElement.querySelector(`.old-color`).addEventListener('input', updateColorPreview);
                    pairElement.querySelector(`.new-color`).addEventListener('input', updateColorPreview);
                    pairElement.querySelector(`.coldate-remove-btn`).addEventListener('click', function() { // Renamed class
                        colorPairsContainer.removeChild(pairElement);
                    });
                }
                
                function updateColorPreview(e) {
                    const previewId = e.target.dataset.preview;
                    const previewElement = document.getElementById(previewId);
                    if (previewElement) {
                        previewElement.style.backgroundColor = e.target.value || 'transparent';
                    }
                }
                
                function getReplacements() {
                    const pairs = [];
                    const pairElements = colorPairsContainer.querySelectorAll('.coldate-color-pair'); // Renamed class
                    
                    pairElements.forEach(pair => {
                        const oldColor = pair.querySelector('.old-color').value.trim();
                        const newColor = pair.querySelector('.new-color').value.trim();
                        
                        if (oldColor && newColor) {
                            pairs.push({ oldColor, newColor });
                        }
                    });
                    
                    return pairs;
                }
                
                function escapeRegExp(string) {
                    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                
                function detectColors(code) {
                    // Match hex, rgb, rgba, hsl, hsla
                    const colorRegex = /(#([0-9a-f]{3}){1,2}\b|rgb\((\s*\d+\s*,){2}\s*\d+\s*\)|rgba\((\s*\d+\s*,){3}\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\))/gi;
                    const matches = code.match(colorRegex) || [];
                    
                    // Count occurrences and get unique colors
                    const colorCounts = {};
                    matches.forEach(color => {
                        const normalizedColor = color.toLowerCase();
                        colorCounts[normalizedColor] = (colorCounts[normalizedColor] || 0) + 1;
                    });
                    
                    // Convert to array of objects
                    return Object.entries(colorCounts)
                        .map(([color, count]) => ({ color, count }))
                        .sort((a, b) => b.count - a.count);
                }
                
                function displayDetectedColors(colors) {
                    colorList.innerHTML = '';
                    colorCount.textContent = `${colors.length} colors detected`;
                    
                    if (colors.length === 0) {
                        colorList.innerHTML = '<p>No color codes found in the input.</p>';
                        return;
                    }
                    
                    colors.forEach(colorObj => {
                        const colorItem = document.createElement('div');
                        colorItem.className = 'coldate-color-item'; // Renamed class
                        colorItem.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="coldate-color-preview" style="background-color: ${colorObj.color}"></div>
                                <span>${colorObj.color}</span>
                            </div>
                            <span>${colorObj.count}x</span>
                        `;
                        
                        colorItem.addEventListener('click', function() {
                            addColorPair(colorObj.color, '');
                            // Scroll to the newly added pair
                            colorPairsContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
                            // Focus on the new color input
                            colorPairsContainer.lastElementChild.querySelector('.new-color').focus();
                        });
                        
                        colorList.appendChild(colorItem);
                    });
                }
                
                // Initialize with one empty color pair
                addColorPair();
            }
        },
        // --- Details Toggle Generator Tool (React + Tailwind) ---
        detailsGen: {
            getControlPanelHTML: () => `
                <div id="details-root-container">
                    <!-- The React app will render here -->
                    <div id="details-generator-app-root"></div>
                </div>
            `,
            getPreviewPanelHTML: () => `
                <!-- No separate preview panel as the React app is self-contained -->
                <h3>Details Toggle Live Output</h3>
                <p>The Details Toggle Generator is a self-contained React application. 
                All controls, preview, and code output are within the single panel on the left.</p>
                <p>Please ensure you have an active internet connection for React, Babel, and Tailwind CSS to load.</p>
            `,
            init: () => {
                console.log('Details Toggle Generator initialized!');
                
                // Clear any previous content from the root
                const appRoot = document.getElementById('details-generator-app-root');
                if (appRoot) {
                    ReactDOM.unmountComponentAtNode(appRoot); // Clean up previous React app if any
                    appRoot.innerHTML = ''; // Clear previous HTML as well
                }

                // Append React, Babel, and Tailwind CDN scripts
                const head = document.head;

                // React and ReactDOM
                const reactScript = document.createElement('script');
                reactScript.src = 'https://unpkg.com/react@18/umd/react.development.js';
                reactScript.setAttribute('data-tool-script', 'detailsGen'); // Mark for potential cleanup
                appRoot.appendChild(reactScript); // Append to appRoot so it loads in correct context

                const reactDOMScript = document.createElement('script');
                reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
                reactDOMScript.setAttribute('data-tool-script', 'detailsGen');
                appRoot.appendChild(reactDOMScript);

                // Babel
                const babelScript = document.createElement('script');
                babelScript.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
                babelScript.setAttribute('data-tool-script', 'detailsGen');
                appRoot.appendChild(babelScript);

                // Tailwind CSS CDN
                const tailwindScript = document.createElement('script');
                tailwindScript.src = 'https://cdn.tailwindcss.com';
                tailwindScript.setAttribute('data-tool-script', 'detailsGen');
                appRoot.appendChild(tailwindScript);

                // Tailwind Config
                const tailwindConfigScript = document.createElement('script');
                tailwindConfigScript.type = 'text/javascript'; // Use text/javascript for non-babel script
                tailwindConfigScript.setAttribute('data-tool-script', 'detailsGen');
                tailwindConfigScript.textContent = `
                    tailwind.config = {
                        theme: {
                            extend: {
                                colors: {
                                    'bento-bg': '#ffffff',
                                    'bento-card': '#ffffff',
                                    'bento-border': '#e5e7eb',
                                    'bento-shadow': 'rgba(0, 0, 0, 0.05)'
                                }
                            }
                        }
                    }
                `;
                appRoot.appendChild(tailwindConfigScript);


                // Main React App Script (will be transpiled by Babel)
                const reactAppScript = document.createElement('script');
                reactAppScript.type = 'text/babel';
                reactAppScript.id = 'details-generator-react-app-script'; // Give it an ID for potential debugging
                reactAppScript.setAttribute('data-tool-script', 'detailsGen');
                reactAppScript.textContent = `
                    const { useState, useEffect, useCallback } = React;

                    // Toast Component for notifications
                    const Toast = ({ message, type, show, onClose }) => {
                        useEffect(() => {
                            if (show) {
                                const timer = setTimeout(onClose, 3000);
                                return () => clearTimeout(timer);
                            }
                        }, [show, onClose]);

                        if (!show) return null;

                        return (
                            <div className={\`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 z-50 \${
                                type === 'success' 
                                    ? 'bg-green-50 text-green-800 border border-green-200' 
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }\`}>
                                <div className="flex items-center gap-2">
                                    {type === 'success' ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="font-medium">{message}</span>
                                </div>
                            </div>
                        );
                    };

                    // Input Form Component
                    const InputForm = ({ summary, description, onSummaryChange, onDescriptionChange, summaryError }) => {
                        return (
                            <div className="bg-bento-card rounded-2xl p-6 shadow-sm border border-bento-border">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.
