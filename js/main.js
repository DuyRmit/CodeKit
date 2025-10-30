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
        // --- REPLACED IFRAME GENERATOR ---
        iframeGen: {
            getControlPanelHTML: () => `
                <h2>Iframe Generator</h2>
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
                console.log('Iframe Gen initialized!');
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
