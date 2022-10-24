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
const openItem2 = item => {
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
    openItem2($this);
    
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

const modal = $("#modal");
const content = modal.find(".modal__content");

$(".app-submit-btn").click(e => {
  e.preventDefault();

 $.fancybox.close();
})

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
    content.text('Ошибка сервера');

    $.fancybox.open( {
      src: '#modal',
      type: 'inline'
   })
  },  
  success: (body) => {
    content.text('Сообщение отправлено');

    $.fancybox.open( {
      src: '#modal',
      type: 'inline'
   })
  }
});


// Далее модальное окно на секцию заказа//
/*$('.form').submit(e => {
  e.preventDefault();

  $.fancybox.open( {
    src: '#modal',
    type: 'inline'
 })
});

$(".app-submit-btn").click(e => {
  e.preventDefault();

 $.fancybox.close();
})*/

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


// Горизонтальный аккордеон//
const mesureWidth = item => {  // функция расчета ширины
  let reqItemWidth = 0;


  const screenWidth = $(window).width();  // сохраним ширину окна
  const container = item.closest(".products-menu");  // сохраним контейнер
  const titleBlocks = container.find(".products-menu__title");  // в контейнере найдем заголовок
  const titleWidth = titleBlocks.width() * titleBlocks.length;  // ширина заголовков (один элемент * на количество)

  const textContainer = item.find(".products-menu__container");  // сохраним блок с текстом и его падинги через функцию парсИн (приводит строку к числу)
  const paddingLeft = parseInt(textContainer.css("padding-left"));
  const paddingRight = parseInt(textContainer.css("padding-right"));

  const isMobile = window.matchMedia("(max-width: 768px)").matches;  // проверяем ширину экрана через медиа запрос и вызываем на true/false
  
  if (isMobile) {
    reqItemWidth = screenWidth - titleWidth;  //  вернем высчитаную ширину из ш.экрана ш.заголовков
  } else {
    reqItemWidth = 500;
  }

  return {    //   вернем объект с контейнером и текстом
    container: reqItemWidth,
    textContainer: reqItemWidth - paddingLeft - paddingRight
  } 
}

const closeEveryItemInContainer = container => {    //  функция закрытия, куда будем передавать контейнер(список) для элементов
  const item = container.find(".products-menu__item");
  const content = container.find(".products-menu__content");
  
  item.removeClass("active");  //  удаляем класс актив на закрытом элементе (айтем)
  content.width(0);
}

const openItem = item => {  // функция открытия элемента
  const hiddenContent = item.find(".products-menu__content"); // сохраним блок с которым будем работать в переменную
  const reqWidth = mesureWidth(item);                    // сохранение значения ширины(высчитанной)
  const textBlock = item.find(".products-menu__container"); // найдем текстовый блок

  item.addClass("active");  //навесим класс на элемент чтоб понять что элемент открытый
  hiddenContent.width(reqWidth.container);  //  применим к блоку
  textBlock.width(reqWidth.textContainer);  //  расчитанная ширина для текстового блока
};

$(".products-menu__title").on("click", e => { // обработчик клика на элемент
  e.preventDefault();

  const $this = $(e.currentTarget); // сохраним текущий элемент
  const item = $this.closest(".products-menu__item"); //найдем и сохраним родителя этого элемента
  const itemOpened = item.hasClass("active");  // сохраним открытый элемент (то есть айтем проверяет наличие класса актив)
  const container = $this.closest(".products-menu");  // переданный контейнер для функции закрытия

  if (itemOpened) {     //  если элемент открыт, то закрываем все другие и если закрыт, то открываем и в тоже время закрываем остальные
    closeEveryItemInContainer(container)
  } else {
    closeEveryItemInContainer(container)
    openItem(item)  // передадим
  }  
});

$(".products-menu__close").on("click", e => {  //  навешиваем функцию закрытия на кнопку закрытия для всех
  e.preventDefault();

  closeEveryItemInContainer($('.products-menu'));
});

// OnePageScroll
const sections = $("section");  //  сохраним блоки...
const display = $(".maincontent");
const sideMenu = $(".fixed-menu");          // сохраним меню в переменную
const menuItem = sideMenu.find(".fixed-menu__item");

const mobileDetect = new MobileDetect(window.navigator.userAgent); // библиотека mobile-detect
const isMobile = mobileDetect.mobile();      // определим с чего мы зашли

let inScroll = false;     // переменная для остановки анимации

sections.first().addClass("active");  // навесим класс актив на видимую секцию, сразу на первый элемент

const countSectionPosition = section => {      //   расчет позиции для секции
  return section * -100;                      // возвращаем высчитанную позицию
}

const changeMenuThemeForSection = section => {   //  функция по смене темы бокового меню

  const currentSection = sections.eq(section);  //  сохраним секцию к которой совершался скролл
  const menuTheme = currentSection.attr("data-sidemenu-theme");  // возьмем значение его дата атрибута
  const activeClass = "fixed-menu--shadowed";   //  сохраним активный класс
  

  if (menuTheme === "black") {                       // и пишем ему условия
    sideMenu.addClass(activeClass);
  } else {
    sideMenu.removeClass(activeClass);
  }
};

const resetActiveClassForItem = (items, itemEq, activeClass) => {
  itemEq.eq(itemEq).addClass(activeClass).siblings().removeClass(activeClass);
}

