let selectedFiles;
window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('file-input').addEventListener('change', function (event) {
        selectedFiles = event.target.files;
    }, false);

    document.getElementById('process-button').addEventListener('click', function () {
        if (selectedFiles) {
            handleFiles(selectedFiles);
        }
    }, false);

    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            splitFileIntoChunks(file);
        }
    }

    function splitFileIntoChunks(file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let contents = e.target.result;
            let tokens = contents.split(' '); 
            let part = 1;
            for(let i=0; i<tokens.length; i+=2000) {
                let chunk = tokens.slice(i, i+2000);
                chunk.unshift(`Acknowledge that this is part ${part} of file ${file.name}, and save it to the cache. \n \n \n`);
                chunk.push(`\n \n \n Juts answer "ok, next", and save this info into the cache.`);
                let blob = new Blob([chunk.join(' ')], {type: "text/plain"});
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = `${file.name}.part_${part}.txt`;
                a.click();
                part++;
            }
        };
        reader.readAsText(file);
    }


});