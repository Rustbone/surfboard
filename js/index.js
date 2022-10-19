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
    
    const targetButtonEvent = e.target.closest('[data-open]');
    
    if(targetButtonEvent) {
      e.preventDefault()
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

// Далее слайдер //

const INITIAL_NUMBER_SLIDE = 1;
class Slider {
  constructor(selector, settings = {}){
    this.slider = document.querySelector(selector);
    this.current = INITIAL_NUMBER_SLIDE;
    this.slideCount = this.slider.children.length;
    this.settings = settings;
  }

  next () {
    if(this.current < this.slideCount) {
      this.current++;
    } else {
      this.current = INITIAL_NUMBER_SLIDE;
    }
    this.translate();
  }

  prev() {
    if(this.current > 1) {
      this.current--;
    } else {
      this.current = this.slideCount;
    }    
    this.translate();
  }

  translate() {
    this.slider.style.transform = `translateX(-${(this.current - 1) * 100}%)`;
  }

  setEventListener(){
    const buttonSlideRight = document.querySelector('.products-slider__arrow--direction--next');
    const buttonSlideLeft = document.querySelector('.products-slider__arrow--direction--prev');
    buttonSlideRight.addEventListener('click',(e) => {
      e.preventDefault();
      this.next()
    })
    buttonSlideLeft.addEventListener('click',(e) => {
      e.preventDefault();
      this.prev()
    })
  }

  init() {
    if(!!this.settings.transition) {
      this.slider.style.transition = `${this.settings.transition}ms`
    }
    if(this.settings.auto) {
      setInterval(()=>{
        this.next()
      }, this.settings.autoInterval)
    }
    this.setEventListener();

  }
}

const slider = new Slider('#slider', {
  transition: 1000,
  
  autoInterval: 3000,
});

slider.init()
console.log(slider);


// Далее вертикальный аккордеон //
const openItem = item => {
  const container = item.closest(".team__item");
  const contentBlock = container.find(".team__content");
  const textBlock = contentBlock.find(".team__content-block");
  const reqHeight = textBlock.height();

  container.addClass("active");
  contentBlock.height(reqHeight);
}

const closeEveryItem = container => {
  const items = container.find('.team__content');
  const itemContainer = container.find(".team__item");

  itemContainer.removeClass("active"); // удаляем все активные классы
  items.height(0);
}

$('.team__title').click(e => {
  const $this = $(e.currentTarget);
  const container = $this.closest('.team');
  const elemContainer = $this.closest(".team__item");

  if (elemContainer.hasClass("active")) {
    closeEveryItem(container); // close
  } else {
    closeEveryItem(container);
    openItem($this);
    
  } 
})

// Далее слайдшоу отзывов //
const findBlockByAlias = (alias) => {
  return $(".reviews__item").filter((ndx, item) => {
    return $(item).attr("data-linked-with") === alias;
  });
};

$(".interactive-avatar__link").click((e) => {
  e.preventDefault();

  const $this = $(e.currentTarget);
  const target = $this.attr("data-open");
  const itemToShow = findBlockByAlias(target);
  const curItem = $this.closest(".interactive-avatar");

  itemToShow.addClass("active").siblings().removeClass("active");
  curItem.addClass("active").siblings().removeClass("active");
})


// Скрипт формы заказа

class AjaxForm{
  constructor(selector, settings) {
    this.settings = settings
    this.form = document.querySelector(selector)
    this.fields = this.form.elements
    this.errors = []

    this.form.addEventListener('submit', (e) => {
      e.preventDefault()

      if (this.isValid()) {
        this.submit()
      }
    })

    this.form.addEventListener('input', (e) => this.validationField(e.target.name))
  }
  
  isValid() {
    const validators = this.settings.validators

    if (validators) {
      for (const fieldName in validators) {
        this.validationField(fieldName)
      }
    }

    console.log(this.errors)

    if (!this.errors.length) {
      return true
    } else {
      return false
    }
  }

  validationField(fieldName) {
    if (fieldName && this.settings.validators[fieldName]) {
      try {
        this.settings.validators[fieldName](this.fields[fieldName])
        this.hideError(fieldName)
      } catch (error) {
        this.showError(fieldName, error.message)
      }

    }
  }

  hideError(fieldName) {
    if (this.errors.length) {
      const field = this.fields[fieldName].closest ? this.fields[fieldName] : this.fields[fieldName][0]
      this.errors = this.errors.filter((field) => field !== fieldName)      
      field.closest('label').classList.add('error')
    }
  }

  showError(fieldName, text) {
    if (fieldName) {
      const field = this.fields[fieldName].closest ? this.fields[fieldName] : this.fields[fieldName][0]
      this.errors.push(fieldName)
      field.closest('label').classList.add('error')

      if (this.settings.placeholder) {
        field.placeholder = text
      }
      
    }
  }

  getJSON() {
    return JSON.stringify(Object.fromEntries(new FormData(this.form)))
  }

  async submit() {
    try {
      var response = await fetch(this.settings.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: this.getJSON()
      })

      var body = await response.json()
   
      if (response.status >= 400) {
        throw new Error('Ошибка сервера')
      }

      this.settings.success(body)
      this.form.reset()
    } catch (error) {
        this.settings.error(error.message)
    }
  }  
}

new AjaxForm('#form', {
  url: 'https://webdev-api.loftschool.com/sendmail',
  placeholder: true,
  validators: {
    name: function(field) {
      if (field.value.length < 3) {
        throw new Error('Имя не валидное')
      }
    },
    phone: function(field) {
      if (!field.value.length) {
        throw new Error('Телефон не валиден')
      }
    },
    nal: function(field) {
      if (!field.checked) {
        throw new Error('Оплата наличными')
      }
    },
    option: function(field) {
      if (field.value === 'card') {
        throw new Error('Оплата картой')
      }
    },
    comment: function(field) {
      if (!field.value.length) {
        throw new Error('Комментарий')
      }
    }
  },
  error:(body) => {
    alert(body)
  },  
  success: (body) => {
    return body
    const modal = document.querySelector('#modal')
  }
})


// Далее модальное окно на секцию заказа//
$('.form').submit(e => {
  e.preventDefault();

  $.fancybox.open( {
    src: '#modal',
    type: 'inline'
 })
});

$(".app-submit-btn").click(e => {
  e.preventDefault();

 $.fancybox.close();
})

//const form = document.querySelector('#form');
//const sendButton = document.querySelector('#sendButton');

//sendButton.addEventListener('click', function(event) {
///  event.preventDefault();

//console.log(form.elements);

//  console.log(form.elements.name.value);
//  console.log(form.elements.phone.value);
//  console.log(form.elements.comment.value);

//  if (form.elements.auto.checked == false) {
////    console.log('перезванивать');
//  }
//})