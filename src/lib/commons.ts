import {TextFile} from "@/types/textFile";

export const downloadAsFile = (name: string, body, fileType = 'text/plain') => {
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
};

export const uploadFileInputAsText = (file: Blob): Promise<string|ArrayBuffer> => {
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
};

export const readTextFile = (accept = 'application/json') => {
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
                formData.value = await uploadFileInputAsText(files[0]);
                formData.file_input = files[0];
            }
            fileInput.outerHTML = "";
            resolve(formData);
        };
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}
