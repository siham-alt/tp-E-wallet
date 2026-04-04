import {getbeneficiaries ,finduserbyaccount,findbeneficiarieByid,getcards,findcards} from "../model/database.js";
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// DOM elements
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn=document.getElementById("submitTransferBtn");


const RechargerBtn = document.getElementById("quickTopup");
const submitRechargeBtn=document.getElementById("submitRechargerBtn");
const RechargeSection = document.getElementById("RechargerPopup");
const closeRechargeBtn = document.getElementById("closeRechargeBtn");
const cancelRechargeBtn = document.getElementById("cancelRechargeBtn");
const moyenpaiment = document.getElementById("moyenpaiment");


// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// Events
  transferBtn.addEventListener("click", handleTransfersection);
  closeTransferBtn.addEventListener("click", closeTransfer);
  cancelTransferBtn.addEventListener("click", closeTransfer);
  submitTransferBtn.addEventListener("click",handleTransfer)


  RechargerBtn.addEventListener("click", handleRechargesection);
  closeRechargerBtn.addEventListener("click", closeRecharger);
  cancelRechargeBtn.addEventListener("click", closeRecharger);
  submitRechargeBtn.addEventListener("click",handleRecharger);

// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
};

function renderDashboard(){
const dashboardData = getDashboardData();
if (dashboardData) {
  greetingName.textContent = dashboardData.userName;
  currentDate.textContent = dashboardData.currentDate;
  solde.textContent = dashboardData.availableBalance;
  incomeElement.textContent = dashboardData.monthlyIncome;
  expensesElement.textContent = dashboardData.monthlyExpenses;
  activecards.textContent = dashboardData.activeCards;
}
// Display transactions
transactionsList.innerHTML = "";
user.wallet.transactions.forEach(transaction => {
  const transactionItem = document.createElement("div");
  transactionItem.className = "transaction-item";
  transactionItem.innerHTML = `
    <div>${transaction.date}</div>
    <div>${transaction.amount} MAD</div>
    <div>${transaction.type}</div>
    <div>${transaction.status}</div>

  `;
  transactionsList.appendChild(transactionItem);
});

}
renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}

function handleTransfersection() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}



 function handleRechargesection(){
    RechargeSection.classList.add("active");
  document.body.classList.add("popup-open");
 }

function closeRecharger() {
  RechargeSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}


// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}

renderBeneficiaries();
function renderCards() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard.appendChild(option);
  });
}

renderCards();
function renderCard() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    moyenpaiment.appendChild(option);
  });
}
renderCard();

//###################################  Transfer  #####################################################//

// check function 

/* function checkUser(numcompte, callback) {
  setTimeout(() => {
    const destinataire = finduserbyaccount(numcompte);
    if (destinataire) {
      callback(destinataire);
    } else {
      console.log("Destinataire non trouvé");
    }
  }, 500);
}

function checkSolde(exp, amount, callback) {
  setTimeout(() => {
    const solde = exp.wallet.balance;
    if (solde >= amount) {
      callback("Solde suffisant");
    } else {
      callback("Solde insuffisant");
    }
  }, 400);
}

function updateSolde(exp, destinataire, amount, callback) {
  setTimeout(() => {  
    exp.wallet.balance -= amount;
    destinataire.wallet.balance += amount;
    callback("Solde mis à jour");
  }, 300);
}


function addtransactions(exp, destinataire, amount, callback) {
  setTimeout(() => { 
    // Transaction pour l'expéditeur (débit)
    const transactionDebit = {
      id: Date.now(),
      type: "debit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    // Transaction pour le destinataire (crédit)
    const transactionCredit = {
      id: Date.now() + 1,
      type: "credit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    user.wallet.transactions.push(transactionDebit);
    destinataire.wallet.transactions.push(transactionCredit);
    renderDashboard();
    callback("Transaction enregistrée");
  }, 200);
}


export function transferer(exp, numcompte, amount) {
  console.log("\n DÉBUT DU TRANSFERT ");

  // Étape 1: Vérifier le destinataire
  checkUser(numcompte, function afterCheckUser(destinataire) {
    console.log("Étape 1: Destinataire trouvé -", destinataire.name);

    // Étape 2: Vérifier le solde
    checkSolde(exp, amount, function afterCheckSolde(soldemessage) {
      console.log(" Étape 2:", soldemessage);

      if (soldemessage.includes("Solde suffisant")) {
        // Étape 3: Mettre à jour les soldes
        updateSolde(exp, destinataire, amount, function afterUpdateSolde(updatemessage) {
          console.log(" Étape 3:", updatemessage);

          // Étape 4: Enregistrer la transaction
          addtransactions(exp, destinataire, amount, function afterAddTransactions(transactionMessage) {
            console.log(" Étape 4:", transactionMessage);
            console.log(`Transfert de ${amount} réussi!`);
          });
        });
      }
    });
  });
}


function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

  
  transferer(user, beneficiaryAccount, amount);

} 

function checkUser(numcompte, callback){
     setTimeout(()=>{
     const beneficiary=finduserbyaccount(numcompte);
     if(beneficiary){
        callback(beneficiary);
     }
     else{
        callback("beneficiary not found");
     }
     },2000);
}
*/


