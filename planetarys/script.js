const CLIENT_ID = '225198933559-4tpm7iveud9fhcrouae75t3kuncik6u7.apps.googleusercontent.com';
const API_KEY = 'AIzaSyD0F_FZs8a36LkhL9kS2UAQ0V99x0qzpQo';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const buttonNewPl = document.getElementById('add-New-pl-botton');
const formSend = document.getElementById('data_form');
const showCorpInfo = document.getElementById('show-corp-pl');
const corpId = document.getElementById('corpId');
const showData = document.getElementById('show-data');
const spiner = document.getElementById('charging');

let gapiInited = false;
let gisInited = false;
let tokenClient;
let storedToken = getTokenFromLocalStorage();

buttonNewPl.addEventListener('click', async (e) => {
    document.getElementById('add-new-planetary').classList.toggle('hiden');
    document.getElementById('show-corp-pl').classList.toggle('hiden');
});

async function gapiLoaded() {
    await new Promise((resolve) => gapi.load('client', resolve));
    await initializeGapiClient();
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
    handleAuthClick();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

async function handleAuthClick() {
    if (isTokenValid(storedToken)) {
        gapi.client.setToken(storedToken);
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh';
        await listMajors();
    } else {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            storedToken = { access_token: resp.access_token, expires_at: new Date().getTime() + (resp.expires_in * 1000) };
            saveTokenToLocalStorage(storedToken);
            document.getElementById('signout_button').style.visibility = 'visible';
            document.getElementById('authorize_button').innerText = 'Refresh';
            await listMajors();
        };
        tokenClient.requestAccessToken({ prompt: 'consent' });
    }
}

function isTokenValid(token) {
    if (!token || !token.access_token || !token.expires_at) {
        return false;
    }
    const now = new Date().getTime();
    return now < token.expires_at;
}

function getTokenFromLocalStorage() {
    const tokenString = localStorage.getItem('google_access_token');
    return JSON.parse(tokenString);
}

function saveTokenToLocalStorage(token) {
    localStorage.setItem('google_access_token', JSON.stringify(token));
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.visibility = 'hidden';
    }
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

async function listMajors() {
    let response;
    try {
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1DNbjuuy8vfS4vafrO_XiC1VM6ALGmYJFNIuUyV71rII',
            range: 'planetarys!A2:E',
        });
        const data = [];
        const values = response.result.values;
        if (values.length > 0) {
            values.forEach((row) => {
                if (row[0] === id) {
                    const rowData = {
                        fecha: row[1],
                        PLreci: row[2],
                        PLGive: row[3],
                        DAteGive: row[4],
                        CorpId: row[0],
                    };
                    data.push(rowData);
                }
            });
            updateTable(data);
        } else {
            console.log('No data found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateTable(data) {
    const tableBody = document.getElementById('data_table_body');
    tableBody.innerHTML = '';
    const corpsId = {
        1: 'Prodigios (PROS)',
        2: 'Separatist Collective (SCNO)',
        3: '"ESTA" Academia Corpora (ESTA)',
        4: 'Los Larrys (LLRS)',
        5: 'Pulverizadores de panoch (UWUX)',
        6: 'Space Raccoons 2.0 (RAC2)',
        7: 'Liberty life (Lll)',
    };
    document.getElementById('corp-name').innerText = corpsId[data[0].CorpId];
    corpId.value = data[0].CorpId;
    data.forEach(item => {
        const row = `
            <tr>
            <td>${item.fecha}</td>
            <td>${item.PLreci}</td>
            <td>${item.PLGive}</td>
            <td>${item.DAteGive}</td>
            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

async function addNewElement() {
    spiner.classList.toggle('hiden');
    const newPL = {
        fecha: document.getElementById('fecha').value,
        Plreci: document.getElementById('Plreci').value,
        corpId: document.getElementById('corpId').value,
    }
    let response;
    try {
        response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: '1DNbjuuy8vfS4vafrO_XiC1VM6ALGmYJFNIuUyV71rII',
            range: 'planetarys!A:E',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [parseInt(corpId.value), newPL.fecha, newPL.Plreci, newPL.Plreci - (newPL.Plreci * 0.10), ''],
                ],
            },
        });
        if (response.status == 200) {
            document.getElementById('fecha').value = '';
            document.getElementById('Plreci').value = '';
            listMajors();
            spiner.classList.toggle('hiden');
        } else {
            spiner.classList.toggle('hiden');
        }
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
    document.getElementById('content').innerText = 'New element added successfully.';
}

showData.addEventListener('click', (e) => {
    showCorpInfo.classList.toggle('hiden');
    data_form.classList.toggle('hiden');
});

formSend.addEventListener('submit', function (event) {
    event.preventDefault();
});

document.addEventListener('DOMContentLoaded', async () => {
    await gapiLoaded();

});
