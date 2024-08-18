document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.getElementById('dropArea');
    const showDataButton = document.getElementById('showDataButton');
    const templateSource = document.getElementById('table-template').innerHTML;
    const template = Handlebars.compile(templateSource);
    const dataBase = 'cortex_db';
    const schema = 'inventory_db';

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.style.borderColor = 'green';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#ccc';
    });

    dropArea.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropArea.style.borderColor = '#ccc';

        const file = event.dataTransfer.files[0];
        if (file.type === 'text/csv') {
            const text = await file.text();
            const csvData = parseCSV(text);
            await initIndexedDB(csvData);
            console.log('Data loaded into IndexedDB');
        } else {
            alert('Please drop a CSV file.');
        }
    });

    showDataButton.addEventListener('click', async () => {
        const data = await readDataFromIndexedDB();
        console.log('Data read from IndexedDB:');
        displayDataAsTable(data);
    });

    function parseCSV(text) {
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows.shift();
        return rows.map(row => Object.fromEntries(row.map((cell, i) => [headers[i], cell])));
    }

    function initIndexedDB(data) {



        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dataBase, 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const store = db.createObjectStore(schema, { keyPath: 'id', autoIncrement: true });
                store.createIndex('id', 'id', { unique: true });
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([schema], 'readwrite');
                const store = transaction.objectStore(schema);

                store.clear();

                data.forEach(row => {
                    store.add(row);
                });

                transaction.oncomplete = () => {
                    resolve();
                };

                transaction.onerror = (event) => {
                    reject(event);
                };
            };

            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    function readDataFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dataBase, 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction([schema], 'readonly');
                const store = transaction.objectStore(schema);
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    resolve(getAllRequest.result);
                };

                getAllRequest.onerror = (event) => {
                    reject(event);
                };
            };

            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    function displayDataAsTable(data) {
        if (data.length === 0) {
            tableContainer.innerHTML = '<p>No data available</p>';
            return;
        }

        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => row[header]));

        const html = template({ headers, rows });
        tableContainer.innerHTML = html;
    }
});
