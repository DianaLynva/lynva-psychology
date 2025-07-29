document.addEventListener('DOMContentLoaded', function(){
  const page = document.querySelector('body');
  const header = document.getElementById('header');
  const burgerBtn = header?.querySelector('.burger');
  const headerMenu = header?.querySelector('.nav__inner');
  const pageOverlay = page?.querySelector('.overlay');

  //detecting header and page height
  const startHeightValue = () => {
    let vh = window.innerHeight * 1;

    document.querySelector(':root').style.setProperty('--vh', `${vh}px`);

    const pageHeader = document.querySelector('.header');
    const headerHeight = pageHeader ? pageHeader.offsetHeight : 0;

    document.documentElement.style.setProperty(
      '--header-height',
      `${headerHeight}px`,
    );
  }

  window.addEventListener('resize', startHeightValue);
  window.addEventListener('scroll', startHeightValue);

  startHeightValue();

  //hiding/showing header 
  let headerHeight = parseFloat(
    document.documentElement.style.getPropertyValue('--header-height')
  );

  let lastHeaderPosition;
  let newHeaderPosition;

  const hideHeaderOnScroll = () => {
    lastHeaderPosition = window.scrollY;
    addClassItem('.header', 'scroll');

    if (headerHeight < lastHeaderPosition && lastHeaderPosition > newHeaderPosition && newHeaderPosition !== 0) {
      addClassItem('.header', 'hide');
      addClassItem('.header', 'scroll');
      } else if ((newHeaderPosition > lastHeaderPosition) && lastHeaderPosition !== 0 || lastHeaderPosition < headerHeight) {
        removeClassItem('.header', 'hide');
      }

      if (lastHeaderPosition < headerHeight) {
        removeClassItem('.header', 'scroll');
      }

      newHeaderPosition = lastHeaderPosition;
  };

  const throttle = (callback, delay) => {
    let previousCall = new Date().getTime();
    
    return function () {
      const time = new Date().getTime();
      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  const throttleHideHeader = throttle(() => {
    hideHeaderOnScroll();
  }, 100);

  window.addEventListener('scroll', throttleHideHeader);
  throttleHideHeader();

  function addClassItem(selector, className) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      element.classList.add(className);
      });
  }

  function removeClassItem(selector, className) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
      element.classList.remove(className)
    });
  }

  
  //creating burger menu func
  if (window.matchMedia('(max-width:992px)').matches && header) {
    burgerBtn.addEventListener('click', function(){
      this.classList.toggle('open');
      headerMenu.classList.toggle('open');
      pageOverlay.classList.toggle('active');
      page.classList.toggle('overflow');
    });

    headerMenu.addEventListener('click', (event) => {
      if (event.target.closest('a.menu__link')) {
        removeBurgerMenu();
      }
    });

    pageOverlay.addEventListener('click', (event) => {
      removeBurgerMenu(this);
    })

    function removeBurgerMenu (targetEl) {
      if (headerMenu.classList.contains('open')) {
      burgerBtn.classList.remove('open');
      headerMenu.classList.remove('open');
      pageOverlay.classList.remove('active');
      page.classList.remove('overflow');
      }
    }
  }
});