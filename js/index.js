class Modal {
  constructor(selector, classMod){
    this.menu = document.querySelector(selector);
    this._classMod = classMod;
    console.log(this.menu)
  }

  _handleEscUp = (evt) => {
    if(evt.key ==='Escape'){
        this.close()
    }
}

open () {
  this.menu.classList.add(this._classMod)
  document.addEventListener('keyup', this._handleEscUp)
}

close() {
  this.menu.classList.remove(this._classMod)
  document.addEventListener('keyup', this._handleEscUp)
}

setEventListener(){
  this.menu.addEventListener('click', (evt) => {
    if(evt.target.classList.contains('popup-js') || !!evt.target.closest('.button--icon--close') || evt.target.dataset.close === 'true') {
        this.close()
    }
})

  document.addEventListener('click', (e) => {
    e.preventDefault()
    const targetButtonEvent = e.target.closest('[data-open]');
    console.log(targetButtonEvent)
    if(targetButtonEvent) {
      const currentIdPopup = targetButtonEvent.dataset.open;
      if(this.menu.id === currentIdPopup){ 
        this.open();
    }
    }
  })
}
}

const menu = new Modal('#full-menu', 'fullscreen-menu--opened')
menu.setEventListener()

// const popupSuccess = new Modal('#popup-success', 'popup--opened')
// popupSuccess.setEventListener()

