const cl = console.log;

const postContainer = document.getElementById('postContainer')
const postForm = document.getElementById('postForm')
const title = document.getElementById('title')
const content = document.getElementById('content')
const userId = document.getElementById('userId')
const addPost = document.getElementById('addPost')
const updatePost = document.getElementById('updatePost')
const loader = document.getElementById('loader')

function snackBar(title, icon){
    Swal.fire({
        title,
        icon,
        timer : 2000
    })
}


let Base_Url = 'https://jsonplaceholder.typicode.com';

let Post_Url = `${Base_Url}/posts`



function fetchAllPosts(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", Post_Url)
    xhr.setRequestHeader('Auth', 'Token from LS');

    xhr.onload = function(){
        cl(xhr.readyState)
        if(xhr.status >= 200 && xhr.status < 300 && xhr.readyState === 4){
            let data = JSON.parse(xhr.response)

            cl(data)
            createCards(data);
        }
    }
    xhr.send(null);

}

fetchAllPosts();

const createCards = (arr) =>{
    let result = arr.map(post =>{
        return `
                <div class="card mb-3 shadow rounded" id = "${post.id}">
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${post.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>                
                    </div>
                </div>    `
    }).join('')
    postContainer.innerHTML = result;
    
}

const onSubmitPost = (eve) =>{
    eve.preventDefault();

    let postObj = {
        title : title.value,
        body : content.value,
        userId : userId.value,        
    }
    

    eve.target.reset();

    loader.classList.remove('d-none')

    let xhr = new XMLHttpRequest();

    xhr.open("POST", Post_Url);
    xhr.setRequestHeader("Auth", "Token from LS")

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status < 300){
            let data = JSON.parse(xhr.response);
            cl(data)
            // create new card in UI
            let card = document.createElement('div');
             card.className = "card mb-3 shadow rounded";
                card.id = data.id;
                     card.innerHTML = `
                        <div class="card-header">
                        <h3 class="m-0">${postObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${postObj.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>                
                    </div>    `

                 postContainer.append(card);

                 snackBar("Created Successfully", "success")
        }else{
            // API call fail
            let err = "Something went Wrong while creating"
        }
        loader.classList.add('d-none')
    }
    xhr.send (JSON.stringify(postObj))

    
}

const onEdit = (ele) =>{

    loader.classList.remove('d-none')

    let Edit_Id = ele.closest('.card').id;
    cl(Edit_Id);

    localStorage.setItem('Edit_Id', Edit_Id);
    let Edit_Url = `${Post_Url}/${Edit_Id}`

    let xhr = new XMLHttpRequest()

    xhr.open("GET", Edit_Url)

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status < 300){
            let res = JSON.parse(xhr.response)
            cl(res)
            title.value = res.title;
            content.value = res.body;
            userId.value = res.userId;

            addPost.classList.add('d-none');
            updatePost.classList.remove('d-none')

        }else{
            snackBar("Something Went wrong !", "error")
        }

        loader.classList.add('d-none')
    }
    xhr.send(null)
}

const onRemove = (ele) =>{

    Swal.fire({
  title: "Do you want to save the changes?",
  showCancelButton: true,
  confirmButtonText: "Remove",
 
}).then((result) => {
  if (result.isConfirmed) {
     let Remove_Id = ele.closest('.card').id;
    cl(Remove_Id);

    let Remove_Url = `${Base_Url}/posts/${Remove_Id}`;
    
    let xhr = new XMLHttpRequest()

    xhr.open("DELETE", Remove_Url)

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status < 300){
            let res = xhr.response;
            cl(res);
            snackBar("The Post is Removed Successfully", "success")
            ele.closest('.card').remove()
        }else{
            snackBar("Something went Wrong", "error")
        }
    }
    xhr.send(null)
    
  }
})
   
}

const onUpdatePost = () =>{
    let Update_Id = localStorage.getItem('Edit_Id');

    let updateObj = {
        title : title.value,
        body : content.value,
        userId : userId.value,
        id : Update_Id,
    }
    cl(updateObj);
    
    let Update_Url = `${Post_Url}/${Update_Id}`
    //API Call

    let xhr = new XMLHttpRequest()

    xhr.open("PATCH", Update_Url);

    xhr.onload = function(){
        if(xhr.status >= 200 && xhr.status < 300){
            let res = xhr.response;
            cl(res);

            let card = document.getElementById(Update_Id);
            let h3 = card.querySelector('.card-header h3').innerText = updateObj.title
            let p = card.querySelector('.card-body p').innerText = updateObj.body

            postForm.reset()

            addPost.classList.remove('d-none');
            updatePost.classList.add('d-none');

            snackBar("Post Updated successfully", "success")


        }else{
            snackBar("Something went Wrong !", "error")

        }
    }

    xhr.send(JSON.stringify(updateObj))
}

updatePost.addEventListener("click", onUpdatePost);

postForm.addEventListener("submit", onSubmitPost);



