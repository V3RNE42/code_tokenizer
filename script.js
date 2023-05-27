window.addEventListener('DOMContentLoaded', () => {
    let selectedFiles;
    let CHUNK_SIZE = 2000; //MAX TOKENS = 2048
    let chunks = [];
    let currentChunkIndex = 0;

    document.getElementById('folder-input').addEventListener('change', function (event) {
        document.getElementById('file-input').disabled = true;
        document.getElementById('file-input').display = 'none';
        selectedFiles = event.target.files;
        handleFiles(selectedFiles);
    }, false);

    document.getElementById('file-input').addEventListener('change', function (event) {
        document.getElementById('folder-input').disabled = true;
        document.getElementById('folder-input').display = 'none';
        selectedFiles = event.target.files;
        handleFiles(selectedFiles);
    }, false);

    document.getElementById('copy-button').addEventListener('click', function () {
        document.getElementById('process-button').disabled = true;
        document.getElementById('process-button').style.display = 'none';
        if (chunks.length > 0 && currentChunkIndex < chunks.length) {
            let textarea = document.createElement('textarea');
            textarea.textContent = chunks[currentChunkIndex].content;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.getElementById('copy-button').innerText = `Copia al portapapeles (${Math.round((currentChunkIndex + 1) / chunks.length * 100)}%)`;
                currentChunkIndex++;
            } catch (err) {
                console.error('Could not copy text: ', err);
            } finally {
                document.body.removeChild(textarea);
            }
        }
        if (document.getElementById('copy-button').innerText == 'Copia al portapapeles (100%)') {
            //display a button to reload page
        }
    }, false);

    document.getElementById('process-button').addEventListener('click', () => {
        document.getElementById('copy-button').disabled = true;
        document.getElementById('copy-button').style.display = 'none';
        for(let i = 0; i < chunks.length; i++) {
            let blob = new Blob([chunks[i].content], {type: "text/plain"});
            let url = URL.createObjectURL(blob);
            let a = document.createElement("a");
            a.href = url;
            a.download = `${chunks[i].filepath}.part_${i+1}.txt`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        //display a button to reload page
    });

    function handleFiles(files) {
        let longestPathLenght = 0, longestNameLenght = 0;
        for (let index = 0; index < files.length; index++) {
            if (files[index].webkitRelativePath.length>longestPathLenght) {
                longestPathLenght = files[index].webkitRelativePath.length;
            }
            if (files[index].name.length>longestNameLenght) {
                longestNameLenght = files[index].name.length;
            }
        }
        CHUNK_SIZE -= longestPathLenght;
        CHUNK_SIZE -= longestNameLenght;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let relativePath = file.webkitRelativePath;
            splitFileIntoChunks(file, relativePath);
        }
    }

    function splitFileIntoChunks(file, relativePath) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let contents = e.target.result;
            let tokens = contents.split(' '); 
            let part = 1;
            for(let i=0; i<tokens.length; i+=CHUNK_SIZE) {
                let chunk = tokens.slice(i, i+CHUNK_SIZE);
                chunk.unshift(`Acknowledge that this is part ${part} of file ${file.name}, with relative path ${relativePath}, and save it to the cache. \n \n \n`);
                chunk.push(`\n \n \n Just answer "ok, next", and save this info into the cache.`);
                chunks.push({content: chunk.join(' '), filepath: `${relativePath}.part_${part}.txt`});
                part++;
            }
        };
        reader.readAsText(file);
    }
});
