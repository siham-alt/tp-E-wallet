import finduserbymail from "/models/database.js";
const btn = document.getElementById('submitbtn');
btn.addEventListener("click",handlelog);

function handlelog(){

const mail=document.getElementById('mail').value;
const password=document.getElementById('password').value;
setTimeout(()=>{
     const user= finduserbymail(mail,password);
    if(user){
        sessionStorage.setItem("user", JSON.stringify(user));
        document.location = '/src/view/dashboard.html';       
    }
    else{
        alert("Bad credentials");
    }
  },2000);
  btn.textContent="checking..."
}