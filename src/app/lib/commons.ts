import {TextFile} from "@/app/types/textFile";

export const Commons = {
    downloadAsFile: function (name, body, fileType = 'text/plain') {
        if (!name) {
            name = Math.floor(new Date().getTime() / 360000) + ".json";
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
    uploadFileInputAsText: function (file: Blob): Promise<string|ArrayBuffer> {
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

    readTextFile: function (accept = 'application/json') {
        return new Promise(resolve => {
            const fileInput = document.createElement("input");
            fileInput.setAttribute("type", "file");
            if (accept) {
                fileInput.setAttribute('accept', accept);
            }
            fileInput.onchange = async function () {
                const formData: TextFile = {
                    value: ''
                };
                const files = fileInput.files as FileList;
                if (files && files.length) {
                    formData.value = await Commons.uploadFileInputAsText(files[0]);
                    formData.file_input = files[0];
                }
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
    }
}
