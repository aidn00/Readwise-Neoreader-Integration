function checkForNewFiles() {
    var folderId = 'YOUR_FOLDER_ID'; // Replace with your folder ID
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFilesByType(MimeType.PLAIN_TEXT);
    var lastCheckedTime = PropertiesService.getScriptProperties().getProperty('lastChecked');

    while (files.hasNext()) {
        var file = files.next();

        // Check if the file is a .txt file
        if (isTxtFile(file)) {
            var lastUpdated = file.getLastUpdated();

            if (new Date(lastUpdated).getTime() > new Date(lastCheckedTime).getTime()) {
                // New or updated .txt file found
                var content = readFileContent(file);
                var highlights = parseHighlights(content);
                // TODO: Process and upload these highlights to Readwise
            }
        }
    }

    // Update the last checked time
    PropertiesService.getScriptProperties().setProperty('lastChecked', new Date().toISOString());
}

function createTrigger() {
    ScriptApp.newTrigger('checkForNewFiles')
        .timeBased()
        .everyHours(6)
        .create();
}

function readFileContent(file) {
    var content = file.getBlob().getDataAsString();
    return content;
}

function isTxtFile(file) {
    var fileName = file.getName();
    return fileName.endsWith('.txt');
}

function parseHighlights(textContent) {
    const lines = textContent.trim().split("\n");
    const bookInfo = lines[0].split("<<")[1].split(">>");
    const title = bookInfo[0].trim();
    const author = bookInfo[1].trim();
    let highlights = [];
    let currentHighlight = { text: '', title: title, author: author, note: '' };

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '-------------------') {
            highlights.push(currentHighlight);
            currentHighlight = { text: '', title: title, author: author, note: '' };
        } else if (lines[i].includes("【Note】")) {
            currentHighlight.note = lines[i].split("【Note】")[1].trim();
        } else {
            currentHighlight.text += lines[i] + '\n';
        }
    }

    // Add the last highlight if it's not empty
    if (currentHighlight.text.trim() !== '') {
        highlights.push(currentHighlight);
    }

    return highlights.filter(hl => hl.text.trim() !== ''); // Filter out empty highlights
}



function setReadwiseToken() {
    var token = "YOUR_READWISE_AUTHTOKEN"; // Your Readwise access token
    PropertiesService.getScriptProperties().setProperty('readwiseToken', token);
}

function postToReadwise(highlightsArray) {
    var token = PropertiesService.getScriptProperties().getProperty('readwiseToken');
    var url = 'https://readwise.io/api/v2/highlights/';
    var payload = {
        'highlights': highlightsArray
    };
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'headers': {
            'Authorization': 'Token ' + token
        },
        'payload': JSON.stringify(payload)
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
        Logger.log("Successfully posted to Readwise. Response: " + response.getContentText());
    } catch (error) {
        Logger.log("Error posting to Readwise: " + error.toString());
    }
}

function checkForNewFiles() {
    var folderId = 'YOUR_FOLDER_ID'; // Replace with your folder ID
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFilesByType(MimeType.PLAIN_TEXT);
    var lastCheckedTime = PropertiesService.getScriptProperties().getProperty('lastChecked');

    while (files.hasNext()) {
        var file = files.next();

        // Check if the file is a .txt file
        if (isTxtFile(file)) {
            var lastUpdated = file.getLastUpdated();

            if (new Date(lastUpdated).getTime() > new Date(lastCheckedTime).getTime()) {
                // New or updated .txt file found
                var content = readFileContent(file);
                var highlights = parseHighlights(content);
                // Process and upload these highlights to Readwise
                postToReadwise(highlights);
            }
        }
    }

    // Update the last checked time
    PropertiesService.getScriptProperties().setProperty('lastChecked', new Date().toISOString());
}
