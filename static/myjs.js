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
    photoBlock.querySelector('.pictureImg').src = photosArray[i].src 
    photoBlock.querySelector('.pictureComments').innerText = photosArray[i].commentsNumber 
    photoBlock.querySelector('.pictureLikes').innerText = photosArray[i].likes
    photoBlock.querySelector('.pictureImg').style.filter = photosArray[i].effect
    picturesContainer.append(photoBlock)
  }
}


function showCheckedPicture(picture){
  let pictureContainer = document.querySelector('.openedPictureContainer')
  pictureContainer.querySelector('.openedPictureImg').src = picture.src 
  pictureContainer.querySelector('.openedPictureImg').style.filter = picture.effect 
  pictureContainer.querySelector('.openedPictureDescription').innerText = picture.description
  pictureContainer.querySelector('.pictureComments').innerText = picture.commentsNumber
  pictureContainer.querySelector('.pictureLikes').innerText = picture.likes
  let commentsTemplate = document.querySelector('#templateCommentBlock')
  let commentBlock = commentsTemplate.content.querySelector('.commentBlock')
  let pictureCommentsContainer = document.querySelector('.pictureCommentsContainer')
  for(let i = 0; i < picture.commentsNumber; i++){
    let comment = commentBlock.cloneNode(true)
    comment.querySelector('.commentText').innerText = picture.comments[i]
    pictureCommentsContainer.append(comment)
  }
  pictureContainer.classList.remove('hidden')
}

let picturesContainer = document.querySelector('.picturesContainer')
picturesContainer.addEventListener('click', function(evt){
  let checkedElement = evt.target

  if(checkedElement.classList.contains('pictureImg')){
    for(let i = 0; i < picturesDB.length; i++){
      if(picturesDB[i].src === checkedElement.getAttribute('src')){
        showCheckedPicture(picturesDB[i])

        break
      }
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
    alert('Choose a picture!')
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
    document.addEventListener('mousedown', onMouseMove)
    function onMouseMove(){
      if(effect == 'none'){
         pin.style.left = 0
         progresLine.style.width = 0
         effectLevel.value = 0
         uploadImage.style.filter = ''
      }else{
        let newLeft = evt.clientX - line.getBoundClientRect().left
        if( newLeft < 0){
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
      document.removeEventListener('mousmove', onMouseMove)
    }
  })
}
  function getPhotos(){
    let xhr = new XMLHttpRequest()
    xhr.open('GET', '/api/photos/all')
    xhr.responseType = 'json'
    xhr.send()
    xhr.onload = function(){
        console.log(xhr.response)
        showPictures(xhr.response)
    }
 }
  getPhotos()