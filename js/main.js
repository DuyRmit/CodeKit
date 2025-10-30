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
            getControlPanelHTML: () => `<h2>Color Replacer</h2><p>Controls for the Color Replacer will go here.</p>`,
            getPreviewPanelHTML: () => `<h3>Updated Code</h3><p>Code after color replacement will be here.</p>`,
            init: () => console.log('Color Replacer initialized!')
        },
        detailsGen: {
            getControlPanelHTML: () => `<h2>Details Toggle Generator</h2><p>Controls for the Details Toggle will go here.</p>`,
            getPreviewPanelHTML: () => `<h3>Live Preview & Code</h3><p>The preview and code will be here.</p>`,
            init: () => console.log('Details Toggle Gen initialized!')
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
        // --- ORIGINAL IFRAME GENERATOR (RENAME IF YOU WANT TO KEEP BOTH) ---
        // If you want to keep the generic iframe generator, give it a different name,
        // for example, `genericIframeGen` and update the sidebar link accordingly.
        // Otherwise, the `ifragen` above replaces this one.
        iframeGen: { // Renamed from 'iframeGen' for this example
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
 
    // --- TOOL LOADING FUNCTION ---
    function loadTool(toolName) {
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
