const showCorpInfo=document.getElementById('show-corp-info');
const addNewCorpBotton=document.getElementById('add-New-corp-botton');
const showData=document.getElementById('show-data');
const formSend=document.getElementById('data_form');

const data_form=document.getElementById('add-new-corp');

addNewCorpBotton.addEventListener('click', (e)=>{
    showCorpInfo.classList.toggle('hiden');
    data_form.classList.toggle('hiden');
})

showData.addEventListener('click', (e)=>{
    showCorpInfo.classList.toggle('hiden');
    data_form.classList.toggle('hiden');
})


formSend.addEventListener('submit', function(event) {
    event.preventDefault();
});