const siteNav = document.querySelector('.site-nav');
const pageNav = document.querySelector('.page-nav');
const contentSection = document.querySelector('.content');
const hoverImagesTargets = document.querySelectorAll('.hover');
const hoverImagesContainer = document.querySelector('.hover-images');
const hoverImages = document.querySelectorAll('.hover-image');

const mapRange = (value, inputMin, inputMax, outputMin, outputMax, clamp) => {
  // Reference:
  // https://openframeworks.cc/documentation/math/ofMath/
  if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
    return outputMin;
  } else {
    var outVal =
      ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
      outputMin;
    if (clamp) {
      if (outputMax < outputMin) {
        if (outVal < outputMax) outVal = outputMax;
        else if (outVal > outputMin) outVal = outputMin;
      } else {
        if (outVal > outputMax) outVal = outputMax;
        else if (outVal < outputMin) outVal = outputMin;
      }
    }
    return outVal;
  }
};

const lerp = (min, max, t) => min * (1 - t) + max * t;

let windowSize;
const getWindowSize = () =>
  (windowSize = { width: window.innerWidth, height: window.innerHeight });
getWindowSize();

let distanceScrolled;
const getDistanceScrolled = () =>
  (distanceScrolled = window.pageYOffset || document.documentElement.scrollTop);
getDistanceScrolled();

class Drifter {
  constructor(el) {
    this.DOM = { el: el };
    this.DOM.image =
      this.DOM.el.querySelector('picture') || this.DOM.el.querySelector('img');

    this.renderedStyles = {
      innerTranslationY: {
        previous: 0,
        current: 0,
        ease: 0.1,
        maxValue: parseInt(
          getComputedStyle(this.DOM.image).getPropertyValue('--overflow'),
          10
        ),
        setValue: () => {
          const maxValue = this.renderedStyles.innerTranslationY.maxValue;
          const minValue = -1 * maxValue;
          return Math.max(
            Math.min(
              mapRange(
                this.props.top - distanceScrolled,
                windowSize.height,
                -1 * this.props.height,
                minValue,
                maxValue
              ),
              maxValue
            ),
            minValue
          );
        },
      },
    };

    this.update();
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => (this.isVisible = entry.intersectionRatio > 0)
      );
    });
    this.observer.observe(this.DOM.el);
    this.initEvents();
  }
  update() {
    this.getSize();
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].previous =
        this.renderedStyles[key].setValue();
    }
    this.layout();
  }

  getSize() {
    const rect = this.DOM.el.getBoundingClientRect();
    this.props = {
      height: rect.height,
      top: distanceScrolled + rect.top,
    };
  }
  initEvents() {
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    this.update();
  }
  render() {
    for (const key in this.renderedStyles) {
      this.renderedStyles[key].current = this.renderedStyles[key].setValue();
      this.renderedStyles[key].previous = lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].ease
      );
    }
    this.layout();
  }
  layout() {
    this.DOM.image.parentElement.style.setProperty(
      '--drift',
      `translate3d(0,${this.renderedStyles.innerTranslationY.previous}px,0)`
    );
  }
}

const items = [
  ...document.querySelectorAll('.article-banner__image-wrapper'),
].map((item) => new Drifter(item));
const animate = () => {
  for (const item of items) {
    if (item.isVisible) {
      item.render();
    }
  }
  requestAnimationFrame(() => animate());
};
animate();

let hoverX = 0.1;
let hoverY = 0.1;
let randomRotation = 0;

const easeHoverPosition = () => {
  const compStyle = getComputedStyle(hoverImagesContainer);
  const currentX = compStyle.getPropertyValue('--x');
  const currentY = compStyle.getPropertyValue('--y');
  const currentRotation = compStyle.getPropertyValue('--angle');

  const newX = lerp(parseInt(currentX), hoverX, 0.3);
  const newY = lerp(parseInt(currentY), hoverY, 0.3);
  const newRotation = lerp(parseFloat(currentRotation), randomRotation, 0.3);

  hoverImagesContainer.style.setProperty('--x', `${newX}px`);
  hoverImagesContainer.style.setProperty('--y', `${newY}px`);
  hoverImagesContainer.style.setProperty('--angle', `${newRotation}deg`);

  requestAnimationFrame(() => easeHoverPosition());
};
const clearActiveHoverImages = () => {
  hoverImages.forEach((image) => image.classList.remove('hover-image--active'));
};
easeHoverPosition();

document.addEventListener('mousemove', ({ clientX, clientY }) => {
  hoverX = clientX;
  hoverY = clientY;
});

hoverImagesTargets.forEach((target) => {
  target.addEventListener('click', (e) => {
    e.preventDefault();
  });
  target.addEventListener('mouseenter', (e) => {
    clearActiveHoverImages();
    randomRotation = Math.random() * (10 - -10) + -10;
    document
      .querySelector(`#${target.dataset.imgTarget}`)
      .classList.add('hover-image--active');
  });
  target.addEventListener('mouseout', clearActiveHoverImages);
});
contentSection.addEventListener('mouseover', () => {
  siteNav.classList.add('site-nav--blurred');
  pageNav.classList.add('page-nav--blurred');
});
contentSection.addEventListener('mouseout', () => {
  siteNav.classList.remove('site-nav--blurred');
  pageNav.classList.remove('page-nav--blurred');
});
window.addEventListener('resize', getWindowSize);
window.addEventListener('scroll', () => {
  getDistanceScrolled();
  clearActiveHoverImages();
});
