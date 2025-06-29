let mainMenuTrigger = document.querySelector('.menu-triger')
let mainMenuContainer = document.querySelector('.main-menu-container')
mainMenuTrigger.addEventListener('click', function(){
  mainMenuContainer.classList.toggle('main-menu-opened')
})

function showPictures(photosArray){
  let pictureTemplate = document.querySelector('#templatePictureExample')
  let pictureExample = pictureTemplate.content.querySelector('.pictureExample')
  let picturesContainer = document.querySelector('.picturesContainer')
  for(let i = 0; i < photosArray.length; i++){
    let photoBlock = pictureExample.cloneNode(true)
    photoBlock.querySelector('.pictureImg').src = '../static/img/photos/' + photosArray[i].src
    photoBlock.querySelector('.pictureComments').innerText = photosArray[i].commentsNumber
    photoBlock.querySelector('.pictureLikes').innerText = photosArray[i].likes
    photoBlock.querySelector('.pictureImg').style.filter = photosArray[i].effect
    picturesContainer.append(photoBlock)
  }
}

function showCheckedPicture(picture) {
  console.log("Received picture data:", picture);
  let pictureContainer = document.querySelector('.openedPictureContainer');
  pictureContainer.querySelector('.openedPictureImg').src = '../static/img/photos/' + picture.src;
  pictureContainer.querySelector('.openedPictureImg').style.filter = picture.effect;
  pictureContainer.querySelector('.openedPictureDescription').innerText = picture.description;
  pictureContainer.querySelector('.pictureComments').innerText = picture.commentsNumber;
  pictureContainer.querySelector('.pictureLikes').innerText = picture.likes;
  let commentsTemplate = document.querySelector('#templateCommentBlock');
  let commentBlock = commentsTemplate.content.querySelector('.commentBlock');
  let pictureCommentsContainer = document.querySelector('.pictureCommentsContainer');
  pictureCommentsContainer.innerHTML = "";
  if (picture.comments && picture.comments.length > 0) {
    for (let i = 0; i < picture.comments.length; i++) {
      let comment = commentBlock.cloneNode(true);
      comment.querySelector('.commentText').innerText = picture.comments[i];
      pictureCommentsContainer.append(comment);
    }
  } else {
    console.log("No comments for this picture");
  }

  pictureContainer.classList.remove('hidden');
}

let picturesContainer = document.querySelector('.picturesContainer')
picturesContainer.addEventListener('click', function(evt){
  if(evt.target.classList.contains('pictureImg')){
    let xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/photos')
    xhr.responseType = 'json'
    let formData = new FormData()
    formData.append('src', evt.target.src.split('/').pop())
    xhr.send(formData)
    xhr.onload = function(){
      showCheckedPicture(xhr.response)
    }
  }
})

let closeButton = document.querySelector('.closeButton')
closeButton.addEventListener('click', function(){
  document.querySelector('.openedPictureContainer').classList.add('hidden')
  document.querySelector('.pictureCommentsContainer').innerHTML = ""
})

let inputUploadFile = document.querySelector('#inputUploadFile')
inputUploadFile.addEventListener('change', function(){
  if(inputUploadFile.files[0].type.includes('image')){
    let reader = new FileReader()
    reader.readAsDataURL(inputUploadFile.files[0])
    reader.addEventListener('load', function(){
      let uploadImage = document.querySelector('.uploadImage')
      uploadImage.src = reader.result
      let uploadEffectPreviews = document.querySelectorAll('.uploadEffectPreview')
      for(let i = 0; i < uploadEffectPreviews.length; i++){
        uploadEffectPreviews[i].style.backgroundImage = `url(${reader.result})`
      }
      let uploadImageOverlay = document.querySelector('.uploadImageOverlay')
      uploadImageOverlay.classList.remove('hidden')
    })
  }else{
    alert('Виберіть зображення!')
  }
})

let uploadCancel = document.querySelector('#uploadCancel')
uploadCancel.addEventListener('click', function(){
  document.querySelector('.uploadImageOverlay').classList.add('hidden')
})

function setEffectLevel(effect){
  let effectLevel = document.querySelector('#effectLevel')
  let pin = document.querySelector('.effectLevelPin')
  let line = document.querySelector('.effectLevelLine')
  let progresLine = document.querySelector('.effectLevelProgresLine')
  let uploadImage = document.querySelector('.uploadImage')
  pin.style.left = 0
  progresLine.style.width = 0
  effectLevel.value = 0
  uploadImage.style.filter = `${effect}(0)`
  pin.addEventListener('mousedown', function(evt){
    evt.preventDefault()
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)

    function onMouseMove(evt){
      if(effect == 'none'){
         pin.style.left = 0
         progresLine.style.width = 0
         effectLevel.value = 0
         uploadImage.style.filter = ''
      }else{
        let lineRect = line.getBoundingClientRect()
        let newLeft = evt.clientX - lineRect.left
        if(newLeft < 0){
          newLeft = 0
        }
        if(newLeft > line.offsetWidth){
          newLeft = line.offsetWidth
        }
        pin.style.left = newLeft + 'px'
        progresLine.style.width = newLeft + 'px'
        effectLevel.value = Math.floor(newLeft / line.offsetWidth * 100)
        uploadImage.style.filter = `${effect}(${effectLevel.value}%)`
      }
    }

    function onMouseUp(){
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
  })
}

function getPhotos(){
  let xhr = new XMLHttpRequest()
  xhr.open('GET', '/api/photos/all')
  xhr.responseType = 'json'
  xhr.send()
  xhr.onload = function(){
    showPictures(xhr.response)
  }
}

getPhotos()