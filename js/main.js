document.addEventListener('DOMContentLoaded', () => {
 
    const sidebarLinks = document.querySelectorAll('#sidebar .tool-link');
    const controlPanel = document.getElementById('control-panel');
    const previewPanel = document.getElementById('preview-panel');
 
    // --- TOOL DEFINITIONS ---
    const tools = {
         layoutGen: {
            getControlPanelHTML: () => `
                <section class="panel-section">
                    <h2 class="tool-section-title">1. Layout Structure</h2>
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Total Boxes:</label>
                            <div id="lg-box-count-selector" class="selector-group">
                                <!-- Box count buttons will be rendered here -->
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Available Layouts:</label>
                            <div id="lg-layout-selector" class="layout-tiles">
                                <!-- Layout tiles will be rendered here -->
                            </div>
                        </div>
                    </div>
                </section>
                <section class="panel-section">
                    <h2 class="tool-section-title">2. Style & Effects</h2>
                    <div class="panel-content">
                        <div class="form-group">
                            <label>Box Style:</label>
                            <div id="lg-style-selector" class="style-tiles">
                                <!-- Style tiles will be rendered here -->
                            </div>
                        </div>
                        <div id="lg-style-customization-section" class="form-group">
                            <div id="lg-border-width-control" class="slider-control">
                                <label for="lg-border-width-slider">Border Width</label>
                                <input type="range" id="lg-border-width-slider" min="1" max="10">
                                <input type="number" id="lg-border-width-input" min="1" max="10">
                                <span>px</span>
                            </div>
                            <div id="lg-border-radius-control" class="slider-control">
                                <label for="lg-border-radius-slider">Border Radius</label>
                                <input type="range" id="lg-border-radius-slider" min="0" max="30">
                                <input type="number" id="lg-border-radius-input" min="0" max="30">
                                <span>px</span>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="lg-content-section" class="panel-section" style="display: none;">
                    <h2 id="lg-content-section-title" class="tool-section-title">3. Content</h2>
                    <div class="panel-content">
                        <div class="form-group">
                            <label for="lg-content-title-input">Title:</label>
                            <input type="text" id="lg-content-title-input">
                        </div>
                        <div class="form-group">
                            <label for="lg-content-desc-input">Description:</label>
                            <textarea id="lg-content-desc-input" rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="lg-hide-box-checkbox">Hide content & style for this box
                            </label>
                        </div>
                    </div>
                </section>
                <button id="lg-get-code-button" class="btn btn-primary" style="width:100%; margin-top: 20px;">Get HTML Code</button>
            `,
            getPreviewPanelHTML: () => `
                <div id="lg-preview-canvas"></div>
                <!-- Modal for generated code -->
                <div id="lg-code-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Get HTML Code</h3>
                            <button id="lg-close-modal-button" class="close-button">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p class="instruction"><strong>Code selected. Press Ctrl+C (or Cmd+C) to copy.</strong></p>
                            <textarea id="lg-generated-code-textarea" readonly></textarea>
                        </div>
                        <div class="modal-footer">
                            <button id="lg-copy-code-button" class="btn btn-primary">Copy Code</button> 
                            <button id="lg-switch-code-type-button" class="btn btn-secondary">Switch to Layout Only</button>
                        </div>
                    </div>
                </div>
            `,
            init: () => {
                console.log('Layout Generator initialized!');

                const state = {
                    boxCount: 2,
                    selectedLayout: null,
                    selectedStyle: 'solid',
                    styleOptions: {
                        borderWidth: 3,
                        borderRadius: 8
                    },
                    cells: [],
                    selectedCellIndex: null,
                    codeType: 'full'
                };

                const dom = {
                    boxCountSelector: document.getElementById('lg-box-count-selector'),
                    layoutSelector: document.getElementById('lg-layout-selector'),
                    styleSelector: document.getElementById('lg-style-selector'),
                    previewCanvas: document.getElementById('lg-preview-canvas'),
                    styleCustomizationSection: document.getElementById('lg-style-customization-section'),
                    borderWidthControl: document.getElementById('lg-border-width-control'),
                    borderRadiusControl: document.getElementById('lg-border-radius-control'),
                    borderWidthSlider: document.getElementById('lg-border-width-slider'),
                    borderWidthInput: document.getElementById('lg-border-width-input'),
                    borderRadiusSlider: document.getElementById('lg-border-radius-slider'),
                    borderRadiusInput: document.getElementById('lg-border-radius-input'),
                    contentSection: document.getElementById('lg-content-section'),
                    contentSectionTitle: document.getElementById('lg-content-section-title'),
                    contentTitleInput: document.getElementById('lg-content-title-input'),
                    contentDescInput: document.getElementById('lg-content-desc-input'),
                    hideBoxCheckbox: document.getElementById('lg-hide-box-checkbox'),
                    getCodeButton: document.getElementById('lg-get-code-button'),
                    codeModal: document.getElementById('lg-code-modal'),
                    closeModalButton: document.getElementById('lg-close-modal-button'),
                    generatedCodeTextarea: document.getElementById('lg-generated-code-textarea'),
                    switchCodeTypeButton: document.getElementById('lg-switch-code-type-button'),
                    copyCodeButton: document.getElementById('lg-copy-code-button')
                };

                const getLayoutOptions = count => {
                    const o = [];
                    if (count === 1) {
                        o.push({
                            value: '1x1',
                            rows: 1,
                            ratios: [
                                [12]
                            ],
                            label: '1x1 (12)'
                        })
                    } else if (count === 2) {
                        o.push({
                            value: '1x2_6-6',
                            rows: 1,
                            ratios: [
                                [6, 6]
                            ],
                            label: '(6,6)'
                        });
                        o.push({
                            value: '1x2_5-7',
                            rows: 1,
                            ratios: [
                                [5, 7]
                            ],
                            label: '(5,7)'
                        });
                        o.push({
                            value: '1x2_7-5',
                            rows: 1,
                            ratios: [
                                [7, 5]
                            ],
                            label: '(7,5)'
                        });
                        o.push({
                            value: '1x2_4-8',
                            rows: 1,
                            ratios: [
                                [4, 8]
                            ],
                            label: '(4,8)'
                        });
                        o.push({
                            value: '1x2_8-4',
                            rows: 1,
                            ratios: [
                                [8, 4]
                            ],
                            label: '(8,4)'
                        })
                    } else if (count === 3) {
                        o.push({
                            value: '1x3',
                            rows: 1,
                            ratios: [
                                [4, 4, 4]
                            ],
                            label: '1x3 (4,4,4)'
                        })
                    } else if (count === 4) {
                        o.push({
                            value: '2x2',
                            rows: 2,
                            ratios: [
                                [6, 6],
                                [6, 6]
                            ],
                            label: '2x2 (6,6)'
                        });
                        o.push({
                            value: '1x4',
                            rows: 1,
                            ratios: [
                                [3, 3, 3, 3]
                            ],
                            label: '1x4 (3,3,3,3)'
                        })
                    } else if (count === 5) {
                        o.push({
                            value: '2r_special_5',
                            rows: 2,
                            ratios: [
                                [4, 4, 4],
                                [2, 4, 4, 2]
                            ],
                            label: 'Special 3-2'
                        })
                    } else if (count === 6) {
                        o.push({
                            value: '2x3',
                            rows: 2,
                            ratios: [
                                [4, 4, 4],
                                [4, 4, 4]
                            ],
                            label: '2x3 (4,4,4)'
                        });
                        o.push({
                            value: '3x2',
                            rows: 3,
                            ratios: [
                                [6, 6],
                                [6, 6],
                                [6, 6]
                            ],
                            label: '3x2 (6,6)'
                        })
                    } else if (count === 7) {
                        o.push({
                            value: '3r_special_7',
                            rows: 3,
                            ratios: [
                                [4, 4, 4],
                                [2, 4, 4, 2],
                                [2, 4, 4, 2]
                            ],
                            label: 'Special 3-2-2'
                        })
                    } else if (count === 8) {
                        o.push({
                            value: '2x4',
                            rows: 2,
                            ratios: [
                                [3, 3, 3, 3],
                                [3, 3, 3, 3]
                            ],
                            label: '2x4'
                        });
                        o.push({
                            value: '4x2',
                            rows: 4,
                            ratios: [
                                [6, 6],
                                [6, 6],
                                [6, 6],
                                [6, 6]
                            ],
                            label: '4x2'
                        });
                        o.push({
                            value: '3r_special_8',
                            rows: 3,
                            ratios: [
                                [4, 4, 4],
                                [4, 4, 4],
                                [2, 4, 4, 2]
                            ],
                            label: 'Special 3-3-2'
                        })
                    } else if (count === 9) {
                        o.push({
                            value: '3x3',
                            rows: 3,
                            ratios: [
                                [4, 4, 4],
                                [4, 4, 4],
                                [4, 4, 4]
                            ],
                            label: '3x3 (4,4,4)'
                        })
                    }
                    return o;
                };
                const styleDefinitions = [{
                    id: 'solid',
                    name: 'Solid Box',
                    hasBorder: false,
                    hasRadius: true
                }, {
                    id: 'line',
                    name: 'Grey Line',
                    hasBorder: true,
                    hasRadius: false
                }, {
                    id: 'dash',
                    name: 'Dash Box',
                    hasBorder: true,
                    hasRadius: true
                }, {
                    id: 'blueLine',
                    name: 'Blue Line',
                    hasBorder: true,
                    hasRadius: false
                }];

                const render = () => {
                    updateCellData();
                    renderControls();
                    renderPreview();
                };

                const renderControls = () => {
                    dom.boxCountSelector.innerHTML = ''; // Clear previous buttons
                    for (let i = 1; i <= 9; i++) {
                        const btn = document.createElement('button');
                        btn.className = 'btn-selector';
                        btn.textContent = i;
                        btn.dataset.count = i;
                        btn.classList.toggle('selected', i === state.boxCount);
                        btn.addEventListener('click', () => {
                            state.boxCount = i;
                            state.selectedCellIndex = null;
                            render();
                        });
                        dom.boxCountSelector.appendChild(btn);
                    }

                    const options = getLayoutOptions(state.boxCount);
                    dom.layoutSelector.innerHTML = '';
                    if (!state.selectedLayout || !options.some(opt => opt.value === state.selectedLayout.value)) {
                        state.selectedLayout = options[0] || null
                    }
                    options.forEach(opt => {
                        const tile = document.createElement('div');
                        tile.className = 'layout-tile';
                        tile.classList.toggle('selected', opt.value === state.selectedLayout.value);
                        let p = '<div class="preview-grid">';
                        opt.ratios.forEach(r => {
                            p += '<div class="preview-row">';
                            const t = r.reduce((a, b) => a + b, 0);
                            r.forEach(rat => {
                                const f = rat / t * 100;
                                p += `<div class="preview-box" style="flex-basis: ${f}%"></div>`
                            });
                            p += '</div>'
                        });
                        p += `</div><span>${opt.label}</span>`;
                        tile.innerHTML = p;
                        tile.addEventListener('click', () => {
                            state.selectedLayout = opt; // Set the actual object
                            render();
                        });
                        dom.layoutSelector.appendChild(tile)
                    });

                    dom.styleSelector.innerHTML = ''; // Clear previous styles
                    styleDefinitions.forEach(def => {
                        const tile = document.createElement('div');
                        tile.className = 'style-tile';
                        tile.dataset.styleId = def.id;
                        let p = {
                            solid: 'f5f5f5;',
                            line: 'border:3px solid #dbdbdb;',
                            dash: 'f5f5f5;border:2px dashed #777;',
                            blueLine: 'border:3px solid #000054;'
                        }[def.id];
                        tile.innerHTML = `<div class="style-tile-preview" style="${p.includes('border')?'':'background-color:#'}${p}"></div><span>${def.name}</span>`;
                        tile.addEventListener('click', () => {
                            if (!tile.classList.contains('disabled')) {
                                state.selectedStyle = def.id;
                                render();
                            }
                        });
                        dom.styleSelector.appendChild(tile);
                        tile.classList.toggle('selected', def.id === state.selectedStyle);
                        const isDisabled = state.boxCount >= 3 && (def.id === 'dash' || def.id === 'blueLine');
                        tile.classList.toggle('disabled', isDisabled);
                    });

                    const styleDef = styleDefinitions.find(s => s.id === state.selectedStyle);
                    const showBorder = styleDef && styleDef.hasBorder;
                    const showRadius = styleDef && styleDef.hasRadius;
                    dom.styleCustomizationSection.style.display = (showBorder || showRadius) ? 'block' : 'none';
                    dom.borderWidthControl.style.display = showBorder ? 'flex' : 'none';
                    dom.borderRadiusControl.style.display = showRadius ? 'flex' : 'none';
                    dom.borderWidthSlider.value = state.styleOptions.borderWidth;
                    dom.borderWidthInput.value = state.styleOptions.borderWidth;
                    dom.borderRadiusSlider.value = state.styleOptions.borderRadius;
                    dom.borderRadiusInput.value = state.styleOptions.borderRadius;
                    if (state.selectedCellIndex === null || !state.cells[state.selectedCellIndex]) {
                        dom.contentSection.style.display = 'none'
                    } else {
                        dom.contentSection.style.display = 'block';
                        dom.contentSectionTitle.textContent = `3. Content (Box ${state.selectedCellIndex+1})`;
                        const cell = state.cells[state.selectedCellIndex];
                        dom.contentTitleInput.value = cell.title;
                        dom.contentDescInput.value = cell.description;
                        dom.hideBoxCheckbox.checked = cell.hidden
                    }
                };

                const renderPreview = () => {
                    dom.previewCanvas.innerHTML = '';
                    if (!state.selectedLayout) return;
                    let cellIndex = 0;
                    state.selectedLayout.ratios.forEach(rowRatios => {
                        const rowDiv = document.createElement('div');
                        rowDiv.className = 'grid-row';
                        const totalRatioInRow = rowRatios.reduce((a, b) => a + b, 0);
                        rowRatios.forEach(ratio => {
                            const colWidth = Math.round(ratio / totalRatioInRow * 12);
                            const colDiv = document.createElement('div');
                            colDiv.className = `col-md-${colWidth}`;
                            if (ratio <= 2) {
                                colDiv.innerHTML = '<p>&nbsp;</p>';
                            } else {
                                if (cellIndex >= state.boxCount) {
                                    colDiv.innerHTML = '<p>&nbsp;</p>';
                                } else {
                                    const container = document.createElement('div');
                                    container.className = 'preview-box-container';
                                    container.dataset.cellIndex = cellIndex;
                                    const content = document.createElement('div');
                                    content.className = 'preview-box-content';
                                    content.classList.toggle('selected', cellIndex === state.selectedCellIndex);
                                    content.innerHTML = generateCellHTML(cellIndex, 'preview');
                                    container.appendChild(content);
                                    colDiv.appendChild(container);
                                    cellIndex++;
                                }
                            }
                            rowDiv.appendChild(colDiv);
                        });
                        dom.previewCanvas.appendChild(rowDiv)
                    });
                };

                const updateCellData = () => {
                    for (let i = 0; i < state.boxCount; i++) {
                        if (!state.cells[i]) {
                            state.cells[i] = {
                                title: `Step ${i+1}`,
                                description: 'Your text will look like this',
                                hidden: false
                            }
                        }
                    }
                    state.cells.length = state.boxCount;
                    if (state.boxCount >= 3 && (state.selectedStyle === 'dash' || state.selectedStyle === 'blueLine')) {
                        state.selectedStyle = 'solid'
                    }
                };

                const generateCellHTML = (cellIndex, context = 'final') => {
                    const cell = state.cells[cellIndex];
                    if (cell.hidden) {
                        return '<p>&nbsp;</p>'
                    }
                    const {
                        borderWidth,
                        borderRadius
                    } = state.styleOptions;
                    let h = '',
                        s = 'height:100%;box-sizing:border-box;';

                    switch (state.selectedStyle) {
                        case 'solid':
                            s += `background-color:#f5f5f5;padding:15px 30px;border-radius:${borderRadius}px;`;
                            h = `<div class="content-box" style="${s}" title="embedded content">\n  <p style="text-align:center;"><span style="color:#000054;"><strong>${cell.title}</strong></span></p>\n  <hr>\n  <p>${cell.description}</p>\n</div>`;
                            break;
                        case 'line':
                        case 'blueLine':
                            const l = state.selectedStyle === 'line' ? '#dbdbdb' : '#000054',
                                t = '#000054';
                            s += `border:solid ${l} ${borderWidth}px;padding:15px;`;
                            h = `<div class="content-box" style="${s}" title="embedded content">\n  <p style="text-align:center;"><span style="color:${t};"><strong>${cell.title}</strong></span></p>\n  <hr>\n  <p>${cell.description}</p>\n</div>`;
                            break;
                        case 'dash':
                            s += `background-color:#f5f5f5;padding:20px;border:${borderWidth}px dashed #777;border-radius:${borderRadius}px;`;
                            h = `<div class="fun-fact-box" style="${s}" title="embedded content">\n  <p><strong><span style="color:#000054;">${cell.title}</span></strong></p>\n  <p>${cell.description}</p>\n</div>`;
                            break
                    }
                    return h
                };

                const generateFinalCode = () => {
                    if (!state.selectedLayout) return '<!-- No layout selected -->';

                    if (state.boxCount === 1 && state.codeType === 'full' && state.selectedLayout.value === '1x1') {
                        return generateCellHTML(0, 'final').trim();
                    }

                    let html = '',
                        cellIndex = 0;
                    state.selectedLayout.ratios.forEach((rowRatios, rowIndex) => {
                        const rowStyle = rowIndex > 0 ? '' : '';
                        html += `<div class="grid-row"${rowStyle}>\n`;
                        const totalRatioInRow = rowRatios.reduce((a, b) => a + b, 0);
                        rowRatios.forEach(ratio => {
                            const colWidth = Math.round(ratio / totalRatioInRow * 12);
                            html += `  <div class="col-xs-12 col-md-${colWidth}">\n`;
                            let cellContent = '';
                            if (ratio <= 2) {
                                cellContent = '<p>&nbsp;</p>'
                            } else {
                                if (cellIndex >= state.boxCount) {
                                    cellContent = '<p>&nbsp;</p>'
                                } else {
                                    cellContent = state.codeType === 'full' ? generateCellHTML(cellIndex, 'final') : (state.cells[cellIndex].hidden ? '<p>&nbsp;</p>' : `<p>${state.cells[cellIndex].description}</p>`);
                                    cellIndex++
                                }
                            }
                            html += cellContent.split('\n').map(line => '    ' + line).join('\n') + '\n';
                            html += '  </div>\n'
                        });
                        html += '</div>\n'
                    });
                    return html.trim()
                };

                const handleModalOpen = () => {
                    dom.generatedCodeTextarea.value = generateFinalCode();
                    dom.codeModal.classList.add('visible');
                    setTimeout(() => {
                        dom.generatedCodeTextarea.focus();
                        dom.generatedCodeTextarea.select()
                    }, 100)
                };

                const initLayoutGen = () => {
                    // Event listeners
                    dom.previewCanvas.addEventListener('click', e => {
                        const box = e.target.closest('.preview-box-container');
                        state.selectedCellIndex = box ? parseInt(box.dataset.cellIndex, 10) : null;
                        render();
                    });
                    dom.borderWidthSlider.addEventListener('input', e => {
                        state.styleOptions.borderWidth = parseInt(e.target.value, 10);
                        render();
                    });
                    dom.borderWidthInput.addEventListener('input', e => {
                        state.styleOptions.borderWidth = parseInt(e.target.value, 10);
                        render();
                    });
                    dom.borderRadiusSlider.addEventListener('input', e => {
                        state.styleOptions.borderRadius = parseInt(e.target.value, 10);
                        render();
                    });
                    dom.borderRadiusInput.addEventListener('input', e => {
                        state.styleOptions.borderRadius = parseInt(e.target.value, 10);
                        render();
                    });
                    dom.contentTitleInput.addEventListener('input', e => {
                        if (state.selectedCellIndex !== null) state.cells[state.selectedCellIndex].title = e.target.value;
                        render();
                    });
                    dom.contentDescInput.addEventListener('input', e => {
                        if (state.selectedCellIndex !== null) state.cells[state.selectedCellIndex].description = e.target.value;
                        render();
                    });
                    dom.hideBoxCheckbox.addEventListener('change', e => {
                        if (state.selectedCellIndex !== null) state.cells[state.selectedCellIndex].hidden = e.target.checked;
                        render();
                    });
                    dom.getCodeButton.addEventListener('click', handleModalOpen);
                    dom.closeModalButton.addEventListener('click', () => dom.codeModal.classList.remove('visible'));
                    dom.codeModal.addEventListener('click', e => {
                        if (e.target === dom.codeModal) {
                            dom.codeModal.classList.remove('visible');
                        }
                    });
                    dom.switchCodeTypeButton.addEventListener('click', () => {
                        state.codeType = state.codeType === 'full' ? 'layoutOnly' : 'full';
                        dom.switchCodeTypeButton.textContent = state.codeType === 'full' ? 'Switch to Layout Only' : 'Switch to Full Style';
                        handleModalOpen();
                    });
                    dom.copyCodeButton.addEventListener('click', () => {
                        const textarea = dom.generatedCodeTextarea;
                        textarea.focus();
                        textarea.select();
                        try {
                            document.execCommand('copy');
                            dom.copyCodeButton.textContent = 'Copied!';
                            dom.copyCodeButton.disabled = true;
                            setTimeout(() => {
                                dom.copyCodeButton.textContent = 'Copy Code';
                                dom.copyCodeButton.disabled = false;
                            }, 2000);
                        } catch (err) {
                            console.error('Fallback: Oops, unable to copy', err);
                        }
                    });
                    render(); // Initial render
                };
                initLayoutGen();
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
