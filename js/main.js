document.addEventListener('DOMContentLoaded', () => {

    const sidebarLinks = document.querySelectorAll('#sidebar .tool-link');
    const controlPanel = document.getElementById('control-panel');
    const previewPanel = document.getElementById('preview-panel');

    // --- ĐỊNH NGHĨA CÁC CÔNG CỤ CỦA BẠN Ở ĐÂY ---
    // Hiện tại chỉ là placeholder, chúng ta sẽ tích hợp code thật sau
    const tools = {
        layoutGen: {
            getControlPanelHTML: () => `<h2>Layout Generator</h2><p>Phần điều khiển của Layout Generator sẽ ở đây.</p>`,
            getPreviewPanelHTML: () => `<h3>Live Preview</h3><p>Kết quả xem trước sẽ ở đây.</p>`,
            init: () => {
                console.log('Layout Generator initialized!');
                // Code logic của Layout Generator sẽ được gọi ở đây
            }
        },
        colorReplacer: {
            getControlPanelHTML: () => `<h2>Color Replacer</h2><p>Phần điều khiển của Color Replacer sẽ ở đây.</p>`,
            getPreviewPanelHTML: () => `<h3>Updated Code</h3><p>Code sau khi thay thế màu sẽ ở đây.</p>`,
            init: () => console.log('Color Replacer initialized!')
        },
        detailsGen: {
            getControlPanelHTML: () => `<h2>Details Toggle Generator</h2><p>Phần điều khiển của Details Toggle sẽ ở đây.</p>`,
            getPreviewPanelHTML: () => `<h3>Live Preview & Code</h3><p>Xem trước và code sẽ ở đây.</p>`,
            init: () => console.log('Details Toggle Gen initialized!')
        },
        iframeGen: {
            getControlPanelHTML: () => `<h2>Iframe Generator</h2><p>Phần điều khiển của Iframe Generator sẽ ở đây.</p>`,
            getPreviewPanelHTML: () => `<h3>Generated Iframe Code</h3><p>Code Iframe sẽ ở đây.</p>`,
            init: () => console.log('Iframe Gen initialized!')
        }
    };

    // --- HÀM TẢI CÔNG CỤ ---
    function loadTool(toolName) {
        const tool = tools[toolName];
        if (!tool) {
            controlPanel.innerHTML = '<h2>Tool not found</h2>';
            previewPanel.innerHTML = '';
            return;
        }

        // Cập nhật nội dung cho các panel
        controlPanel.innerHTML = tool.getControlPanelHTML();
        previewPanel.innerHTML = tool.getPreviewPanelHTML();

        // Chạy hàm khởi tạo của công cụ
        tool.init();
    }

    // --- XỬ LÝ SỰ KIỆN CLICK TRÊN SIDEBAR ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn trình duyệt chuyển trang

            // Xóa class 'active' khỏi tất cả các link
            sidebarLinks.forEach(l => l.classList.remove('active'));

            // Thêm class 'active' cho link vừa được click
            link.classList.add('active');

            // Tải công cụ tương ứng
            const toolName = link.dataset.tool;
            loadTool(toolName);
        });
    });

    // --- TẢI CÔNG CỤ MẶC ĐỊNH KHI VÀO TRANG ---
    loadTool('layoutGen');
});