function checkUser(numcompte) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const beneficiary = finduserbyaccount(numcompte);

            if (beneficiary) {
                resolve(beneficiary);
            } else {
                reject("beneficiary not found");
            }
        }, 2000);
    });
}



/*
function checkSolde(expediteur,amount,callback){
  setTimeout(()=>{
      if(expediteur.wallet.balance>amount){
        callback("Sufficient balance");
      }else{
        callback("Insufficient balance");
      }
  },3000)
}
*/

function checkSolde(expediteur, amount) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (expediteur.wallet.balance > amount) {
                resolve("Sufficient balance");
            } else {
                reject("Insufficient balance");
            }
        }, 3000);
    });
}

/*
function updateSolde(expediteur,destinataire,amount,callback){
    setTimeout(()=>{
        expediteur.wallet.balance-=amount;
        destinataire.wallet.balance+=amount;
        callback("update balance done");
  },200);
}
*/



function updateSolde(expediteur, destinataire, amount) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            expediteur.wallet.balance -= amount;
            destinataire.wallet.balance += amount;
            resolve("update balance done");
        }, 200);
    });
}


/*
function addtransactions(expediteur,destinataire,amount,callback){
   setTimeout(()=>{
    // create credit transaction
 const credit={
    id:Date.now(),
    type:"credit",
    amount: amount,
    date: Date.now().toLocaleString(),
    from: expediteur.name
 }
 //create debit transaction
const debit={
    id:Date.now(),
    type:"debit",
    amount: amount,
    date: Date.now().toLocaleString(),
    to: destinataire.name, 
 }
  expediteur.wallet.transactions.push(debit);
  destinataire.wallet.transactions.push(credit);
   callback("transaction added successfully");
   },3000)
}

*/
function addtransactions(expediteur, destinataire, amount) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            const credit = {
                id: Date.now(),
                type: "credit",
                amount: amount,
                date: new Date().toLocaleString(),
                from: expediteur.name
            };

            const debit = {
                id: Date.now(),
                type: "debit",
                amount: amount,
                date: new Date().toLocaleString(),
                to: destinataire.name
            };

            expediteur.wallet.transactions.push(debit);
            destinataire.wallet.transactions.push(credit);

            resolve("transaction added successfully");

        }, 3000);
    });
}

// **************************************transfer***************************************************//
/*

function transfer(expediteur,numcompte,amount){

checkUser(numcompte).then(checkSolde())

    checkUser(numcompte,(destinataire)=>{
            console.log("Étape 1: Destinataire trouve -", destinataire.name);
             checkSolde(expediteur,amount,(soldemessage)=>{
                console.log(soldemessage);
                if(soldemessage==="Sufficient balance"){
                    updateSolde(expediteur,destinataire,amount,(updatemessage)=>{
                        if(updatemessage==="update balance done"){
                             addtransactions(expediteur,destinataire,amount,(addtransactionMessage)=>{
                                       console.log(addtransactionMessage); 
                             });
                        }else{
                               console.log(updatemessage);
                        }
                    })
                }
                else{
                     console.log(soldemessage);
                }
             })
    })
} 





function transfer(expediteur, numcompte, amount) {

    checkUser(numcompte)
        .then(d => (console.log("Étape 1: Destinataire trouvé -", d.name), d))

        .then(d => 
            checkSolde(expediteur, amount)
                .then(msg => {
                    console.log(msg); 
                    return d;
                })
        )

        .then(d => 
            updateSolde(expediteur, d, amount)
                .then(msg => {
                    console.log(msg); 
                    return d;
                })
        )

        .then(d => 
            addtransactions(expediteur, d, amount)
                .then(msg => {
                console.log(msg); 
                renderDashboard();
                })
            
        )
  
        .catch(err => console.log("Erreur :", err));
}
*/

