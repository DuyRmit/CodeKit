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
        colorReplacer: {
    getControlPanelHTML: () => `
        <div class="color-replacer-container">
            <h2>Coldate - Color Replacer</h2>
            <p>Paste your HTML/CSS code below and replace color codes easily</p>
            
            <div class="input-section">
                <h3>Input Code</h3>
                <textarea id="inputCode" placeholder="Paste your HTML/CSS code here..."></textarea>
                
                <h3>Color Replacements</h3>
                <div id="colorPairsContainer">
                    <!-- Color pairs will be added here -->
                </div>
                
                <button id="addColorBtn" class="add-btn">Add Color Replacement</button>
                <button id="processBtn">Update Colors</button>
            </div>
        </div>`,
    getPreviewPanelHTML: () => `
        <div class="preview-container">
            <div class="colors-section">
                <h3>Detected Colors</h3>
                <div id="colorList" class="color-list">
                    <!-- Detected colors will appear here -->
                </div>
                <div class="stats">
                    <span id="colorCount">0 colors detected</span>
                    <button id="scanColorsBtn">Scan Colors</button>
                </div>
            </div>
            
            <div class="output-section">
                <h3>Output Code</h3>
                <textarea id="outputCode" readonly placeholder="Your updated code will appear here..."></textarea>
                <button id="copyBtn" class="copy-btn">Copy to Clipboard</button>
                <div class="stats">
                    <span id="replaceCount">0 replacements made</span>
                    <span id="timeInfo">Ready</span>
                </div>
            </div>
        </div>`,
    init: () => {
        console.log('Coldate initialized!');
        const inputCode = document.getElementById('inputCode');
        const outputCode = document.getElementById('outputCode');
        const colorPairsContainer = document.getElementById('colorPairsContainer');
        const colorList = document.getElementById('colorList');
        const addColorBtn = document.getElementById('addColorBtn');
        const processBtn = document.getElementById('processBtn');
        const scanColorsBtn = document.getElementById('scanColorsBtn');
        const copyBtn = document.getElementById('copyBtn');
        const colorCount = document.getElementById('colorCount');
        const replaceCount = document.getElementById('replaceCount');
        const timeInfo = document.getElementById('timeInfo');

        // Add new color replacement pair
        function addColorPair(oldColor = '', newColor = '') {
            const pairId = Date.now();
            const pairElement = document.createElement('div');
            pairElement.className = 'color-pair';
            pairElement.innerHTML = `
                <input type="text" class="color-input old-color" value="${oldColor}" placeholder="#RRGGBB or rgb()" data-preview="old-${pairId}">
                <div class="color-preview" id="old-${pairId}" style="background-color: ${oldColor || 'transparent'}"></div>
                <span>→</span>
                <input type="text" class="color-input new-color" value="${newColor}" placeholder="New color" data-preview="new-${pairId}">
                <div class="color-preview" id="new-${pairId}" style="background-color: ${newColor || 'transparent'}"></div>
                <button class="remove-btn" data-pair="${pairId}">×</button>
            `;
            
            colorPairsContainer.appendChild(pairElement);
            
            // Add event listeners
            pairElement.querySelector('.old-color').addEventListener('input', updateColorPreview);
            pairElement.querySelector('.new-color').addEventListener('input', updateColorPreview);
            pairElement.querySelector('.remove-btn').addEventListener('click', () => {
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
            const pairElements = colorPairsContainer.querySelectorAll('.color-pair');
            
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
            const colorRegex = /(#[0-9a-f]{3,6}\b|rgb\((\s*\d+\s*,){2}\s*\d+\s*\)|rgba\((\s*\d+\s*,){3}\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\))/gi;
            const matches = code.match(colorRegex) || [];
            
            const colorCounts = {};
            matches.forEach(color => {
                const normalizedColor = color.toLowerCase();
                colorCounts[normalizedColor] = (colorCounts[normalizedColor] || 0) + 1;
            });
            
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
                colorItem.className = 'color-item';
                colorItem.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="color-preview" style="background-color: ${colorObj.color}"></div>
                        <span>${colorObj.color}</span>
                    </div>
                    <span>${colorObj.count}x</span>
                `;
                
                colorItem.addEventListener('click', function() {
                    addColorPair(colorObj.color, '');
                    colorPairsContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });
                    colorPairsContainer.lastElementChild.querySelector('.new-color').focus();
                });
                
                colorList.appendChild(colorItem);
            });
        }

        // Event Listeners
        addColorBtn.addEventListener('click', () => addColorPair('', ''));
        
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
                const regex = new RegExp(escapeRegExp(pair.oldColor), 'gi');
                updatedCode = updatedCode.replace(regex, pair.newColor);
                const matches = (code.match(regex) || []).length;
                replacementCount += matches;
            });
            
            outputCode.value = updatedCode;
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            replaceCount.textContent = `${replacementCount} replacements made`;
            timeInfo.textContent = `Processed in ${duration}s`;
        });
        
        scanColorsBtn.addEventListener('click', function() {
            const code = inputCode.value;
            if (!code.trim()) {
                alert('Please enter some code first');
                return;
            }
            
            const colors = detectColors(code);
            displayDetectedColors(colors);
        });
        
        copyBtn.addEventListener('click', function() {
            outputCode.select();
            document.execCommand('copy');
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '#4cc9f0';
            }, 2000);
        });

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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Input Fields
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                                            Summary Text
                                        </label>
                                        <input
                                            id="summary"
                                            type="text"
                                            value={summary}
                                            onChange={(e) => onSummaryChange(e.target.value)}
                                            className={\`w-full px-4 py-3 rounded-xl border transition-colors duration-200 \${
                                                summaryError 
                                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                                                    : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-200'
                                            } focus:outline-none focus:ring-2\`}
                                            placeholder="Enter summary (must end with 'Infographic Description')"
                                        />
                                        {summaryError && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {summaryError}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Description Text
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => onDescriptionChange(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors duration-200 resize-none"
                                            placeholder="Enter your description"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    };

                    // Preview Component
                    const PreviewSection = ({ summary, description }) => {
                        return (
                            <div className="bg-bento-card rounded-2xl p-6 shadow-sm border border-bento-border">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Live Preview
                                </h2>
                                
                                    <details className="w-full" style={{ margintop: '20px' }}>
                                        <summary className="cursor-pointer"  style={{ color: '#666666' }}>
                                            {summary || "Infographic Description"}
                                        </summary>
                                        <div className="content-box pad-box-mini" style={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#333333',
                                            padding: '0px 15px',
                                            height: '100%',
                                            margin:'5px 15px',
                                        }} title="embedded content">
                                            <p style={{ margin: 0, padding: '1em 0' }}>
                                                {description || "Enter your description"}
                                            </p>
                                        </div>
                                    </details>
                            </div>
                        );
                    };

                    // Code Output Component
                    const CodeOutput = ({ generatedCode, onCopy }) => {
                        return (
                            <div className="bg-bento-card rounded-2xl p-6 shadow-sm border border-bento-border">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        Generated Code
                                    </h2>
                                    <button
                                        onClick={onCopy}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy to Clipboard
                                    </button>
                                </div>
                                
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm leading-relaxed border">
                                    <code>{generatedCode}</code>
                                </pre>
                            </div>
                        );
                    };

                    // Main App Component
                    const App = () => {
                        const [summary, setSummary] = useState("Infographic Description");
                        const [description, setDescription] = useState("Enter your description");
                        const [summaryError, setSummaryError] = useState("");
                        const [toast, setToast] = useState({ show: false, message: "", type: "" });
                        const [generatedCode, setGeneratedCode] = useState("");

                        // Validate summary input
                        const validateSummary = useCallback((value) => {
                            if (!value.trim()) {
                                return "Summary cannot be empty";
                            }
                            if (!value.endsWith("Infographic Description")) {
                                return "Summary must end with 'Infographic Description'";
                            }
                            return "";
                        }, []);

                        // Generate HTML code
                        const generateCode = useCallback((summaryText, descriptionText) => {
                            return \`<details style="margin-top: 20px;">
    <summary style="color: #666666;">\${summaryText}</summary>
    <div class="content-box pad-box-mini" style="background-color: #f5f5f5; color: #333333; padding: 0px 15px; margin: 5px 15px; height: 100%;" title="embedded content">
        <p>\${descriptionText}</p>
    </div>
</details>\`;
                        }, []);

                        // Update generated code when inputs change
                        useEffect(() => {
                            const error = validateSummary(summary);
                            setSummaryError(error);
                            
                            if (!error && summary.trim() && description.trim()) {
                                const code = generateCode(summary.trim(), description.trim());
                                setGeneratedCode(code);
                            } else {
                                setGeneratedCode(''); // Clear code if there's an error or empty inputs
                            }
                        }, [summary, description, validateSummary, generateCode]);

                        // Handle summary change
                        const handleSummaryChange = (value) => {
                            setSummary(value);
                        };

                        // Handle description change  
                        const handleDescriptionChange = (value) => {
                            setDescription(value);
                        };

                        // Handle copy to clipboard
                        const handleCopy = async () => {
                            try {
                                if (!generatedCode) {
                                    setToast({ show: true, message: "No code to copy", type: "error" });
                                    return;
                                }

                                await navigator.clipboard.writeText(generatedCode);
                                setToast({ show: true, message: "Code copied to clipboard!", type: "success" });
                            } catch (error) {
                                console.error("Failed to copy to clipboard:", error);
                                setToast({ show: true, message: "Failed to copy to clipboard", type: "error" });
                            }
                        };

                        // Close toast
                        const closeToast = () => {
                            setToast({ show: false, message: "", type: "" });
                        };

                        return (
                            <div className="min-h-screen bg-bento-bg">
                                <Toast {...toast} onClose={closeToast} />
                                
                                <div className="container mx-auto px-4 py-8">
                                    <div className="text-center mb-12">
                                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                            Details Toggle Code Generator
                                        </h1>
                                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                            Create HTML <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;details&gt;</code> toggle snippets with a modern, user-friendly interface
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                                        {/* Left Column */}
                                        <div className="space-y-8">
                                            <InputForm 
                                                summary={summary}
                                                description={description}
                                                onSummaryChange={handleSummaryChange}
                                                onDescriptionChange={handleDescriptionChange}
                                                summaryError={summaryError}
                                            />
                                            
                                            <PreviewSection 
                                                summary={summary}
                                                description={description}
                                            />
                                        </div>

                                        {/* Right Column */}
                                        <div className="lg:col-span-1">
                                            <CodeOutput 
                                                generatedCode={generatedCode}
                                                onCopy={handleCopy}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    };

                    // Ensure this renders to the specific root for the detailsGen tool
                    const detailsRoot = document.getElementById('details-generator-app-root');
                    if (detailsRoot) {
                        ReactDOM.render(<App />, detailsRoot);
                    } else {
                        console.error('details-generator-app-root not found for React app.');
                    }
                `;

                // After all other scripts are appended, append the React app script
                // Adding a slight delay to ensure React, ReactDOM, Babel are fully loaded and parsed
                setTimeout(() => {
                    appRoot.appendChild(reactAppScript);
                }, 100); // Small delay
            }
        },
        // --- IfraGen Tool ---
        ifragen: {
            getControlPanelHTML: () => `
                <div id="ifragen-tool-container">
                    <h2>IfraGen</h2>
                    <div class="ifragen-form-group">
                        <label for="ifragen-fileLink">1. Paste the File Link</label>
                        <input type="text" id="ifragen-fileLink" placeholder="e.g., https://rmit.instructure.com/courses/.../...?preview=...">
                    </div>
                    <div class="ifragen-form-group">
                        <label for="ifragen-height">2. Set the Height</label>
                        <input type="number" id="ifragen-height" value="2000">
                    </div>
                    <button class="ifragen-button" id="ifragen-generate-btn">3. Generate Code</button>
                    <p id="ifragen-error-message">Error: Could not find Course ID or File ID in the link. Please check the URL.</p>
                </div>
            `,
            getPreviewPanelHTML: () => `
                <div class="ifragen-output-container">
                    <label for="ifragen-result">4. Copy Your Code</label>
                    <textarea id="ifragen-result" readonly placeholder="Your generated code will appear here..."></textarea>
                    <button class="ifragen-copy-button" id="ifragen-copy-btn">Copy to Clipboard</button>
                </div>
            `,
            init: () => {
                console.log('IfraGen tool initialized!');
                const fileLinkInput = document.getElementById('ifragen-fileLink');
                const heightInput = document.getElementById('ifragen-height');
                const generateBtn = document.getElementById('ifragen-generate-btn');
                const outputArea = document.getElementById('ifragen-result');
                const copyBtn = document.getElementById('ifragen-copy-btn');
                const errorMessage = document.getElementById('ifragen-error-message');

                function generateIframe() {
                    const fileLink = fileLinkInput.value;
                    const height = heightInput.value;
        
                    errorMessage.style.display = 'none';
                    outputArea.value = '';
        
                    const courseMatch = fileLink.match(/\/courses\/(\d+)\//);
                    const fileMatch = fileLink.match(/preview=(\d+)/);
        
                    if (courseMatch && fileMatch) {
                        const courseId = courseMatch[1];
                        const fileId = fileMatch[1];
                        
                        const iframeCode = 
`<p><iframe src="https://rmit.instructure.com/courses/${courseId}/files/${fileId}/download" width="1200" height="${height}" loading="lazy" allowfullscreen="allowfullscreen" data-api-endpoint="https://rmit.instructure.com/api/v1/courses/${courseId}/files/${fileId}" data-api-returntype="File"></iframe></p>`;
        
                        outputArea.value = iframeCode;
                    } else {
                        errorMessage.style.display = 'block';
                    }
                }

                function copyCode() {
                    if (!outputArea.value) return;
        
                    outputArea.select();
                    document.execCommand('copy');
                    
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                }

                generateBtn.addEventListener('click', generateIframe);
                copyBtn.addEventListener('click', copyCode);
            }
        },
        iframeGen: { 
            getControlPanelHTML: () => `
                <h2>Generic Iframe Generator</h2>
                <div class="form-group">
                    <label for="iframe-url">URL</label>
                    <input type="text" id="iframe-url" placeholder="https://example.com" value="https://www.youtube.com/embed/dQw4w9WgXcQ">
                </div>
                <div class="form-group">
                    <label>Dimensions (px)</label>
                    <div class="dimension-inputs">
                        <div>
                            <input type="number" id="iframe-width" value="560" placeholder="Width">
                        </div>
                        <div>
                            <input type="number" id="iframe-height" value="315" placeholder="Height">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="iframe-title">Title (for accessibility)</label>
                    <input type="text" id="iframe-title" placeholder="A descriptive title" value="Example Video">
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="iframe-fullscreen" checked> Allow Fullscreen</label>
                </div>
                <button id="generate-iframe-btn" class="btn btn-primary">Generate Code</button>
            `,
            getPreviewPanelHTML: () => `
                <h3>Generated Iframe Code</h3>
                <div class="code-output-container">
                    <button id="copy-iframe-code-btn" class="copy-btn">Copy</button>
                    <pre><code id="iframe-output-code"></code></pre>
                </div>
                <h3>Live Preview</h3>
                <div id="iframe-live-preview"></div>
            `,
            init: () => {
                console.log('Original Iframe Gen initialized!');
                const urlInput = document.getElementById('iframe-url');
                const widthInput = document.getElementById('iframe-width');
                const heightInput = document.getElementById('iframe-height');
                const titleInput = document.getElementById('iframe-title');
                const fullscreenCheckbox = document.getElementById('iframe-fullscreen');
                const generateBtn = document.getElementById('generate-iframe-btn');
                const copyBtn = document.getElementById('copy-iframe-code-btn');
                const outputCode = document.getElementById('iframe-output-code');
                const livePreview = document.getElementById('iframe-live-preview');

                const generateIframeCode = () => {
                    const url = urlInput.value.trim() || 'about:blank';
                    const width = widthInput.value || '560';
                    const height = heightInput.value || '315';
                    const title = titleInput.value.trim() || 'Embedded Content';
                    const allowFullscreen = fullscreenCheckbox.checked ? 'allowfullscreen' : '';

                    const iframeTag = `<iframe\n  src="${url}"\n  width="${width}"\n  height="${height}"\n  title="${title}"\n  frameborder="0"\n  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"\n  ${allowFullscreen}\n></iframe>`;

                    outputCode.textContent = iframeTag;
                    livePreview.innerHTML = iframeTag; // Update live preview as well
                };

                const copyToClipboard = () => {
                    navigator.clipboard.writeText(outputCode.textContent).then(() => {
                        copyBtn.textContent = 'Copied!';
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        alert('Failed to copy code.');
                    });
                };
                
                generateBtn.addEventListener('click', generateIframeCode);
                copyBtn.addEventListener('click', copyToClipboard);

                // Generate initial code on load
                generateIframeCode();
            }
        }
    };
 
    // Function to clean up scripts added by a tool
    function cleanUpToolScripts() {
        document.querySelectorAll('[data-tool-script="detailsGen"]').forEach(script => {
            script.remove();
        });
        const appRoot = document.getElementById('details-generator-app-root');
        if (appRoot) {
            ReactDOM.unmountComponentAtNode(appRoot); // Clean up React app
            appRoot.innerHTML = ''; // Clear the HTML
        }
    }

    // --- TOOL LOADING FUNCTION ---
    function loadTool(toolName) {
        // Clean up scripts from the previous tool before loading a new one
        cleanUpToolScripts();

        const tool = tools[toolName];
        if (!tool) {
            controlPanel.innerHTML = '<h2>Tool not found</h2>';
            previewPanel.innerHTML = '';
            return;
        }
 
        // Update panel content
        controlPanel.innerHTML = tool.getControlPanelHTML();
        previewPanel.innerHTML = tool.getPreviewPanelHTML();
 
        // Run the tool's initialization script
        tool.init();
    }
 
    // --- SIDEBAR CLICK EVENT HANDLING ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
 
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
 
            const toolName = link.dataset.tool;
            loadTool(toolName);
        });
    });
 
    // --- LOAD DEFAULT TOOL ON PAGE LOAD ---
    // Activate the corresponding link for the default tool
    document.querySelector('.tool-link[data-tool="layoutGen"]').classList.add('active');
    loadTool('layoutGen');
});
