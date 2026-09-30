document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'F5') {
            event.preventDefault();

            sessionStorage.removeItem('pageWasVisited');
            window.location.href = '../index.html';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const imagesButton = document.getElementById('images-tab-btn');
    const dropzone = document.querySelector('.upload__dropzone');
    const currentUploadInput = document.querySelector('.upload__input');
    const copyButton = document.querySelector('.upload__copy');

    const updateTabStyles = () => {
        const uploadTab = document.getElementById('upload-tab-btn');
        const imagesTab = document.getElementById('images-tab-btn');
        const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];

        const isImagesPage = window.location.pathname.includes('images.html');

        uploadTab.classList.remove('upload__tab--active');
        imagesTab.classList.remove('upload__tab--active');

        if (isImagesPage) {
            imagesTab.classList.add('upload__tab--active');
        } else {
            uploadTab.classList.add('upload__tab--active');
        }
    };

    const handleAndStoreFiles = async (files) => {
        if (!files || files.length === 0) {
            return;
        }
        const storedFiles = JSON.parse(localStorage.getItem('uploadedImages')) || [];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        let lastUrl = '';

        for (const file of files) {
            if (!allowedTypes.includes(file.type) || file.size > MAX_SIZE_BYTES) {
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/upload', { method: 'POST', body: formData });
                const result = await response.json();

                if (!response.ok) {
                    alert(`${file.name}: ${result.error || 'upload failed'}`);
                    continue;
                }

                // result.url — справжнє посилання від сервера, напр. /images/<uuid>.png
                storedFiles.push({ name: file.name, url: result.url });
                lastUrl = `${window.location.origin}${result.url}`;
            } catch (error) {
                alert(`${file.name}: network error`);
            }
        }

        localStorage.setItem('uploadedImages', JSON.stringify(storedFiles));
        updateTabStyles();

        if (lastUrl) {
            if (currentUploadInput) {
                currentUploadInput.value = lastUrl;
            }
            alert("Files uploaded successfully! Go to the 'Images' tab to view them.");
        }
    };

    if (copyButton && currentUploadInput) {
        copyButton.addEventListener('click', () => {
            const textToCopy = currentUploadInput.value;

            if (textToCopy && textToCopy !== 'https://') {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyButton.textContent = 'COPIED!';
                    setTimeout(() => {
                        copyButton.textContent = 'COPY';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    }

    if (imagesButton) {
        imagesButton.addEventListener('click', () => {
            window.location.href = 'images.html';
        });
    }

    fileUpload.addEventListener('change', (event) => {
        handleAndStoreFiles(event.target.files);
        event.target.value = '';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropzone.addEventListener('drop', (event) => {
        handleAndStoreFiles(event.dataTransfer.files);
    });

    updateTabStyles();
});