async function transfer(expediteur, numcompte, amount) {
  try {
    const destinataire = await checkUser(numcompte);
    console.log("Étape 1: Destinataire trouvé -", destinataire.name);

    const soldeMsg = await checkSolde(expediteur, amount);
    console.log(soldeMsg);

    const updateMsg = await updateSolde(expediteur, destinataire, amount);
    console.log(updateMsg);

    const transactionMsg = await addtransactions(expediteur, destinataire, amount);
    console.log(transactionMsg);

    renderDashboard();

  } catch (err) {
    console.log("Erreur :", err);
  }
}

function checkMontant(montant){
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            if (isNaN(montant) || montant < 10 || montant > 5000) {
                reject("montant n'est pas valide");
            } else {
                resolve("montant valide");
            }

        }, 2000);
    });
}


function checkMoyen(){
return new Promise((resolve,reject)=>{
    setTimeout(()=>{
   const moyens =getcards(user.id);
   if(moyens){
resolve("utilisateur possède au moins un moyen de paiement");
   }else{
    reject("utilisateur ne possède aucune moyen de paiemnt ");
   }
    },2000);
})
}


function checkvalidite(moyenpaiment){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
const card=findcards(moyenpaiment,user.id);
if(card){
   const expiryDate = new Date(card.expiry); 
      const today = new Date();
      today.setDate(1); today.setHours(0, 0, 0, 0);
      if(today>expiryDate){
         reject("carte expiré");
      }else{
        resolve("trouve");
      }     
}else{
    reject("carte non trouvé!");
}
        },2000);
    })

}

function updatewallet(amount) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            user.wallet.balance += amount;
            resolve("update balance done");
        }, 200);
    });
}

function addRecharge( amount, status) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            const recharge = {
                id: Date.now(),
                type: "recharge",
                amount: amount,
                date: new Date().toLocaleString(),
                from: user.name,
                status:status
            };
            user.wallet.transactions.push(recharge);

            resolve("recharge added successfully");
           
    
    

        }, 2000);
    });
}
/*
function recharger(moyenpaiment, amount) {

    checkMontant(amount)
        .then(msg => {
            console.log(msg);
            return checkMoyen();
        })
        .then(msg => {
            console.log(msg);
            return checkvalidite(moyenpaiment);
        })
        .then(msg => {
            console.log(msg);
            return updatewallet(amount);
        })
        .then(msg => {
            console.log(msg);
            return addRecharge(amount, "succes");
        })
        .then(msg => {
            console.log(msg);
            renderDashboard();
        })
        .catch(err => {
            console.log("Erreur :", err);

            return addRecharge(amount, "echoué") 
                .then(msg => {
                    console.log(msg);
                    renderDashboard();
                });
        });
}

*/
async function recharger(moyenpaiment, amount) {
  try {
    const m1 = await checkMontant(amount);
    console.log(m1);

    const m2 = await checkMoyen();
    console.log(m2);

    const m3 = await checkvalidite(moyenpaiment);
    console.log(m3);

    const m4 = await updatewallet(amount);
    console.log(m4);

    const m5 = await addRecharge(amount, "succes");
    console.log(m5);

    renderDashboard();

  } catch (err) {
    console.log("Erreur :", err);

    // même en cas d'erreur → transaction enregistrée
    const msg = await addRecharge(amount, "echoué");
    console.log(msg);
    renderDashboard();
  }
}

function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;
  const amount = Number(document.getElementById("amount").value);

transfer(user, beneficiaryAccount, amount);
} 

function handleRecharger(e){
     e.preventDefault();
    const moyenpaiment = document.getElementById("moyenpaiment").value;
    const montant = Number(document.getElementById("montant").value);
    recharger(moyenpaiment,montant);
}

/*
    function func1(number,callback){
        console.log("start function");
       if(number%2===0){
        console.log("start callback");
        callback(number);
        console.log("end callback");
       }else{
        
       }
       console.log("end function");
    }

    function produit(number){
        console.log("the result is : ", (number*number));
    }

    func1(4,produit);
    */