const performTransition = section => {      // функция скроллинга до нужного экрана
  if (inScroll === false) {
    inScroll = true;
    const position = countSectionPosition(section);         // номер секции 

    changeMenuThemeForSection(section);     // вызовим боковое меню
    
   display.css({                              //   описываем css
    transform: `translateY(${position}%)`
   });

   

   sections.eq(section).addClass("active").siblings().removeClass("active");   // добавляем класс актив той секции на которую перешли а у остальных удаляем

   setTimeout(() => {             // ожидаем пока инерция мыши остановиться
    inScroll = false;

    sideMenu
    .find(".fixed-menu__item").eq(section)        // изменяем активный класс (поставили его после скролла)
     .addClass("fixed-menu__item--active").siblings()
     .removeClass("fixed-menu__item--active");
   }, 1300);
   }  
};

const scrollViewport = direction => {          // функция определяющая к какой имено секции нужно передвинуть, аргументом передадим направление
  const activeSection = sections.filter(".active");  // при скролле фильтруем активную
  const nextSection = activeSection.next();    //след секция ниже по дереву
  const prevSection = activeSection.prev();    //пред секция выше по дереву

  if (direction === "next" && nextSection.length) {                  // вызываем функции анимации и передаем ей номер секции к которой совершается анимация
    performTransition(nextSection.index())                          // ... и попутно проверяем есть ли впереди секция
  }

  if (direction === "prev" && prevSection.length) {
    performTransition(prevSection.index())
  }
}

$(window).on("wheel", e => {  //  обрабатываем событие "колесо"
  const deltaY = e.originalEvent.deltaY;  // сохраним свойтво deltaY

  if (deltaY > 0) {           // вызываем функцию скролла при разных условиях
    scrollViewport("next");    
  }

  if (deltaY < 0) {
    scrollViewport("prev");
  }
});

$(window).on("keydown", e => {         // обрабатываем событие с клавиатуры
  
  //console.log(e.which);                                // console.log(e.keycode);

  const tagName = e.target.tagName.toLowerCase();    //  условие того что юзер не находиться в полях ввода

  if (tagName !== "input" && tagName !== "textarea") {
    switch (e.which) {         // у каждой клавиши клавиатуры есть свой keycode
      case 38:  // prev
       scrollViewport("prev");   // вызываем нужную функцию с нужным параметром
       break;
      case 40:  // next
       scrollViewport("next");
       break;  
    }
  }
});

$(".wrapper").on("touchmove", e => e.preventDefault());   //  прикрепляем к врапперу(экрану) спец событие для мобильных

$("[data-scroll-to]").click(e => {     // обработчик клика для переходов из меню через дата атрибут
  e.preventDefault();

  const $this = $(e.currentTarget);      //  сохраним текущий элемент
  const target = $this.attr("data-scroll-to");         //  возьмем значение его атрибута
  const reqSection = $(`[data-section-id=${target}]`);    // найдем необходимую секцию

  performTransition(reqSection.index());              //  передадим фунцию перехода
});

if(isMobile) {          //  определим условия для мобильных
  //https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
  $("body").swipe({
   swipe: function (event, direction) {
    const scroller = scrollViewport();   //  подключили наш скроллер
    let scrollDirection = "";

    if (direction ==="up") scrollDirection = "next";
    if (direction ==="down") scrollDirection = "prev";

    scroller();     // вызовем это событие
    },
  });
}

//  Подключение Яндекс.Карты через API
let myMap;
 
const init = () => {
 myMap = new ymaps.Map("map", {
   center: [55.76, 37.64],
   zoom: 11,
   controls: []
 });

 const coords = [
  [55.75, 37.50],
  [55.75, 37.71],
  [55.70, 37.70]
 ];

 const myCollection = new ymaps.GeoObjectCollection({}, {
  draggable: false,
  iconLayout: 'default#image',
  iconImageHref: "./images/icons/marker.svg",
  iconImageSize: [46, 57],
  iconImageOffset: [-35, -52]
 });

 coords.forEach(coord => {
  myCollection.add(new ymaps.Placemark(coord));
 });

 myMap.geoObjects.add(myCollection);

 myMap.behaviors.disable('scrollZoom');

};
 
ymaps.ready(init);

// Секция YouTube Iframe API
let player;
const playerContainer = $(".player");

let eventsInit = () => {
  $(".play").click(e => {
    e.preventDefault();
    
  
    if (playerContainer.hasClass("paused")) {
      playerContainer.removeClass("paused");
      player.pauseVideo();
    } else {
      playerContainer.addClass("paused");
      player.playVideo();
    }
  });
 };
 
function onYouTubeIframeAPIReady() {
 player = new YT.Player("yt-player", {
   height: "405",
   width: "660",
   videoId: "LXb3EKWsInQ",
   events: {
     // onReady: onPlayerReady,
     // onStateChange: onPlayerStateChange
   },
   playerVars: {
    controls: 0,
    disablekb: 1,
    showinfo: 0,
    rel: 0,
    autoplay: 0,
    modestbranding: 0
  }
 });
} 
/*
const videoElement = document.querySelector('#yt-player');
const durationControl = document.querySelector('#durationLevel1');
const soundControl = document.querySelector('#micLevel1');
const playButtons = document.querySelectorAll('.play');
const playButtonVideo = document.querySelector('.player__video-play-img');
const micButton = document.querySelector('#mic');

playButtons.forEach( button => button.addEventListener("click", playStop))

function playStop() {
  playButtonVideo.classList.toggle("player__video-play-img--hidden");

  if(videoElement.paused) {
    videoElement.play()
  } else {
    videoElement.paused()
  }
}*/