import { database } from "/models/database.js";

const user = JSON.parse(sessionStorage.getItem("user"));

const form = document.getElementById("transferForm");


const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transfer-section");
const closeBtn = document.getElementById("closeTransferBtn");
const cancelBtn = document.getElementById("cancelTransferBtn");

transferBtn.addEventListener("click", () => {
    transferSection.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
    transferSection.classList.add("hidden");
});

cancelBtn.addEventListener("click", () => {
    transferSection.classList.add("hidden");
});


form.addEventListener("submit", function(e){
    e.preventDefault();
    
    const amount = Number(document.getElementById("amount").value);
    const fromCard = document.getElementById("sourceCard").value;
    const toCard = document.getElementById("beneficiary").value;

    transfer(amount, fromCard, toCard);
});



function checkAmount(amount, callback){

    setTimeout(()=>{
        if(amount > 0){
            console.log("montant valide");
            callback(null);
        }else{
            callback("montant invalide");
        }
    },500);

}


// 2️⃣ check solde
function checkBalance(card, amount, callback){

    setTimeout(()=>{
        if(card.balance >= amount){
            console.log("solde suffisant");
            callback(null);
        }else{
            callback(" solde insuffisant");
        }
    },500);

}


// 3️⃣ check beneficiaire
function checkBeneficiary(cardNumber, callback){

    setTimeout(()=>{

        const beneficiary = database.users.find(u =>
            u.wallet.cards.some(c => c.numcards === cardNumber)
        );

        if(beneficiary){
            console.log("bénéficiaire trouvé");
            callback(null, beneficiary);
        }else{
            callback(" bénéficiaire introuvable");
        }

    },500);

}
// 4️⃣ creation transaction
function createTransaction(amount, fromCard, toCard, callback){

    setTimeout(()=>{

        const transaction = {
            id: Date.now(),
            type:"debit",
            amount: amount,
            date: new Date().toLocaleDateString(),
            from: fromCard,
            to: toCard
        };

        console.log(" transaction créée");
        callback(null, transaction);

    },500);

}


// 5️⃣ debit
function debit(card, amount, callback){

    setTimeout(()=>{

        card.balance -= amount;
        console.log(" débit effectué");

        callback(null);

    },500);

}


// 6️⃣ credit
function credit(cardNumber, amount, callback){

    setTimeout(()=>{

        database.users.forEach(u=>{
            u.wallet.cards.forEach(c=>{
                if(c.numcards === cardNumber){
                    c.balance += amount;
                }
            });
        });

        console.log(" crédit effectué");

        callback(null);

    },500);

}


// 7️⃣ transfert complet
function transfer(amount, fromCard, toCard){

    const card = user.wallet.cards.find(c => c.numcards === fromCard);

    checkAmount(amount,(err)=>{

        if(err) return alert(err);

        checkBalance(card,amount,(err)=>{

            if(err) return alert(err);

            checkBeneficiary(toCard,(err)=>{

                if(err) return alert(err);

                createTransaction(amount,fromCard,toCard,(err,transaction)=>{

                    if(err) return alert(err);

                    debit(card,amount,(err)=>{

                        if(err) return alert(err);

                        credit(toCard,amount,(err)=>{

                            if(err) return alert(err);

                            user.wallet.transactions.push(transaction);

                            sessionStorage.setItem("user",JSON.stringify(user));

                            alert("transfert réussi");

                        });

                    });

                });

            });

        });

    });

}