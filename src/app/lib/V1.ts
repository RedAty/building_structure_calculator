export const V1 = {
    /**
     * @param {string} url
     * @param {object} options
     * @returns {Promise<string>}
     */
    fetch: async function (url, options = {}) {
        if (!options) {
            options = {};
        }
        if (!options.method) {
            options.method = "GET";
        }
        if (!options.credentials) {
            options.credentials = "include";
        }

        return await (await fetch(url, options).catch(V1.errorHandler)).text().catch(V1.errorHandler);
    },
    /**
     * @param {string} url
     * @returns {Promise<null|object>}
     */
    getJSON: async function (url) {
        const textResponse = await V1.fetch(url);
        if (!textResponse) {
            return null;
        }
        let json = null;
        try {
            json = JSON.parse(textResponse);
        } catch (e) {
            V1.errorHandler(e);
        }
        return json;
    },
    postJSON: async function (url, json) {

        const textResponse = await V1.fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });
        if (!textResponse) {
            return null;
        }
        let out = null;
        try {
            out = JSON.parse(textResponse);
        } catch (e) {
            V1.errorHandler(e);
        }
        return out;
    },
    putJSON: async function (url, json) {

        const textResponse = await V1.fetch(url, {
            method: "PUT",
            credentials: "include",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });
        if (!textResponse) {
            return null;
        }
        let out = null;
        try {
            out = JSON.parse(textResponse);
        } catch (e) {
            V1.errorHandler(e);
        }
        return out;
    },
    /**
     * @param {string} url
     * @returns {Promise<null|string>}
     */
    getText: function (url) {
        return V1.fetch(url);
    },
    /**
     * @name createTable
     * @method
     * @param {Array[]} lineArray
     * @param {Object} details
     * @param details.className
     * @param details.classList
     * @param details.header
     * @param details.footer
     * @param details.events
     * @returns {Element}
     */
    createTable: function (lineArray, details) {
        if (!lineArray) {
            lineArray = [];
        }

        if (!details) {
            details = {};
        }
        let node;
        if (!Array.isArray(lineArray) || typeof details !== 'object') {
            console.error('Invalid type/details');
            return null;
        }

        node = document.createElement('table');

        if (details.className) {
            node.className = details.className;
        }
        if (details.classList) {
            details.classList.forEach(c => node.classList.add(c));
        }

        const getTableLine = function (columns, type = 'td') {
            const tr = document.createElement('tr');

            if (Array.isArray(columns)) {
                columns.forEach(column => {
                    const tableElement = document.createElement(type);
                    if (typeof column === 'string' || typeof column === 'number') {
                        tableElement.innerHTML = column;
                    } else if (typeof column === 'function') {
                        const functionResult = column();

                        if (functionResult instanceof HTMLElement) {
                            tableElement.appendChild(functionResult);
                        } else if (functionResult) {
                            tableElement.innerHTML = functionResult;
                        }
                    } else if (column instanceof HTMLElement) {
                        tableElement.appendChild(column);
                    } else if (column && typeof column === 'object') {
                        try {
                            tableElement.innerHTML = JSON.stringify(column);
                        } catch (e) {
                            console.warn(e);
                        }
                    } else {
                        console.warn('Invalid column data');
                    }

                    tr.appendChild(tableElement);
                });
            }

            if (details.events && typeof details.events === 'object') {
                const names = Object.keys(details.events);
                names.forEach(event => {
                    if (typeof details.events[event] === 'function') {
                        tr[event] = function (ev) {
                            if (typeof ev.preventDefault === 'function') {
                                ev.preventDefault();
                            }
                            details.events[event](columns, ev);
                        };
                    }
                });
            }

            return tr;
        };

        const thead = document.createElement('thead');
        if (Array.isArray(details.header)) {
            thead.appendChild(getTableLine(details.header, 'th'));
        }
        node.appendChild(thead);
        const tbody = document.createElement('tbody');
        lineArray.forEach(line => {
            tbody.appendChild(getTableLine(line));
        });
        node.appendChild(tbody);

        if (Array.isArray(details.footer)) {
            const tfoot = document.createElement('tfoot');
            tfoot.appendChild(getTableLine(details.footer));
            node.appendChild(tfoot);
        }
        return node;
    },
    createInput: (input, options, node) => {
        if (!options) {
            options = {};
        }
        let target = node;
        if (options.grouped) {
            target = document.createElement('div');
            target.className = 'form-group';
        }
        if (input) {

            if (input instanceof HTMLElement) {
                if (input.label) {
                    const label = document.createElement('label');
                    if (input.id) {
                        label.setAttribute('for', input.id);
                    }
                    label.innerHTML = input.label;
                    target.appendChild(label);
                }
                target.appendChild(input);
            } else if (typeof input === 'object') {
                let node_: HTMLElement = document.createElement('input');
                if (input.type === 'image') {
                    node_.setAttribute('type', 'hidden');
                } else if (input.type === 'checkbox') {
                    node_.setAttribute('type', 'checkbox');
                    if (options.grouped) {
                        target.style.alignItems = 'center';
                        target.style.flexDirection = 'row';
                    }
                } else if (input.type === 'custom') {
                    node_ = document.createElement('div');
                } else if (input.type === 'textarea') {
                    node_ = document.createElement('textarea');
                } else {
                    node_.setAttribute('type', input.type || 'text');
                }

                if (input.value && input.type === 'custom') {
                    node_.appendChild(input.value);
                } else if (input.value && input.type === 'textarea') {
                    node_.value = input.value;
                } else {
                    node_.setAttribute('value', input.value);
                }
                if (typeof input.checked === 'boolean') {
                    node_.setAttribute('checked', input.checked);
                }
                if (input.placeholder) {
                    node_.setAttribute('placeholder', input.placeholder);
                }
                if (input.name) {
                    node_.setAttribute('name', input.name);
                }
                if (input.innerHTML) {
                    node_.innerHTML = input.innerHTML;
                }
                if (input.className) {
                    node_.className = input.className;
                }
                if (input.id) {
                    node_.id = input.id;
                }
                if (input.disabled) {
                    node_.disabled = input.disabled;
                }
                if (input.label) {
                    const label = document.createElement('label');
                    if (input.id) {
                        label.setAttribute('for', input.id);
                    }
                    label.innerHTML = input.label;
                    target.appendChild(label);
                }
                if (input.type === 'image') {
                    const imgPreview = document.createElement('div');
                    imgPreview.className = 'image-uploader-div';
                    if (input.value) {
                        if (input.value.startsWith('data:')) {
                            imgPreview.style.backgroundImage = "url('" + input.value + "')";
                        } else {
                            imgPreview.style.backgroundImage = "url('../uploads/" + input.value + "')";
                        }
                    } else {
                        imgPreview.innerHTML = 'Kattints ide vagy húzz ide egy képet';
                    }
                    target.appendChild(imgPreview);
                    imgPreview.onclick = function () {
                        V1.getImageFromUser().then(imageObject => {
                            console.log(imageObject);
                            if (imageObject && imageObject.image) {
                                imgPreview.style.backgroundImage = "url('" + imageObject.image + "')";
                                node_.value = imageObject.image;
                                imgPreview.innerHTML = "";
                            }
                        });
                    }
                }
                target.appendChild(node_);
            }
            if (options.grouped) {
                node.appendChild(target);
            }
        }
    },
    /**
     * @name createForm
     * @method
     * @param {InputForm[]} inputs
     * @param {Object} details
     * @param details.title
     * @param details.action
     * @param details.method
     * @param details.target
     * @param details.className
     * @param details.classList
     * @returns {HTMLFormElement}
     */
    createForm: function (inputs, details) {
        if (!inputs) {
            inputs = [];
        }

        if (!details) {
            details = {};
        }
        if (!inputs || typeof details !== 'object') {
            console.error('Invalid type/details');
            return null;
        }

        const node = document.createElement('form');
        const self = this;

        if (details.className) {
            node.className = details.className;
        }
        if (details.classList) {
            details.classList.forEach(c => node.classList.add(c));
        }

        if (details.title) {
            const title = document.createElement('h5');
            title.classList.add('title');
            title.innerHTML = details.title;
            node.appendChild(title);
        }
        if (Array.isArray(inputs)) {
            inputs.forEach((input) => this.createInput(input, details, node));
        } else if (typeof inputs === 'object') {
            const inputList = Object.keys(inputs);
            inputList.forEach(id => {
                inputs[id].id = id;
                this.createInput(inputs[id], details, node);
            });
        } else {
            console.warn('Invalid input');
        }

        if (details.action) {
            node.setAttribute('action', details.action);
        }
        if (details.method) {
            node.setAttribute('method', details.method);
        }
        if (details.target) {
            node.setAttribute('target', details.target);
        }

        return node;
    },
    downloadAsFile: function (name, body, fileType = 'text/plain') {
        if (!name) {
            name = Math.floor(new Date().getTime() / 360000) + ".txt";
        }
        try {
            let textToSaveAsBlob = new Blob([body], {type: fileType});
            let textToSaveAsURL = URL.createObjectURL(textToSaveAsBlob);
            let fileNameToSaveAs = name;

            let downloadLink = document.createElement('a');
            downloadLink.download = fileNameToSaveAs;
            downloadLink.innerHTML = 'Download As File';
            downloadLink.href = textToSaveAsURL;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);

            downloadLink.click();
            downloadLink.outerHTML = '';


        } catch (e) {
            console.error(e.message);
        }
    },
    /**
     * Need to have a file input for this method
     * Example: await getTextWithFileReader(fileInput.files[0]);
     * @param file
     */
    uploadFileInputAsText: function (file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsText(file);
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        })
    },
    /**
     *
     * @returns {Promise<{image:string, name:string, size: number, type: string}>}
     */
    getImageFromUser: function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.visibility = "hidden";
        document.body.appendChild(fileInput);
        return new Promise(resolve => {
            fileInput.onchange = function () {
                const reader = new FileReader();
                reader.onload = () => {
                    const dataURL = reader.result;
                    let type = this.files[0].type.replace('.', '');
                    if (!type) {
                        type = this.files[0].name.split('.').pop() || '';
                    }
                    fileInput.outerHTML = '';
                    resolve({
                        image: dataURL,
                        name: this.files[0].name,
                        size: this.files[0].size,
                        type: type,
                    });
                };
                reader.readAsDataURL(this.files[0]);
            };
            fileInput.click();
        });
    },
    uploadImage: async function () {
        const image = await this.getImageFromUser();
        if (!image || !image.image) {
            return null; //'cancelled';
        }
        return await this.fetch('../api/v1/media.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(image)
        })
    },
    readTextFile: function (accept = 'application/json') {
        return new Promise(resolve => {
            const fileInput = document.createElement("input");
            fileInput.setAttribute("type", "file");
            if (accept) {
                fileInput.setAttribute('accept', accept);
            }
            fileInput.onchange = async function () {
                const formData = {};
                formData.value = await V1.uploadFileInputAsText(fileInput.files[0]);
                formData.file_input = fileInput.files[0];
                fileInput.outerHTML = "";
                resolve(formData);
            };
            document.body.appendChild(fileInput);
            fileInput.click();
        });
    },
    jsonToURLEncodedArray: function (json) {
        if (!json || typeof json !== "object") {
            return "";
        }
        let uri = "";
        const keys = Object.keys(json);
        keys.forEach(key => {
            const value = json[key];
            switch (typeof value) {
                case "string":
                    uri += "&" + key + "=" + encodeURIComponent(value);
                    break;
                case "number":
                    uri += "&" + key + "=" + encodeURIComponent(value);
                    break;
                case "object":
                    if (!value) {
                        uri += "&" + key + "=";
                    } else if (Array.isArray(value)) {
                        let text = "";
                        value.forEach(v => {
                            text += "&" + key + "=" + v;
                        });
                        uri += text;
                    }
                    break;
            }
        });
        return uri.substring(1);
    },
    formDataToJSON: function (json) {
        let checkboxes = [];
        if (json instanceof HTMLFormElement && json.tagName && json.tagName.toLowerCase() === "form") {
            checkboxes = json.querySelectorAll('[type=checkbox]');
            json = new FormData(json);
        }
        if (json instanceof FormData) {
            const formData = json;
            json = {};
            for (const [key, value] of formData.entries()) {
                //console.log(key, value);
                if (key.endsWith("[]")) {
                    if (Array.isArray(json[key])) {
                        json[key].push(value);
                    } else {
                        json[key] = [value];
                    }
                } else {
                    json[key] = value;
                }
            }
        }
        try {
            checkboxes.forEach(checkbox => {
                const name = checkbox.getAttribute('name');
                json[name] = checkbox.checked;
            });
        } catch (e) {
            console.error(e)
        }

        if (!json || typeof json != "object") {
            return {};
        } else {
            return json;
        }
    },
    errorHandler: function (error) {
        console.error(error);
    },
    createAutoComplete: function (dataArray = ['test', 'test2'], onAddResults = () => {
    }, key) {
        const outerContainer = document.createElement('div');
        const autocomplete = document.createElement('div');
        autocomplete.className = 'autocomplete';
        const input = document.createElement('input');
        input.type = 'text';

        autocomplete.appendChild(input);
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        outerContainer.appendChild(autocomplete);
        outerContainer.appendChild(resultContainer);

        const usedData = key ? dataArray.map(a => a[key]) : dataArray;
        applyAutocomplete(input, usedData);

        function applyAutocomplete(inp, arr) {
            if (!inp.id) {
                inp.id = "";
            }

            let currentFocus;

            function onInput(e) {
                let a, b, i, val = inp.value;
                closeAllLists();
                currentFocus = -1;
                a = document.createElement("DIV");
                a.setAttribute("id", inp.id + "autocomplete-list");
                a.setAttribute("class", "autocomplete-items");
                inp.parentNode.appendChild(a);


                for (i = 0; i < arr.length; i++) {
                    if (!val || arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                        b = document.createElement("DIV");
                        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                        b.innerHTML += arr[i].substr(val.length);
                        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                        b.addEventListener("click", function (e) {
                            let result = null;
                            if (typeof onAddResults === 'function') {
                                result = onAddResults(this.getElementsByTagName("input")[0].value, i, arr);
                            }
                            if (!result) {
                                inp.value = this.getElementsByTagName("input")[0].value;
                            }
                            closeAllLists();
                        });
                        a.appendChild(b);
                    }
                }
            }

            inp.oninput = onInput;
            inp.onkeydown = function (e) {
                let x = document.getElementById(inp.id + "autocomplete-list");
                if (x) x = x.getElementsByTagName("div");
                if (e.keyCode === 40) {
                    currentFocus++;
                    addActive(x);
                } else if (e.keyCode === 38) { //up
                    currentFocus--;
                    addActive(x);
                } else if (e.keyCode === 13) {
                    e.preventDefault();
                    if (currentFocus > -1) {
                        if (x) x[currentFocus].click();
                    }
                }
            };
            inp.onclick = function (e) {
                if (inp.parentNode.getElementsByClassName("autocomplete-items").length) {
                    closeAllLists()
                } else {
                    const all = document.getElementsByClassName("autocomplete-items");
                    if (all.length) {
                        for (let i = 0; i < all.length; i++) {
                            all[i].parentNode.removeChild(all[i]);
                        }
                    }
                    onInput(e);
                }
            }

            function addActive(x) {
                if (!x) return false;
                removeActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                x[currentFocus].classList.add("autocomplete-active");
            }

            function removeActive(x) {
                for (let i = 0; i < x.length; i++) {
                    x[i].classList.remove("autocomplete-active");
                }
            }

            function closeAllLists(element) {
                const x = inp.parentNode.getElementsByClassName("autocomplete-items");
                for (let i = 0; i < x.length; i++) {
                    if (element !== x[i] && element !== inp) {
                        x[i].parentNode.removeChild(x[i]);
                    }
                }
            }
        }

        return outerContainer;
    },
    createCustomMultiSelect(array, options) {
        if (!options) {
            options = {};
        }
        if (!Array.isArray(array)) {
            return null;
        }
        const addSelectedWInput = (selected, target, array) => {
            const item = document.createElement('div');

            const closeButton = document.createElement('div');
            closeButton.innerHTML = 'X';
            closeButton.onclick = function () {
                array.push(selected);
                item.outerHTML = "";
            };
            closeButton.className = 'close-button';
            item.className = 'entry-item';

            if (options && options.type === 'number') {
                const input = document.createElement('input');
                input.className = 'entry-input';
                input.type = "number";
                input.value = "1";
                input.min = "0";
                const text = document.createElement('div');
                text.innerHTML = " * " + selected;

                item.appendChild(input);
                item.appendChild(text);
            } else {
                item.innerHTML = selected;
            }

            item.setAttribute('data-value', selected);
            item.appendChild(closeButton);

            const index = array.indexOf(selected);

            if (index !== -1) {
                array.splice(index, 1);
            }
            target.appendChild(item);
            return item;
        };
        const autocompleteNode = this.createAutoComplete(array,
            (s, i, array) => addSelectedWInput(s, autocompleteNode.querySelector('.result-container'), array),
            options.key
        );
        if (options.id) {
            autocompleteNode.id = options.id;
        }
        if (options.type) {
            autocompleteNode.setAttribute('data-type', options.type);
        }
        if (options.value) {
            const entryParent = autocompleteNode.querySelector('.result-container');

            options.value.forEach((d, i) => {
                if (options.type === 'number') {
                    if (d) {
                        d = options.key ? array.find(a => a.id + "" === i + "")[options.key] : d;
                    }
                } else if (d) {
                    d = options.key ? array.find(a => a.id + "" === d + "")[options.key] : d;
                }
                if (d) {
                    addSelectedWInput(d, entryParent, array);
                }


            })

        }
        return autocompleteNode;
    },
    readDataFromMultiSelect(id) {
        const node = document.getElementById(id);
        const output = []
        if (!node) {
            return output;
        }
        node.querySelectorAll('.result-container .entry-item').forEach(node => {
            const value = node.getAttribute('data-value') || '';
            const input = node.querySelector('input');

            if (input) {
                const obj = {};
                obj[value] = Number(input.value);
                output.push(obj);
            } else {
                output.push(value);
            }
        });
        return output;
    }
}
