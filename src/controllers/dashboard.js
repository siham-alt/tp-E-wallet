
import { database } from "/models/database.js"; 
const user = JSON.parse(sessionStorage.getItem("user"));
if(!user){
    document.location = "/src/view/login.html";
}
const nom=document.getElementById('greetingName');
nom.textContent=user.name;

const totalCards = user.wallet.cards.reduce(
    (sum, card) => sum + Number(card.balance),
    0
);
const solde = Number(user.wallet.balance) + totalCards;
document.getElementById('availableBalance').textContent= solde;


const credits = user.wallet.transactions.filter(t=>t.type== "credit");
console.log(credits);

const sumcredit= credits.reduce((sum,c) => sum + Number(c.amount),0);
document.getElementById('monthlyIncome').textContent=sumcredit;


const debits = user.wallet.transactions.filter(t=>t.type== "debit");
const sumdebits= debits.reduce((sum,d) => sum + Number(d.amount),0);
document.getElementById('monthlyExpenses').textContent=sumdebits;


const today = new Date();
const activeCardsCount = user.wallet.cards.filter(card => {
    const [day, month, year] = card.expiry.split('-');
    const expiryDate = new Date(`20${year}`, month - 1, day); 
    return expiryDate >= today; 
}).length;
document.getElementById('activeCards').textContent = activeCardsCount;



const beneficiarySelect = document.getElementById("beneficiary");
const sourceCardSelect = document.getElementById("sourceCard");


beneficiarySelect.innerHTML = "";

const otherUsers = database.users.filter(u => u.id !== user.id);

otherUsers.forEach(u => {
    u.wallet.cards.forEach(card => {
        const option = document.createElement("option");
        option.value = card.numcards; 
        option.textContent = u.name +"(" + card.numcards +")";
        beneficiarySelect.appendChild(option);
    });
});



sourceCardSelect.innerHTML = "";

user.wallet.cards.forEach(c => {
    const option = document.createElement("option");
    option.value = c.numcards; 
    option.textContent = c.numcards+ "(Solde:" +c.balance+ " "+ user.wallet.currency +")";
    sourceCardSelect.appendChild(option);
});